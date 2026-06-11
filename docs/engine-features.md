# Engine — Features pendientes (backlog ordenado por dificultad)

> Este documento es el **backlog de cosas por agregar al engine**. Cada idea está
> convertida en una _feature_ con un código estable (`EF-001`, `EF-002`, …) para
> poder trabajarla en chats distintos sin ambigüedad. Las features están
> **ordenadas por dificultad** (de más fácil a más difícil). La arquitectura del
> sistema vive en `docs/engine-arquitectura.md`; este documento solo dice **qué
> falta hacer**, no cómo está hecho lo que ya existe.

---

## 🚀 Prompt para arrancar una feature (copiar/pegar al inicio de un chat nuevo)

```
Vas a trabajar en el "engine" de QGEM Games. Antes de tocar nada:

1. Lee COMPLETO `docs/engine-arquitectura.md` — es la fuente de verdad de la
   arquitectura: el modelo GameObject, las tripletas (modelo/editor/vista)
   registradas por `type`, el sistema de coordenadas en unidades container-query,
   y la convención de nombres. NO rompas el modelo unidireccional (el dato es la
   única verdad; Inspector y Scene solo se hablan a través del dato).

2. Lee COMPLETO `docs/engine-features.md` (este documento) — es el backlog de
   features pendientes ordenadas por dificultad, cada una con su código `EF-XXX`.

3. Te voy a decir el código de la feature en la que vamos a trabajar (ej: "EF-003").
   Busca esa feature, léela entera y, antes de escribir código, confírmame el plan:
   qué archivos vas a crear/tocar y cómo encaja con la arquitectura existente.

Reglas del proyecto que SIEMPRE aplican:
- Importa el engine con el alias `@engine/*` (no `@/components/shared/engine/`).
- Valida con `pnpm build` (hace type-check); `pnpm lint` NO type-checkea.
- Sin comentarios en el código salvo que se pidan; la deuda técnica va a
  `docs/technical-debt.md`.
- La UI va en español.

Cuando termines la feature, actualiza su **Estado** en este documento y, si la
arquitectura cambió, refleja el cambio en `docs/engine-arquitectura.md`.
```

---

## Leyenda

- **Código:** identificador estable de la feature (`EF-XXX`). No se reutiliza ni se reordena.
- **Dificultad:** 1–5 (1 = trivial, 5 = cambio arquitectónico grande). El documento se ordena por este campo.
- **Estado:** `Pendiente` · `En progreso` · `Hecho`.

---

## Features

> Ordenadas por dificultad (ascendente). El código `EF-XXX` es estable y se asignó
> por orden de captura, no por posición en la lista.

### [EF-004] Componente Text (cargar fuente local, texto, tamaño)

- **Dificultad:** 3/5
- **Estado:** Hecho
- **Idea original:** "Agregar el componente de Texto. El usuario debe poder cargar una fuente desde local; se tiene un texto y un tamaño de fuente. Puede que en un futuro se agreguen más detalles. Por ahora solo esto."
- **Qué es:** Nueva **tripleta** Text (modelo `textComponent.ts` + `TextView` + `TextInspector`) registrada en `componentRegistry.ts`. Campos mínimos: **texto** (string), **tamaño de fuente**, y **fuente cargada desde local**. Diseñado para crecer (color, alineación, peso, subrayado…) sin rehacerlo.
- **Notas / encaje con la arquitectura:** Es el patrón "agregar tripleta + entrada del registro" del §3 — no toca Inspector ni Scene. Tamaño de fuente debe ir en unidades container-query (`cqh`/`cqi`), no `px`, para respetar §5. La **fuente local** se carga con `FontFace` desde un archivo del equipo; ojo con la **persistencia del blob** (mismo riesgo que Video, ver **TD-006**) → registrar deuda si aplica. Revisar la memoria/decisión previa de Text (`engine-text-component-direction`): allí el subrayado es un `div` aparte y cada letra puede ser su propio GameObject — **esta feature es la versión base** (un Text simple por GameObject); la dirección "letra = GameObject" queda para una feature posterior si se necesita en deletreo. Sin Offset (posiciona el `rectTransform`).

<!--
PLANTILLA DE ENTRADA (no borrar — referencia de formato):

### [EF-XXX] Título corto de la feature
- **Dificultad:** N/5
- **Estado:** Pendiente
- **Idea original:** lo que dijo el usuario, en bruto, sin interpretar de más.
- **Qué es:** descripción ordenada de qué se quiere lograr.
- **Notas / encaje con la arquitectura:** dónde toca (¿nueva tripleta? ¿store? ¿coordenadas?),
  riesgos, dependencias con otras features.
-->
