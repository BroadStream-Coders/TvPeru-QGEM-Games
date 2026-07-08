# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**

- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso / Diferido).

---

## Estrategia (2026-06-17): juegos a mano primero, engine después

Decisión: sacar los juegos a mano para no perder la ventana de oportunidad, e
iterar hacia el engine genérico **promoviendo patrones reales** que aparezcan en
varios juegos (como ya pasó con el SpellFrame, RM-006). El roadmap está ordenado
por fases; lo de engine puro queda **diferido** a la Fase 2 (conserva su código y
su "Hecho cuando", pero no es el foco actual).

---

# ⭐ Terna prioritaria — Evaluación del proyecto (2026-07-07)

> Las 3 acciones de mayor retorno/esfuerzo detectadas en la evaluación de
> escalabilidad/producto. **En pausa deliberada:** ahora el foco es sacar juegos;
> hacer más engine/sistema antes de eso sería miedo a lanzar. Se retoman cuando
> se destrabe la salida de juegos.

## [RM-073] Campo `version` en `scene.json`

- **Objetivo:** Que toda escena exportada lleve un campo de versión del formato
  (p. ej. envolver el array en `{ version: 1, gameObjects: [...] }` o campo
  equivalente), y que la carga lo lea. Hoy el export es un array pelado: el día
  que cambie el modelo de `GameObject`, cada `scene.json` exportado por
  producción se vuelve ilegible sin forma de detectar de qué versión era.
- **Hecho cuando:** el export escribe la versión, la carga la valida (y rechaza
  o migra versiones viejas con mensaje claro), y los 3 `scene.json` sembrados
  la incluyen.
- **Fecha:** 2026-07-07 · **Estado:** Abierto

## [RM-074] CI mínimo + tests de las funciones puras del engine

- **Objetivo:** Red de seguridad automatizada mínima para una app que sale al
  aire: un GitHub Action que corra `pnpm build` en cada push, y un puñado de
  tests sobre las funciones puras del engine (matemática de coordenadas de
  `RectTransform`/`ancestorOffset`, `mergeRuntime`, `duplicateSubtrees`,
  `reorderGameObjects`, los type-guards de sesión). Sin suite grande: solo lo
  que se testea en una tarde y atrapa regresiones antes del estudio.
- **Hecho cuando:** existe el workflow de CI corriendo build + tests, y las
  funciones listadas tienen al menos un test cada una.
- **Fecha:** 2026-07-07 · **Estado:** Abierto

## [RM-075] "Show mode": candado de edición para el en vivo

- **Objetivo:** Un modo show que **congele la edición** durante el broadcast.
  Contexto real de uso: el operador SÍ tendrá el editor disponible minutos antes
  del en vivo para ajustes de posición y similares, pero la mayor parte del
  tiempo no mueve nada — y hoy nada impide que un click accidental arrastre un
  GameObject, borre algo o cierre un panel en pleno aire. Es un candado/toggle
  (edición ↔ show), no quitar el editor: en show quedan activas solo las teclas
  del juego y fullscreen; gestos de canvas, Inspector, Hierarchy y cierre de
  paneles quedan bloqueados.
- **Hecho cuando:** existe el toggle; activado, no se puede mutar el diseño ni
  el layout de paneles desde ninguna superficie, y las teclas del behavior +
  fullscreen siguen funcionando; desactivarlo restaura la edición normal.
- **Fecha:** 2026-07-07 · **Estado:** Abierto

---

# Fase 1 — Juegos a mano (la ventana de oportunidad)

## [RM-014] Juego "Intruso"

- **Objetivo:** Crear el juego "Intruso" como workspace propio.
- **Hecho cuando:** existe su workspace, carga su session file y se muestra
  fullscreen listo para broadcast.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-015] Juego "La sabes o No"

- **Objetivo:** Crear el juego "La sabes o No" como workspace propio.
- **Hecho cuando:** existe su workspace, carga su session file y se muestra
  fullscreen listo para broadcast.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

---

# Mejoras comprometidas surgidas al cerrar Cálculo Mental (RM-013)

> Patrones reales detectados al terminar Cálculo Mental. Varios obligan a cambiar
> cómo funciona el Slot (RM-023), por eso se cerró antes un commit estable.

## [RM-022] Una sola fuente en el build; el resto desde storage

- **Objetivo:** El build de Next incluye una única fuente base; las demás se piensan
  como provenientes del storage (Supabase futuro), no empaquetadas. Alinea con la
  filosofía de assets (catálogo + resolver, RM-017).
- **Hecho cuando:** el bundle solo trae una fuente; cargar otras se hace en runtime
  (storage/archivo), no por import estático.
- **Fecha:** 2026-06-19 · **Estado:** Abierto

## [RM-024] Cargar nuevas fuentes en Cálculo Mental

- **Objetivo:** Tener una forma de cargar nuevas fuentes en Cálculo Mental. Si se
  usa el componente Text (que ya carga fuentes vía FontFace), queda resuelto.
  Relacionado con RM-022 y RM-023.
- **Hecho cuando:** en Cálculo Mental se puede asignar una fuente cargada a los
  textos (vía el componente Text).
- **Fecha:** 2026-06-19 · **Estado:** Abierto

---

# Mejoras de editor / engine comprometidas

## [RM-040] En la vista Game nada es seleccionable

- **Objetivo:** Que en la vista **Game** el contenido no se pueda seleccionar ni
  arrastrar por el usuario: ni seleccionar/copiar texto, ni la selección accidental
  de un div que termina marcando todo.
- **Hecho cuando:** en Game no se puede seleccionar texto ni marcar/arrastrar
  contenido; la selección del navegador queda anulada en el área de display.
- **Fecha:** 2026-06-29 · **Estado:** Abierto

## [RM-043] Menú "Windows" para reabrir paneles cerrados

- **Objetivo:** Un desplegable **"Windows"** en el chrome del editor que liste los
  paneles del layout (Hierarchy, Inspector, Scene, Game, Assets, …) y permita
  volver a agregar cualquiera que se haya cerrado, por accidente o a propósito.
  Sobre el dockview del Sandbox (RM-042).
- **Hecho cuando:** existe el menú "Windows"; si un panel está cerrado, elegirlo lo
  vuelve a abrir en el layout; si ya está abierto, lo enfoca.
- **Fecha:** 2026-06-30 · **Estado:** Abierto

## [RM-044] Acción "sacar como panel flotante" + rediseño del chrome flotante

- **Objetivo:** Poder sacar un panel como **panel flotante** de dockview
  (`addFloatingGroup` / floating), **no** como pop-out a otra ventana del navegador
  (esa acción no se usará en ningún caso). Incluye **rediseñar el chrome del panel
  flotante**, cuyo diseño por defecto es feo, para alinearlo a la paleta del editor.
- **Hecho cuando:** desde el panel (menú de pestaña o botón) se puede convertir en
  flotante y arrastrarlo dentro del editor; el flotante usa estilos propios acordes
  al editor, no el default.
- **Fecha:** 2026-06-30 · **Estado:** Abierto

## [RM-046] Pipeline de assets por key en el editor (depende de RM-045)

- **Objetivo:** `EditorLayout` baja el catálogo del juego (`toManifest` +
  `useAssetPreloader`) y lo provee **por key** vía un `AssetsContext` que cruza el
  portal de dockview; el panel **Assets** muestra los assets reales + progreso
  (reutiliza `AssetLoaderTiles`). Los componentes que usan assets (Image, Video,
  audio, Text/font) resuelven por `assetKey` de forma **aditiva**: si no hay key,
  usan `src` como hoy, así los juegos existentes no se rompen.
- **Hecho cuando:** un juego con catálogo muestra sus assets cargados en el panel;
  un Image con `assetKey` renderiza el blob resuelto; los juegos actuales (con `src`
  crudo) siguen funcionando igual.
- **Fecha:** 2026-06-30 · **Estado:** En progreso (2026-07-01) — hecho el pipeline
  + panel Assets + el mecanismo `assetKey` en Image (view resuelve por key, inspector
  con selector). Falta demostrarlo con un juego real; deletreo resultó bloqueado (ver
  hallazgo: necesita una 4ta pieza de "comportamiento" en el contrato).

## [RM-049] Migrar Cálculo Mental al `EditorLayout` (depende de RM-047)

- **Objetivo:** Segundo juego migrado al layout genérico, mismo patrón que deletreo
  (RM-048): `game.tsx` (assets, gameObjects —background/controller/4 slots con
  pregunta+respuesta—, components slot/controller, behavior, initialSelectedId),
  `CalculoMentalBehavior.tsx` (teclas/board/sonidos/animaciones/sesión), `constants.ts`
  y `page.tsx` fino.
- **Hecho cuando:** `/workspaces/calculo-mental` corre sobre `EditorLayout` con su
  lógica en `behavior`; funciona igual que antes.
- **Fecha:** 2026-07-01 · **Estado:** En progreso (2026-07-01)

## [RM-050] Migrar Intruso al `EditorLayout` (depende de RM-047)

- **Objetivo:** Tercer juego migrado, mismo patrón. Intruso es simple (un Background
  con video, sin componentes propios ni teclas): `game.tsx` (assets, un gameObject
  con video, behavior, initialSelectedId), `IntrusoBehavior.tsx` (efecto que setea el
  `src` del video al cargar), `constants.ts`, `page.tsx` fino.
- **Hecho cuando:** `/workspaces/intruso` corre sobre `EditorLayout`; funciona igual.
- **Fecha:** 2026-07-01 · **Estado:** En progreso (2026-07-01)

---

# Fase 2 — Engine genérico (diferido)

> Diferido a propósito hasta cerrar la Fase 1. Se retoma promoviendo patrones que
> ya hayan aparecido en los juegos a mano, no por especulación.

## [RM-005] GameObjects "especiales"

- **Objetivo:** Definir gameobjects "especiales" como hijos de un gameobject, que
  aportan funcionalidades o elementos que el Engine aún no contempla, para
  aprovechar el engine y sacar juegos lo antes posible.
- **Hecho cuando:** se puede anidar un gameobject especial bajo uno normal, el
  engine respeta su jerarquía/transform y el especial aporta su comportamiento extra.
- **Fecha:** 2026-06-11 · **Estado:** Diferido (2026-06-17)

## [RM-010] Diagnóstico de FPS y rendimiento

- **Objetivo:** Herramienta de diagnóstico (componente o GameObject especial, a
  decidir al implementar) que muestre FPS y rendimiento para validar el equipo donde
  corre el juego.
- **Hecho cuando:** se puede activar un overlay que muestra FPS/rendimiento en vivo
  dentro de un workspace.
- **Fecha:** 2026-06-16 · **Estado:** Diferido (2026-06-17)

---

# Sandbox Editor — assets e inspector

## [RM-057] Seleccionar assets locales → info en el Inspector

- **Objetivo:** Poder seleccionar un asset en el panel Local para que el Inspector
  muestre su información (tipo, peso, dimensiones, origen, etc.). Al implementar se
  evalúa si el peso va en el tile (como el diseño) o en el Inspector.
- **Hecho cuando:** al hacer click en un asset del panel Local, el Inspector muestra
  sus metadatos.
- **Fecha:** 2026-07-03 · **Estado:** Abierto

## [RM-077] Calibrar el presupuesto de memoria con las specs del estudio

- **Objetivo:** `MEMORY_BUDGET_BYTES` (`src/hooks/use-memory-budget.ts`) quedó en
  2 GB provisional. Cuando Esteban pase las specs del equipo del estudio (RAM, y
  GPU/VRAM si se conoce; la más débil si son varias), ajustar el número (~25% de la
  RAM como regla base).
- **Hecho cuando:** la constante refleja un presupuesto derivado de las specs reales.
- **Fecha:** 2026-07-07 · **Estado:** Abierto

## [RM-059] Pestaña Storage (navegar y descargar a local)

- **Objetivo:** Ventana Storage (paralela a Local) para navegar los assets remotos
  (Supabase), verlos aunque sea como iconos, y con una acción descargarlos a la carga
  local. La organización local (RM-055) es independiente del origen.
- **Hecho cuando:** existe la pestaña Storage, lista/navega assets remotos y permite
  descargar uno al panel Local.
- **Fecha:** 2026-07-03 · **Estado:** Abierto
