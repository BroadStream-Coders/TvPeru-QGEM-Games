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

## [TD-020] El export de escena puede filtrar data de runtime (strip opt-in + campos que el strip no cubre)

- **Ubicación:** `src/components/shared/engine/componentRegistry.ts` (campo `stripForExport`) · consumido en `src/components/shared/engine/editor/EditorLayout.tsx` (`handleExport`)
- **Riesgo:** 6/10
- **Problema:** El export de escena (File → Export) limpia la data de runtime de
  cada componente llamando a su `stripForExport`, pero hay dos huecos:
  1. **Es opcional.** Un componente que guarde estado de runtime en el GameObject
     (hoy `deletreo`/`spellframe`/`controller`/`slot`, escritos por sus behaviors) y
     **olvide** declarar `stripForExport` exporta esa data sin aviso.
  2. **El strip es por-componente**, así que no alcanza a: (a) campos de runtime que
     un behavior escribe en un **componente nativo** compartido —p. ej. `calculo-mental`
     mete la pregunta/respuesta en el `text` nativo, que en otros juegos es diseño, así
     que no se puede stripear a ciegas; (b) `active` a nivel **GameObject** (no es
     componente). Ambos solo salen limpios si se exporta desde un **estado limpio**
     (sesión sin cargar, sin jugar). De hecho el primer `scene.json` de calculo-mental
     salió con preguntas, `active:true` y URLs blob muertas por exportarse a mitad de juego.
- **Impacto futuro:** Un `scene.json` commiteado como "diseño" puede quedar contaminado
  con data de una sesión concreta (palabras, `active`, blobs muertos), rompiendo la
  premisa de que el diseño no lleva data. Falla en silencio (no hay error ni test).
  Mitigación posible: exportar siempre desde estado limpio como convención; o separar
  el estado de runtime del estado de diseño en el editor (que los behaviors no muten
  los mismos GameObjects que se exportan); o un chequeo que avise si se exporta con
  data cargada.
- **Fecha:** 2026-07-04 · **Estado:** Abierto

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
