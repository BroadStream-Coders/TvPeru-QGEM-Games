# QGEM Games — TV Perú

Sistema de visualización fullscreen para los juegos del programa **Que Gane el Mejor** (TV Perú). Carga datos desde archivos `.json` o `.zip` (cuando hay imágenes) y los presenta en pantalla completa durante la producción en vivo.

## Concepto

Cada juego del programa tiene su propio **workspace**:

- El operador carga un archivo de sesión (`.json` o `.zip`) preparado previamente.
- El sistema muestra los datos en una vista fullscreen optimizada para pantalla de producción.
- Los archivos `.zip` empaquetan el JSON de sesión junto con imágenes asociadas al juego.

## Desarrollo

```bash
pnpm dev      # servidor en localhost:3000
pnpm build    # build de producción
pnpm lint     # eslint
```

## Stack

- Next.js 16 + React 19 (App Router)
- Tailwind CSS v4 + shadcn/ui
- Zustand — estado global por workspace
- JSZip — carga/descarga de bundles con imágenes

---

BroadStream Coders © TV Perú
