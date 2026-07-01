# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

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
