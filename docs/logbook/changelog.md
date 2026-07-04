# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

## [RM-068] Duplicar objetos en Scene (Ctrl/Cmd+D estilo Figma) (2026-07-04 15:52)
`duplicateSubtrees` (gameObject.ts) clona la selección con su subárbol: ids nuevos, `parentId` reapuntado a los clones, offset
(+20,-20) solo en las raíces y `ComponentRef.gameObjectId` internos remapeados a las copias. Expuesto como `duplicateSelected` en el
editor y cableado a Ctrl/Cmd+D en `SceneCanvas`; poda descendientes (no duplica hijo si el padre también está seleccionado) y deja
seleccionadas las copias.

## [RM-067] Edición de Scene migrada a react-moveable (2026-07-04 15:36)
`SceneCanvas` reemplazó el sistema propio (`SelectionOverlay`+`use-transform-gesture`, eliminados): InfiniteViewer (zoom/pan/encajar,
panel dockview `renderer:"always"`) + Moveable controlado (drag/resize/rotate, Shift=ratio) que convierte a coordenadas del modelo
(`sceneTransform.ts`) y escribe directo al DOM en el gesto + commit al soltar; `RectTransform` reposicionado left/top para ser
Moveable-friendly. Multi-selección por react-selecto (click/marquee/shift, `rootContainer` fija el offset por el transform de dockview)
y grupos de Moveable; `selectedId`→`selectedIds[]`. Snapping/guías → WL-018.

## [RM-066] Ventana Game: fit contain sin scroll + look Unity (2026-07-04 10:01)
La rama Game de `Scene.tsx` (solo en ventana) encaja el stage 16:9 con `min(100cqi, 100cqb*16/9)` — pillarbox/letterbox,
nunca scroll — sobre un backdrop plano `#202327`, sin grilla ni borde (estilo Game view de Unity). Fullscreen y Scene intactos.

## [RM-065] Topbar "Cargar" cableado a la data del juego (2026-07-04 09:27)
`GameDefinition` gana `onLoad(file, editor)`; `EditorLayout` lo pasa al header (aparece el botón "Cargar"). Deletreo
y Cálculo Mental definen su `onLoad` (parsean su JSON y patchean su componente de data); se quitó el botón "Cargar
JSON" de ambos inspectores — un solo punto de carga.

## [RM-061] Componentes por referencia (estilo Unity) (2026-07-04 09:27)
Primitivo `ComponentRef { gameObjectId, type }` + campo `ComponentRefField`/`AssetSelectField` en el inspector. El
`controller` de deletreo pasó a componente especializado `Deletreo` (montado en Anchor): referencia un Image y
togglea `normalFrame`/`errorFrame` según `frame`; el behavior solo setea `frame`. Image quedó renderer tonto.

## [RM-064] Video "Load First": referenciar Local en vez de cargar (2026-07-03 22:35)
Video quedó `{ fit, assetKey, muted, loop }`: referencia un asset de Local, sin file/URL propio; Inspector igual
que image (Asset + ajuste, Sound/Loop). Intruso hornea `assetKey:"background"` y su behavior se eliminó. De paso
se quitó `cover` (lo cubre el mask) y video + videoControl pasaron a inglés.

## [TD-014] Preloader ↔ Video reconectados (resuelto por RM-064) (2026-07-03 22:35)
Al pasar video a Load First declara su asset en el catálogo/manifest y consume el blob ya precargado; se van los
caminos file/URL que saltaban el preloader (adiós arranque en negro en vivo).

## [RM-060] Filosofía "Load First" (paraguas) (2026-07-03 22:35)
Cerrado: todo recurso pasa por Local y los componentes solo lo referencian por `assetKey`. Completado por RM-062
(ingesta a Local), RM-063 (image) y RM-064 (video). Colocación = dropdown (Nivel A); drag/select-in-Local (Nivel B) → RM-061.

## [RM-063] Image "Load First": quitar el cargador manual (2026-07-03 22:04)
Image quedó `{ fit, assetKey }`: `ImageView` y el mask resuelven por `assetKey` desde Local, sin carga
propia; Inspector = recuadro-selector Asset + icono de ajuste. Deletreo migrado (togglea mainFrame/errorFrame);
`AssetField` borrado (carga manual muerta en Load First).

## [RM-062] Local: cargar archivos del PC (ingesta a Local) (2026-07-03 21:42)
Botón "Cargar" en la barra de Local sube archivos del equipo (image/video/audio) vía
`createObjectURL` — blob listo al instante, key autogenerada+dedupe, en la raíz. `assetsState`
pasó a mutable en `EditorLayout` (`addLocalFiles` fusiona con el catálogo precargado; revoke al desmontar). Primera de RM-060.

## [TD-056] Fix color de tabs del dockview (activo se confundía con inactivo) (2026-07-03 10:10)
La barra de tabs estaba en `head` (más claro que el tab activo en `panel`), y los inactivos
también en `head`, así que resaltaban más que el activo. Se pasó barra y tabs inactivos a `bg`
(oscuro) y el activo queda en `panel` (claro), fusionando con el contenido. En `dockview-theme.css`.

## [RM-055] Assets: panel "Local" con organización propia + barra breadcrumb (2026-07-03 10:04)
Panel renombrado a "Local" (icono HardDrive); futura ventana "Storage" aparte. El árbol ahora
sale de un campo nuevo `folder` del catálogo (organización local, independiente del `path` de
origen), no del path. Barra entre tab y contenido con breadcrumb navegable + contador de items.
Poblado `folder` de ejemplo en intruso (Frames/Colors/Backgrounds/Fonts) y deletreo (Frames).

## [RM-016] Panel de Assets tipo Unity (browser carpetas + miniaturas) (2026-07-03 09:55)
`AssetBrowser`: árbol de carpetas derivado de los `path` del catálogo (izq, expandible + conteo)
y grid de miniaturas de la carpeta seleccionada (der, recursivo). Miniatura real para imágenes
ready (blob decodificado), ícono por tipo para video/audio/font; badge de tipo (ext) y de estado
(ready/loading/error del preloader RM-007). Se agregó `catalog` al `assetsContext`; se eliminó el
`AssetsBar` viejo. Diferido a futuro Supabase: pestañas Local/Storage, caching/GET y búsqueda.

## [RM-054] Iconos en las pestañas del dockview (2026-07-03 09:47)
`defaultTabComponent` custom (`PanelTab`) que muestra icono lucide coloreado + título + cerrar
en hover, reenviando los handlers de puntero de dockview. Mapa por id: hierarchy/scene (azul),
inspector (violeta), game (ámbar), assets (verde). Estilos en `dockview-theme.css`.

## [RM-053] Status bar (footbar) del editor (2026-07-03 09:37)
Barra de 23px bajo el dockview en `EditorLayout` (da respiro al panel Assets). Muestra solo
datos reales: estado según el preloader (Listo/Cargando assets…), nº de objetos, objeto
seleccionado, y `N/M assets` listos + tag "QGEM Engine". Sin FPS/GB inventados del diseño.

## [RM-052] Topbar a 34px igual al diseño, por grupos ocultables (2026-07-03 09:08)
`WorkspaceHeader` reconstruido a 34px: botón Volver icono-only, brand (icono+título, sin
versión), menus e history presentes pero ocultos vía `const SHOW`, Play (=fullscreen del
Game, cableado por `onPlay` en el header store + `onFullscreenReady` en `Scene`), Load
condicional a `onLoad`, y `AuthButton` como avatar+dropdown (solo Logout). Se eliminó ON AIR.
Play activa primero la pestaña Game (vía `props.api.setActive`) y entra a fullscreen en el
siguiente frame, así funciona desde cualquier pestaña sin error; se quitó el botón de
fullscreen que vivía dentro de `Scene` (`showFullscreenButton`). Cierre: header del root (`/`)
igualado a 34px; `AuthButton` deslogueado = solo ícono Google, logueado = solo avatar (foto
de `user_metadata.avatar_url` con fallback a iniciales color+letra), info en el dropdown.

## [RM-051] Layout por defecto igual al diseño Sandbox (2026-07-03 08:49)
Reordenado `buildDefaultLayout`: Assets se agrega antes que hierarchy/inspector para que
ocupe todo el ancho abajo (altura 232 del diseño), no solo bajo Scene. Tokens de color ya
existían (RM-026) y coinciden con el diseño; sin cambios ahí.

## [RM-004] Operaciones Combinadas eliminado (no se usa) (2026-07-01 00:46)
Se removió el workspace `operaciones-combinadas` por completo (carpeta, card del home,
menciones en el doc del engine). Era un stub (ex-TD-011) sin uso ni plan a corto plazo; se
descarta en vez de migrarlo al `EditorLayout`. Cierra RM-004 y TD-011.

## [RM-048] deletreo migrado al `EditorLayout` (2026-07-01 00:28)
deletreo pasó de un `page.tsx` de ~410 líneas a 4 piezas: `game.tsx` (ficha:
assets/gameObjects/components/behavior/initialSelectedId), `DeletreoBehavior.tsx` (teclas/
sonidos/animaciones/sesión vía `useEditor`/`useAssets`/`useAnimations`), `constants.ts` y
`page.tsx` fino. `EditorLayout` ganó `onAnimatePosition` (bounce/slide) e `initialSelectedId`.
Primer juego real sobre el layout genérico.

## [RM-047] Pieza de "comportamiento" (behavior) en el contrato (2026-07-01 00:28)
`GameDefinition` ganó `behavior?` (un componente por juego que `EditorLayout` monta bajo sus
providers) para alojar la lógica de runtime del juego. Se extrajo el `EditorContext` a
`@engine/editor/editorContext.ts` (`useEditor` importable desde componentes de juego). Es la
4ta pieza, además de assets/gameObjects/components.

## [RM-045] Layout genérico del editor + contrato `GameDefinition` (2026-06-30 23:59)
`EditorDock` se volvió `EditorLayout` genérico en `@engine/editor/`, recibe una
`GameDefinition { id, title, icon?, assets?, gameObjects?, components? }` y de ahí deriva
registry (`NATIVE_COMPONENTS + game.components`), `initialGameObjects` y el header. El Sandbox
quedó como página fina (`<EditorLayout game={sandboxGame} />`) con una ficha vacía de
referencia. Se eliminó el POC `border`. Assets aún placeholder (Fase 2, RM-046).

## [RM-042] Sistema de ventanas tipo Unity (dockview) en el Sandbox (2026-06-30 23:31)
El chrome de edición del Sandbox usa `dockview-react`: Hierarchy, Inspector, Scene, Game y
Assets como paneles con pestaña, redimensionables, reubicables y flotantes. Estado real de
`useSceneEditor` compartido vía Context (cruza el portal de dockview). Scene edita (grid,
overlay, gestos); Game muestra limpio con botón de fullscreen. `Scene` ganó props aditivas
`viewMode`/`showFullscreenButton` (los otros 4 juegos intactos). Tema `.dv-qgem` mapeado a la
paleta del editor, centralizado en `@engine/dockview-theme.css`.

## [TD-017] Glue de edición de GameObjects extraído a `useSceneEditor` (2026-06-30 14:20)
Las 9 funciones genéricas de edición (estado de `gameObjects`/`selectedId`, setters de
transform/componentes, jerarquía y gesto) estaban duplicadas en los 5 workspaces. Se
movieron a `src/hooks/use-scene-editor.ts`; cada página ahora solo desestructura el hook
(pasando `initialGameObjects`/`initialSelectedId`). Cambios a nivel engine (p. ej. rotación)
ya no se multiplican por juego. Reset de selección unificado a `null`.

## [RM-041] Rotación en el RectTransform (2026-06-30 13:58)

`RectTransform` admite `rotation?` (grados, eje Z) aplicado al render rotando
alrededor del pivot (`transform-origin`), editable con un campo "Rotation Z" en
el inspector. Alcance solo-inspector; el overlay de canvas sigue axis-aligned (ver
WL-013).

## [TD-016] Chrome de edición separado del árbol enmascarado + restyle (2026-06-29 19:08)

El overlay de edición (borde + handles + área de move) estaba duplicado en los 4
workspaces dentro del `renderContent`, metido en el wrapper enmascarado/animado de
`GameObjectView`, así que cualquier máscara (propia o de un ancestro) recortaba los
controles. Se extrajo a `SelectionOverlay` compartido, montado a nivel del stage
(coordenadas absolutas vía `ancestorOffset`), fuera de toda máscara. `GameObjectView`
quedó como render puro (sin chrome de edición). Restyle: borde punteado rojo →
accent azul sólido (`#4c8dff`) con handles cuadrados rellenos estilo Figma.

## [RM-012] Máscara general estilo Unity (2026-06-29 18:26)

Nuevo componente `Mask` que NO es standalone: usa la `Image` hermana del mismo
GameObject como fuente (estilo Unity) y `GameObjectView` la aplica como CSS mask al
wrapper, recortando componentes e hijos. Su única propiedad es `Show image` (ocultar
el gráfico, útil en dev). Color volvió a ser relleno plano.

## [RM-023] Slot de Cálculo Mental con 2 hijos Text para delimitar el texto (2026-06-27 17:41)

El Slot ya no dibuja el texto internamente: cada Slot tiene 2 GameObjects hijos con
componente Text (pregunta/respuesta, autoSize) posicionables vía RectTransform. El
board-sync vuelca el texto en los hijos, el reveal hace toggle de su `active`;
SlotComponent adelgazó a marcos + estado correcto/incorrecto.

## [RM-039] Campo `AssetField` + `FieldIconButton`; ImageInspector como piloto (2026-06-27 17:20)

Nuevos primitivos en `InspectorFields.tsx`: `AssetField` (fila label + badge de tipo

- nombre + picker desacoplado vía `onPick` + slot `actions`) y `FieldIconButton`
  (botón icono cuadrado consistente). `ImageInspector` migrado: fuera preview, botón de
  texto largo y span de filename; ahora fila Source (badge PNG derivado de la extensión,
  loader y ajustador como íconos) + Ajuste. Resto de inspectores pendientes.

## [RM-038] Token `acc-hover` para el hover del acento (2026-06-27 16:55)

El hex mágico `#5d99ff` estaba hardcodeado en 5 archivos como hover del acento;
ahora es token (`--editor-acc-hover` → `bg-acc-hover`). Reemplazados los 5 usos.

## [RM-037] Paleta editor como brand único: retematizar primitivos + podar tokens shadcn (2026-06-27 16:48)

`button` y `context-menu` retematizados a tokens editor (`acc/elev/line/ink/panel`),
`Scene` usa `bg-stage`. Eliminados de `globals.css` todos los tokens shadcn huérfanos
(`primary/secondary/muted/accent/popover/card/input` + `-foreground`); quedan como
semánticos del brand `background/foreground/border/ring/destructive/brand/success` +
la paleta editor. Sin tokens nuevos: el único rol faltante (peligro) ya era `destructive`.

## [RM-036] Limpieza shadcn: borrar primitivos muertos + podar tokens huérfanos (2026-06-27 16:40)

Estandarización hacia la paleta editor (RM-026): eliminados 5 primitivos `ui/` sin
uso (`card`, `select`, `scroll-area`, `input`, `badge`) y podados de `globals.css` los
tokens shadcn huérfanos (`sidebar-*`, `chart-*`). Quedan `button` + `context-menu`
(aún con tokens shadcn, su retematización va en el siguiente paso). Build limpio.

## [TD-015] Copy desactualizado: "Studio"/"colector de datos" → Games (2026-06-26 02:45)

La app se anunciaba como "QGEM Studio" y "Colector de datos": en `layout.tsx` (metadata
title/description) y `page.tsx` (top bar + eyebrow). Corregido a **QGEM Games**, descripción
"Visualizador de juegos a pantalla completa…" y eyebrow "Workspaces de juegos", acorde a que
es una herramienta de visualización de juegos, no un colector. Build limpio.

## [RM-035] Página root (launcher) repintada a la estética del editor (2026-06-26 02:35)

`src/app/page.tsx` adopta la paleta del editor sin cambiar layout: top bar/footer `bg-head`+
`border-edge`, badge del Trophy y hover de cards/iconos en `--acc`/`--acc-bg`, cards `bg-panel`
borde `--line` (hover `bg-panel-2`), textos `--ink`/`--dim`/`--faint`, pill "TV Perú" en `--elev`.
Se conserva el pill verde "Sistema activo" (indicador de estado). Build limpio.

## [RM-034] WorkspaceHeader repintado a la estética del editor (2026-06-26 02:20)

El `WorkspaceHeader` y su `FileActions` adoptan la paleta del editor (`bg-head`/`border-edge`,
"Volver" `--dim`→`--ink` con hover `--elev`, divisor `--line`, badge de icono `--acc-bg`/`--acc`,
título `--ink`, botón de carga `--acc` con hover `#5d99ff`). Se conservan el alto `h-12`, el
`h-7` del botón y todo el comportamiento (volver, icono+título por store, carga). Era lo único
de la top bar que quedaba fuera del restyle. Build limpio.

## [RM-033] Barra inferior de Assets (shell + estados) (2026-06-26 02:05)

Nueva `AssetsBar` (+ `AssetTile`/`AssetLoaderTiles`) en el layout de los 4 workspaces:
barra full-width bajo las 3 columnas, header `--head` "ASSETS" + cuerpo en fila de tiles.
Estado vacío "Ninguno cargado" en sandbox/operaciones; en deletreo/cálculo muestra el tile
de la sesión JSON del controller + los tiles de los assets del preloader con su estado
(ready/loading/error) y el progreso en el header. Se eliminó la card blanca `AssetLoaderCard`
(`bg-slate-50`), cuya info se movió a la barra. `main` pasa a `flex-col`. No es el sistema de
gestión de assets (RM-016, diferido); es su shell con estados. Build limpio.

## [RM-032] Layout flush de 3 columnas (no card) (2026-06-26 01:20)

El layout de los 4 workspaces deja de ser cards flotantes: `main` pierde `p-3`/`gap`,
las 3 columnas van pegadas a sangre y a altura completa, separadas por divisores
`--edge` (Hierarchy 262px · Scene 1fr · Inspector 336px, más ancho). `SidePanel` deja
de ser tarjeta redondeada (columna `bg-panel` full-height) y gana `bodyClassName`. La
Scene/toolbar pierden el marco redondeado y la Scene llena su columna (viewport ajedrezado
a altura completa). Las secciones del Inspector (`ComponentSection`, cabecera de objeto)
pasan a flush con borde inferior `--line` en vez de cards; el cuerpo del Inspector va sin
padding/gap. Build limpio.

## [RM-031] Toolbar y viewport ajedrezado de la Scene (2026-06-26 00:45)

`ViewModeTabs` pasa a ser la toolbar `--head` (30px): tabs Scene/Game con borde inferior
de acento en la activa, separador, resolución `1920 × 1080` + `16:9` en mono `--faint`, y
botón **Fullscreen** azul `--acc` (movido aquí desde el botón flotante, que se eliminó). El
viewport gana fondo ajedrezado (`repeating-conic-gradient` 22px) con marco `--line` detrás
del stage 16:9 (borde `--edge` + sombra). No se tocó `FullScreen`, container-query ni el
grid/gizmo de edición. Zoom de la maqueta omitido (no hay zoom real). Build limpio.

## [RM-030] Campos tipados del Inspector + Add Component (2026-06-26 00:25)

Nuevo `InspectorFields` con primitivos del diseño: `FieldRow`, `AxisInput`/`AxisField`
(num mono con prefijo de eje X/Y/W/H sobre `--elev`), `SelectField` (caja `--bg` + ▾),
`ColorField` (swatch 22px + hex mono) y `ToggleField` (pill `--acc`). `NumberInput`/
`NumberField` repintados (`--bg`/`--line`, alineado a la derecha, label `--dim`) y
`NumberInput` acepta `className`. Migrados: RectTransform (Position/Size con ejes),
los inspectores nativos (color/image/video/text/videoControl + animaciones por NumberField)
y los locales (border/spellframe/2×controller/slot), con sus controles inline repintados
del brand rojo/shadcn al acento azul `--acc` y paleta del editor. `AddComponentButton`
estilo pill `--elev`/`+` azul. Slider y campo asset de la maqueta se omiten (sin consumidor
hoy; serían código muerto). Build limpio.

## [RM-029] Chrome del Inspector: cabecera de objeto + secciones colapsables (2026-06-25 23:55)

Nuevo `ComponentSection` (marco compartido: header `--panel2` con caret colapsable,
badge de glyph coloreado por acento text/image/video/anim, título y remove). Los 14
inspectores (RectTransform, los 9 nativos y los 5 locales: border/spellframe/2×controller/
slot) se envuelven en él. `GameObjectInspector` repintado: check de activo cuadrado `--acc`,
glyph de tipo por `kind` (nuevo prop, cableado en los 4 workspaces) e input de nombre
`--bg`. El header sticky `INSPECTOR` ya lo da el `SidePanel` (RM-027). Switch enable y
menú `⋮` de la maqueta → WL-010 (sin modelo/primitivo). Campos internos → RM-030. Build limpio.

## [RM-028] Filas del Hierarchy estilo editor (2026-06-25 23:30)

Las filas del árbol pasan a estilo editor: barra de selección `--acc` a la izquierda,
caret de expansión, glyph mono coloreado por tipo (group/text/image/video/color vía
`gameObjectKind`), nombre con ellipsis, marca de animación ✦ (`gameObjectHasAnimation`)
y ojo de visibilidad que togglea `active`. Nuevos helpers en `gameObject.ts`, `TreeNode`
gana `kind`/`hasAnimation`, `Hierarchy` gana `onToggleActive`; cableado en los 4
workspaces. Conserva select/create/delete/reorder. Build limpio.

## [RM-027] Chrome de `SidePanel` estilo editor (2026-06-25 23:05)

`SidePanel` pasa de la "pestaña" shadcn a una caja `--panel` con borde `--line` y
barra de header `--head` (30px): título en mayúsculas con tracking + color `--dim`,
contador y zona de acciones opcionales (props `count`/`actions`, retrocompatibles),
cuerpo con scrollbar `.scrl`. Repinta Hierarchy/Inspector en los 4 workspaces. Build limpio.

## [RM-026] Tokens de diseño + fuentes IBM Plex + scrollbars (2026-06-25 22:30)

Base del restyle del sandbox: paleta del editor como tokens (`--editor-*` crudos +
utilidades Tailwind `panel/head/elev/line/ink/dim/faint/acc/type-*/anim` vía `@theme`)
en `globals.css`, **IBM Plex Sans** (UI) e **IBM Plex Mono** (números) vía
`next/font/google` reemplazando a Geist como base, scrollbar `.scrl` y `::selection`
de acento. Build limpio; aún sin aplicar a los paneles (eso va en RM-027+).

## [RM-009] Componente Control de video por teclas (2026-06-25 13:33)

Nueva tripleta `videoControl` (nativa, registrada): controla el `<video>` hermano de
su GameObject con dos teclas asignables —pausa/play toggle (K) y reinicio (J) por
defecto; reinicio deja el video pausado en 0—. Su View ata un listener global sin UI;
el inspector captura las teclas. El inspector de Video gana un botón "Agregar control
de video" (un click) vía el nuevo prop opcional `onAddComponent` del editor, cableado
en los 4 workspaces, y dos checkboxes Sonido/Loop (`muted`/`loop` al modelo, mute y
loop activos por defecto). Resto de controles → WL-009.

## [TD-013] El mensaje de error ya no llama "colector" a la app (2026-06-19 14:57)

En `persistence.ts`, el error de validación pasa de "…para este colector." a
"…para este juego.", acorde a que la app es de visualización, no un colector.

## [TD-012] Borrar el `NumberField` muerto en `shared/` (2026-06-19 14:50)

Eliminado `src/components/shared/NumberField.tsx`, código muerto que nadie importaba
(todo el repo usa `@engine/NumberField`). Build limpio tras el borrado.

## [RM-020] Auto-size en el componente Text (2026-06-19 14:17)

Text gana Auto Size estilo TextMeshPro: toggle + fontSize mín/máx que escala el
texto vía búsqueda binaria para llenar su RectTransform (alto en modo wrap). Inspector
reordenado (Font → Size) con labels en inglés; se extrajo `NumberInput` de `NumberField`.

## [RM-021] Modificador de estilo de letra en Text (2026-06-19 11:44)

El componente Text expone negrita/cursiva/subrayado como tres toggles independientes y acumulables (booleanos `bold`/`italic`/`underline`, todos deseleccionables) en el inspector; el `TextView` los mapea a `font-weight`/`font-style`/`text-decoration`. Promovió y cerró WL-004.

## [WL-004] Control de grosor de texto (font-weight) (2026-06-19 11:40)

Cerrada al implementarse como RM-021.

## [WL-006] Menú contextual de click derecho en el Hierarchy (2026-06-19 11:28)

Se reemplazó el botón "+" por un menú de click derecho: sobre un nodo "Crear hijo", sobre la zona vacía "Crear GameObject" (root). Nuevo primitivo `ui/context-menu.tsx` (radix). Realizada junto con RM-025.

## [RM-025] Eliminar GameObjects (2026-06-19 11:28)

Acción "Eliminar" en el menú contextual del Hierarchy que borra un GameObject y su subárbol (inmediato, sin confirmación); helpers `collectSubtreeIds`/`deleteGameObjectAndChildren` en `gameObject.ts`, cableado en los 4 workspaces.

## [RM-013] Juego "Cálculo Mental" (2026-06-19 11:14)

Workspace propio: 4 slots (componente `slot` — frame azul+pregunta, morado+respuesta, badge check/X) hijos de un GameObject `Controller` que carga el JSON (grupos>tableros>slots) y los puebla de forma destructiva. Teclas: →/← revelar/retroceder pregunta, M respuesta+correcto, F error, C limpiar, ↑/↓ entrada/salida escalonada (0.1s) de los 4 slots, N/B navegar tableros.

## [RM-019] Controller de datos para Deletreo (2026-06-19 09:10)

Deletreo replica el patrón de Cálculo Mental: GameObject `Controller` con componente que carga el JSON (`isDeletreoData`) y gestiona navegación grupos/slots; el `onLoad` del header se retiró. La info referencial + leyenda de teclas viven en el inspector del Controller, eliminando `StatusCard` y `LegendCard`.

## [RM-018] Hierarchy e Inspector de tamaño fijo con scroll (2026-06-19 09:02)

`SidePanel` saca su cuerpo del flujo (capa `absolute inset-0` con `overflow-y-auto`), así los paneles ya no empujan el alto de la fila: quedan fijos al alto de la escena y hacen scroll interno cuando el contenido excede. Aplica a Hierarchy e Inspector en todos los workspaces.

## [RM-011] Animaciones de deletreo como componentes (2026-06-19 08:51)

Pop, Shake, Bounce y Slide son ahora componentes del engine (`NATIVE_COMPONENTS`) con disparo vía `useAnimations().trigger`; Pop/Shake animan el content-div y Bounce/Slide la posición del transform (canal `onAnimatePosition` en `GameObjectView`). Deletreo migrado: MainFrame cuelga de un `Anchor` fijo y arranca visible (Bounce sube, Slide baja).

## [RM-017] Catálogo de assets compartidos/locales con resolver (2026-06-17 09:05)

Separación de identidad lógica vs URL físico: `resolveAssetUrl`/`toManifest` (`asset-source.ts`) + catálogos tipados (`SHARED_ASSETS` global, `DELETREO_ASSETS` local). Los assets se movieron a `public/assets/{shared,games/<juego>}/` espejando el bucket; migrar a Supabase = setear `NEXT_PUBLIC_ASSET_BASE_URL`. Se eliminó `SOUNDS` de `audio.ts` (el catálogo es la fuente de rutas).

## [RM-007] Preloader de assets headless (2026-06-17 08:39)

Nuevos `preloadAssets` (helper) + `useAssetPreloader` (hook): bajan imágenes/video/audio/fuentes a blob local y decodifican (img.decode / canplaythrough / FontFace), resolviendo cuando todas están settled. Deletreo los consume (imagen + audio), espera `ready` antes de renderizar y muestra una `AssetLoaderCard` de progreso; la imagen de error ya no tiene delay en su primer render.

## [RM-006] SpellFrame como componente del engine (2026-06-16 22:37)

El SpellFrame de deletreo es ahora una tripleta registrada (`spellframe`, local de deletreo): su edición vive en el Inspector con carga de tipografía propia; se eliminó la card inferior `TextCard`.

## [RM-008] Quitar el footer del layout de juegos (2026-06-16 22:25)

Se eliminó el `<footer>` del layout de workspaces; la zona inferior queda libre para el futuro panel de assets (RM-007).

## [TD-006] Descartada — no es deuda (2026-06-16 21:18)

Revisada contra la filosofía del proyecto y descartada (wontfix): que el blob URL del modo "Equipo" de Video no sobreviva al reload es **comportamiento por diseño** (nada persiste a propósito), y la app no serializa/produce session files. El modo Link/Supabase es el camino persistente para broadcast, por diseño. Código retirado (no se reusa).

## [RM-003] Componentes personalizados por juego (2026-06-16 21:05)

El registro de componentes pasó de un `COMPONENT_REGISTRY` global a un sistema componible: el engine exporta `NATIVE_COMPONENTS` + `createComponentRegistry`/`ComponentRegistryProvider`/`useComponentRegistry`, y cada juego arma su registro local (nativas + las suyas). Demostrado con un componente custom `Border` registrado solo en sandbox, fuera del core.

## [TD-004] Tipado fuerte del registro de componentes (2026-06-16 21:05)

`defineComponent<C>` ata vista y editor al modelo `C` (type-check en compilación), eliminando los `as unknown as` por entrada; el único ensanchado a la base ocurre una vez dentro del helper. Resuelto como parte de RM-003.

## [RM-002] Componente Text (2026-06-11)

Nueva tripleta Text (modelo + `TextView` + `TextInspector`) registrada en `componentRegistry.ts`: texto, tamaño en unidades container-query (`cqh`), color, alineación horizontal y vertical, y modo de ajuste (contener/desbordar/recortar). La fuente se carga desde el equipo vía `FontFace` + blob URL (por diseño no persiste al recargar).

## [RM-001] Componente Color acepta una imagen `shape` (2026-06-11)

El componente Color ahora acepta una imagen `shape` opcional que recorta su silueta (máscara alpha vía CSS `mask-image`) y la rellena con el color; con selector de ajuste (contener/cubrir/estirar) reusado de Image y "ajustar al tamaño". Sin `shape` se comporta como antes.

## [WL-004] Opacidad en el Hierarchy para gameobjects apagados (2026-06-11)

Los gameobjects con `active: false` ahora se ven atenuados (opacity-50) en el árbol del Hierarchy. Se añadió `active` a `TreeNode` y se propagó desde el `buildNode` de los workspaces sandbox y deletreo.
