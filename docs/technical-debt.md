# Deuda Técnica

Registro de atajos, decisiones pendientes y riesgos a futuro de este proyecto.

**Formato de cada entrada:**

- **Ubicación:** `archivo:línea` afectado.
- **Riesgo:** del 1 al 10 (1-3 cosmético · 4-6 ralentiza/moderado · 7-9 bug latente o seguridad · 10 crítico).
- **Problema:** qué está mal, sintetizado.
- **Impacto futuro:** qué puede causar si no se atiende.
- **Fecha** y **Estado** (Abierto / Resuelto).

---

## [TD-001] Cambio de sistema de coordenadas rompe sesiones antiguas

- **Ubicación:** `src/components/shared/RectTransform.tsx:43`, `src/hooks/use-transform-gesture.ts`, `src/app/workspaces/escena/page.tsx`
- **Riesgo:** 6/10
- **Problema:** Se migró el sistema de coordenadas de `Transform` a origen en el centro de la pantalla con Y hacia arriba (antes era esquina superior izquierda con Y hacia abajo). Los archivos de sesión de `escena` guardan `transform.position` con los valores crudos, por lo que los bundles creados con la convención anterior se renderizarán en una posición incorrecta al cargarse.
- **Impacto futuro:** Sesiones guardadas antes de este cambio aparecerán descolocadas. Si el productor de los archivos de sesión no adopta la nueva convención (centro, Y-up), las posiciones no coincidirán.
- **Fecha:** 2026-06-02 · **Estado:** Abierto

## [TD-002] Parentesco de RectTransform solo soporta un nivel

- **Ubicación:** `src/components/shared/engine/RectTransform.tsx:32`, `src/app/workspaces/deletreo/page.tsx`
- **Riesgo:** 4/10
- **Problema:** El prop `parent` ya posiciona al hijo relativo al padre, pero solo suma `parent.position` (un nivel). Si el padre está a su vez parentado (abuelo), el render no acumula la cadena: el caller le pasa el transform local del padre inmediato, no su posición mundial. Tampoco considera `size`/`pivot`/anchors del padre, solo su punto de pivote como origen.
- **Impacto futuro:** Al anidar 3+ niveles, las posiciones serán incorrectas. Para soportarlo hay que resolver la posición mundial del padre (subiendo por la cadena `parentId`) o que `RectTransform` acepte ya el transform mundial del padre.
- **Fecha:** 2026-06-04 · **Estado:** Abierto

## [TD-003] Árbol de prueba hardcodeado en el Hierarchy de deletreo

- **Ubicación:** `src/app/workspaces/deletreo/page.tsx` (`HIERARCHY_TEST_TREE`)
- **Riesgo:** 2/10
- **Problema:** Se inyecta un subárbol de prueba ("Test" → Canvas/Panel/Button/…) en el Hierarchy para validar el Tree View compartido. No corresponde a objetos reales de la escena y seleccionarlo deja el Inspector vacío.
- **Impacto futuro:** Si no se quita, en producción aparecerán nodos falsos en el Hierarchy de un juego en vivo. Eliminar `HIERARCHY_TEST_TREE` y su uso cuando el Tree View esté validado.
- **Fecha:** 2026-06-04 · **Estado:** Abierto

## [TD-005] Sandbox legado pendiente de eliminar

- **Ubicación:** `src/app/workspaces/sandbox/legacy/LegacySandbox.tsx`
- **Riesgo:** 2/10
- **Problema:** El sandbox se reescribió sobre el sistema del engine (GameObject + Hierarchy + Inspector + registro de componentes). La implementación anterior, basada en el modelo ad-hoc `Source` (text/image con paneles Fuentes/Propiedades/Transform), se movió íntegra a `LegacySandbox` y quedó **sin usar** (ningún route ni componente la importa), solo apartada para borrarla más adelante.
- **Impacto futuro:** Código muerto que se compila y mantiene sin aportar. Eliminar el archivo (y la carpeta `legacy/`) una vez validado el sandbox del engine.
- **Fecha:** 2026-06-04 · **Estado:** Abierto

## [TD-004] Tipado laxo del registro de componentes

- **Ubicación:** `src/components/shared/engine/componentRegistry.ts`
- **Riesgo:** 3/10
- **Problema:** `COMPONENT_REGISTRY` tipa `view`/`editor` sobre el `GameObjectComponent` base y castea las entradas concretas (`ImageView`/`ImageInspector`) con `as`. No hay garantía en compilación de que el `view`/`editor` registrado bajo una clave `type` coincida con el modelo de ese `type`.
- **Impacto futuro:** Al sumar más componentes (Text, Video…) un registro mal emparejado (vista de un tipo con el modelo de otro) no lo detecta el compilador y se cae en runtime. Conviene un registro genérico parametrizado por la unión discriminada de componentes.
- **Fecha:** 2026-06-04 · **Estado:** Abierto

## [TD-006] Video desde la PC usa blob URL que no persiste

- **Ubicación:** `src/components/shared/engine/components/video/VideoInspector.tsx`
- **Riesgo:** 4/10
- **Problema:** El modo "Equipo" del componente Video carga el archivo con `URL.createObjectURL` (blob URL). Se eligió frente al data URL para no inflar el estado/session file con un base64 enorme, pero el blob URL es una referencia en memoria: **no sobrevive a recargar la página ni a serializar la sesión**. Solo el modo "Link" (URL de Supabase) produce un `src` persistente.
- **Impacto futuro:** Un video cargado desde el equipo se ve mientras dura la sesión de autoría, pero al recargar o reabrir el bundle el `src` blob queda muerto y el video desaparece. Para broadcast hay que usar siempre el modo Link, o resolver una estrategia de subida (Supabase) al elegir archivo.
- **Fecha:** 2026-06-04 · **Estado:** Abierto

## [TD-007] YouTube descartado como fuente del componente Video

- **Ubicación:** `src/components/shared/engine/components/video/` (decisión de diseño)
- **Riesgo:** 2/10
- **Problema:** Se evaluó un 3er modo "YouTube" y se descartó: YouTube no es reproducible en un `<video>` (no hay URL del archivo), solo vía `<iframe>` de la IFrame API. Eso rompe los contratos de la tripleta: camino de render distinto, `object-fit` no aplica (barras negras, "cubrir/estirar" exige hackear escala+recorte), "ajustar al tamaño original" imposible (la API no expone la resolución), branding/anuncios/relacionados de YouTube y riesgo de red para salida en vivo.
- **Impacto futuro:** Si en el futuro se requiere YouTube, debe tratarse como un modo degradado explícitamente separado (iframe, looped+muted con `playlist=<id>`), sin ajuste real ni tamaño original, asumiendo el riesgo para broadcast.
- **Fecha:** 2026-06-04 · **Estado:** Abierto
