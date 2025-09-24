# Documento de Requisitos

## Introducción

El Planificador de Rutas de Escape Rooms es una aplicación web que permite a los usuarios crear y planificar rutas personalizadas de escape rooms utilizando un mapa interactivo y un sistema de chat/búsqueda. La aplicación permite planificar múltiples días, donde cada día constituye una ruta independiente con sus propios escape rooms. El sistema calcula automáticamente los tiempos de desplazamiento entre ubicaciones y ayuda a optimizar la planificación considerando horarios de apertura, duración de las actividades y tiempo disponible para cada día.

## Requisitos

### Requisito 1

**Historia de Usuario:** Como usuario entusiasta de escape rooms, quiero poder buscar y seleccionar escape rooms en un mapa interactivo, para poder visualizar geográficamente las opciones disponibles en mi área.

#### Criterios de Aceptación

1. CUANDO el usuario accede a la aplicación ENTONCES el sistema DEBERÁ mostrar un mapa interactivo con escape rooms marcados
2. CUANDO el usuario hace clic en un marcador del mapa ENTONCES el sistema DEBERÁ mostrar información detallada del escape room (nombre, dirección, horarios, duración estimada, dificultad)
3. CUANDO el usuario utiliza la función de búsqueda ENTONCES el sistema DEBERÁ filtrar los escape rooms por nombre, ubicación o características
4. CUANDO el usuario selecciona un escape room ENTONCES el sistema DEBERÁ permitir agregarlo a su ruta planificada

### Requisito 2

**Historia de Usuario:** Como planificador de actividades, quiero poder crear rutas personalizadas seleccionando múltiples escape rooms, para poder organizar un día completo de entretenimiento.

#### Criterios de Aceptación

1. CUANDO el usuario selecciona múltiples escape rooms ENTONCES el sistema DEBERÁ crear una ruta optimizada considerando la proximidad geográfica
2. CUANDO se crea una ruta ENTONCES el sistema DEBERÁ calcular automáticamente los tiempos de desplazamiento entre cada ubicación
3. CUANDO el usuario modifica el orden de la ruta ENTONCES el sistema DEBERÁ recalcular los tiempos y mostrar la nueva estimación
4. CUANDO el usuario guarda una ruta ENTONCES el sistema DEBERÁ permitir nombrarla y almacenarla para uso futuro

### Requisito 2.1

**Historia de Usuario:** Como planificador de viajes largos, quiero poder crear planes de múltiples días donde cada día tenga su propia ruta independiente, para poder organizar escapadas de fin de semana o vacaciones temáticas.

#### Criterios de Aceptación

1. CUANDO el usuario crea un nuevo plan ENTONCES el sistema DEBERÁ permitir especificar el número de días y fechas
2. CUANDO se planifica cada día ENTONCES el sistema DEBERÁ permitir crear rutas independientes con diferentes escape rooms
3. CUANDO se visualiza el plan completo ENTONCES el sistema DEBERÁ mostrar un resumen por día con tiempos totales y escape rooms incluidos
4. CUANDO el usuario modifica un día específico ENTONCES el sistema DEBERÁ actualizar solo ese día sin afectar los otros
5. CUANDO se guarda un plan multi-día ENTONCES el sistema DEBERÁ permitir exportarlo o compartirlo como itinerario completo

### Requisito 3

**Historia de Usuario:** Como usuario que planifica con tiempo limitado, quiero ver estimaciones precisas de tiempo total incluyendo desplazamientos, para poder determinar si mi ruta es factible en el tiempo disponible.

#### Criterios de Aceptación

1. CUANDO se calcula una ruta diaria ENTONCES el sistema DEBERÁ mostrar el tiempo total estimado (escape rooms + desplazamientos + tiempo buffer)
2. CUANDO el usuario especifica un tiempo límite por día ENTONCES el sistema DEBERÁ indicar si cada ruta diaria es viable dentro de ese tiempo
3. SI una ruta diaria excede el tiempo disponible ENTONCES el sistema DEBERÁ sugerir modificaciones (eliminar paradas, cambiar orden, mover a otro día)
4. CUANDO se muestran los tiempos ENTONCES el sistema DEBERÁ desglosar por día: tiempo en cada escape room, tiempo de desplazamiento, y tiempo total
5. CUANDO se visualiza el plan completo ENTONCES el sistema DEBERÁ mostrar un resumen de tiempo total por día y tiempo total del viaje

### Requisito 4

**Historia de Usuario:** Como usuario que quiere optimizar su experiencia, quiero poder interactuar con un chat o sistema de búsqueda inteligente, para poder describir mis preferencias y recibir sugerencias personalizadas.

#### Criterios de Aceptación

1. CUANDO el usuario escribe en el chat ENTONCES el sistema DEBERÁ interpretar preferencias (dificultad, temática, duración, ubicación)
2. CUANDO se procesan las preferencias ENTONCES el sistema DEBERÁ sugerir escape rooms que coincidan con los criterios
3. CUANDO el usuario solicita una ruta automática ENTONCES el sistema DEBERÁ generar una propuesta basada en sus preferencias y tiempo disponible
4. CUANDO el sistema hace sugerencias ENTONCES DEBERÁ explicar el razonamiento detrás de cada recomendación

### Requisito 5

**Historia de Usuario:** Como usuario que planifica con anticipación, quiero poder considerar horarios de apertura y disponibilidad, para asegurarme de que mi ruta sea realista y ejecutable.

#### Criterios de Aceptación

1. CUANDO se planifica una ruta ENTONCES el sistema DEBERÁ verificar los horarios de apertura de cada escape room
2. CUANDO se detecta un conflicto de horarios ENTONCES el sistema DEBERÁ alertar al usuario y sugerir alternativas
3. CUANDO el usuario especifica una fecha y hora de inicio ENTONCES el sistema DEBERÁ calcular los horarios de llegada a cada ubicación
4. SI un escape room requiere reserva previa ENTONCES el sistema DEBERÁ indicarlo claramente y proporcionar información de contacto

### Requisito 6

**Historia de Usuario:** Como usuario que valora la experiencia de usuario, quiero una interfaz intuitiva y responsiva, para poder planificar mis rutas tanto desde escritorio como desde dispositivos móviles.

#### Criterios de Aceptación

1. CUANDO el usuario accede desde cualquier dispositivo ENTONCES la interfaz DEBERÁ adaptarse correctamente al tamaño de pantalla
2. CUANDO el usuario interactúa con el mapa ENTONCES DEBERÁ responder fluidamente a gestos táctiles y clics
3. CUANDO se cargan datos ENTONCES el sistema DEBERÁ mostrar indicadores de progreso apropiados
4. CUANDO ocurre un error ENTONCES el sistema DEBERÁ mostrar mensajes claros y opciones de recuperación

### Requisito 7

**Historia de Usuario:** Como usuario que planifica con anticipación, quiero poder guardar mis rutas y planes para editarlos en múltiples sesiones, para poder refinar mi planificación a lo largo del tiempo sin perder el progreso.

#### Criterios de Aceptación

1. CUANDO el usuario crea una ruta o plan multi-día ENTONCES el sistema DEBERÁ permitir guardarlo con un nombre personalizado
2. CUANDO el usuario cierra la aplicación y regresa ENTONCES el sistema DEBERÁ mostrar todos sus planes guardados en una lista
3. CUANDO el usuario selecciona un plan guardado ENTONCES el sistema DEBERÁ cargar toda la información (días, rutas, escape rooms, configuraciones)
4. CUANDO el usuario modifica un plan guardado ENTONCES el sistema DEBERÁ permitir guardar los cambios manteniendo el historial de versiones
5. CUANDO el usuario quiere duplicar un plan ENTONCES el sistema DEBERÁ permitir crear una copia para modificar sin afectar el original
6. CUANDO el usuario elimina un plan ENTONCES el sistema DEBERÁ solicitar confirmación y mover el plan a una papelera recuperable

### Requisito 8

**Historia de Usuario:** Como usuario que quiere compartir experiencias, quiero poder exportar y compartir mis rutas planificadas, para poder coordinar con amigos o guardar mis itinerarios en otros formatos.

#### Criterios de Aceptación

1. CUANDO el usuario completa una ruta ENTONCES el sistema DEBERÁ permitir exportarla en formatos PDF, JSON o enlace compartible
2. CUANDO se genera un enlace compartible ENTONCES otros usuarios DEBERÁN poder ver la ruta (solo lectura) sin necesidad de cuenta
3. CUANDO se exporta a PDF ENTONCES el sistema DEBERÁ incluir mapa, horarios, direcciones y información de contacto
4. CUANDO el usuario importa una ruta compartida ENTONCES el sistema DEBERÁ permitir copiarla a su cuenta para editarla

### Requisito 9

**Historia de Usuario:** Como usuario consciente de costos, quiero poder ver estimaciones de precios y gestionar mi presupuesto, para planificar económicamente mis actividades.

#### Criterios de Aceptación

1. CUANDO se muestra información de un escape room ENTONCES el sistema DEBERÁ incluir precios aproximados si están disponibles
2. CUANDO se crea una ruta ENTONCES el sistema DEBERÁ calcular el costo total estimado (escape rooms + transporte)
3. CUANDO el usuario establece un presupuesto límite ENTONCES el sistema DEBERÁ sugerir alternativas si se excede
4. CUANDO se planifica transporte ENTONCES el sistema DEBERÁ estimar costos de gasolina, transporte público o servicios de ride-sharing

### Requisito 10

**Historia de Usuario:** Como usuario que valora las opiniones, quiero poder ver reseñas y calificaciones de escape rooms, para tomar decisiones informadas sobre qué incluir en mi ruta.

#### Criterios de Aceptación

1. CUANDO se muestra información de un escape room ENTONCES el sistema DEBERÁ mostrar calificación promedio y número de reseñas obtenidas de Google Places API
2. CUANDO no hay datos de Google disponibles ENTONCES el sistema DEBERÁ permitir a los usuarios dejar reseñas y calificaciones internas
3. CUANDO se filtran escape rooms ENTONCES el sistema DEBERÁ permitir filtrar por calificación mínima (Google o interna)
4. CUANDO se sugieren rutas automáticas ENTONCES el sistema DEBERÁ priorizar escape rooms mejor calificados según datos de Google Places
5. CUANDO se integra con Google Places ENTONCES el sistema DEBERÁ sincronizar automáticamente calificaciones y reseñas actualizadas

### Requisito 11

**Historia de Usuario:** Como usuario activo en redes sociales, quiero poder compartir mis rutas planificadas en mis redes sociales, para mostrar mis planes a amigos y inspirar a otros con mis itinerarios.

#### Criterios de Aceptación

1. CUANDO el usuario completa una ruta ENTONCES el sistema DEBERÁ generar una imagen atractiva con el mapa de la ruta y resumen de escape rooms
2. CUANDO el usuario selecciona compartir ENTONCES el sistema DEBERÁ ofrecer opciones para Facebook, Instagram, Twitter y WhatsApp
3. CUANDO se comparte en redes sociales ENTONCES el mensaje DEBERÁ incluir texto personalizable como "¡Mira mi ruta planificada para Barcelona!" con enlace a la ruta
4. CUANDO se genera el contenido para compartir ENTONCES el sistema DEBERÁ incluir hashtags relevantes (#EscapeRoom #Barcelona #PlanDeViaje)
5. CUANDO alguien hace clic en el enlace compartido ENTONCES el sistema DEBERÁ mostrar una vista pública de la ruta con opción de copiarla

### Requisito 12

**Historia de Usuario:** Como administrador del sistema, quiero poder gestionar la información de escape rooms, para mantener actualizada la base de datos con información precisa.

#### Criterios de Aceptación

1. CUANDO un administrador accede al panel ENTONCES el sistema DEBERÁ permitir agregar, editar y eliminar escape rooms
2. CUANDO se actualiza información ENTONCES el sistema DEBERÁ validar la integridad de los datos
3. CUANDO se realizan cambios ENTONCES el sistema DEBERÁ registrar un log de auditoría
4. CUANDO se importan datos masivos ENTONCES el sistema DEBERÁ procesar archivos CSV o JSON con validación de formato

### Requisito 13 (Técnico)

**Historia de Usuario:** Como desarrollador del sistema, quiero utilizar PostgreSQL como base de datos principal, para aprovechar sus capacidades avanzadas de JSONB y consultas geoespaciales.

#### Criterios de Aceptación

1. CUANDO se almacenan horarios complejos ENTONCES el sistema DEBERÁ utilizar campos JSONB nativos de PostgreSQL para consultas eficientes
2. CUANDO se realizan búsquedas geográficas ENTONCES el sistema DEBERÁ utilizar índices espaciales de PostgreSQL para optimizar el rendimiento
3. CUANDO se consultan horarios especiales ENTONCES el sistema DEBERÁ aprovechar los operadores JSONB (@>, ?, ->) para consultas rápidas
4. CUANDO se escala la aplicación ENTONCES el sistema DEBERÁ beneficiarse de las capacidades de concurrencia MVCC de PostgreSQL
5. CUANDO se realizan consultas complejas ENTONCES el sistema DEBERÁ utilizar tipos de datos nativos (UUID, INTERVAL, TIMESTAMP WITH TIME ZONE) para mejor rendimiento