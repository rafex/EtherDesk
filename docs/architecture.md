# Arquitectura inicial

## Objetivo

La PoC parte de un frontend fuerte y un backend mock liviano en JavaScript/TypeScript.

No se usará inicialmente un backend pesado en Java. La carpeta `backend/java` queda reservada para una etapa futura si el proyecto lo necesita.

## Estructura propuesta

### Frontend

Ubicación: `frontend/src`

- `os`
  Punto de entrada de la experiencia del sistema.
  Debe resolver:
  - pantalla de acceso o login simulado
  - transición al escritorio
  - sesión visual básica del usuario
  - estado global simple del sistema

- `shell`
  Responsable del escritorio una vez iniciada la sesión:
  - wallpaper
  - layout principal
  - ventanas
  - dock o barra de aplicaciones
  - launcher

- `apps`
  Registro y acceso a aplicaciones disponibles.
  Cada app debe definir:
  - `id`
  - `name`
  - `description`
  - `icon`
  - `route` o `url`

- `editor`
  Editor de texto simple.

- `terminal`
  Terminal controlada y limitada.

- `shared`
  Componentes reutilizables, utilidades, tipos y configuración.

### Backend mock

Ubicación: `backend/javascript/src`

- `routes`
  Endpoints mock.

- `modules`
  Lógica pequeña por dominio.

- `shared`
  Tipos, utilidades y configuración común.

## Flujo de experiencia

El flujo inicial de la PoC debe ser:

1. `os` muestra una pantalla de acceso simple.
2. El usuario entra a una sesión simulada.
3. `shell` renderiza el desktop.
4. El desktop muestra wallpaper, dock y launcher.
5. Las apps se alimentan desde configuración local o desde el backend mock.

## Nota de diseño

`frontend/src/os` no reemplaza a `shell`.

La separación recomendada es:

- `os`: entrada, sesión simulada y navegación inicial del sistema
- `shell`: escritorio ya cargado y su interacción visual

Esto permite mantener responsabilidades claras y evita convertir un solo módulo en un componente monolítico.
