# Deuda Técnica

Registro de atajos, decisiones pendientes y riesgos a futuro de este proyecto.
Código `TD-###` (nunca se reutiliza). Al resolverse, la entrada se mueve al
changelog y se borra de aquí.

**Formato de cada entrada:**

- **Ubicación:** `archivo:línea` afectado.
- **Riesgo:** del 1 al 10 (1-3 cosmético · 4-6 ralentiza/moderado · 7-9 bug latente o seguridad · 10 crítico).
- **Problema:** qué está mal, sintetizado.
- **Impacto futuro:** qué puede causar si no se atiende.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [TD-061] Los blobs de la sesión no se liberan al salir del workspace

- **Ubicación:** `src/components/shared/engine/editor/EditorLayout.tsx:501` (unmount solo hace `resetRuntime()`) · `src/app/workspaces/intruso/session.ts` (crea los blob URLs)
- **Riesgo:** 3/10
- **Problema:** Al desmontar el workspace se resetea el runtime, pero los blob
  URLs de la sesión (fotos de Intruso) no se revocan y la categoría "Sesión" del
  presupuesto de memoria no se limpia. Resultado: al cambiar de juego sin
  recargar la página, la RAM de las fotos sigue retenida por el navegador y el
  MemoryBadge sigue mostrando "Sesión: X MB" de un juego que ya no está en
  pantalla. Catálogo y Local sí se liberan (EditorLayout:451-452).
- **Impacto futuro:** Navegar entre varios juegos con sesiones pesadas en una
  misma tanda acumula memoria fantasma. Arreglo probable: un registro central de
  URLs de sesión (store pequeño con `dispose()`) que los loaders alimentan y
  EditorLayout revoca + `clear("session")` en el unmount.
- **Fecha:** 2026-07-08 · **Estado:** Abierto

## [TD-060] Recargar una sesión con el mismo nombre no refresca la vista (Cálculo Mental, Deletreo)

- **Ubicación:** `src/app/workspaces/calculo-mental/CalculoMentalBehavior.tsx:55` (deps del efecto keyed por `fileName`) · patrón equivalente en Deletreo
- **Riesgo:** 3/10
- **Problema:** El efecto que vuelca la sesión a la escena depende de
  `[índices, fileName]`. Si el operador re-exporta la sesión y la carga con el
  mismo nombre de archivo estando en los índices iniciales, las deps no cambian
  y la pantalla sigue mostrando la data anterior hasta navegar. Intruso ya lo
  resuelve con un sello `loadedAt: Date.now()` en el controller.
- **Impacto futuro:** Corrección de último minuto antes del vivo que "no entra"
  sin explicación. Arreglo: replicar el `loadedAt` de Intruso en los otros
  behaviors.
- **Fecha:** 2026-07-08 · **Estado:** Abierto

## [TD-059] Inspector y Hierarchy no ven ni editan el estado runtime

- **Ubicación:** `src/components/shared/engine/editor/EditorLayout.tsx:70-145` (HierarchyPanel/InspectorPanel leen `useEditor`, solo diseño) · `src/components/shared/engine/runtime/sceneRuntime.ts:23` (`ov.active ?? go.active`)
- **Riesgo:** 5/10
- **Problema:** El canvas renderiza `mergeRuntime(diseño, runtime)`, pero Hierarchy
  e Inspector están cableados solo al diseño (`e.hierarchyNodes`, `e.selected`,
  `e.patchGameObject`). Toda propiedad que el behavior pisó vía `useSceneRuntime`
  (`active` de los textos, `text` de los componentes, `status` de los slots) queda
  de facto inmutable desde el editor: el toggle de active y el campo de texto
  escriben al diseño, pero el override de runtime siempre gana en el merge, así
  que el cambio no se ve. Además el Inspector muestra valores viejos (el texto de
  diseño, no la pregunta cargada de la sesión).
- **Impacto futuro:** Rompe el flujo del operador pre-vivo (RM-075): con la data
  cargada como referencia visual puede mover transform y fuente (props que el
  behavior no pisa) pero no apagar un GameObject ni tocar su texto, sin ningún
  indicio de por qué. Arreglo probable: Inspector/Hierarchy leen el merge y, al
  editar una prop con override, limpian ese override puntual además de escribir
  al diseño (el behavior sigue siendo autoridad cuando vuelva a escribir).
- **Fecha:** 2026-07-08 · **Estado:** Abierto

## [TD-057] `supabase.ts` lee las env vars con `!` sin validar

- **Ubicación:** `src/helpers/supabase.ts:4-5`
- **Riesgo:** 3/10
- **Problema:** `createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, …ANON_KEY!)`
  usa non-null assertion: si falta una env var, el cliente se crea con
  `undefined` y el error aparece lejos de la causa (en el primer request o en
  auth), no al arrancar. `storage-check` y `asset-source` sí manejan la ausencia
  con `|| ""` / opcional.
- **Impacto futuro:** En una máquina nueva (estudio, otro dev) sin `.env` el
  síntoma será críptico. Un guard que lance "falta NEXT_PUBLIC_SUPABASE_URL" al
  crear el cliente lo hace obvio.
- **Fecha:** 2026-07-07 · **Estado:** Abierto

## [TD-058] Páginas `lab/` (~1.250 líneas de demos) conviven con producción

- **Ubicación:** `src/app/lab/` (`motion`, `react-moveable`, `dockview`)
- **Riesgo:** 2/10
- **Problema:** Los laboratorios de exploración (motion 517 líneas, moveable 458,
  dockview 280) viven como rutas del mismo app de producción. Cumplieron su rol
  (validar librerías antes de cablear); hoy son peso muerto en el build y rutas
  accesibles desde el navegador del estudio.
- **Impacto futuro:** Ruido al navegar el código y superficie accidental en
  producción. Cuando un lab ya se promovió al engine (motion → RM/WL-019,
  moveable/dockview ya cableados), su página puede borrarse; git conserva la
  referencia.
- **Fecha:** 2026-07-07 · **Estado:** Abierto

## [TD-019] Ctrl/Cmd+D (duplicar) choca con el atajo de marcador en Brave

- **Ubicación:** `src/components/shared/engine/editor/SceneCanvas.tsx` (handler `onKeyDown`)
- **Riesgo:** 2/10
- **Problema:** El duplicar usa Ctrl/Cmd+D con `preventDefault()`. En Chrome (el
  target del proyecto) esto cancela el diálogo de marcador y funciona. En Brave (y
  algún otro Chromium con el atajo "cableado") el navegador captura Ctrl+D antes que
  la página, así que en vez de duplicar guarda un marcador.
- **Impacto futuro:** Ninguno en el equipo del estudio (solo Chrome). Solo relevante
  si algún día se usa en otro navegador; ahí habría que ofrecer un atajo alternativo
  (p. ej. Ctrl+J) o un botón/menú de "Duplicar" en el canvas/Hierarchy. Esencialmente
  fuera de alcance por la convención "target solo Chrome".
- **Fecha:** 2026-07-04 · **Estado:** Abierto

## [TD-018] El dockview del editor no tiene tamaño mínimo de panel

- **Ubicación:** `src/app/workspaces/sandbox/EditorDock.tsx`
- **Riesgo:** 4/10
- **Problema:** los paneles se pueden redimensionar hasta casi cero; no hay un
  mínimo configurado, así que un panel puede quedar colapsado e inusable.
- **Impacto futuro:** layouts rotos o paneles inaccesibles sin forma clara de
  recuperarlos; se agrava mientras no exista el menú "Windows" (RM-043).
- **Fecha:** 2026-06-30 · **Estado:** Abierto

## [TD-008] `contentRef` añadido al `GameObjectView` genérico por una necesidad de un juego

- **Ubicación:** `src/components/shared/engine/GameObjectView.tsx`
- **Riesgo:** 3/10
- **Problema:** Se añadió el prop `contentRef?: (go) => Ref<HTMLDivElement>` al `GameObjectView` del engine para que Deletreo pudiera atar las animaciones de shake/pop al div de contenido interno del MainFrame (envuelve la imagen, sin el `transform` de pivote del `RectTransform`, que la animación pisaría). Es código genérico del engine modificado para resolver una necesidad puntual de un workspace.
- **Objetivo del cambio:** Que las animaciones de error (tecla F) y correcto (tecla M) se apliquen a la imagen del marco y a sus hijos, no solo a las letras; el `contentRef` da acceso al único elemento del árbol del GameObject que se puede animar sin romper el posicionamiento.
- **Impacto futuro:** Es un punto de extensión válido pero abre la puerta a que el engine acumule props ad-hoc por demanda de juegos. Revisar si conviene una API de animación/efectos más formal a nivel de GameObject (p. ej. un componente o hook del engine) antes de que aparezcan más casos así.
- **Fecha:** 2026-06-11 · **Estado:** Abierto

## [TD-009] `Vec2` (tipo nuclear) vive dentro de `RectTransform.tsx`

- **Ubicación:** `src/components/shared/engine/RectTransform.tsx:7`
- **Riesgo:** 1/10
- **Problema:** `Vec2` y `RectTransformValues` —los tipos de datos más usados del engine, importados por `gameObject.ts`, `componentRegistry.ts`, los gestos y casi todo— se declaran dentro de un archivo de componente React (`.tsx`), junto al positioner y a las constantes `DESIGN_*`. Es el único sitio donde un tipo nuclear y un componente comparten archivo.
- **Impacto futuro:** Ninguno funcional; solo acoplamiento conceptual (importar un tipo puro arrastra un `.tsx`). Si se limpia, `Vec2`/`RectTransformValues` pedirían un `geometry.ts`/`types.ts` propio.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [TD-010] Raíz del engine plana: 13 archivos mezclando 4 roles

- **Ubicación:** `src/components/shared/engine/` (raíz)
- **Riesgo:** 1/10
- **Problema:** La raíz tiene grupos latentes al mismo nivel sin separar: escena/render (`Scene`, `GameObjectView`, `RectTransform`, `ViewModeTabs`, `SceneViewMode`), paneles/edición (`GameObjectInspector`, `RectTransformInspector`, `AddComponentButton`, `Hierarchy`), primitivos UI (`SidePanel`, `NumberField`) y modelo/registro (`gameObject.ts`, `componentRegistry.ts`). El subárbol `components/` sí está bien ordenado.
- **Impacto futuro:** Hoy navegable; empezará a dispersarse cuando entre el store `useScene` (Decisión C) y al retomar Text. Umbral para agrupar (`scene/`, `panels/`, `core/`): cuando entre `useScene`.
- **Fecha:** 2026-06-16 · **Estado:** Abierto
