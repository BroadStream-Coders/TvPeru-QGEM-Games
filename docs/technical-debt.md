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

## [TD-002] `parent` de RectTransform declarado pero sin comportamiento

- **Ubicación:** `src/components/shared/RectTransform.tsx:21`
- **Riesgo:** 3/10
- **Problema:** El prop `parent?: RectTransformValues` existe en la interfaz pero no se consume: el render no posiciona relativo al padre todavía. Es scaffolding acordado para definir luego la semántica de parentesco.
- **Impacto futuro:** Si se empieza a pasar `parent` esperando posicionamiento relativo, no tendrá efecto y puede confundir. Hay que definir e implementar la matemática de parentesco (offset, pivot/anchors, anidamiento) antes de apoyarse en él.
- **Fecha:** 2026-06-04 · **Estado:** Abierto

## [TD-003] Árbol de prueba hardcodeado en el Hierarchy de deletreo

- **Ubicación:** `src/app/workspaces/deletreo/page.tsx` (`HIERARCHY_TEST_TREE`)
- **Riesgo:** 2/10
- **Problema:** Se inyecta un subárbol de prueba ("Test" → Canvas/Panel/Button/…) en el Hierarchy para validar el Tree View compartido. No corresponde a objetos reales de la escena y seleccionarlo deja el Inspector vacío.
- **Impacto futuro:** Si no se quita, en producción aparecerán nodos falsos en el Hierarchy de un juego en vivo. Eliminar `HIERARCHY_TEST_TREE` y su uso cuando el Tree View esté validado.
- **Fecha:** 2026-06-04 · **Estado:** Abierto
