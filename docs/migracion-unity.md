# Migración Unity → QGEM Games

Guía operativa para replicar en este sistema los juegos que ya existen en Unity.
Documenta el proceso probado con **Cálculo Mental** (RM-076) e **Intruso**
(RM-078/RM-014). El objetivo: no poner valores a mano ni re-explicar el proceso
en cada sesión.

> **Contexto clave:** este sistema *reemplaza* a Unity. Los prefabs son insumo
> de una sola dirección — después de la migración, cualquier ajuste (posición,
> cronómetro, etc.) se hace aquí, nunca en Unity. Por eso los prefabs **no se
> commitean**: Esteban los sube a `docs/referencia/unity/<juego>/`, se hace la
> conversión, y él los borra cuando termina.

## Flujo por juego

1. Esteban sube a `docs/referencia/unity/<juego>/` el `.prefab` + los `.meta`
   de las imágenes (solo el `.meta` hace falta: da el GUID para mapear sprites;
   los PNG ya viven en el catálogo de assets del workspace).
2. Convertir el prefab a `scene.json` (secciones siguientes). Generarlo con un
   script Node desechable en el scratchpad (`JSON.stringify(scene, null, 2)`),
   no a mano: los juegos tienen ~30 GameObjects repetitivos.
3. Validar con `pnpm build` (nunca `pnpm dev`) y esperar el visto bueno visual
   de Esteban comparando contra Unity.
4. Cablear la funcionalidad: controller + behavior + carga de sesión.
5. Logbook: changelog con código RM, avances en la bandeja del roadmap.

## Leer el prefab (YAML de Unity)

- Referencia del Canvas: **1920×1080** (igual que el design space del engine).
- El prefab es una lista de bloques `--- !u!<tipo> &<fileID>`. Los que importan:
  `GameObject` (nombre, `m_IsActive`, lista de components), `RectTransform`
  (jerarquía vía `m_Father`/`m_Children`, anclas), `MonoBehaviour` con script
  `fe87c0e1…` = **UI Image** (`m_Sprite` → GUID) y `f4688fdb…` = **TextMeshPro**.
- Prefabs grandes (~3.000 líneas) exceden el límite del Read: leer por chunks
  (`limit`/`offset`); la estructura es muy regular entre opciones/slots.
- Sprites: el GUID de `m_Sprite` se busca en los `.meta` subidos → nombre del
  PNG → clave del catálogo de assets del workspace (`assets.ts`).

## Conversión de coordenadas

Engine: posición relativa al **centro del padre**, Y hacia arriba (igual que
Unity), pivots 0.5, tamaños en px de diseño.

- **Ancla puntual** (`anchorMin == anchorMax = (ax, ay)`), padre de W×H:

  ```
  pos.x = ax·W − W/2 + anchoredPosition.x
  pos.y = ay·H − H/2 + anchoredPosition.y
  size  = sizeDelta
  ```

  Ej.: ancla top-center (0.5, 1) en padre 392×188 con ap (0, −57) → (0, 37).

- **Stretch total** (`anchorMin (0,0)`, `anchorMax (1,1)`):
  `size = tamañoPadre + sizeDelta` (sizeDelta suele ser negativo o 0),
  `pos = anchoredPosition`. Un stretch con sizeDelta 0 y ap 0 es un
  pass-through: se puede aplanar (fusionar con el padre) sin perder nada.

## HorizontalLayoutGroup

Unity lo resuelve en runtime; aquí se hornea. Caso usado en Intruso
(`ChildControlWidth: 0`, `ChildForceExpandWidth: 1`, padding 0):

```
sobrante = anchoContenedor − (Σ anchosHijos + spacing·(n−1))
celda    = anchoHijo + sobrante/n
offsetEnCelda = (celda − anchoHijo) · 0.5        (alignment middle-center)
izquierda_i   = i·(celda + spacing) + offsetEnCelda
centro_i (rel. al centro del padre) = izquierda_i + anchoHijo/2 − anchoContenedor/2
```

Ej. Intruso: contenedor 1617, 4 hijos de 392, spacing 10 → centros en
x = ±610.125 y ±203.375.

## TextMeshPro → componente `text`

Conversión de px a cqh: **`cqh = px ÷ 10.8`** (1080 px de alto = 100 cqh).

| TMP | Engine |
|---|---|
| `m_fontSizeBase` / `Min` / `Max` | `fontSize` / `fontSizeMin` / `fontSizeMax` (÷10.8) |
| `m_enableAutoSizing: 1` | `autoSize: true` |
| `m_fontStyle: 1` | `bold: true` |
| `m_HorizontalAlignment: 2` | `alignH: "center"` |
| `m_VerticalAlignment: 512` | `alignV: "middle"` |
| `m_margin {x:izq, y:arriba, z:der, w:abajo}` | se **hornea en el rect** del GO de texto |

Horneado de margins: `tamaño = rect − (izq+der, arriba+abajo)`;
`offset extra = ((izq−der)/2, (abajo−arriba)/2)`. El `m_fontSize` guardado es
el *resultado* del auto-size para el contenido de muestra — no usarlo, el
engine re-ajusta por contenido. `TextView` usa `lineHeight: "normal"` para leer
las mismas métricas de fuente que TMP (no tocar; era la causa de textos más
grandes que en Unity).

## Patrones de escena

- **IDs** kebab-case predecibles (`option-0-text`, `slot-1-answer`); los
  behaviors los generan con helpers en `constants.ts`. Nombres de GameObjects
  en inglés (convención del engine).
- **Frames de estado** (normal/correct/incorrect): GameObjects hermanos con
  `active` igual que en Unity (normal on, resto off). El behavior los conmuta
  vía `useSceneRuntime.setActive` — el `active` del diseño es solo el estado
  inicial; el override de runtime siempre gana en `mergeRuntime`.
- **Mask de Unity** (Mask + `m_ShowMaskGraphic: 0`): componente nativo `mask`
  + componente `image` con el sprite en el **mismo** GO, `showImage: false`.
  Recorta a los hijos con CSS mask.
- **Nivel como grupo**: el GO que en Unity tenía el script del nivel (p. ej.
  "Level 1") se convierte en grupo y **lleva el componente `controller`** con
  el estado del juego. Niveles futuros = grupos hermanos.
- Objetos vacíos e inactivos sin hijos (p. ej. "Void") se omiten.

## Funcionalidad (patrón por juego)

Espejo de Cálculo Mental / Intruso (`src/app/workspaces/<juego>/`):

- `components/controller/` — tripleta: modelo con type-guard de la sesión
  (`isXxxData`), Inspector (info de sesión + leyenda de teclas), View null.
- `constants.ts` — ids; `game.tsx` — `GameDefinition` con `components`,
  `behavior`, `onLoad`; `page.tsx` — solo `<EditorLayout game={…}/>`.
- `Behavior` — lee el controller desde `useSceneRuntime`, un `useEffect` vuelca
  la ronda actual a la escena (deps: índices + **`loadedAt`**, nunca solo
  `fileName` — ver TD-060), y `useGameKeys` mapea las teclas.
- **Teclas convenidas**: `0-9` índice directo (Shift +10, Alt +20), `N/B`
  siguiente/anterior, `Q/W/E/R` → `onOption(0-3)`, `V` → `onValidate`,
  `M` → `onShowAnswer` (con sonido de correcto), numpad → `onNavigate`.
  Bloque de navegación → `onInsert/onHome/onPageUp/onDelete/onEnd/onPageDown`
  (cambio de pantallas/paneles, equivale al INS/HOME del framework de Unity;
  Álbum usa Ins = temas, Home = cartas).

### Sesión ZIP (patrón Intruso, `session.ts`)

Las imágenes de sesión son **estado runtime**, nunca diseño ni panel Local:

1. `loadZipFile(file)` → leer `sessionData.json` → validar con el type-guard.
2. Revocar blob URLs de la sesión anterior + `clear("session")` del budget.
3. Por imagen: `zip.file(path)` → `Blob` con MIME por extensión →
   `URL.createObjectURL` → `img.decode()` (pre-decodificar, sin jank en vivo)
   → `useMemoryBudget.register("session", …)` con bytes + dimensiones.
4. `patchComponent(LEVEL_ID, "controller", { …, fileName, loadedAt: Date.now() })`.

La foto llega a pantalla por el campo runtime `src` del componente `image`
(prioridad sobre `assetKey`; el diseño solo guarda claves de catálogo).

## Gotchas conocidos

- El inspector/Hierarchy no ven ni editan props pisadas por runtime (TD-059).
- Recargar sesión con el mismo nombre de archivo: usar `loadedAt` (TD-060;
  Cálculo Mental y Deletreo aún lo arrastran).
- Los blobs de sesión no se liberan al salir del workspace (TD-061).
- Diferencias tipográficas residuales = archivo de fuente distinto entre el
  font asset de TMP y el TTF del catálogo, no un error de conversión.

## Estado de migraciones

| Juego | Escena | Funcionalidad |
|---|---|---|
| Cálculo Mental | ✅ RM-076 | ✅ (previa a la migración) |
| Intruso (Nivel 1) | ✅ RM-078 | ✅ RM-014 (Nivel 2 fuera de alcance) |
| La sabes o No | ✅ RM-015 | ✅ RM-015 |
| Al Vuelo (ex Si o No) | ✅ RM-079 | ✅ RM-079 |
| Álbum | ✅ RM-082 | ✅ RM-082 (animaciones → RM-083) |
