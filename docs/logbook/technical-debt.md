# Deuda Técnica

Registro de atajos, decisiones pendientes y riesgos a futuro de este proyecto.
Código `TD-###` (nunca se reutiliza). Al resolverse, la entrada se mueve al
changelog y se borra de aquí.

**Formato de cada entrada:**

- **Ubicación:** `archivo:línea` afectado.
- **Riesgo:** del 1 al 10 (1-3 cosmético · 4-6 ralentiza/moderado · 7-9 bug latente o seguridad · 10 crítico).
- **Problema:** qué está mal, sintetizado.
- **Impacto futuro:** qué puede causar si no se atiende.
- **Fecha** y **Estado** (Abierto / En progreso).

---

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

## [TD-008] `contentRef` añadido al `GameObjectView` genérico por una necesidad de un juego

- **Ubicación:** `src/components/shared/engine/GameObjectView.tsx`
- **Riesgo:** 3/10
- **Problema:** Se añadió el prop `contentRef?: (go) => Ref<HTMLDivElement>` al `GameObjectView` del engine para que Deletreo pudiera atar las animaciones de shake/pop al div de contenido interno del MainFrame (envuelve la imagen, sin el `transform` de pivote del `RectTransform`, que la animación pisaría). Es código genérico del engine modificado para resolver una necesidad puntual de un workspace.
- **Objetivo del cambio:** Que las animaciones de error (tecla F) y correcto (tecla M) se apliquen a la imagen del marco y a sus hijos, no solo a las letras; el `contentRef` da acceso al único elemento del árbol del GameObject que se puede animar sin romper el posicionamiento.
- **Impacto futuro:** Es un punto de extensión válido pero abre la puerta a que el engine acumule props ad-hoc por demanda de juegos. Revisar si conviene una API de animación/efectos más formal a nivel de GameObject (p. ej. un componente o hook del engine) antes de que aparezcan más casos así.
- **Fecha:** 2026-06-11 · **Estado:** Abierto
