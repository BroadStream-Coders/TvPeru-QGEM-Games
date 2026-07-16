# Plan: sistema de animaciones sobre `motion` (RM-086..089)

> Plan **comprometido** (2026-07-16). Si la sesión se corta, este documento +
> las entradas RM-086..089 del roadmap bastan para retomar el trabajo donde
> quedó. Se actualiza al cerrar cada fase (marcar ✅ y anotar desvíos).

## La visión

Gamefeel **nivel Balatro** para los juegos de QGEM: como casi todos son quiz o
similares, la calidad de animación es lo que más aporta visualmente al display.
Corto plazo: las animaciones se controlan **por código** (behaviors). Largo
plazo (sin compromiso): el usuario podrá editarlas desde el inspector — el
modelo de "animación = componente con config JSON serializable" ya lo deja
casi gratis (solo es agregar campos al inspector; encaja con WL-025).

La herramienta es **`motion`** (ex framer-motion, import `motion/react`, ya
instalado y validado en `/lab/motion`). Pero motion es el ejecutor, no el
sistema: el trabajo estructural real son tres carencias del engine actual:

1. **Orquestación** — hoy `trigger()` es fire-and-forget: sin promesa de fin,
   sin encadenar, secuencias con `setTimeout` a mano.
2. **Presencia (enter/exit)** — todo aparece/desaparece con `setActive`
   instantáneo; no existe "cuando este objeto se activa, entra así".
3. **Vocabulario de feel** — Balatro se siente Balatro porque todo usa los
   mismos springs/tiempos. Faltan tokens compartidos, no duraciones por juego.

## El sistema actual (lo que se reemplaza)

- 4 animaciones como componentes del engine: `pop`, `shake`, `bounce`, `slide`
  (`@engine/components/<tipo>/`, Views `null`, el componente es solo config).
- Ejecución en 4 hooks caseros (`src/hooks/use-pop|use-shake|use-bounce-move|use-slide.ts`):
  Pop/Shake con Web Animations API sobre el content-div; Bounce/Slide con rAF +
  easings a mano empujando posiciones por `onAnimatePosition` →
  `setRuntimeTransform` (capa runtime §2.6, el diseño nunca se ensucia).
- Disparo: `AnimationsContext` (mapa `goId → type → trigger`);
  `useGameObjectAnimations` (montado en cada `GameObjectView`) registra los
  triggers; los behaviors hacen `trigger(id, "pop")`.
- Consumidores hoy: deletreo (pop/shake/bounce/slide sobre FRAME_ID),
  calculo-mental (pop/shake por slot + secuencias con `setTimeout`).

## Restricciones que todo el plan respeta

- **Diseño vs runtime (§2.6 de engine-arquitectura.md):** las animaciones son
  estado de juego → escriben a `useSceneRuntime` / al DOM, nunca al diseño; el
  export sale siempre limpio.
- Solo se anima el **content-div** interno (el `transform` CSS del
  `RectTransform` hace el pivot; pisarlo rompe el posicionamiento) o la
  **posición del transform** vía runtime.
- La config de animación se serializa a `scene.json` → JSON puro.
- Validar con `pnpm build`; la prueba visual en play la hace Esteban (no se
  levanta dev server).

## Las fases (paso a paso, cada una shippeable)

### Fase 1 — RM-086: migrar el ejecutor a motion ✅ (2026-07-16)

- **Muere:** los 4 hooks caseros de `src/hooks/`.
- **Nace:** `@engine/animations/feel.ts` — tokens de feel: 2–3 springs con
  nombre (`snappy`, `bouncy`, `gentle`) como transiciones de motion que toda
  animación consume.
- **Cambia:** `useGameObjectAnimations` usa `animate()` de motion — pop/shake
  animan el mismo content-div (keyframes + spring); bounce/slide animan un
  valor `from→to` con spring real y siguen empujando por `onAnimatePosition`.
- **No cambia:** componentes, inspectores, `trigger()`, modelo serializable.
  Los juegos no se tocan; deben verse igual o mejor.
- Verificar la API actual de motion (context7) antes de escribir.

### Fase 2 — RM-087: API de orquestación ✅ (2026-07-16)

- `trigger()` → `play(id, tipo)` que devuelve **promesa** (resuelta al
  terminar; la del bounce cubre viaje + rebote), y `playStagger(ids, tipo,
  stepMs?)` que resuelve cuando todas acaban. Runners async con cancelación
  por guard de secuencia en `useGameObjectAnimations`.
- calculo-mental migrado (sin `setTimeout`); deletreo renombrado.
- Cerró **TD-008**: el prop ad-hoc `contentRef` de `GameObjectView` quedó sin
  consumidores y se eliminó junto con `@engine/refs.ts`.

### Fase 3 — RM-088: primitivo de presencia (enter/exit)

- Componente de transición del engine: cuando el runtime togglea `active`, el
  objeto entra/sale animado (variantes config: fade, pop, slide, flip) en vez
  del swap instantáneo.
- Es el prerequisito real de RM-083: el flip de carta de Álbum no es "animar
  un objeto" sino una **transición entre dos estados** (back activo → front
  activo). Bien hecho, anima todos los juegos de quiz sin tocar cada behavior.

### Fase 4 — RM-083: Álbum como piloto de gamefeel

- Flip de carta (`DoFlip`, teclas E/B) y blink de bloqueo de tema
  (`UIBlinkPulse`: pulso 1.1 + parpadeo ×3, tecla L) sobre la base nueva,
  swap sincronizado con la animación, puliendo tokens hasta que se sienta
  **muy** bien. Álbum (cartas) es el juego más Balatro-shaped del proyecto.

### Fase final — RM-089: borrar `/lab`

- `src/app/lab/` completo. Sus 3 demos habrán graduado: dockview
  (EditorLayout), react-moveable (SelectionOverlay), motion (RM-086..088).
- Se borra **al final** y no antes: los juguetes del lab (repartir cartas,
  carta shiny, camera shake) son referencia de feel para el piloto de Álbum.

### Después, sin compromiso

- **Magic move entre pantallas (`layoutId`) → WL-026.** Lo de mayor fricción:
  requiere que ambos estados del objeto compartan identidad React entre
  renders, y hoy las pantallas son subárboles que se activan/desactivan.
  **Esteban avaló romper esa estructura** (es propuesta suya, no sagrada) con
  tal de que se vea bien al aire y sea manejable en desarrollo.
- Editabilidad completa del usuario (con WL-025, inspector por esquema).
- Camera shake a nivel de stage.

## Decisiones ya tomadas (no re-litigar)

- Motion es el ejecutor; el modelo animación-como-componente se conserva.
- **El asentamiento del bounce usa la curva `easeOutBounce` custom (rebote "de
  pelota"), NO un spring.** Se probó reemplazarlo por spring en Fase 1 y
  Esteban lo rechazó: es otro carácter y se veía mal. Motion acepta funciones
  de easing custom en `ease`, así que la curva original vive en
  `useGameObjectAnimations.ts`. Los tokens de `feel.ts` quedan para las fases
  siguientes (presencia, Álbum), no para pisar feels ya aprobados.
- El canal `onAnimatePosition` → runtime se mantiene en Fase 1 (correcto y
  WYSIWYG en el panel Scene); optimizar a motion values solo si el perf lo
  pide en la práctica.
- El orden de fases es 1→2→3→4→final; magic move queda para después.
