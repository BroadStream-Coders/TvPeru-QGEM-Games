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

## [TD-014] El preloader de assets no encaja con cómo el componente Video carga su `src`

- **Ubicación:** `src/helpers/asset-preloader.ts` ↔ `src/components/shared/engine/components/video/videoComponent.ts`
- **Riesgo:** 5/10
- **Problema:** El preloader (`preloadAssets`) trabaja sobre un `AssetManifest` aparte (clave → `{ kind, src }`) que baja a blob y decodifica antes del primer render. El componente Video, en cambio, resuelve su `src` por su cuenta: modo **Link** (URL de Supabase escrita en el inspector) o modo **Equipo** (blob efímero del archivo local). Ninguna de las dos fuentes pasa por el manifest, así que el video que realmente se reproduce **no** se precarga; y al revés, un blob ya precargado por el manifest no se cablea de vuelta al modelo del Video. Además `loadOne` para `kind: "video"` sólo hace `fetch`→blob, **no** decodifica/espera `canplaythrough` como sí hace imagen y audio, por lo que ni siquiera garantiza readiness real.
- **Impacto futuro:** En cabina, un video pesado puede tironear o arrancar en negro en su primer play porque no estaba precargado, justo en una herramienta de salida en vivo. Al integrar Supabase habrá que decidir el contrato: o el Video declara su asset en el manifest (y consume el blob ya listo), o el preloader aprende a precargar lo que declaran los componentes Video de la escena. Hoy son dos caminos desconectados.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

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

## [TD-011] La carga de sesión de Operaciones Combinadas es un stub que no renderiza nada

- **Ubicación:** `src/app/workspaces/operaciones-combinadas/page.tsx:223`
- **Riesgo:** 4/10
- **Problema:** El `handleLoad` valida el JSON y lo guarda en `data`, pero nada lo consume: la grilla y la bandeja salen hardcodeadas de `gridConfig`/`INITIAL_TRAY`, no del archivo. Cargar una sesión "tiene éxito" sin cambiar nada en pantalla. Además queda un `console.log("Operaciones Combinadas cargado:", loaded)` (línea 229) de depuración en una herramienta de salida en vivo.
- **Impacto futuro:** En cabina, un operador puede cargar el archivo, no ver cambios y creer que la app falló. Hay que cablear `data` al render (poblar celdas/bandeja desde la sesión) y quitar el `console.log`.
- **Fecha:** 2026-06-19 · **Estado:** Abierto
