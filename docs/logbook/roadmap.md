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

> **Plan de animaciones (2026-07-16, reordenado el mismo día):** gamefeel al
> nivel de Balatro, pero **dinámica primero**: RM-086 (ejecutor sobre motion,
> ✅) → RM-087 (orquestación, ✅) → RM-090 (definición de dinámicas por juego)
> → RM-083 (Álbum como piloto, guiado por su dinámica) → RM-088 (extraer
> componentes de lo aprobado) → RM-089 (limpieza del lab). Nace de la
> promoción de WL-019. Principio de Esteban: **cada juego es una experiencia
> independiente y fresca, con sus propios tiempos y feel, aunque se repita
> código** — no hay tokens de feel compartidos a nivel engine. Largo plazo
> (sin compromiso): magic move entre pantallas y animaciones editables por el
> usuario (base lista con RM-091). Esteban avaló romper la estructura actual de
> "pantallas como subárboles activados/desactivados" si el magic move lo pide.

## [RM-090] Estructura de definición de dinámicas por juego

- **Objetivo:** Formato estándar para describir la dinámica de cada juego en
  `docs/juegos/<juego>.md` (plantilla en `docs/juegos/plantilla.md`): concepto,
  pantallas/estados, flujo del segmento al aire, controles del operador, beats
  emocionales y ritmo, animación/feel deseado. Es el insumo sin el cual no se
  pueden recomendar ni diseñar animaciones útiles; todo juego nuevo nace
  describiendo su dinámica antes de tocar código.
- **Hecho cuando:** existe la plantilla y Álbum tiene su documento escrito (el
  primero), usado como insumo directo de RM-083.
- **Fecha:** 2026-07-16 · **Estado:** En progreso (2026-07-16)

## [RM-088] Extraer componentes de presencia/transición de lo aprobado en Álbum

- **Objetivo:** Cosechar del piloto de Álbum (RM-083) los patrones de
  animación que Esteban apruebe y promoverlos a componentes del engine (misma
  tripleta), incluido — si el patrón aparece — el enter/exit animado sobre el
  `active` de runtime. Redefinida el 2026-07-16: antes era "diseñar el
  primitivo de presencia genérico primero"; se invirtió para extraer de un
  feel real aprobado, no diseñar en abstracto (misma estrategia SpellFrame).
  Las transiciones de pantalla quedan on/off instantáneo mientras tanto.
- **Hecho cuando:** los patrones repetibles del piloto viven como componentes
  del engine y Álbum los consume desde el registro.
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
- **Fecha:** 2026-07-13 · **Estado:** En progreso (2026-07-16)

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
