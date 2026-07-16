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

---

# Mejoras de editor / engine comprometidas

> **Plan de animaciones (2026-07-16):** base estructural para gamefeel nivel
> Balatro, en fases shippeables: RM-086 (ejecutor sobre motion) → RM-087
> (orquestación) → RM-088 (presencia) → RM-083 (Álbum como piloto) → RM-089
> (limpieza del lab). Nace de la promoción de WL-019. Largo plazo (sin
> compromiso): magic move entre pantallas y animaciones editables por el
> usuario (encaja con WL-025). Esteban avaló romper la estructura actual de
> "pantallas como subárboles activados/desactivados" si el magic move lo pide.

## [RM-086] Fase 1 — Migrar el ejecutor de animaciones a `motion`

- **Objetivo:** Reemplazar los 4 hooks caseros (`use-pop`, `use-shake`,
  `use-bounce-move`, `use-slide`) por `animate()` de `motion` (ya instalado,
  validado en `/lab/motion`). Pop/Shake sobre el content-div; Bounce/Slide
  manteniendo el canal `onAnimatePosition` → runtime pero con springs reales.
  Nacen los tokens de feel compartidos (springs con nombre: snappy/bouncy/gentle).
  Sin cambio de API para los juegos: mismo `trigger()`, mismos componentes e
  inspectores. Verificar API actual de motion (context7) al cablear.
- **Hecho cuando:** los 4 hooks caseros están eliminados, las 4 animaciones
  corren sobre motion con tokens compartidos y los 3 juegos que las usan se ven
  igual o mejor en play.
- **Fecha:** 2026-07-16 · **Estado:** En progreso (2026-07-16)

## [RM-087] Fase 2 — API de orquestación de animaciones

- **Objetivo:** `trigger()` fire-and-forget → `play()` que devuelve promesa
  (motion las da gratis), cancelación coordinada real (hoy bounce/slide se
  cancelan entre sí a mano) y helper de secuencia/stagger (reemplaza los
  `setTimeout` escalonados de calculo-mental). Permite sincronizar animación +
  sonido + swap de estado en los behaviors. Cierra TD-008 (la "API formal de
  animación" que esa entrada pedía).
- **Hecho cuando:** los behaviors pueden `await play(id, tipo)` y encadenar
  secuencias sin `setTimeout`; calculo-mental migrado como prueba; TD-008
  cerrado.
- **Fecha:** 2026-07-16 · **Estado:** Abierto

## [RM-088] Fase 3 — Primitivo de presencia (enter/exit animado)

- **Objetivo:** Componente de transición del engine: cuando el runtime togglea
  `active`, el objeto entra/sale animado (variantes configurables: fade, pop,
  slide, flip) en vez del swap instantáneo de hoy. Es el primitivo que RM-083
  necesita (el flip de carta es una transición entre dos estados) y anima de
  golpe todos los juegos de quiz sin tocar cada behavior.
- **Hecho cuando:** existe el componente de presencia con su tripleta, un
  `setActive` de runtime dispara la animación de entrada/salida configurada, y
  al menos un caso real lo usa.
- **Fecha:** 2026-07-16 · **Estado:** Abierto

## [RM-089] Eliminar `/lab` al cerrar el sistema de animaciones

- **Objetivo:** Borrar `src/app/lab/` completo. Sus 3 demos ya habrán graduado
  a producción: dockview (EditorLayout), react-moveable (SelectionOverlay) y
  motion (RM-086..088). Mantenerlo hasta el final de RM-083 porque los juguetes
  del lab (repartir cartas, shiny, camera shake) sirven de referencia de
  gamefeel para el piloto.
- **Hecho cuando:** `src/app/lab/` no existe y el build pasa.
- **Fecha:** 2026-07-16 · **Estado:** Abierto

## [RM-083] Animaciones de Álbum (flip de carta y bloqueo de tema)

- **Objetivo:** Reemplazar los swaps instantáneos de Álbum (RM-082) por las
  animaciones de Unity: `DoFlip` (giro de carta al voltear con E/B) y
  `UIBlinkPulse` (pulso 1.1 + parpadeo ×3 al bloquear un tema con L). Esteban
  indicó que el sistema de animaciones se va a mejorar/cambiar; hacerlo sobre esa
  base nueva, no sobre pop/shake actuales.
- **Hecho cuando:** voltear una carta y bloquear un tema se ven animados en el
  display, y el swap de estados queda sincronizado con la animación.
- **Fecha:** 2026-07-13 · **Estado:** Abierto

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

---

# Sandbox Editor — assets e inspector

## [RM-077] Calibrar el presupuesto de memoria con las specs del estudio

- **Objetivo:** `MEMORY_BUDGET_BYTES` (`src/hooks/use-memory-budget.ts`) quedó en
  2 GB provisional. Cuando Esteban pase las specs del equipo del estudio (RAM, y
  GPU/VRAM si se conoce; la más débil si son varias), ajustar el número (~25% de la
  RAM como regla base).
- **Hecho cuando:** la constante refleja un presupuesto derivado de las specs reales.
- **Fecha:** 2026-07-07 · **Estado:** Abierto
