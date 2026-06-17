# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**

- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-008] Quitar el footer del layout de juegos

- **Objetivo:** Quitar el footer del layout de los juegos para liberar la zona inferior. Tarea simple y previa al panel de assets (RM-007); se puede hacer de inmediato.
- **Hecho cuando:** el layout de workspaces ya no renderiza el footer y la zona inferior queda libre.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-006] SpellFrame como componente del engine

- **Objetivo:** Convertir el "SpellFrame" de deletreo (el texto) en un componente reutilizable del engine, que además permita cargar otra tipografía distinta a la actual.
- **Hecho cuando:** existe la tripleta del componente (modelo + view + inspector) registrada, deletreo lo usa en lugar de su implementación propia, y se puede asignar/cargar una tipografía distinta desde el inspector.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-009] Componente controlador de video (teclas)

- **Objetivo:** Componente para controlar la reproducción de un video mediante teclas asignables: reiniciar, pausar, dar play, adelantar/retroceder, etc.
- **Hecho cuando:** existe la tripleta del componente registrada; al asignar teclas desde el inspector, presionarlas controla el video (play/pausa/reinicio/seek) en tiempo real.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-010] Diagnóstico de FPS y rendimiento

- **Objetivo:** Herramienta de diagnóstico (componente o GameObject especial, a decidir al implementar) que muestre FPS y rendimiento para validar el equipo donde corre el juego.
- **Hecho cuando:** se puede activar un overlay que muestra FPS/rendimiento en vivo dentro de un workspace.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-011] Animaciones de deletreo como componentes

- **Objetivo:** Convertir las animaciones hechas para deletreo en componentes reutilizables del engine.
- **Hecho cuando:** las animaciones de deletreo existen como componentes registrados y deletreo las usa desde el engine en lugar de su implementación propia.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-005] GameObjects "especiales"

- **Objetivo:** Definir gameobjects "especiales" como hijos de un gameobject, que aportan funcionalidades o elementos que el Engine aún no contempla, para aprovechar el engine y sacar juegos lo antes posible.
- **Hecho cuando:** se puede anidar un gameobject especial bajo uno normal, el engine respeta su jerarquía/transform y el especial aporta su comportamiento extra.
- **Fecha:** 2026-06-11 · **Estado:** Abierto

## [RM-012] Máscara general estilo Unity

- **Objetivo:** Revisar el "shape" del componente Color y rediseñar la máscara como un mecanismo general estilo Unity, que pueda enmascarar no solo color sino también imágenes y videos.
- **Hecho cuando:** la máscara funciona como recurso general aplicable a color/imagen/video; el caso actual de Color + shape queda cubierto por el nuevo mecanismo.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-007] Sistema de gestión y precarga de assets

- **Objetivo:** Crear un panel de assets tipo Unity en la zona inferior del layout de juegos (donde estaba el footer, ver RM-008), donde los assets (imágenes, video, etc.) se cargan primero; garantizar que todos estén cargados localmente antes de entregarlos a los componentes, para evitar cortes en vivo (p. ej. video por link si se cae la internet) y el delay del primer render (p. ej. la imagen de error de deletreo que tarda la primera vez).
- **Hecho cuando:** existe el panel de assets, los assets se precargan/almacenan y los componentes solo los reciben cuando todos están listos; mostrar un video/imagen ya no depende de la red en el momento de aparecer ni presenta retardo en su primera aparición.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-013] Juego "Cálculo Mental"

- **Objetivo:** Crear el juego "Cálculo Mental" como workspace propio. Va **antes** de Operaciones Combinadas (RM-004).
- **Hecho cuando:** existe su workspace, carga su session file y se muestra fullscreen listo para broadcast.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-014] Juego "Intruso"

- **Objetivo:** Crear el juego "Intruso" como workspace propio. Va **antes** de Operaciones Combinadas (RM-004).
- **Hecho cuando:** existe su workspace, carga su session file y se muestra fullscreen listo para broadcast.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-015] Juego "La sabes o No"

- **Objetivo:** Crear el juego "La sabes o No" como workspace propio. Va **antes** de Operaciones Combinadas (RM-004).
- **Hecho cuando:** existe su workspace, carga su session file y se muestra fullscreen listo para broadcast.
- **Fecha:** 2026-06-16 · **Estado:** Abierto

## [RM-004] Juego "Operaciones Combinadas"

- **Objetivo:** Generar el juego Operaciones Combinadas, aunque no use el sistema Engine. (Dependencia: primero los juegos RM-013, RM-014 y RM-015.)
- **Hecho cuando:** existe su workspace, carga su session file y se muestra fullscreen listo para broadcast.
- **Fecha:** 2026-06-11 · **Estado:** En progreso (2026-06-11)
