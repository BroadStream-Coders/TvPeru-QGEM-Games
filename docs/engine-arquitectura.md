# Engine — Arquitectura del sistema GameObject

> **Si llegas nuevo a esta conversación: lee este documento entero antes de tocar
> nada.** Resume qué es el "engine", cómo piensa, cómo se nombra y en qué estado
> está. Es la fuente de verdad de la arquitectura.

El "engine" es un mini-editor estilo Unity que vive en
`src/components/shared/engine/`. Sirve para **componer y posicionar lo que se ve
en pantalla** en los juegos de QGEM (display fullscreen para TV Perú). No es un
motor de gameplay: es el sistema de **escena + jerarquía + inspector** que cada
juego reutiliza para colocar su contenido.

---

## 1. La idea en una frase

La entidad real es el **GameObject**. No se colocan piezas sueltas en la pantalla:
se colocan GameObjects, y cada GameObject **tiene componentes**.

```
GameObject
├── id, name, active, parentId   ← datos propios
├── transform (RectTransform)    ← posición/tamaño, SIEMPRE presente
└── components[]                 ← lista de componentes visuales (Image, Text, …)
```

Tres piezas de UI operan sobre los GameObjects:

- **Hierarchy** → lista todos los GameObjects en árbol (respeta `parentId`).
- **Inspector** → abre el GameObject seleccionado y deja **ver/editar** sus datos
  (sus campos propios + el editor de cada componente).
- **Scene** → es el lienzo donde viven los GameObjects "físicos": los **renderiza**.

---

## 2. El modelo mental que NO hay que romper

Esto es lo más importante y lo más fácil de equivocar (sobre todo viniendo de
Unity/C#):

**El DATO es la única verdad. El flujo es unidireccional (estilo Flux, no MVC
clásico ni retained-mode de Unity).**

```
                 ┌── Inspector (edita) ──┐
   MODELO  ◄─────┤                       │
 (GameObject[])  └── escribe de vuelta ──┘
      │
      └──► Scene (lo dibuja)   +   Hierarchy (lo lista)
```

- La **Scene NO observa ni muta imperativamente** como un GameObject de Unity. Es
  una **función pura del modelo**: React la vuelve a dibujar cuando el dato cambia.
- **Inspector y Scene no se hablan entre sí.** Se comunican **solo a través del
  dato**. Prueba mental: el Inspector edita `transform.position` → la Scene se
  mueve, sin que ninguno conozca al otro, solo porque ambos leen el mismo objeto.
- Distinguir dos tipos de estado:
  - **Estado autorado** = el modelo (serializable, lo edita el Inspector).
  - **Estado runtime** = gameplay efímero (animaciones, paso del deletreo, sonidos)
    que maneja la lógica del juego y **no** se serializa.

---

## 3. Cada tipo de componente es una "tripleta"

Un tipo de componente (RectTransform, Image, Text…) se define con **tres piezas**:

| Pieza                | Qué es                                     | Dónde se ve         |
| -------------------- | ------------------------------------------ | ------------------- |
| **Modelo**           | dato JSON puro con un `type` discriminador | en `components[]`   |
| **Editor** (control) | el formulario que edita ese dato           | en el **Inspector** |
| **Vista** (render)   | cómo se dibuja ese dato                    | en la **Scene**     |

El Modelo no sabe dibujarse ni editarse; el Editor no sabe de render; la Vista no
sabe de edición. Los tres se pegan con un **registro indexado por `type`**:

```ts
// pseudocódigo — el mecanismo que hace todo extensible
const COMPONENT_REGISTRY = {
  image: { editor: ImageInspector, render: ImageView },
  text: { editor: TextInspector, render: TextView },
};
```

- Inspector: `gameObject.components.map(c => REGISTRY[c.type].editor)`.
- Scene: por cada GameObject, lo posiciona y dibuja los `render` de sus componentes.

**Agregar un componente nuevo = crear su tripleta y registrarla. No se toca ni el
Inspector ni la Scene.** Ese es el objetivo de todo el diseño.

---

## 4. RectTransform: el caso especial (son 3 cosas)

`RectTransform` aparece con el mismo nombre en tres roles distintos; tenerlos
separados evita confusión:

| #   | Qué es                                        | Rol                                                     | Dónde vive                                 |
| --- | --------------------------------------------- | ------------------------------------------------------- | ------------------------------------------ |
| 1   | **dato** (`position`, `size`, `pivot`)        | el transform del GameObject                             | `engine/gameObject.ts` (campo `transform`) |
| 2   | **posicionador / render** (`<RectTransform>`) | plomería del engine: coloca cada GameObject en la Scene | `engine/RectTransform.tsx`                 |
| 3   | **editor** (`RectTransformInspector`)         | el formulario Pos/Width/Height del Inspector            | `engine/RectTransformInspector.tsx`        |

Diferencias con un componente normal:

- El transform **no** vive en `components[]`: es un **campo fijo** del GameObject
  (siempre existe, como el Transform obligatorio de Unity). → **Decisión A** abajo.
- Su render (#2) **no** es un "componente visual": es el primitivo de
  posicionamiento que usa la propia vista del GameObject. Por eso su nombre se
  queda como `RectTransform` y **no** sigue el patrón `…View`.
- ⚠️ **El nombre `RectTransform` está protegido: no renombrar a `Transform`.**

---

## 5. Sistema de coordenadas (clave para no romper el render)

La **Scene** es un escenario 16:9 que es un _container-query context_
(`[container-type:size]`). Por eso **todo se mide en unidades de container query
(`cqw`/`cqh`/`cqi`), nunca en `vw`/`rem`/`px`.** Así la composición se ve idéntica
en ventana o en fullscreen (en fullscreen se hace letterbox sobre negro).

Espacio de diseño y origen (definidos en `engine/RectTransform.tsx`):

- `DESIGN_WIDTH = 1920`, `DESIGN_HEIGHT = 1080`.
- **Origen en el centro de la pantalla, eje Y hacia arriba.**
- Conversión a CSS: `left = ((960 + x) / 1920) * 100 cqw`,
  `top = ((540 − y) / 1080) * 100 cqh`; el `pivot` se aplica con
  `translate(−pivot.x*100%, −pivot.y*100%)`.
- **Parenting (`parent`):** hoy solo suma `parent.position` → **un solo nivel**
  (no acumula abuelos, ni considera size/pivot del padre). Es la deuda **TD-002**
  en `docs/technical-debt.md`.

---

## 6. Convención de nombres

Por cada tipo, el par es **`XxxInspector` (edita) / `XxxView` (dibuja)**:

| Tipo             | Editor (Inspector)       | Vista (Scene)                           |
| ---------------- | ------------------------ | --------------------------------------- |
| GameObject       | `GameObjectInspector`    | `GameObjectView`                        |
| RectTransform    | `RectTransformInspector` | `RectTransform` _(plomería, excepción)_ |
| Text _(futuro)_  | `TextInspector`          | `TextView`                              |
| Image _(futuro)_ | `ImageInspector`         | `ImageView`                             |

- `View` = "vista" de la tripleta (modelo / control / **vista**).
- El nombre `Inspector` (a secas) queda **reservado** para el futuro panel que
  recorra los componentes; hoy NO existe como componente.
- El **dato** se queda con el nombre limpio (`GameObject`), la **vista** lleva
  sufijo (`GameObjectView`). Además los archivos `gameObject.ts` y
  `GameObjectView.tsx` no chocan en mayúsculas en Windows.

---

## 7. Estructura de carpetas

```
src/components/shared/engine/
├── Scene.tsx                  # el lienzo 16:9 (ex-FullScreen) + SceneBackground
├── RectTransform.tsx          # posicionador (#2) + tipos Vec2/RectTransformValues + DESIGN_*
├── gameObject.ts              # modelo GameObject + createGameObject + GameObjectComponent
├── GameObjectView.tsx         # vista de un GameObject (posiciona + borde + contenido)
├── GameObjectInspector.tsx    # editor de los campos propios del GameObject (name, active)
├── RectTransformInspector.tsx # editor (#3) del transform (Pos/Width/Height)
├── Hierarchy.tsx              # árbol de GameObjects (TreeNode + Hierarchy)
└── components/                # ← (futuro) una carpeta por tipo: image/, text/ …
                               #    cada una con su tripleta (modelo + editor + vista)
```

`GameObjectView` (la vista) hoy estructura cada objeto en 3 capas, en este orden:

1. `<RectTransform>` que lo posiciona (capa #2 de arriba).
2. un div de **contenido** (`absolute inset-0`) donde entran los componentes / el
   contenido del juego (pasado como `children`).
3. un div de **borde** superpuesto (`absolute inset-0`, `pointer-events-none`),
   dibujado **al final** para que la selección siempre se vea por encima del
   contenido. Va aparte porque un `border` cambiaría el tamaño de la caja.

---

## 8. Quién usa el engine hoy

- **`workspaces/deletreo`** → el juego de referencia. Ya usa el engine completo:
  `Scene` + `Hierarchy` + `GameObjectInspector` + `RectTransformInspector` +
  `GameObjectView`, con dos GameObjects (MainFrame, y Text como hijo). Tiene además
  lógica propia de juego (gestos de edición, animaciones bounce/slide, sonidos,
  el deletreo de letras) que es **del juego**, no del engine.
- **`workspaces/sandbox`** → compositor estilo OBS (fuentes texto/imagen con
  transform editable). Usa `Scene` + `RectTransform` directo. Es el banco de
  pruebas. (El antiguo workspace "Escena" se eliminó y su contenido vive aquí.)

---

## 9. Estado actual

**Hecho:**

- `engine/` consolidado con todos los archivos de §7.
- Modelo `GameObject { id, name, active, parentId, transform, components[] }` en el
  engine, modular y reutilizable.
- `GameObjectView` renderiza cada GameObject; deletreo ya pasa por él.
- Convención de nombres `…Inspector` / `…View` aplicada.

**Pendiente / lo que sigue:**

- `components[]` existe en el modelo pero **aún no se renderiza** → el siguiente
  paso es crear el **primer componente real (Image o Text)** con su tripleta y
  estrenar el **registro por `type`**.
- No existe todavía el panel `Inspector` genérico que recorra `components[]`
  (hoy deletreo cablea los editores a mano).
- El estado del grafo vive en `deletreo/page.tsx`; aún no se levantó a un store
  `useScene` (ver Decisión C).

---

## 10. Decisiones abiertas

**A — ¿El transform es campo fijo o un componente más?**
Hoy es **campo fijo** (`gameObject.transform`), con garantía en compilación de que
existe. Alternativa: meterlo en `components[]` (uniforme pero pierde la garantía).
_Unity:_ obligatorio pero **dibujado** como un componente más (híbrido).

**B — Forma de la carpeta de componentes.**
Recomendado: `engine/components/<tipo>/` con **editor + vista juntos** por tipo.
Alternativa descartada: separar "solo editores" en una carpeta tipo `viewInspector`.

**C — ¿Levantar el estado a un store `useScene` ahora o después?**
Recomendado: **después**, cuando exista un 2º componente y duela pasar props.
Mismo patrón que `useWorkspaceHeader`.

**D — Nombre `Scene` vs choques.**
Existe la pestaña "Scene" de `ViewModeTabs` y antes la ruta `/escena`. El
componente `Scene` no rompe nada; se deja así salvo que moleste el nombre repetido.

---

## 11. Orden de implementación sugerido

1. ✅ `FullScreen` → `Scene`; mover Inspector/RectTransformInspector al engine.
2. ✅ Modelo `GameObject` + `GameObjectView` en el engine; nombres normalizados.
3. Definir el **registro por `type`** y el primer componente real (**Text** o
   **Image**) con su tripleta. → depende de **Decisión A/B**.
4. Hacer que `GameObjectView` dibuje los `render` de `components[]` desde el registro.
5. Construir el panel `Inspector` genérico que recorra `components[]` desde el registro.
6. (Según **Decisión C**) levantar el grafo a `useScene`.
