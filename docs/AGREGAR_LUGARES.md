# 📍 Cómo Agregar Nuevos Lugares al Sistema

## Sistema Híbrido Implementado

Tu formulario ahora tiene un **sistema de búsqueda de 3 niveles**:

1. ⭐ **Base de datos local** (instantáneo) - Lugares que tú predefines
2. 🗺️ **Mapbox API** (preciso) - Base de datos mundial
3. 🌍 **Nominatim/OpenStreetMap** (fallback) - Respaldo gratuito

## Cómo Agregar Nuevos Centros de Eventos

### 1. Obtener las coordenadas del lugar

**Opción A: Usando Google Maps**
1. Abre [Google Maps](https://maps.google.com)
2. Busca el lugar (ej: "La Fragua Centro de Eventos")
3. Haz clic derecho sobre el marcador
4. Selecciona las coordenadas (aparecen en la parte superior)
5. Ejemplo: `-33.1867, -70.6782`

**Opción B: Usando la consola del navegador**
1. Abre tu formulario
2. Presiona F12 (Consola de desarrollador)
3. Busca un lugar similar y ve los resultados en consola
4. Copia las coordenadas que aparecen

### 2. Editar el archivo script.js

Busca la sección `LUGARES_PREDEFINIDOS` (línea ~4) y agrega tu nuevo lugar:

```javascript
const LUGARES_PREDEFINIDOS = [
    // TUS LUGARES EXISTENTES...
    
    // AGREGAR AQUÍ TU NUEVO LUGAR:
    { 
        nombre: 'Nombre del Centro de Eventos', 
        direccion: 'Dirección Completa, Comuna, Ciudad', 
        lat: -33.1234,  // Latitud (número negativo en Chile)
        lon: -70.5678,  // Longitud (número negativo en Chile)
        categoria: 'centro_eventos'  // Puede ser: centro_eventos, parque, mall, estadio, etc.
    },
];
```

### 3. Ejemplo Real

```javascript
{ 
    nombre: 'Centro de Eventos Mi Fiesta', 
    direccion: 'Camino Los Aromos 1234, Colina, Santiago', 
    lat: -33.2000, 
    lon: -70.6500, 
    categoria: 'centro_eventos' 
},
```

### 4. Guardar y Probar

1. Guarda el archivo `script.js`
2. Recarga la página (F5)
3. Escribe el nombre del lugar en el formulario
4. ¡Debería aparecer con una estrella ⭐!

## Ventajas del Sistema

✅ **Resultados locales aparecen primero** (con estrella ⭐)
✅ **Combinación con resultados de Mapbox** (con pin 📍)
✅ **Fallback automático** si Mapbox no encuentra el lugar
✅ **Búsqueda inteligente** por nombre o dirección
✅ **Sin duplicados** - El sistema elimina resultados repetidos

## Categorías Disponibles

- `centro_eventos` - Centros de eventos y salones
- `parque` - Parques y áreas verdes
- `mall` - Centros comerciales
- `estadio` - Estadios y recintos deportivos
- `aeropuerto` - Aeropuertos
- `plaza` - Plazas públicas
- `otro` - Cualquier otro tipo de lugar

## ¿Necesitas Ayuda?

Si necesitas agregar muchos lugares a la vez o tienes dudas, contáctame y te ayudo a automatizar el proceso.
