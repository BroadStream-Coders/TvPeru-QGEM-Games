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

## [TD-062] Los inspectors de sesión muestran "Sin sesión cargada" leyendo del diseño

- **Ubicación:** `src/app/workspaces/*/components/*/​*Inspector.tsx` (los 4 juegos muestran `component.fileName`)
- **Riesgo:** 2/10
- **Problema:** La línea de estado de sesión en los inspectors de controller lee
  `component.fileName` del diseño, que nunca se llena (la sesión ahora vive en
  `useGameSession`, y antes vivía en runtime, que el Inspector tampoco veía).
  Siempre dice "Sin sesión cargada" aunque haya una.
- **Impacto futuro:** UI que miente al operador. Arreglo: leer
  `useGameSession((s) => s.fileName)` en esos inspectors (y quitar `fileName` de
  los tipos de componente de diseño).
- **Fecha:** 2026-07-09 · **Estado:** Abierto

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

## [TD-010] Raíz del engine plana: 13 archivos mezclando 4 roles

- **Ubicación:** `src/components/shared/engine/` (raíz)
- **Riesgo:** 1/10
- **Problema:** La raíz tiene grupos latentes al mismo nivel sin separar: escena/render (`Scene`, `GameObjectView`, `RectTransform`, `ViewModeTabs`, `SceneViewMode`), paneles/edición (`GameObjectInspector`, `RectTransformInspector`, `AddComponentButton`, `Hierarchy`), primitivos UI (`SidePanel`, `NumberField`) y modelo/registro (`gameObject.ts`, `componentRegistry.ts`). El subárbol `components/` sí está bien ordenado.
- **Impacto futuro:** Hoy navegable; empezará a dispersarse cuando entre el store `useScene` (Decisión C) y al retomar Text. Umbral para agrupar (`scene/`, `panels/`, `core/`): cuando entre `useScene`.
- **Fecha:** 2026-06-16 · **Estado:** Abierto
