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

## [RM-084] Text: inputs de separación de letra y de línea (como Unity)

- **Objetivo:** El componente Text del engine debe exponer en el inspector campos
  de **letter spacing** y **line spacing** (separación entre letras y entre
  líneas), equivalentes a los de Unity, para poder afinar la tipografía por texto.
- **Hecho cuando:** el inspector del Text tiene ambos campos, se guardan en
  `scene.json`, y el display los aplica al renderizar.
- **Fecha:** 2026-07-14 · **Estado:** Abierto

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

