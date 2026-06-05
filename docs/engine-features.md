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

### [EF-001] Quitar el cambio de fondo de la Scene (fondo vacío por defecto)

- **Dificultad:** 2/5
- **Estado:** Pendiente
- **Idea original:** "Tenemos que quitar la funcionalidad del componente scena, de cambiar el tipo de fondo, de color, image y video, todo eso se va a la basura, el fondo por defecto debe tener un color básico, que refleje que está vacío; si se requiere algo como color/img/video, se debe agregar como un gameobject nuevo."
- **Qué es:** La Scene deja de tener configuración de fondo (las variantes `color` / `image` / `video` del `SceneBackground` / `BackgroundConfig` se eliminan). El fondo pasa a ser **fijo**: un color neutro que comunique "lienzo vacío". Cualquier fondo real (color, imagen, video) se compone **dentro de la escena** como un GameObject más con su componente correspondiente (Color/Image/Video), no como propiedad de la Scene.
- **Notas / encaje con la arquitectura:** Toca `engine/Scene.tsx` (+ `SceneBackground`) y elimina el cableado de `BackgroundConfig` en `deletreo/page.tsx` y `sandbox/page.tsx`. Refuerza el modelo "todo es GameObject" del §1–§3 de la arquitectura. Revisar que ningún juego dependa hoy del fondo de Scene para su look; si lo hace, migrar ese fondo a un GameObject de fondo. Elegir el color "vacío" (gris medio / patrón) y dejarlo como constante. Actualizar la arquitectura (§5/§7) si cambia la firma de `Scene`.

### [EF-002] Inputs de RectTransform tipo Unity (calculadora, negativos, sin 0 forzado)

- **Dificultad:** 3/5
- **Estado:** Pendiente
- **Idea original:** "Corregir el ingreso de datos en rectTransform; es muy incómodo que siempre te aparezca un 0 y que si quiero poner un negativo no me deje escribir el guion. Idealmente debe funcionar como en Unity, que el input funciona como una calculadora. Revisar si esto es posible."
- **Qué es:** Rehacer la edición de los campos numéricos del `RectTransformInspector` (Pos X/Y, Width, Height) para que se sientan como en Unity: permitir estados intermedios mientras se escribe (vacío, solo `-`, `-0`, decimales a medio escribir) sin forzar un `0`, y aceptar el signo negativo. **Bonus (revisar viabilidad):** que el campo evalúe una expresión tipo calculadora (`100+20`, `960/2`) al confirmar.
- **Notas / encaje con la arquitectura:** El problema típico es un input numérico **controlado** que castea a número en cada `onChange` y pisa lo que escribes. Patrón: mantener un **string local** mientras el campo está enfocado y solo escribir al modelo (`transform`) cuando el valor es parseable / al `blur` / `Enter`. La calculadora se puede hacer parseando la expresión en el commit. No cambia el modelo de datos, solo el editor (#3 de §4). Si el patrón sirve, considerar extraerlo a un `NumberField` reutilizable para futuros editores.

### [EF-004] Componente Text (cargar fuente local, texto, tamaño)

- **Dificultad:** 3/5
- **Estado:** Pendiente
- **Idea original:** "Agregar el componente de Texto. El usuario debe poder cargar una fuente desde local; se tiene un texto y un tamaño de fuente. Puede que en un futuro se agreguen más detalles. Por ahora solo esto."
- **Qué es:** Nueva **tripleta** Text (modelo `textComponent.ts` + `TextView` + `TextInspector`) registrada en `componentRegistry.ts`. Campos mínimos: **texto** (string), **tamaño de fuente**, y **fuente cargada desde local**. Diseñado para crecer (color, alineación, peso, subrayado…) sin rehacerlo.
- **Notas / encaje con la arquitectura:** Es el patrón "agregar tripleta + entrada del registro" del §3 — no toca Inspector ni Scene. Tamaño de fuente debe ir en unidades container-query (`cqh`/`cqi`), no `px`, para respetar §5. La **fuente local** se carga con `FontFace` desde un archivo del equipo; ojo con la **persistencia del blob** (mismo riesgo que Video, ver **TD-006**) → registrar deuda si aplica. Revisar la memoria/decisión previa de Text (`engine-text-component-direction`): allí el subrayado es un `div` aparte y cada letra puede ser su propio GameObject — **esta feature es la versión base** (un Text simple por GameObject); la dirección "letra = GameObject" queda para una feature posterior si se necesita en deletreo. Sin Offset (posiciona el `rectTransform`).

### [EF-003] Jerarquía padre/hijo real (transform relativo + arrastre del padre)

- **Dificultad:** 4/5
- **Estado:** Hecho (2026-06-04). Solución: `RectTransform` cambió sus unidades de `cqw`/`cqh` a `%` y `GameObjectView` renderiza a sus hijos **dentro** del div de contenido del padre (render en árbol: las páginas solo mapean los root). El anidamiento DOM nativo resuelve la cadena de transforms a cualquier profundidad; se eliminó el prop `parent` y se añadió `parentSize`. El sistema de coordenadas del usuario no cambió (origen centro, Y arriba; mismos números en el Inspector). Cerró **TD-002**. Limitación abierta: los overlays de edición solo se renderizan en root (**TD-008**).
- **Idea original:** "Revisar el sistema de hijos/padre. La idea es que si un gameobject es hijo de otro, y este último mueve su transform, su hijo se mueve con él. La position del hijo funciona como un offset (no exactamente, pero similar): el hijo por defecto debe estar en el centro, en (0,0); si le pongo (100,0) esto debe ser respecto al padre."
- **Qué es:** Convertir el parenting actual (suma de un solo nivel) en una jerarquía de transforms **de verdad**: la `position` del hijo es **relativa al padre** (origen (0,0) = centro del padre), y mover/reposicionar el padre arrastra a todos sus descendientes. Debe acumular por toda la cadena de ancestros, no solo un nivel.
- **Notas / encaje con la arquitectura:** Es exactamente la deuda **TD-002** (parenting de un solo nivel; hoy solo suma `parent.position`, ignora abuelos, size y pivot del padre). Se ataca en `engine/RectTransform.tsx` (§5): el cálculo CSS debe componer la cadena de transforms padre→hijo. Decidir el alcance: ¿solo acumular posición por toda la cadena, o también heredar rotación/escala/pivot a futuro? Mínimo viable: posición relativa multinivel + arrastre. Cuidado de no romper el modelo unidireccional ni el sistema de coordenadas (origen centro, Y arriba). Al cerrarla, actualizar §5 y marcar **TD-002** como resuelta.

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
