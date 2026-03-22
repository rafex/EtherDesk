# Frontend

Base del portal EtherDesk.

## Estructura inicial

- `src/os`
  Entrada de la experiencia del sistema. Aquí vive el login simulado y el arranque hacia el desktop.

- `src/shell`
  Desktop web: wallpaper, ventanas, dock y launcher.

- `src/apps`
  Configuración e integración de aplicaciones.

- `src/editor`
  Editor de texto simple.

- `src/terminal`
  Terminal controlada.

- `src/shared`
  Componentes reutilizables, tipos y utilidades.

## Flujo esperado

1. `os` presenta un acceso simple.
2. al iniciar, redirige al desktop.
3. `shell` renderiza la experiencia tipo escritorio.

## Makefile

El frontend debe poder levantarse desde su propio `Makefile`.

Objetivos esperados:

- `make install`
- `make dev`
- `make build`
- `make preview`

El `Makefile` raíz puede delegar en este archivo para mantener separado el arranque del frontend.

## Scaffold actual

El scaffold inicial ya incluye:

- Vue 3
- Vite
- TypeScript
- SASS
- `src/os` con login simulado
- `src/shell` con desktop base y dock
