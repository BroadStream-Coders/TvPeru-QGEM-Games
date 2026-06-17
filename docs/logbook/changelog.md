# Changelog

Registro permanente de todo el trabajo terminado. Indexado por código de tarea
(`TD-`, `RM-`, `WL-`). Orden inverso: lo más nuevo arriba.

**Formato de cada entrada:**

```
## [CÓDIGO] Título (YYYY-MM-DD HH:MM)
Resumen en ≤2 líneas de lo que se hizo.
```

---

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
