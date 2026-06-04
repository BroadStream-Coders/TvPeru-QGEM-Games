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
sabe de edición. Los tres se pegan con un **registro indexado por `type`** que ya
existe y funciona: `engine/componentRegistry.ts`.

```ts
// engine/componentRegistry.ts (forma real, simplificada)
export interface ComponentDefinition {
  label: string; // nombre visible en el dropdown "Agregar componente"
  create: () => GameObjectComponent; // fábrica del modelo por defecto
  view: ComponentType<{ component }>; // la Vista (Scene)
  editor: ComponentType<{ component; onChange; onRemove; onResize }>; // el Editor (Inspector)
}

export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = {
  image: { label: "Image", create: createImageComponent, view: ImageView, editor: ImageInspector },
  color: { label: "Color", create: createColorComponent, view: ColorView, editor: ColorInspector },
};
export const COMPONENT_OPTIONS = Object.entries(...); // {type,label}[] para el dropdown
```

Contrato de cada pieza:

- **Vista** recibe `{ component }` y devuelve el render (o `null` si no hay nada que
  dibujar). Se monta dentro de la capa de contenido del `GameObjectView`.
- **Editor** recibe `{ component, onChange, onRemove, onResize }`:
  - `onChange(next)` — escribe el componente mutado de vuelta en el modelo.
  - `onRemove()` — quita ese componente del GameObject (botón papelera).
  - `onResize(size)` — pide al host fijar el `transform.size` del GameObject (lo usa
    Image en "Ajustar al tamaño de la imagen"; los que no lo necesiten lo ignoran).
- **`create()`** produce el modelo por defecto (p. ej. Image arranca sin recurso).

Cómo lo consumen las dos UIs (idéntico en deletreo y sandbox):

- Inspector: `selected.components.map(c => REGISTRY[c.type].editor)` + `AddComponentButton`.
- Scene: `GameObjectView` hace `gameObject.components.map(c => REGISTRY[c.type].view)`.

**Agregar un componente nuevo = crear su tripleta y registrar una entrada. No se
toca ni el Inspector ni la Scene.** Ese es el objetivo de todo el diseño, y ya se
cumple: Image y Color se sumaron solo tocando su carpeta + el registro.

> Nota de tipos: las entradas del registro castean con `as unknown as` porque el
> tipo genérico usa el `GameObjectComponent` base. Es la deuda menor **TD-004**.

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

| Tipo             | Editor (Inspector)       | Vista (Scene)                           | Modelo             |
| ---------------- | ------------------------ | --------------------------------------- | ------------------ |
| GameObject       | `GameObjectInspector`    | `GameObjectView`                        | `gameObject.ts`    |
| RectTransform    | `RectTransformInspector` | `RectTransform` _(plomería, excepción)_ | (campo `transform`)|
| Image            | `ImageInspector`         | `ImageView`                             | `imageComponent.ts`|
| Color            | `ColorInspector`         | `ColorView`                             | `colorComponent.ts`|
| Text _(futuro)_  | `TextInspector`          | `TextView`                              | `textComponent.ts` |

- `View` = "vista" de la tripleta (modelo / control / **vista**).
- El **dato** se queda con el nombre limpio (`GameObject`), la **vista** lleva
  sufijo (`GameObjectView`). Además los archivos `gameObject.ts` y
  `GameObjectView.tsx` no chocan en mayúsculas en Windows.
- El modelo de cada componente va en `…Component.ts` (minúscula inicial) con su
  `interface XxxComponent extends GameObjectComponent` y un `createXxxComponent()`.

---

## 7. Estructura de carpetas

```
src/components/shared/engine/
├── Scene.tsx                  # el lienzo 16:9 (ex-FullScreen) + SceneBackground
├── RectTransform.tsx          # posicionador (#2) + tipos Vec2/RectTransformValues + DESIGN_*
├── gameObject.ts              # modelo GameObject + createGameObject + GameObjectComponent
├── GameObjectView.tsx         # vista de un GameObject (posiciona + dibuja components[] + borde)
├── GameObjectInspector.tsx    # editor de los campos propios del GameObject (name, active)
├── RectTransformInspector.tsx # editor (#3) del transform (Pos/Width/Height + botón "Editar")
├── Hierarchy.tsx              # árbol de GameObjects (TreeNode + Hierarchy); prop onAdd → "+"
├── AddComponentButton.tsx     # botón + dropdown "Agregar componente" (lee COMPONENT_OPTIONS)
├── SidePanel.tsx              # marco visual (pestaña + caja) para Hierarchy e Inspector
├── componentRegistry.ts       # COMPONENT_REGISTRY + COMPONENT_OPTIONS (el pegamento por type)
└── components/                # una carpeta por tipo, cada una con su tripleta
    ├── image/
    │   ├── imageComponent.ts  #   modelo (src, fit, fileName)
    │   ├── ImageView.tsx      #   vista (background-image según fit)
    │   └── ImageInspector.tsx #   editor (cargar desde equipo, ajuste, fit-a-imagen, eliminar)
    └── color/
        ├── colorComponent.ts  #   modelo (value)
        ├── ColorView.tsx      #   vista (div que rellena el rect con backgroundColor)
        └── ColorInspector.tsx #   editor (color picker + hex, eliminar)
```

`GameObjectView` (la vista) hoy estructura cada objeto en 3 capas, en este orden:

1. `<RectTransform>` que lo posiciona (capa #2 de arriba).
2. un div de **contenido** (`absolute inset-0`) que dibuja primero las **Vistas de
   `components[]`** (vía el registro) y luego el `children` (contenido propio del
   juego, p. ej. el texto del deletreo, que queda por encima de los componentes).
3. un div de **borde** superpuesto (`absolute inset-0`, `pointer-events-none`),
   dibujado **al final** para que la selección siempre se vea por encima del
   contenido. Va aparte porque un `border` cambiaría el tamaño de la caja.

---

## 8. Quién usa el engine hoy

- **`workspaces/deletreo`** → el juego de referencia. Usa el engine completo:
  `Scene` + `Hierarchy` (con "+") + `GameObjectInspector` + `RectTransformInspector`
  + editores de `components[]` por el registro + `AddComponentButton`. Arranca con
  dos GameObjects: **MainFrame** (con un componente **Image**) y **Text** (hijo).
  La tecla **F** muta el `src` de ese Image (marco normal ↔ error); es la fuente de
  verdad del swap. Tiene además lógica propia de juego (gestos de edición,
  animaciones bounce/slide, sonidos, el deletreo de letras) que es **del juego**, no
  del engine.
- **`workspaces/sandbox`** → banco de pruebas, ya **reescrito sobre el engine**:
  mismo layout Hierarchy + Scene + Inspector que deletreo, sin GameObjects iniciales.
  Sirve para crear objetos con "+" y agregarles componentes (Image, Color) libremente,
  con `BackgroundConfig` para el fondo de la Scene.
  - La implementación vieja (modelo ad-hoc `Source` texto/imagen con paneles
    Fuentes/Propiedades/Transform) se movió íntegra y **sin usar** a
    `sandbox/legacy/LegacySandbox.tsx`, apartada para borrarla más adelante (**TD-005**).

---

## 9. Estado actual

**Hecho:**

- `engine/` consolidado con todos los archivos de §7.
- Modelo `GameObject { id, name, active, parentId, transform, components[] }`,
  modular y reutilizable. GameObjects nuevos se crean con **size 100×100**, centrados.
- **El registro por `type` está vivo** (`componentRegistry.ts`): `GameObjectView`
  dibuja las Vistas de `components[]` y el Inspector recorre sus Editores, ambos
  desde el registro. Agregar un tipo no toca Inspector ni Scene.
- **Dos componentes reales** con su tripleta: **Image** (cargar desde equipo —no URL—,
  ajuste contain/cover/fill, "Ajustar al tamaño de la imagen", eliminar) y **Color**
  (color picker + hex que rellena el rect, eliminar).
- UI de composición genérica y compartida: **Hierarchy con "+"** (crear GameObject),
  **`AddComponentButton`** (dropdown que lista el registro), botón **eliminar** por
  componente, **`SidePanel`** como marco. La usan deletreo y sandbox igual.
- Convención de nombres `…Inspector` / `…View` / `…Component.ts` aplicada.

**Pendiente / lo que sigue:**

- Componente **Text** (pausado): el subrayado es un `div` aparte y cada letra sería
  su propio GameObject con su Text; el modelo lleva los datos de la card menos Offset
  (posiciona el rectTransform). Ver memoria `engine-text-component-direction`.
- El estado del grafo vive en `deletreo/page.tsx` y `sandbox/page.tsx` (duplicado);
  aún no se levantó a un store `useScene` (ver Decisión C).
- Parenting de un solo nivel (**TD-002**); tipado laxo del registro (**TD-004**);
  legacy del sandbox por borrar (**TD-005**).

---

## 10. Decisiones (tomadas y abiertas)

**A — ¿El transform es campo fijo o un componente más?** → **Decidido: campo fijo.**
`gameObject.transform` siempre existe (garantía en compilación), fuera de `components[]`.

**B — Forma de la carpeta de componentes.** → **Decidido:** `engine/components/<tipo>/`
con **modelo + editor + vista juntos** por tipo (ver §7). Image y Color ya siguen esto.

**C — ¿Levantar el estado a un store `useScene` ahora o después?** → **Abierta, ahora
empieza a doler:** el grafo está duplicado en `deletreo/page.tsx` y `sandbox/page.tsx`
con helpers casi idénticos (createNewGameObject, addComponent, removeComponent,
patchComponent, setGameObjectSize, setAxis…). Candidato fuerte a un store `useScene`,
mismo patrón que `useWorkspaceHeader`.

**D — Nombre `Scene` vs choques.**
Existe la pestaña "Scene" de `ViewModeTabs` y antes la ruta `/escena`. El
componente `Scene` no rompe nada; se deja así salvo que moleste el nombre repetido.

---

## 11. Orden de implementación sugerido

1. ✅ `FullScreen` → `Scene`; mover Inspector/RectTransformInspector al engine.
2. ✅ Modelo `GameObject` + `GameObjectView` en el engine; nombres normalizados.
3. ✅ Registro por `type` + primer componente real (**Image**) con su tripleta.
4. ✅ `GameObjectView` dibuja las Vistas de `components[]` desde el registro.
5. ✅ Inspector genérico que recorre `components[]` + `AddComponentButton` + eliminar.
6. ✅ Segundo componente (**Color**) sumado solo con su carpeta + entrada del registro.
7. ⏳ (Según **Decisión C**) levantar el grafo duplicado a un store `useScene`.
8. ⏳ Componente **Text** (pausado, ver §9 y la memoria del proyecto).
