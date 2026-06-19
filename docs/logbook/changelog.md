# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

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
