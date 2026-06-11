# Roadmap

Trabajo comprometido: lo que sí se va a hacer. Código `RM-###` (nunca se reutiliza).
Al terminar una tarea se mueve al changelog y se borra de aquí.

**Formato de cada entrada:**

- **Objetivo:** qué se quiere lograr.
- **Hecho cuando:** criterio claro de finalización.
- **Fecha** y **Estado** (Abierto / En progreso).

---

## [RM-001] Componente Color acepta una imagen `shape`

- **Objetivo:** Que el componente Color del engine acepte una imagen llamada `shape`: toma únicamente la forma (silueta) de la imagen entregada y aplica el color por encima de ella.
- **Hecho cuando:** se puede asignar una imagen como `shape` a un componente Color y el render muestra esa forma rellenada con el color elegido; sin `shape`, se comporta como hoy.
- **Fecha:** 2026-06-11 · **Estado:** Abierto

## [RM-002] Componente de Texto

- **Objetivo:** Crear el componente Text del engine con control de tamaño y alineación, y sobre todo poder cambiar la tipografía subiendo una fuente desde el equipo.
- **Hecho cuando:** se puede añadir un componente Text, editar tamaño y alineación, y cargar una tipografía propia desde el equipo que se aplica al render.
- **Fecha:** 2026-06-11 · **Estado:** Abierto

## [RM-003] Componentes personalizados por juego

- **Objetivo:** Estructurar el sistema de componentes para que cada juego pueda crear y registrar sus propios componentes personalizados, sin tocar el core del engine.
- **Hecho cuando:** un juego puede definir un componente propio (modelo + view + editor) y registrarlo localmente, y el engine lo renderiza y edita como a los nativos.
- **Fecha:** 2026-06-11 · **Estado:** Abierto

## [RM-004] Juego "Operaciones Combinadas"

- **Objetivo:** Generar el juego Operaciones Combinadas, aunque no use el sistema Engine.
- **Hecho cuando:** existe su workspace, carga su session file y se muestra fullscreen listo para broadcast.
- **Fecha:** 2026-06-11 · **Estado:** Abierto

## [RM-005] GameObjects "especiales"

- **Objetivo:** Definir gameobjects "especiales" como hijos de un gameobject, que aportan funcionalidades o elementos que el Engine aún no contempla, para aprovechar el engine y sacar juegos lo antes posible.
- **Hecho cuando:** se puede anidar un gameobject especial bajo uno normal, el engine respeta su jerarquía/transform y el especial aporta su comportamiento extra.
- **Fecha:** 2026-06-11 · **Estado:** Abierto
