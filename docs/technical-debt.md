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

- **Ubicación:** `src/components/shared/Transform.tsx:42`, `src/hooks/use-transform-gesture.ts`, `src/app/workspaces/escena/page.tsx`
- **Riesgo:** 6/10
- **Problema:** Se migró el sistema de coordenadas de `Transform` a origen en el centro de la pantalla con Y hacia arriba (antes era esquina superior izquierda con Y hacia abajo). Los archivos de sesión de `escena` guardan `transform.position` con los valores crudos, por lo que los bundles creados con la convención anterior se renderizarán en una posición incorrecta al cargarse.
- **Impacto futuro:** Sesiones guardadas antes de este cambio aparecerán descolocadas. Si el productor de los archivos de sesión no adopta la nueva convención (centro, Y-up), las posiciones no coincidirán.
- **Fecha:** 2026-06-02 · **Estado:** Abierto
