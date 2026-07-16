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

## [TD-063] Lab `motion` (~517 líneas) vive como ruta de producción

- **Ubicación:** `src/app/lab/motion/`
- **Riesgo:** 2/10
- **Problema:** Demo de exploración de `motion` como ruta del app de producción.
  Ya cumplió su rol (validar la librería antes de cablearla al engine).
- **Impacto futuro:** Peso muerto en el build y ruta accesible desde el navegador
  del estudio. Borrable una vez que el plan de animaciones (RM-088/089) cierre;
  git conserva la referencia.
- **Fecha:** 2026-07-16 · **Estado:** Abierto

## [TD-018] El dockview del editor no tiene tamaño mínimo de panel

- **Ubicación:** `src/app/workspaces/sandbox/EditorDock.tsx`
- **Riesgo:** 4/10
- **Problema:** los paneles se pueden redimensionar hasta casi cero; no hay un
  mínimo configurado, así que un panel puede quedar colapsado e inusable.
- **Impacto futuro:** layouts rotos o paneles inaccesibles sin forma clara de
  recuperarlos; se agrava mientras no exista el menú "Windows" (RM-043).
- **Fecha:** 2026-06-30 · **Estado:** Abierto

## [TD-010] Raíz del engine plana: 13 archivos mezclando 4 roles

- **Ubicación:** `src/components/shared/engine/` (raíz)
- **Riesgo:** 1/10
- **Problema:** La raíz tiene grupos latentes al mismo nivel sin separar: escena/render (`Scene`, `GameObjectView`, `RectTransform`, `ViewModeTabs`, `SceneViewMode`), paneles/edición (`GameObjectInspector`, `RectTransformInspector`, `AddComponentButton`, `Hierarchy`), primitivos UI (`SidePanel`, `NumberField`) y modelo/registro (`gameObject.ts`, `componentRegistry.ts`). El subárbol `components/` sí está bien ordenado.
- **Impacto futuro:** Hoy navegable; empezará a dispersarse cuando entre el store `useScene` (Decisión C) y al retomar Text. Umbral para agrupar (`scene/`, `panels/`, `core/`): cuando entre `useScene`.
- **Fecha:** 2026-06-16 · **Estado:** Abierto
