# Wishlist

Ideas y mejoras posibles, sin compromiso (quizá nunca). Código `WL-###` (nunca se reutiliza).
Si una idea se promueve, se borra de aquí y nace un `RM` nuevo.

**Formato:** título + idea en 1–2 líneas, sin campos.

---

## [WL-024] Selector de comportamiento de fullscreen al entrar a Play

Desplegable en la topbar del panel Game para el comportamiento al dar Play:
`fullscreen on play / focus only / none`. Hoy Play y Fullscreen son dos gestos
separados (Play en el header, Fullscreen en la topbar del panel Game); esto sería
azúcar de conveniencia sobre eso.

## [WL-003] Sistema de anclajes estilo Unity Canvas

Agregar el sistema de anclajes (anchors) del Canvas de Unity al rectTransform de los gameobjects.

## [WL-005] Componente de layout estilo Unity (Horizontal/Vertical/Grid)

Componente que ordena GameObjects hijos automáticamente, como los Layout Group de Unity. A decidir: **un único componente configurable** (eje horizontal/vertical/grid + spacing/padding/alineación) **vs. 3 separados** como Unity. Criterio inicial: **uno solo configurable** encaja mejor con nuestro registro de componentes y evita triplicar la lógica de medición/posicionado; Unity los separa por historia y por su inspector, no por una necesidad técnica real, y un Grid es básicamente Horizontal/Vertical con wrap. Diferencia a tener presente: Unity calcula layout contra un Canvas con anchors (que aún no tenemos, WL-003); habría que definir cómo mide el "ancho disponible" con nuestro RectTransform en unidades de diseño.

## [WL-007] localScale en el RectTransform

Agregar `localScale` al RectTransform y que se propague a todos los hijos del subárbol, como el localScale de Unity.

## [WL-009] Más controles para el componente Control de video

El Control de video arrancó (RM-009) sólo con pausa (K) y reinicio (J). Extras posibles, sin compromiso: play/stop como teclas separadas, adelantar/retroceder (seek ±n segundos), saltar a un tiempo fijo, velocidad de reproducción, y elegir a qué video apunta cuando hay varios (hoy controla el `<video>` hermano de su GameObject).

## [WL-010] Interruptor enable y menú ⋮ por componente en el Inspector

La maqueta del editor (RM-029) muestra en cada sección de componente un interruptor
de **enable** (habilitar/deshabilitar sin borrar) y un menú **⋮** (mover arriba/abajo,
reset, copiar/pegar valores…). No se implementaron: `enabled` no existe en el modelo
`GameObjectComponent` (lo necesitarían vista + serialización) y `⋮` requiere un
primitivo dropdown-menu (hoy solo hay context-menu). Hoy `ComponentSection` solo trae
remove directo. Promover si se quiere desactivar componentes sin eliminarlos.

## [WL-025] Motor de inspector por esquema (absorbe WL-008)

Que cada componente declare un esquema de propiedades y un renderer genérico
genere el inspector (a mano solo como override, estilo Unity). Segunda fase:
el renderer lee valores vivos (merge) durante play. Base para componentes
scripteados por el usuario a futuro. Detalle y preguntas: `docs/idea-inspector-engine.md`.

## [WL-011] Login con Google One Tap / FedCM (prompt en la esquina)

Reemplazar el botón de redirect actual (`signInWithOAuth`) por el prompt One Tap de Google que aparece en la esquina, sin salir de la app. Es otro mecanismo: Google Identity Services (`gsi/client`) + `supabase.auth.signInWithIdToken` (no `signInWithOAuth`), requiere `NEXT_PUBLIC_GOOGLE_CLIENT_ID` y generar un nonce; corre sobre FedCM (encaja bien con target solo-Chrome). Las piezas actuales (`useAuth`, cliente Supabase, sesión) se reutilizan; solo cambia el disparador del login.

## [WL-012] Cámara navegable en la vista Scene

En Scene poder hacer pan (arrastrar la cámara) y zoom (acercar/alejar), con un marco de referencia que muestre el recorte real del Game dentro del lienzo, estilo editor 2D (Unity/Figma).

## [WL-013] Rotación editable desde el canvas

La rotación (RM-041) hoy solo se edita por el campo numérico del inspector; el `SelectionOverlay` y `useTransformGesture` siguen siendo axis-aligned, así que con un objeto rotado los handles se ven desalineados. Promover para: rotar el overlay junto al objeto, agregar un handle de arrastre para rotar y hacer que el resize funcione en espacio rotado (matemática de rotación en el gesto).

## [WL-014] Renombrar assets en Local

Poder renombrar la key/nombre de un asset ya cargado en Local. Hoy (RM-062) la key de un archivo subido se autogenera desde el nombre de archivo, sin edición posterior.

## [WL-015] Traer/descargar un asset a Local desde una URL

Poder ingerir un asset al panel Local desde una URL (descargar/generar), no solo desde archivos del PC (RM-062). Nace al quitar la URL directa del video en RM-064: el link deja de vivir en el componente. Distinto de la pestaña Storage/Supabase (RM-059), que navega assets remotos ya catalogados.

## [WL-016] Asignar por drag-and-drop (Nivel B)

Arrastrar para asignar: un asset del panel Local sobre un componente (setea su `assetKey`), y un componente sobre un campo de referencia (RM-061). Hoy la asignación es por dropdown/selector; el drag es el upgrade de UX. Es el "Nivel B" pospuesto de RM-060/RM-061.

## [WL-018] Snapping y guías al mover/redimensionar en Scene

Al arrastrar/redimensionar en el canvas de Scene, mostrar guías de alineación
(smart guides estilo Figma/Unity) y snapping a bordes/centros de otros objetos y
del lienzo. Moveable ya trae `snappable`/`elementGuidelines`/`verticalGuidelines`;
faltaría alimentarle las guías (bordes de los demás GO + centro del 1920×1080) y
decidir umbral y atajo para desactivarlo. Era la Fase 3 restante de RM-067.

## [WL-017] `id` estable por componente

Dar un `id` propio a cada componente. Hoy solo el GameObject tiene `id`; los componentes se identifican por `type` dentro de su objeto (uno de cada tipo por objeto). Haría falta si un objeto llega a tener varios componentes del mismo tipo, o para referencias más robustas. La referencia a componente de RM-061 usa `{ gameObjectId, type }` justamente para no necesitar esto todavía.

## [WL-020] Guía de operador (mitigar bus factor 1)

Documento corto de operación en vivo, pensado para que alguien que no es el autor
pueda operar el sistema: cómo abrir cada juego, cómo cargar el archivo de sesión
(ZIP/JSON), qué teclas usa cada behavior (deletreo: F/M…, video: K/J…), cómo entrar
a fullscreen y qué hacer si algo falla al aire. Hoy todo ese conocimiento vive en
una sola persona y en el código. Encaja como `docs/operacion.md` o similar; se
vuelve relevante apenas otra persona toque la máquina del estudio.

## [WL-021] Acción "sacar como panel flotante" + rediseño del chrome flotante

Sacar un panel como panel flotante de dockview (`addFloatingGroup`, no pop-out a otra ventana) y rediseñar el chrome flotante default para alinearlo a la paleta del editor. Era RM-044; degradada 2026-07-09 por ser cosmética de editor frente a la prioridad de sacar juegos.

## [WL-022] Pestaña Storage (navegar y descargar a local)

Ventana Storage paralela a Local para navegar los assets remotos (Supabase) y descargarlos a la carga local. Era RM-059; degradada 2026-07-09 porque depende del Supabase futuro (distante).

## [WL-023] Seleccionar assets locales → info en el Inspector

Click en un asset del panel Local muestra sus metadatos (tipo, peso, dimensiones, origen) en el Inspector; evaluar si el peso va en el tile o en el Inspector. Era RM-057; degradada 2026-07-09 por nice-to-have.

## [WL-026] Magic move entre pantallas (`layoutId`)

El efecto shared-layout de `motion` (*magic move*: un objeto que existe en dos
pantallas vuela y se transforma de una a la otra, estilo Balatro), explorado en
`/lab/motion`. Quedó fuera del plan comprometido de animaciones (RM-086..088)
por ser lo de mayor fricción con el engine: requiere que ambos estados del
objeto compartan identidad React entre renders, y hoy las pantallas son
subárboles que se activan/desactivan. Esteban avaló romper esa estructura si
hace falta. Promover cuando la base nueva esté asentada.
