# Wishlist

Ideas y mejoras posibles, sin compromiso (quizá nunca). Código `WL-###` (nunca se reutiliza).
Si una idea se promueve, se borra de aquí y nace un `RM` nuevo.

**Formato:** título + idea en 1–2 líneas, sin campos.

---

## [WL-001] Layout del engine estilo Unity

Rediseñar la distribución de espacios del layout del engine para que se sienta más como el desarrollo en Unity que como lo que es hoy.

## [WL-002] Pedir un diseño a Claude Design

Solicitar a Claude Design una propuesta de diseño del engine a partir de estas especificaciones.

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

## [WL-008] Revisar la creación de componentes y el nombre de la clase base

La tripleta de un componente genera bastantes archivos; evaluar simplificarlo. Además, valorar renombrar la clase base `GameObjectComponent` a solo `Component`. A decidir al momento de tocarlo.

## [WL-011] Login con Google One Tap / FedCM (prompt en la esquina)

Reemplazar el botón de redirect actual (`signInWithOAuth`) por el prompt One Tap de Google que aparece en la esquina, sin salir de la app. Es otro mecanismo: Google Identity Services (`gsi/client`) + `supabase.auth.signInWithIdToken` (no `signInWithOAuth`), requiere `NEXT_PUBLIC_GOOGLE_CLIENT_ID` y generar un nonce; corre sobre FedCM (encaja bien con target solo-Chrome). Las piezas actuales (`useAuth`, cliente Supabase, sesión) se reutilizan; solo cambia el disparador del login.
