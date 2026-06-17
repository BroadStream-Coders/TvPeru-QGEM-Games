# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

## [RM-002] Componente Text (2026-06-11)

Nueva tripleta Text (modelo + `TextView` + `TextInspector`) registrada en `componentRegistry.ts`: texto, tamaño en unidades container-query (`cqh`), color, alineación horizontal y vertical, y modo de ajuste (contener/desbordar/recortar). La fuente se carga desde el equipo vía `FontFace` + blob URL (por diseño no persiste al recargar).

## [RM-001] Componente Color acepta una imagen `shape` (2026-06-11)

El componente Color ahora acepta una imagen `shape` opcional que recorta su silueta (máscara alpha vía CSS `mask-image`) y la rellena con el color; con selector de ajuste (contener/cubrir/estirar) reusado de Image y "ajustar al tamaño". Sin `shape` se comporta como antes.

## [WL-004] Opacidad en el Hierarchy para gameobjects apagados (2026-06-11)

Los gameobjects con `active: false` ahora se ven atenuados (opacity-50) en el árbol del Hierarchy. Se añadió `active` a `TreeNode` y se propagó desde el `buildNode` de los workspaces sandbox y deletreo.
