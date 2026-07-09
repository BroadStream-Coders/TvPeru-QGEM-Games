# Idea: motor de inspector por esquema (WL-025)

> Apunte de idea (2026-07-09), sin compromiso. Para retomar en una sesión futura.
> Contexto completo en la conversación que cerró el Play Mode.

## La idea

Hoy cada componente del engine trae su inspector escrito a mano (la "tripleta":
definición + vista + inspector). La propuesta: que el componente **declare un
esquema de propiedades** ("`text` es string, `fontSize` es number, `color` es
color, `src` es assetKey…") y un **renderer genérico único** mapee ese esquema a
los primitivos que ya existen (`InspectorFields`, `NumberField`,
`ComponentSection`). El inspector a mano queda como override para casos
especiales — igual que los custom editors de Unity, donde el inspector default
se genera solo.

Son **dos decisiones apiladas**, no una:

1. **Inspector generado por esquema.** Mata el archivo de inspector por
   componente; la tripleta baja a definición+esquema y vista.
2. **Qué store lee/escribe el renderer según el modo.** En edición lee diseño
   (como hoy); en play podría leer los valores fusionados (merge) y pintarse
   distinto (tinte estilo Unity). Esto es lo que resolvería que el inspector
   "no ve" lo que el behavior pisa durante play. La #1 no lo resuelve sola,
   pero permite resolverlo **en un solo lugar** en vez de en N inspectors.

Horizonte lejano: componentes "scripteados" por el usuario (seudo-lenguaje).
Un componente scripteado emitiría esquema + lógica, y su inspector saldría
gratis del motor. Muchos serían controllers sin vista → el motor cubre toda su
UI.

## Qué ya existe a favor

- Los inspectors actuales ya se arman con primitivos compartidos; los ladrillos
  están, falta el esquema y el renderer.
- `ComponentDefinition` ya es el punto único de registro (`componentRegistry`);
  el esquema viviría ahí.
- TS no tiene reflexión en runtime → el esquema se declara explícito (no se
  puede "inferir" del tipo).

## Preguntas a resolver / investigar

- **Forma del esquema:** ¿array de `{ key, type, label?, min/max?, options? }`?
  ¿Qué tipos de campo cubren los componentes actuales (string, number, color,
  vec2, boolean, enum, assetKey)? Inventariar los inspectors existentes.
- **Casos que no caben en esquema plano:** el TextInspector tiene lógica
  (resize, fuentes del catálogo); ¿override total o slots/hooks en el renderer?
- **Diseño fino:** ¿hace falta un `editor.json` de layout por componente o el
  esquema con labels/grupos alcanza? (Sospecha: alcanza; YAGNI el json.)
- **Valores vivos en play (decisión #2):** ¿solo lectura con tinte, o editable
  escribiendo al override de runtime? ¿Qué pasa al salir de play?
- **Migración:** ¿se migran los 8+ componentes existentes al esquema o solo los
  nuevos nacen así? ¿Cuáles necesitan override sí o sí?
- **Herencia de WL-008:** valorar de paso renombrar la clase base
  `GameObjectComponent` → `Component` (quedó absorbida esa WL en esta).
- **Referentes:** custom property drawers de Unity y `@export` de Godot como
  modelo de esquema mínimo viable.
