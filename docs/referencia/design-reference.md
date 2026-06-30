# Referencia de diseño — Restyle visual del sandbox

Extracto digerible de la maqueta `sandbox-editor.standalone.html` (Claude design).
El `.html` es un bundle standalone: ábrelo en **Chrome** para ver el diseño vivo;
este documento es lo que se necesita para implementar el restyle sin reabrirlo.

Plan de trabajo: **RM-026 → RM-031** en `docs/logbook/roadmap.md`.
Alcance: restyle del editor actual (Hierarchy / Scene / Inspector). La top bar y el
panel Assets de la maqueta quedan fuera (ver roadmap).

---

## Tokens (paleta del diseño) — base de RM-026

La maqueta los define como CSS vars en el contenedor raíz:

| Token      | Valor                  | Uso                                      |
| ---------- | ---------------------- | ---------------------------------------- |
| `--bg`     | `#15171a`              | Fondo de la app / canvas de paneles      |
| `--panel`  | `#1d2024`              | Fondo de Hierarchy / Inspector / Assets  |
| `--panel2` | `#23272c`              | Cabecera de objeto, fondo de sección     |
| `--head`   | `#26292f`              | Barra de header de cada panel            |
| `--elev`   | `#2b2f36`              | Hover, prefijo de input, botones         |
| `--elev2`  | `#32373f`              | Hover elevado, pista de slider           |
| `--line`   | `#303640`              | Bordes/divisores principales             |
| `--line2`  | `#3b424c`              | Bordes sutiles / handles de divisor      |
| `--txt`    | `#d6d9de`              | Texto principal                          |
| `--dim`    | `#9aa1ab`              | Texto secundario / labels                |
| `--faint`  | `#6b727c`              | Texto terciario / placeholders / íconos  |
| `--acc`    | `#4c8dff`              | Acento (selección, foco, botón primario) |
| `--accbg`  | `rgba(76,141,255,.16)` | Fondo de selección/acento suave          |
| `--accbg2` | `rgba(76,141,255,.28)` | Fondo de acento más fuerte               |
| `--green`  | `#46c98b`              | Tipo **image**, estado OK / ON AIR       |
| `--amber`  | `#e0a83a`              | Tipo **video**                           |
| `--violet` | `#a779f0`              | Marca de animación / tags                |

Bordes "negros" entre paneles: `#0d0f11`. Selección de texto: `rgba(76,141,255,.35)`.
Hover de divisor: `--line`. Base de fuente del editor: **13px**, color `--txt`.

### Fuentes (RM-026)

- **IBM Plex Sans** → toda la UI (`font-family:'IBM Plex Sans',system-ui,sans-serif`).
- **IBM Plex Mono** (`--mono`) → números, códigos, contadores, resoluciones, fps.
- Cargar con `next/font/google` (alineado con RM-022: una sola fuente base en el
  bundle; el resto pensado desde storage — revisar al implementar).

### Scrollbars (`.scrl`, RM-026)

```css
.scrl::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}
.scrl::-webkit-scrollbar-thumb {
  background: #3a3f47;
  border: 2px solid transparent;
  background-clip: padding-box;
  border-radius: 6px;
}
.scrl::-webkit-scrollbar-thumb:hover {
  background: #4b515a;
}
```

(Target = Chrome del estudio, así que `::-webkit-scrollbar` es suficiente.)

---

## Layout general

Grid de 5 filas: `34px` top bar · `1fr` main · `8px` divisor · `232px` Assets ·
`23px` status bar. **Del restyle solo entra la fila `1fr` (main).**

Main = 3 columnas con divisores `col-resize`: `262px` Hierarchy · `1fr` Scene ·
`336px` Inspector. Hoy el sandbox usa `w-72` (288px) para ambos lados.

---

## Hierarchy — RM-027 (chrome) + RM-028 (filas)

**Header** (`--head`, alto 30px): título `HIERARCHY` en 11px, `font-weight:600`,
`letter-spacing:.6px`, color `--dim`; contador mono `--faint`; spacer; caja de
búsqueda (`⌕ Search…`) y botón `+` (Create) en `--elev` con borde `--line2`.

**Fila** (alto 23px, 12.5px):

- Barra lateral izq. 2px = color de estado (selección/activo).
- Caret de expansión (rota según abierto), `--faint`.
- Glyph de tipo (15px, mono, `font-weight:600`) coloreado por tipo:
  - group `▸` `#cdd2da` · text `T` `#7fb0ff` · image `▢` `#46c98b` · video `▶` `#e0a83a`.
- Nombre con ellipsis; `font-weight` mayor si seleccionado.
- Si tiene animación: `✦` violeta.
- Ojo de visibilidad (toggle active) a la derecha.
- Hover: `background:var(--elev)`. Seleccionado: fondo `--accbg`/barra `--acc`.

Conservar select / create (menú contextual) / delete / reorder actuales.

---

## Scene — RM-031

**Toolbar** (`--head`, 30px): tabs (Scene/Game) con `border-bottom:2px` de acento
en la activa; separador; info de resolución `1920×1080` + `Free Aspect` en mono
`--faint`; spacer; zoom (`⊟ 67%`); botón **Fullscreen** azul (`--acc`, texto
blanco, `border-radius:6px`, hover `#5d99ff`).

**Viewport**: fondo tablero de ajedrez detrás del stage 16:9:

```css
background: repeating-conic-gradient(#101214 0 25%, #0c0e10 0 50%) 0/22px 22px;
```

El stage 16:9 va centrado con sombra. No tocar `FullScreen`, container-query ni el
gizmo de edición (el gizmo de la maqueta: borde `1.5px #4c8dff`, handles 7px
blancos con borde de acento).

---

## Inspector — RM-029 (chrome) + RM-030 (campos)

**Header sticky** (`--head`): `INSPECTOR` (igual estilo que Hierarchy) + acción Lock.

**Cabecera de objeto** (`--panel2`): check de activo (cuadrado borde `--acc`,
fondo `--accbg`, `✓`), glyph de tipo (mono, color por tipo), input de nombre
(fondo `--bg`, borde `--line`, `border-radius:5px`, `font-weight:600`).
Debajo: fila Tag / Layer (en la maqueta; **opcional**, no hay modelo hoy).

**Sección de componente** (colapsable, borde inferior `--line`):

- Header `--panel2` (28px): caret; badge 18px (fondo translúcido del color del
  tipo + glyph mono); nombre 12.5px `font-weight:600`; tag opcional violeta;
  spacer; interruptor enable (cuadrado con marca); menú `⋮`.
- Cuerpo: lista de campos.

**Rect Transform**: misma estructura de sección; filas con label (54px, `--dim`) y
dos inputs con prefijo de eje.

### Primitivos de campo (RM-030)

Patrón base: fila `label (≈54–78px, --dim) + control`. Control sobre `--bg`,
borde `--line`, `border-radius:5px`.

- **num / vector**: input mono alineado a la derecha; **prefijo de eje** (`X`/`Y`/
  `W`/`H`) en caja `--elev` `--faint` pegada a la izquierda; unidad opcional al
  final.
- **text**: input simple. **area**: caja multilínea (`font-weight:600` para títulos).
- **select**: caja con valor + `▾` `--faint`; hover `border-color:var(--line2)`.
- **color**: swatch 22px (borde `--line2`) + input hex mono en mayúsculas.
- **slider**: pista `--elev2` 4px, relleno `--acc`, thumb 11px blanco borde acento,
  valor mono `--dim` a la derecha.
- **toggle**: pill 30×17, thumb blanco; ON = fondo `--acc`.
- **asset**: caja con swatch de tipo (gradiente) + nombre + ícono de picker `◎`.

**Add Component** (RM-030): pill centrado 80% de ancho, `--elev` borde `--line2`,
`+` en `--acc`; hover `--elev2` + borde `--acc`.

---

## Mapa rápido tarea → archivo

| RM  | Archivo(s) principal(es)                                                        |
| --- | ------------------------------------------------------------------------------- |
| 026 | `src/app/globals.css`, `src/app/layout.tsx` (fuentes)                           |
| 027 | `src/components/shared/engine/SidePanel.tsx` (compartido)                       |
| 028 | `src/components/shared/engine/Hierarchy.tsx`                                    |
| 029 | `GameObjectInspector.tsx` + marco de inspectores de componente                  |
| 030 | `RectTransformInspector.tsx`, `NumberField.tsx`, inspectores en `components/*/` |
| 031 | `Scene.tsx`, `SceneViewMode.tsx`, `ViewModeTabs.tsx`                            |
