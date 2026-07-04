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

## [RM-067] Migrar la edición de Scene a react-moveable (basado en lab/react-moveable)

- **Objetivo:** Reemplazar el sistema de edición propio del panel **Scene**
  (`SelectionOverlay` + `use-transform-gesture`) por `react-moveable` +
  `react-infinite-viewer`, sumando zoom/pan, rotación y keepRatio. Clave: Moveable
  va **controlado** (sus eventos se convierten a coordenadas del modelo y escriben en
  `gameObjects`), porque el engine es data-autoritativo y Scene/Game renderizan el
  mismo modelo. **Game no se toca.**
- **Hecho cuando:** en Scene se puede arrastrar/redimensionar/rotar/ratio con Moveable
  y navegar con zoom/pan; el modelo sigue siendo la única verdad; `SelectionOverlay` y
  `use-transform-gesture` quedan eliminados.
- **Fecha:** 2026-07-04 · **Estado:** En progreso (2026-07-04) — Fase 1 hecha:
  `SceneCanvas` (InfiniteViewer + viewport 1920×1080 con zoom/pan/fit/encajar),
  cableado en `ScenePanel`; la edición vieja sigue viva dentro del viewer. **Gotcha
  clave:** el panel Scene DEBE registrarse con `renderer: "always"` en dockview; con el
  default (`onlyWhenVisible`) dockview destruye/reconstruye el DOM al cambiar de pestaña
  y InfiniteViewer se rompe (salto de vista, "Encajar" muerto). Con `"always"` lo oculta
  vía `visibility:hidden` y el viewer sobrevive. Falta Fase 2 (Moveable controlado, borrar
  el sistema viejo) y Fase 3 (snapping/guías, multi-selección).
  **Fase 2 hecha (2026-07-04):** Moveable controlado en `SceneCanvas`
  (drag/resize/rotate + toggle Ratio), sus eventos se convierten a coordenadas del
  modelo vía `sceneTransform.ts` (`toAbsRect`/`fromAbsRect`, mismas fórmulas que el
  gesto viejo) y escriben con un nuevo `setTransform` del editor. Target = el div del GO
  seleccionado por `data-go-id` (marcado en `RectTransform`). Los controles salen al
  seleccionar (se eliminó el toggle `editMode` completo: state, `EditorApi`, botón
  "Editar" del Inspector). Resize usa `ev.drag.beforeTranslate` (el cálculo por
  `direction` daba un resize brusco). Shift fuerza ratio además del toggle. Se quitaron
  las líneas punteadas de outline en `GameObjectView`. Eliminados `SelectionOverlay.tsx`
  y `use-transform-gesture.ts`.
  **Gotcha coordenadas (2026-07-04):** Moveable NO sabe parsear un `transform:
  translate(-pivot%,-pivot%)`; con eso el resize saltaba y los handles se desalineaban.
  Se refactorizó `RectTransform` para posicionar con `left/top/width/height` directos
  (pivot plegado en el %), dejando `transform` solo para `rotate()`. Layout visual
  idéntico (verificado old==new), pero el objetivo queda "Moveable-friendly".
  **Fluidez (2026-07-04):** el resize/drag se sentían "duros" porque cada frame del
  gesto hacía `setTransform` → re-render de TODA la escena. Ahora durante el gesto se
  escribe el DOM del objeto directo (`rectTransformStyle` extraído de `RectTransform`,
  misma fórmula → sin salto ni residuo al volcar) y se hace `setTransform` una sola vez
  al soltar. La lista de objetos se memoiza (`useMemo`) para que Shift/Space/zoom no la
  re-rendericen y pisen la escritura directa. NO se eliminó el pivot (rompería los juegos
  existentes y no hace falta). El panel Game refleja el cambio al soltar, no en vivo.
  Falta Fase 3.

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

## [RM-058] Presupuesto de memoria de assets (producción en vivo)

- **Objetivo:** Evitar que en vivo un asset no cargue por falta de memoria. No hay
  límite de cantidad; el límite es RAM/VRAM (blobs + memoria decodificada
  `ancho×alto×4`). JS no mide blobs/GPU, solo estima. Definir presupuesto para el
  equipo del estudio, barra de uso estimada y avisos, y estrategia de gestión.
- **Hecho cuando:** existe una barra/indicador de uso estimado de memoria de assets y
  avisa antes de acercarse al presupuesto del equipo.
- **Fecha:** 2026-07-03 · **Estado:** Abierto

## [RM-059] Pestaña Storage (navegar y descargar a local)

- **Objetivo:** Ventana Storage (paralela a Local) para navegar los assets remotos
  (Supabase), verlos aunque sea como iconos, y con una acción descargarlos a la carga
  local. La organización local (RM-055) es independiente del origen.
- **Hecho cuando:** existe la pestaña Storage, lista/navega assets remotos y permite
  descargar uno al panel Local.
- **Fecha:** 2026-07-03 · **Estado:** Abierto

