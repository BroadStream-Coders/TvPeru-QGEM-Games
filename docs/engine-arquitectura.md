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

### Quién es dueño del dato: el controlador (`useSceneEditor`)

El modelo de arriba dice que "el dato es la única verdad", pero falta lo más
práctico: **¿dónde vive ese dato y quién lo muta?** Esa pieza es el **controlador
de escena**, el hook `useSceneEditor` (`src/hooks/use-scene-editor.ts`).

Hay que distinguir **dos familias** de piezas en el engine:

- **Piezas presentacionales (controladas):** `RectTransform`, `GameObjectView`,
  `SelectionOverlay`, `useTransformGesture`, `RectTransformInspector`, los editores
  de cada componente. **No tienen estado propio.** Reciben datos por props y avisan
  de los cambios por callbacks. El `RectTransformInspector` no sabe qué es un
  GameObject ni dónde vive: recibe `transform={…}` y, cuando el usuario escribe 45,
  llama `setRotation(45)`. Qué hacer con ese 45 **no es asunto suyo**.
- **El controlador (`useSceneEditor`):** es el cerebro. Es el **único dueño** del
  estado autorado de la escena (`gameObjects[]` + `selectedId`) y el **único** que lo
  muta. Traduce "el usuario escribió 45" → "busca el GameObject seleccionado y
  reemplázalo por uno nuevo con `rotation: 45`".

```
useSceneEditor({ registry, initialGameObjects, initialSelectedId })
   │
   ├─ posee:   useState(gameObjects), useState(selectedId)
   ├─ deriva:  selected, hierarchyNodes (el árbol para Hierarchy)
   ├─ monta:   el gesto de arrastre de la Scene (stageRef, beginGesture)
   └─ devuelve: las operaciones ya armadas (setAxis, setRotation, addComponent,
                removeComponent, patchComponent, createNewGameObject,
                deleteGameObject, handleReorder, setGameObjectSize, animatePosition…)
```

El **ciclo completo** de una edición (sigue el "45 en Rotation"):

```
1. RectTransformInspector  → llama setRotation(45)                 (pieza controlada)
2. useSceneEditor          → setGameObjects(prev => …rotation:45…)  (el controlador muta)
3. React re-renderiza con el nuevo gameObjects[]
4. GameObjectView          → lee gameObject.transform.rotation
5. RectTransform           → aplica rotate(45deg) alrededor del pivot  (render)
```

Es el flujo unidireccional puro del diagrama de arriba: el estado vive en un solo
sitio, baja como props y los componentes mandan eventos de vuelta. Por eso podés
cambiar el render (paso 5) sin tocar el Inspector, y cambiar el controlador
(paso 2) sin tocar los juegos.

**Qué pone cada juego y qué hereda.** El controlador es genérico; lo único propio
de un juego es **con qué arranca** y su lógica de show:

```tsx
const { selected, setAxis, setRotation, beginGesture, … } = useSceneEditor({
  registry,                       // el registro de componentes de ESTE juego (§3)
  initialSelectedId: FRAME_ID,
  initialGameObjects: () => [ /* los GameObjects de partida de este juego */ ],
});
```

Todo el aparato de editarlos y mostrarlos (inspector, jerarquía, gesto, render) lo
hereda y no lo ve. Esto vale para **los 5 juegos** (sandbox, intruso, deletreo,
calculo-mental, operaciones-combinadas).

> **La regla práctica:** una propiedad nueva del transform o de la escena (rotación,
> `localScale` WL-007, anclajes WL-003) se agrega **una sola vez** en `useSceneEditor`
> + el render, y los juegos la heredan. **Antes** no era así: cada `page.tsx`
> reimplementaba el controlador a mano (las mismas ~9 funciones duplicadas), así que
> un cambio de engine se multiplicaba por juego. Cerrarlo fue la **Decisión C / TD-017**.

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
existe y funciona: `engine/componentRegistry.ts`. El registro es **componible y
tipado**: el engine no expone un objeto global mutable, sino las piezas para que
**cada juego arme el suyo** (nativas + las propias).

```ts
// engine/componentRegistry.ts (forma real, simplificada)
export interface ComponentDefinition<C extends GameObjectComponent = GameObjectComponent> {
  type: C["type"];
  label: string; // nombre visible en el dropdown "Agregar componente"
  create: () => C; // fábrica del modelo por defecto
  view: ComponentType<{ component: C }>; // la Vista (Scene)
  editor: ComponentType<{ component: C; onChange; onRemove; onResize }>; // el Editor (Inspector)
}

// Helper tipado: ata vista/editor al modelo C en compilación (cierra TD-004).
export function defineComponent<C>(def: ComponentDefinition<C>): ComponentDefinition { … }

// Cada carpeta de componente exporta su definición desde su index.ts:
//   image/index.ts → export const imageDefinition = defineComponent<ImageComponent>({ … })
export const NATIVE_COMPONENTS = [imageDefinition, colorDefinition, videoDefinition, textDefinition];

export function createComponentRegistry(defs): { get(type): ComponentDefinition | undefined; options: {type,label}[] };
export const ComponentRegistryProvider; // context: el juego provee su registro
export function useComponentRegistry();  // GameObjectView lo lee (igual que useSceneViewMode)
```

**Registro por juego (RM-003):** cada workspace hace
`const registry = createComponentRegistry([...NATIVE_COMPONENTS, miCustom])`, envuelve
su árbol de `GameObjectView` con `<ComponentRegistryProvider value={registry}>` y usa
`registry.get/options` en el Inspector y el `AddComponentButton`. Así un juego suma un
componente propio **sin tocar el core** (los custom viven en
`workspaces/<juego>/components/<tipo>/`; ej. `sandbox/components/border/`).

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
cumple: Image y Color se sumaron solo tocando su carpeta + el registro. Si el
componente es **propio de un juego**, ni siquiera toca el engine: se registra en el
`createComponentRegistry` de ese workspace (ver §3, RM-003).

> Nota de tipos: `defineComponent<C>` ata vista y editor al modelo `C` en
> compilación, así que un emparejamiento mal hecho es error de build. **TD-004
> resuelto** (el único `as` queda dentro del helper, no por entrada).

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
(`[container-type:size]`). El contenido que **no** depende de la jerarquía
(p. ej. el tamaño de fuente del SpellFrame) se mide en unidades de container query
(`cqw`/`cqh`/`cqi`), nunca en `vw`/`rem`/`px`, para verse idéntico en ventana o
fullscreen (en fullscreen se hace letterbox sobre negro).

El **posicionamiento de los GameObjects** (`RectTransform`), en cambio, usa
porcentajes (`%`) **relativos al padre** y se apoya en el anidamiento DOM nativo
para resolver la jerarquía (ver §7): cada `GameObjectView` hijo se renderiza
**dentro** del div de contenido de su padre, así que su `%` resuelve contra la
caja del padre. Para los root el "padre" es el stage (`parentSize = DESIGN`),
y `100%` del stage equivale a `100cqw`/`100cqh`, así que el resultado es idéntico
al esquema anterior.

Espacio de diseño y origen (definidos en `engine/RectTransform.tsx`):

- `DESIGN_WIDTH = 1920`, `DESIGN_HEIGHT = 1080`.
- **Origen en el centro del padre, eje Y hacia arriba.**
- `RectTransform` recibe `parentSize: Vec2` (default `{ DESIGN_WIDTH, DESIGN_HEIGHT }`)
  con las dimensiones de diseño del padre. Conversión a CSS:
  `left = (0.5 + x / parentSize.x) * 100 %`,
  `top = (0.5 − y / parentSize.y) * 100 %`,
  `width = (size.x / parentSize.x) * 100 %`,
  `height = (size.y / parentSize.y) * 100 %`;
  el `pivot` se aplica con `translate(−pivot.x*100%, −pivot.y*100%)`.
- **Parenting:** lo resuelve el DOM. La `position` del hijo es relativa al padre
  (origen (0,0) = centro del padre) y mover el padre arrastra a toda su
  descendencia, acumulando por toda la cadena de ancestros. Resolvió **TD-002**.
  El sistema de coordenadas que ve el usuario en el Inspector **no cambió** (mismos
  números, solo cambió la unidad CSS de salida de `cqw`/`cqh` a `%`).

---

## 6. Convención de nombres

Por cada tipo, el par es **`XxxInspector` (edita) / `XxxView` (dibuja)**:

| Tipo            | Editor (Inspector)       | Vista (Scene)                           | Modelo              |
| --------------- | ------------------------ | --------------------------------------- | ------------------- |
| GameObject      | `GameObjectInspector`    | `GameObjectView`                        | `gameObject.ts`     |
| RectTransform   | `RectTransformInspector` | `RectTransform` _(plomería, excepción)_ | (campo `transform`) |
| Image           | `ImageInspector`         | `ImageView`                             | `imageComponent.ts` |
| Color           | `ColorInspector`         | `ColorView`                             | `colorComponent.ts` |
| Video           | `VideoInspector`         | `VideoView`                             | `videoComponent.ts` |
| Text _(futuro)_ | `TextInspector`          | `TextView`                              | `textComponent.ts`  |

- `View` = "vista" de la tripleta (modelo / control / **vista**).
- El **dato** se queda con el nombre limpio (`GameObject`), la **vista** lleva
  sufijo (`GameObjectView`). Además los archivos `gameObject.ts` y
  `GameObjectView.tsx` no chocan en mayúsculas en Windows.
- El modelo de cada componente va en `…Component.ts` (minúscula inicial) con su
  `interface XxxComponent extends GameObjectComponent` y un `createXxxComponent()`.

---

## 7. Estructura de carpetas

> **Import:** el engine se importa con el alias **`@engine/*`** (definido en
> `tsconfig.json` `paths`, apunta a `src/components/shared/engine/*`). Usar
> `import { Scene } from "@engine/Scene"`, **no** `@/components/shared/engine/Scene`.
> Validar siempre con `pnpm build` (el alias debe resolver en Turbopack y en el
> type-check de TS).

```
src/components/shared/engine/   →  alias @engine/
├── Scene.tsx                  # el lienzo 16:9 (ex-FullScreen) + pestañas Game/Scene; fondo fijo bg-muted (sin prop background)
├── ViewModeTabs.tsx           # pestañas Game/Scene que renderiza la propia Scene
├── SceneViewMode.tsx          # contexto del viewMode (Scene lo provee, GameObjectView lo lee)
├── RectTransform.tsx          # posicionador (#2, unidades %, prop parentSize) + Vec2/RectTransformValues + DESIGN_*
├── gameObject.ts              # modelo GameObject + createGameObject + GameObjectComponent
├── GameObjectView.tsx         # vista de un GameObject (posiciona + dibuja components[] + hijos en árbol + borde)
├── GameObjectInspector.tsx    # editor de los campos propios del GameObject (name, active)
├── RectTransformInspector.tsx # editor (#3) del transform (Pos/Width/Height + botón "Editar")
├── NumberField.tsx            # input numérico reutilizable estilo Unity (draft local, commit en blur/Enter, calculadora +-*/() sin eval)
├── Hierarchy.tsx              # árbol de GameObjects (TreeNode + Hierarchy); prop onAdd → "+"
├── AddComponentButton.tsx     # botón + dropdown "Agregar componente" (lee COMPONENT_OPTIONS)
├── SidePanel.tsx              # marco visual (pestaña + caja) para Hierarchy e Inspector
├── componentRegistry.ts       # COMPONENT_REGISTRY + COMPONENT_OPTIONS (el pegamento por type)
└── components/                # una carpeta por tipo, cada una con su tripleta
    ├── image/
    │   ├── imageComponent.ts  #   modelo (src, fit, fileName)
    │   ├── ImageView.tsx      #   vista (background-image según fit)
    │   └── ImageInspector.tsx #   editor (cargar desde equipo, ajuste, fit-a-imagen, eliminar)
    ├── color/
    │   ├── colorComponent.ts  #   modelo (value)
    │   ├── ColorView.tsx      #   vista (div que rellena el rect con backgroundColor)
    │   └── ColorInspector.tsx #   editor (color picker + hex, eliminar)
    └── video/
        ├── videoComponent.ts  #   modelo (src, fit, source: "file"|"url", fileName)
        ├── VideoView.tsx      #   vista (<video> autoPlay loop muted playsInline, object-fit)
        └── VideoInspector.tsx #   editor (Equipo/Link, ajuste, fit-a-original, eliminar)
```

`GameObjectView` (la vista) hoy estructura cada objeto en 3 capas, en este orden:

1. `<RectTransform>` que lo posiciona (capa #2 de arriba). Recibe `parentSize`
   (el `transform.size` del padre) para resolver sus `%`; los root no lo reciben
   y usan el default `DESIGN`.
2. un div de **contenido** (`absolute inset-0`) que dibuja, en orden: las **Vistas
   de `components[]`** (vía el registro), luego sus **GameObjects hijos** (cada uno
   un `GameObjectView` anidado, encontrado con `allGameObjects.filter(parentId)` y
   con `parentSize = este transform.size`), y por último el contenido por-objeto que
   inyecta el host. Por eso las páginas renderizan en **árbol**: solo mapean los root
   (`!parentId`) y la jerarquía la baja el DOM. El contenido por-objeto (overlays de
   edición, SpellFrame) NO viaja por `children` sino por el render-prop
   **`renderContent(go)`**, que `GameObjectView` invoca para sí mismo y **pasa
   recursivamente** a los hijos junto con `selectedId`/`editMode`; así los handles,
   el borde de selección y el SpellFrame aparecen a cualquier profundidad. La
   conversión local↔mundo del gesto de edición la hace `ancestorOffset(go, all)`
   (en `gameObject.ts`), que acumula la posición de toda la cadena de ancestros.
3. un div de **borde** superpuesto (`absolute inset-0`, `pointer-events-none`),
   dibujado **al final** para que la selección siempre se vea por encima del
   contenido. Va aparte porque un `border` cambiaría el tamaño de la caja.

El borde se dibuja si el `outline` que pasa el host es `true` **o** si el viewMode
de la Scene es `"scene"`. La `Scene` renderiza las pestañas **Game/Scene** arriba a
la izquierda, guarda el `viewMode` y lo expone por contexto (`SceneViewMode`); cada
`GameObjectView` lo lee, así que en modo "scene" **todos** los GameObjects muestran
su recuadro de referencia sin que el juego tenga que cablear nada. Por eso las
pestañas viajan con la `Scene`: aparecen en deletreo, sandbox y cualquier juego.

---

## 8. Quién usa el engine hoy

Hoy lo usan **5 workspaces** (sandbox, intruso, deletreo, calculo-mental,
operaciones-combinadas), todos a través del controlador `useSceneEditor` (§2). Los
dos de abajo son los ejemplos de referencia:

- **`workspaces/deletreo`** → el juego de referencia. Usa el engine completo:
  `Scene` + `Hierarchy` (con "+") + `GameObjectInspector` + `RectTransformInspector`
  - editores de `components[]` por el registro + `AddComponentButton`. Arranca con
    tres GameObjects: **Background** (un componente **Color** verde croma que llena el
    stage, sin lógica especial), **MainFrame** (con un componente **Image**) y **Text**
    (hijo). La tecla **F** muta el `src` de ese Image (marco normal ↔ error); es la fuente de
    verdad del swap. Tiene además lógica propia de juego (gestos de edición,
    animaciones bounce/slide, sonidos, el deletreo de letras) que es **del juego**, no
    del engine.
- **`workspaces/sandbox`** → banco de pruebas, ya **reescrito sobre el engine**:
  mismo layout Hierarchy + Scene + Inspector que deletreo, sin GameObjects iniciales.
  Sirve para crear objetos con "+" y agregarles componentes (Image, Color) libremente.
  El fondo de la Scene es fijo (`bg-muted`); cualquier fondo real se compone como un
  GameObject más.

---

## 9. Estado actual

**Hecho:**

- `engine/` consolidado con todos los archivos de §7.
- Modelo `GameObject { id, name, active, parentId, transform, components[] }`,
  modular y reutilizable. GameObjects nuevos se crean con **size 100×100**, centrados.
- **El registro por `type` está vivo** (`componentRegistry.ts`): `GameObjectView`
  dibuja las Vistas de `components[]` y el Inspector recorre sus Editores, ambos
  desde el registro. Agregar un tipo no toca Inspector ni Scene.
- **Registro componible y tipado por juego (RM-003):** el engine expone
  `NATIVE_COMPONENTS` + `createComponentRegistry`/`ComponentRegistryProvider`/
  `useComponentRegistry` y el helper tipado `defineComponent<C>`. Cada juego arma su
  registro local; un componente propio de un juego se registra sin tocar el core
  (demostrado con `Border` en `sandbox/components/border/`). Cerró **TD-004**.
- **Tres componentes reales** con su tripleta: **Image** (cargar desde equipo —no URL—,
  ajuste contain/cover/fill, "Ajustar al tamaño de la imagen", eliminar), **Color**
  (color picker + hex que rellena el rect, eliminar) y **Video** (dos modos: Equipo
  —blob URL, efímero **por diseño**, preview local— y Link —URL de Supabase, el modo
  persistente para broadcast—; siempre
  `muted`+`loop`, ajuste contain/cover/fill, "Ajustar al tamaño del video", eliminar).
  YouTube se evaluó y descartó como fuente (**TD-007**).
- UI de composición genérica y compartida: **Hierarchy con "+"** (crear GameObject),
  **`AddComponentButton`** (dropdown que lista el registro), botón **eliminar** por
  componente, **`SidePanel`** como marco. La usan deletreo y sandbox igual.
- Convención de nombres `…Inspector` / `…View` / `…Component.ts` aplicada.
- **Controlador de escena compartido (`useSceneEditor`, TD-017):** el estado del
  grafo (`gameObjects[]` + `selectedId`) y todas sus mutaciones, antes duplicados en
  cada `page.tsx`, viven en un hook único; los 5 juegos lo desestructuran. Ver §2 y
  Decisión C.

**Pendiente / lo que sigue:**

- Componente **Text** (pausado): el subrayado es un `div` aparte y cada letra sería
  su propio GameObject con su Text; el modelo lleva los datos de la card menos Offset
  (posiciona el rectTransform). Ver memoria `engine-text-component-direction`.

---

## 10. Decisiones (tomadas y abiertas)

**A — ¿El transform es campo fijo o un componente más?** → **Decidido: campo fijo.**
`gameObject.transform` siempre existe (garantía en compilación), fuera de `components[]`.

**B — Forma de la carpeta de componentes.** → **Decidido:** `engine/components/<tipo>/`
con **modelo + editor + vista juntos** por tipo (ver §7). Image y Color ya siguen esto.

**C — ¿Levantar el estado a un controlador compartido?** → **Decidido y hecho
(TD-017).** El grafo estaba duplicado en los 5 `page.tsx` con helpers idénticos
(createNewGameObject, addComponent, removeComponent, patchComponent,
setGameObjectSize, setAxis…). Se extrajo al hook **`useSceneEditor`**
(`src/hooks/use-scene-editor.ts`), dueño único de `gameObjects[]` + `selectedId` y de
todas las mutaciones (ver §2, "Quién es dueño del dato"). Cada juego solo lo
desestructura pasando `initialGameObjects`/`initialSelectedId`. Quedó como **hook**
(no un store Zustand) porque el estado es **por-escena/por-página**, no global como
`useWorkspaceHeader`.

**E — ¿Cómo registra un juego sus componentes propios?** → **Decidido (RM-003):**
registro **componible + React context**, no global mutable. El engine exporta las
nativas y el builder; cada juego arma su registro (`createComponentRegistry`) y lo
provee por `ComponentRegistryProvider` (espeja `SceneViewMode`). Los componentes
propios de un juego viven en `workspaces/<juego>/components/<tipo>/`, no en el engine.

**D — Nombre `Scene` vs choques.**
Existe la pestaña "Scene" de `ViewModeTabs` (ahora dentro del propio componente
`Scene`) y antes la ruta `/escena`. El componente `Scene` no rompe nada; se deja
así salvo que moleste el nombre repetido.

---

## 11. Orden de implementación sugerido

1. ✅ `FullScreen` → `Scene`; mover Inspector/RectTransformInspector al engine.
2. ✅ Modelo `GameObject` + `GameObjectView` en el engine; nombres normalizados.
3. ✅ Registro por `type` + primer componente real (**Image**) con su tripleta.
4. ✅ `GameObjectView` dibuja las Vistas de `components[]` desde el registro.
5. ✅ Inspector genérico que recorre `components[]` + `AddComponentButton` + eliminar.
6. ✅ Segundo componente (**Color**) sumado solo con su carpeta + entrada del registro.
   6b. ✅ Tercer componente (**Video**) sumado igual (carpeta + entrada del registro).
7. ✅ Registro componible + tipado por juego (**RM-003**): `defineComponent<C>`,
   `NATIVE_COMPONENTS`, `createComponentRegistry` + context; demo `Border` en sandbox.
   Cerró **TD-004**.
8. ✅ (**Decisión C / TD-017**) controlador compartido `useSceneEditor`: el grafo
   duplicado se levantó a un hook dueño del estado; los 5 juegos lo desestructuran.
9. ⏳ Componente **Text** (pausado, ver §9 y la memoria del proyecto).
