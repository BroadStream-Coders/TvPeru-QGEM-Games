# Engine — Arquitectura del sistema GameObject

Documento de trabajo para entender y **decidir** cómo evoluciona el "engine" (el
mini-editor estilo Unity que estamos armando en `src/components/shared/engine/`).
No es código aún: es el mapa para tomar decisiones. Cada sección abierta tiene un
bloque **Decisión** al final.

---

## 1. Idea central

La entidad real es el **GameObject**. No se colocan piezas sueltas (como un
RectTransform) en la escena: se colocan GameObjects, y cada GameObject **tiene
componentes**.

```
GameObject
├── id, name, active, parentId        ← datos propios
└── components[]                       ← lista de componentes
      ├── RectTransform (posición)     ← siempre presente
      ├── Image (futuro)
      └── Text (futuro)
```

- **Hierarchy** muestra los GameObjects de la **Scene** (árbol, respeta `parentId`).
- **Inspector** abre el GameObject seleccionado y **recorre sus componentes**,
  dibujando el editor de cada uno.
- **Scene** renderiza cada GameObject: lo posiciona con su RectTransform y dibuja
  sus componentes visuales (Image / Text).

---

## 2. El punto fino: "RectTransform" son **3 cosas distintas**

Hoy el nombre `RectTransform` se usa para una sola cosa, pero en el modelo final
hay tres responsabilidades separadas. Tenerlas claras evita confusión:

| #   | Qué es                                                                           | Rol                                                                   | Dónde vive                      |
| --- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------- |
| 1   | **RectTransform-dato** (`position`, `size`, `pivot`)                             | Un **componente** del GameObject                                      | en `components[]` / modelo      |
| 2   | **RectTransform-render** (`<RectTransform>` actual, posiciona con `cqw/cqh`)     | **Plomería del engine**: la Scene lo usa para colocar cada GameObject | `engine/RectTransform.tsx`      |
| 3   | **RectTransform-editor** (campos Pos/Width/Height, hoy `RectTransformInspector`) | El editor que el Inspector dibuja                                     | `engine/` (carpeta de editores) |

> Tu frase "RectTransform no debería existir como objeto" aplica a **#1**: deja de
> ser un objeto suelto y pasa a ser data/componente. Pero **#2 sigue existiendo**
> como interno de la Scene (ya no lo usa el juego a mano).

---

## 3. Cada componente tiene **dos vistas**, no una

Esto es lo que falta en el plan inicial (que solo contemplaba el editor):

- **Editor** → lo que se ve en el Inspector (ej. los campos del RectTransform).
- **Render** → cómo se dibuja en la Scene (ej. el `Text` pinta las letras).

Un `Text` necesita **ambas**: su editor en el Inspector **y** su render en la
Scene. Por eso conviene que cada componente sea un módulo que exporte las dos
piezas (o que haya dos registros paralelos: uno de editores, uno de renders).

```
componente "text"
├── data:    { type: "text", value, fontSize, ... }
├── editor:  <TextInspector />     ← Inspector
└── render:  <TextView />          ← Scene
```

---

## 4. Registro por tipo (el mecanismo)

Para que el Inspector y la Scene "no sepan" de cada componente concreto, se usa un
**registro** indexado por `type`:

```ts
// pseudocódigo
const COMPONENT_REGISTRY = {
  rectTransform: { editor: RectTransformInspector, render: null },
  image: { editor: ImageInspector, render: ImageView },
  text: { editor: TextInspector, render: TextView },
};
```

- Inspector: `gameObject.components.map(c => REGISTRY[c.type].editor)`.
- Scene: por cada GameObject, posiciona con su RectTransform y dibuja los
  `render` de sus componentes.

Agregar un componente nuevo = crear su módulo y registrarlo. No se toca ni el
Inspector ni la Scene.

---

## 5. Estructura de carpetas propuesta

```
src/components/shared/engine/
├── Scene.tsx                 # el lienzo (ex-FullScreen) ✅ hecho
├── Hierarchy.tsx             # árbol de GameObjects ✅ hecho
├── Inspector.tsx             # cabecera + recorre componentes ✅ movido
├── RectTransform.tsx         # render-posicionador (#2) ✅ hecho
├── gameObject.ts             # modelo GameObject + componentes ✅ movido al engine
├── GameObjectView.tsx        # vista de un GameObject (posiciona + borde + contenido) ✅ hecho
└── components/               # ← carpeta de componentes (cada uno: data + editor + render)
    ├── rectTransform/
    │   ├── RectTransformInspector.tsx   # editor (#3) ✅ movido (reubicar aquí)
    │   └── ...
    ├── image/
    └── text/
```

> En la charla quedó "viewInspector" como nombre tentativo. Mi recomendación es
> agrupar **editor + render** juntos por componente (carpeta `components/<tipo>/`),
> no solo los editores. Ver **Decisión B**.

---

## 6. Estado (el backbone de verdad)

Hoy todo el grafo (`gameObjects`, `selectedId`, animaciones) vive en
`deletreo/page.tsx`. Si Hierarchy / Scene / Inspector son compartidos, terminarán
recibiendo muchísimas props si el estado no se levanta.

**Propuesta:** un store Zustand `useScene` (mismo patrón que `useWorkspaceHeader`):

```ts
useScene → {
  gameObjects, selectedId,
  select(id), patch(id, partial),
  addComponent(id, comp), removeComponent(id, type), ...
}
```

Hierarchy, Scene e Inspector se conectan al mismo store. El juego solo siembra los
GameObjects iniciales y agrega su lógica propia (ej. en deletreo: las animaciones
de subir/bajar el frame, el deletreo de letras).

Ojo: deletreo tiene lógica muy específica (gestos de edición, bounce/slide,
sonidos). Hay que decidir qué es **del engine** (genérico) y qué es **del juego**.
Ver **Decisión C**.

---

## 7. Decisiones a tomar

### Decisión A — ¿El RectTransform es un componente más o un campo fijo?

- **A1.** Campo dedicado `gameObject.transform` (como hoy). Garantía en tiempo de
  compilación de que siempre existe. El Inspector lo dibuja primero, fijo, y luego
  itera el resto de `components[]`.
- **A2.** Un componente más dentro de `components[]` (uniforme, todo se itera
  igual). Más extensible, pero se pierde la garantía de que exista (se necesita una
  invariante en runtime o un helper `getRectTransform()`).
- _Unity:_ el Transform es obligatorio y no se puede quitar → se parece a **A1**,
  pero se **dibuja** como un componente más (híbrido).

### Decisión B — Nombre y forma de la carpeta de componentes

- **B1.** `engine/components/<tipo>/` con editor **y** render juntos. _(recomendado)_
- **B2.** `engine/viewInspector/` solo con editores, y otra carpeta para renders.
- **B3.** Otro nombre (`inspectorViews`, `engine/inspector/components`, …).

### Decisión C — ¿Levantamos el estado a un store `useScene` ahora o después?

- **C1.** Ahora, antes de modelar componentes (base limpia para todo lo demás).
- **C2.** Después, cuando ya haya 2+ componentes y duela pasar props.

### Decisión D — Nombre `Scene` vs choques existentes

- Ya existen: la pestaña **"Scene"** de `ViewModeTabs` y la ruta `/workspaces/escena`.
- El componente `Scene` no rompe nada, pero el nombre se repite. ¿Lo dejamos así o
  diferenciamos (ej. `SceneStage`)?

---

## 8. Orden de implementación sugerido

1. ✅ Renombrar `FullScreen` → `Scene`.
2. ✅ Mover `Inspector` + `RectTransformInspector` a `engine/`.
3. Definir el **modelo de componentes** (`type` + registro) y mover `gameObject.ts`
   al engine. → depende de **Decisión A** y **B**.
4. Migrar RectTransform al modelo de componentes (editor desde el registro).
5. Hacer que la **Scene** renderice desde los componentes.
6. Construir el primer componente visual nuevo (**Text**) con sus dos vistas.
7. (Según **Decisión C**) levantar el grafo a `useScene`.

---

## 9. Estado actual (lo ya hecho)

- `engine/Scene.tsx` (ex-FullScreen), `engine/Hierarchy.tsx` (TreeView),
  `engine/RectTransform.tsx` (render + `parent` de 1 nivel),
  `engine/Inspector.tsx`, `engine/RectTransformInspector.tsx`,
  `engine/GameObjectView.tsx` (vista de un GameObject).
- `GameObject` con `id, name, active, parentId, transform, components[]`
  ya vive en `engine/gameObject.ts` (modular, reutilizable por otros games).
  `components[]` existe en el modelo pero aún no se renderiza (siguiente paso).
- Hierarchy muestra MainFrame con Text anidado; Inspector apunta al seleccionado.
- Deuda registrada: `docs/technical-debt.md` (TD-002 parent 1 nivel).

```

```
