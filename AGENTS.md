# AGENTS.md

## Propósito del proyecto

Este repositorio implementa un **portal web con apariencia de sistema operativo**.

El objetivo es crear un **punto de entrada unificado** para sistemas web desarrollados por el autor.

El sistema debe ofrecer:

- un escritorio web minimalista
- un editor de texto simple
- una terminal limitada para ejecutar operaciones controladas
- un lanzador de aplicaciones
- una estructura extensible para integrar otros sistemas

Este proyecto **NO pretende replicar un sistema operativo completo**.

Priorizar siempre:

- simplicidad
- claridad
- seguridad
- velocidad de carga
- mantenibilidad

---

### Stack tecnológico

Vue
Vite
Xterm.js (terminal)
Monaco Editor (editor)
SASS (estilos)
Animated.css (animaciones simples)


---

## Filosofía de desarrollo

El proyecto debe mantenerse **pequeño, claro y modular**.

Principios:

- preferir soluciones simples
- evitar sobreingeniería
- evitar dependencias innecesarias
- escribir código legible
- mantener responsabilidades claras entre módulos

Si una solución es demasiado compleja, probablemente no es la correcta.

---

## Arquitectura esperada

Organizar el código en módulos conceptuales:

shell  (xtermjs)
Responsable del escritorio web:

- layout
- ventanas
- barra de aplicaciones
- launcher

editor  (monaco)
Editor de texto simple.

terminal  (xtermjs)
Interfaz de terminal y ejecución controlada de comandos.

apps  
Integraciones con otros sistemas.

shared  
Componentes reutilizables, utilidades y configuración.

Evitar componentes monolíticos.

---

## Experiencia de usuario

El sistema debe sentirse como un **desktop web minimalista**.

Principios de UI:

- diseño limpio
- pocos elementos visibles
- interacciones simples
- evitar animaciones innecesarias
- evitar modales excesivos
- priorizar rapidez

Inspiraciones aceptables:

- eyeOS
- ChromeOS
- Cloud IDEs
- dashboards minimalistas

Pero manteniendo siempre **simplicidad**.

---

## Terminal

La terminal **no debe convertirse en un shell completo del sistema**.

Reglas:

- solo permitir operaciones controladas
- usar lista blanca de comandos si es necesario
- validar siempre las entradas
- separar la UI de la lógica de ejecución
- evitar ejecución arbitraria de comandos del sistema

La seguridad es prioritaria.

---

## Editor

El editor debe ser **simple**.

Reglas:

- trabajar inicialmente con texto plano
- evitar funcionalidades complejas tipo IDE
- evitar dependencias pesadas
- separar UI de persistencia

No convertir el editor en un IDE completo.

---

## Lanzador de aplicaciones

Las aplicaciones representan **accesos a otros sistemas**.

Cada app debe tener:

- id
- nombre
- descripción
- icono
- ruta o URL

El launcher debe poder configurarse fácilmente.

Evitar hardcodear apps directamente en el código.

---

## Estilo de código

Preferencias:

- nombres claros
- funciones pequeñas
- evitar abreviaciones crípticas
- evitar lógica escondida
- evitar efectos secundarios inesperados

El código debe ser fácil de entender para otro desarrollador.

---

## Dependencias

Ser conservador al agregar dependencias.

Reglas:

- preferir capacidades del lenguaje/framework
- evitar dependencias grandes para problemas pequeños
- justificar nuevas dependencias
- evitar acoplamiento fuerte a frameworks complejos

---

## Seguridad

Considerar siempre:

- autenticación futura
- autorización
- riesgo de abuso de la terminal
- XSS en el editor
- exposición de datos sensibles
- manejo seguro de requests

Nunca hardcodear credenciales.

---

## Pruebas

Si el proyecto incluye pruebas:

- mantenerlas actualizadas
- probar flujos críticos

Flujos importantes:

- carga del escritorio
- apertura del editor
- funcionamiento de la terminal
- renderizado del launcher

No crear tests complejos innecesarios.

---

## Disciplina de cambios

Antes de modificar el código:

1. entender la estructura del repositorio
2. identificar convenciones existentes
3. realizar el cambio mínimo necesario

Evitar refactorizar partes no relacionadas.

---

## Orden de prioridades

Cuando se desarrollen nuevas funcionalidades seguir este orden:

1. shell (escritorio)
2. launcher de apps
3. editor
4. terminal
5. persistencia
6. autenticación
7. mejoras visuales

---

## Guía de nombres

El proyecto puede usar nombres como:
EtherDesk  

Internamente usar nombres claros:

shell  
editor  
terminal  
apps

Evitar nombres demasiado abstractos dentro del código.

---

## Qué evitar

Evitar convertir el proyecto en:

- un IDE completo
- un sistema Linux en el navegador
- un sistema de plugins complejo
- una arquitectura de microfrontends prematura

El proyecto debe crecer **de forma controlada y gradual**.

---

## Entregables

Al completar cambios se debe:

- explicar qué se modificó
- explicar por qué
- listar archivos afectados
- mencionar posibles mejoras futuras

Mantener respuestas técnicas y concisas.