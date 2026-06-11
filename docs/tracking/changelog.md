# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## YYYY-MM-DD — [CÓDIGO] Título
Resumen en ≤2 líneas de lo que se hizo.
```

---

## 2026-06-11 — [WL-004] Opacidad en el Hierarchy para gameobjects apagados

Los gameobjects con `active: false` ahora se ven atenuados (opacity-50) en el árbol del Hierarchy. Se añadió `active` a `TreeNode` y se propagó desde el `buildNode` de los workspaces sandbox y deletreo.
