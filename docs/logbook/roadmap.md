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

- **Objetivo:** Crear el juego "Intruso" como workspace propio. Va **antes** de
  Operaciones Combinadas (RM-004).
- **Hecho cuando:** existe su workspace, carga su session file y se muestra
  fullscreen listo para broadcast.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-015] Juego "La sabes o No"

- **Objetivo:** Crear el juego "La sabes o No" como workspace propio. Va **antes**
  de Operaciones Combinadas (RM-004).
- **Hecho cuando:** existe su workspace, carga su session file y se muestra
  fullscreen listo para broadcast.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-004] Juego "Operaciones Combinadas"

- **Objetivo:** Generar el juego Operaciones Combinadas, aunque no use el sistema
  Engine. (Dependencia: primero los juegos RM-013, RM-014 y RM-015.)
- **Hecho cuando:** existe su workspace, carga su session file y se muestra
  fullscreen listo para broadcast.
- **Fecha:** 2026-06-11 · **Estado:** En progreso (2026-06-11)

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

## [RM-023] Slot de Cálculo Mental con 2 hijos Text para delimitar el texto

- **Objetivo:** El Slot pasa a tener 2 GameObjects hijos con componente Text
  (pregunta y respuesta) para delimitar manualmente el área del texto con el
  RectTransform existente, en vez de dibujarlo internamente. Cambia cómo funciona el
  Slot; depende de RM-020 y RM-021.
- **Hecho cuando:** cada Slot renderiza pregunta y respuesta vía hijos con Text,
  posicionables/redimensionables con RectTransform, y el reveal sigue funcionando.
- **Fecha:** 2026-06-19 · **Estado:** Abierto

## [RM-024] Cargar nuevas fuentes en Cálculo Mental

- **Objetivo:** Tener una forma de cargar nuevas fuentes en Cálculo Mental. Si se
  usa el componente Text (que ya carga fuentes vía FontFace), queda resuelto.
  Relacionado con RM-022 y RM-023.
- **Hecho cuando:** en Cálculo Mental se puede asignar una fuente cargada a los
  textos (vía el componente Text).
- **Fecha:** 2026-06-19 · **Estado:** Abierto

---

# Restyle visual del sandbox (estilo editor Unity oscuro)

> Origen: maqueta `Sandbox Editor (standalone).html` (Claude design). Alcance
> elegido: **restyle del editor actual** (Hierarchy / Scene / Inspector), sin
> agregar paneles nuevos vacíos (el panel Assets queda en RM-016, diferido).
> Paleta objetivo `--bg #15171a / --panel #1d2024 / --head #26292f / --line
> #303640`, acento azul `#4c8dff` + verde/ámbar/violeta por tipo, fuentes **IBM
> Plex Sans** (UI) e **IBM Plex Mono** (números/códigos). Pasos en orden de
> dependencia: 026 es la base de todos. **Nota:** tokens (026) y `SidePanel`
> (027) son compartidos → repintan también deletreo, cálculo mental y
> operaciones; es deseado ("nuevo estilo visual de la app"), pero validar los 4
> workspaces. La top bar del diseño mapea al `WorkspaceHeader` compartido y queda
> **fuera** de este restyle.

## [RM-029] Chrome del Inspector (header sticky + secciones colapsables)

- **Objetivo:** Inspector con header sticky `--head`, cabecera de objeto (check de
  activo + glyph de tipo + input de nombre) y secciones de componente colapsables
  con badge de glyph, interruptor enable y menú `⋮`. Aplica a `GameObjectInspector`
  y al marco de cada inspector de componente.
- **Hecho cuando:** el Inspector del sandbox presenta cabecera de objeto y
  secciones plegables estilizadas; los inspectores de componentes existentes
  quedan envueltos en el nuevo marco sin perder edición.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

## [RM-030] Campos tipados del Inspector (num/select/color/slider/toggle/asset)

- **Objetivo:** Crear primitivos de campo con el estilo del diseño: fila con label,
  input numérico mono con prefijo de eje (X/Y) sobre `--elev`, select, color
  (swatch + hex), slider, toggle y campo de asset. Aplicarlos a `RectTransform­Inspector`
  y migrar los inputs de los inspectores de componentes (text/color/image/video/
  videoControl/border/animaciones) a estos primitivos. Restyle del botón
  **Add Component**.
- **Hecho cuando:** Rect Transform y al menos los inspectores nativos usan los
  campos nuevos; el botón Add Component coincide con la maqueta. Build limpio.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

## [RM-031] Toolbar y viewport de la Scene

- **Objetivo:** Barra superior de la Scene (tabs / resolución / zoom / botón
  **Fullscreen** azul) y fondo de viewport tipo tablero de ajedrez detrás del
  stage 16:9, con la paleta de RM-026. Sin romper `FullScreen`, container-query ni
  el gizmo de edición.
- **Hecho cuando:** la zona central del sandbox muestra la toolbar y el fondo
  ajedrezado de la maqueta; fullscreen y la edición en canvas siguen intactos.
- **Fecha:** 2026-06-25 · **Estado:** Abierto

---

# Fase 2 — Engine genérico (diferido)

> Diferido a propósito hasta cerrar la Fase 1. Se retoma promoviendo patrones que
> ya hayan aparecido en los juegos a mano, no por especulación.

## [RM-016] Panel de assets tipo Unity

- **Objetivo:** Panel de assets en la zona inferior del layout de juegos (donde
  estaba el footer, RM-008) para cargar/gestionar assets visualmente, estilo Unity.
  Se apoya en el preloader de RM-007. (Separado de RM-007 para no construir editor
  antes de sacar juegos.)
- **Hecho cuando:** existe el panel, permite cargar/gestionar assets y usa el
  preloader (RM-007) para garantizar que estén listos antes de entregarlos a los
  componentes.
- **Fecha:** 2026-06-17 · **Estado:** Diferido

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

## [RM-012] Máscara general estilo Unity

- **Objetivo:** Revisar el "shape" del componente Color y rediseñar la máscara como
  un mecanismo general estilo Unity, que pueda enmascarar no solo color sino también
  imágenes y videos.
- **Hecho cuando:** la máscara funciona como recurso general aplicable a
  color/imagen/video; el caso actual de Color + shape queda cubierto por el nuevo
  mecanismo.
- **Fecha:** 2026-06-16 · **Estado:** Diferido (2026-06-17)
