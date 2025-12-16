// MAPBOX CONFIGURATION
const MAPBOX_TOKEN = 'pk.eyJ1IjoicmVncmVzb2ZlbGl6IiwiYSI6ImNtajNjNXVnMDE1OTMzcHB6ZzBiMWx1dXIifQ.W2JNrM712264cNmKX5a8iw';

// BASE DE DATOS LOCAL - Centros de Eventos y Lugares Populares en Chile
const LUGARES_PREDEFINIDOS = [
    // Centros de Eventos - Santiago
    { nombre: 'Centro de Eventos La Fragua', direccion: 'La Fragua, Colina, Santiago', lat: -33.1867, lon: -70.6782, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Botánico', direccion: 'Sendero Estero, Peñalolén, Santiago', lat: -33.5089, lon: -70.5128, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Casona San José', direccion: 'Av. Santa Rosa, La Pintana, Santiago', lat: -33.5856, lon: -70.6344, categoria: 'centro_eventos' },
    { nombre: 'Espacio Riesco', direccion: 'Av. El Salto 5000, Huechuraba, Santiago', lat: -33.3594, lon: -70.6403, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Casona Reina Sur', direccion: 'Camino Longitudinal Sur, San Bernardo', lat: -33.6167, lon: -70.7167, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Punta Cali', direccion: 'Camino El Melocotón, Pirque', lat: -33.6789, lon: -70.5756, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Santa Martina', direccion: 'Camino Padre Hurtado, Peñaflor', lat: -33.6089, lon: -70.9128, categoria: 'centro_eventos' },
    { nombre: 'Haras Los Lingues', direccion: 'Camino Los Lingues, Buin', lat: -33.7389, lon: -70.7456, categoria: 'centro_eventos' },
    { nombre: 'Club Hípico de Santiago', direccion: 'Av. Blanco Encalada 2540, Santiago Centro', lat: -33.4689, lon: -70.6833, categoria: 'centro_eventos' },
    { nombre: 'Movistar Arena', direccion: 'Av. Beauchef 1204, Santiago', lat: -33.4656, lon: -70.6833, categoria: 'centro_eventos' },
    
    // Ubicaciones populares - Santiago
    { nombre: 'Plaza de Armas', direccion: 'Plaza de Armas, Santiago Centro', lat: -33.4378, lon: -70.6503, categoria: 'plaza' },
    { nombre: 'Costanera Center', direccion: 'Av. Andrés Bello 2425, Providencia', lat: -33.4183, lon: -70.6067, categoria: 'mall' },
    { nombre: 'Parque Bicentenario Vitacura', direccion: 'Av. Bicentenario, Vitacura', lat: -33.4000, lon: -70.5833, categoria: 'parque' },
    { nombre: 'Parque Araucano', direccion: 'Av. Presidente Riesco, Las Condes', lat: -33.4067, lon: -70.5733, categoria: 'parque' },
    { nombre: 'Estadio Nacional', direccion: 'Av. Grecia 2001, Ñuñoa', lat: -33.4650, lon: -70.6100, categoria: 'estadio' },
    { nombre: 'Aeropuerto Arturo Merino Benítez', direccion: 'Pudahuel, Santiago', lat: -33.3930, lon: -70.7858, categoria: 'aeropuerto' }
];

// Variables globales para Leaflet y Mapbox
let map;
let origenMarker = null;
let destinoMarker = null;
let routeLayer = null;
let origenCoords = null;
let destinoCoords = null;

// Constantes de precio
const PRECIO_BASE = 25000;
const COSTO_POR_KM = 500;

// Obtener elementos del DOM
const form = document.getElementById('reservaForm');
const mensaje = document.getElementById('mensaje');
const centroEventoInput = document.getElementById('centroEvento');
const destinoFinalInput = document.getElementById('destinoFinal');
const sugerenciasOrigen = document.getElementById('sugerencias-origen');
const sugerenciasDestino = document.getElementById('sugerencias-destino');

// Botón volver al inicio (solo en index.html)
document.addEventListener('DOMContentLoaded', function() {
    const btnVolverInicio = document.getElementById('btnVolverInicio');
    
    if (btnVolverInicio) {
        btnVolverInicio.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Inicializar componentes del formulario
    inicializarMapa();
    configurarAutocompletado();
    configurarActualizacionResumen();
    configurarToggleMapa();
});

// Configurar botón para activar/desactivar mapa
function configurarToggleMapa() {
    let mapaActivo = false;
    const toggleBtn = document.getElementById('toggleMapBtn');
    const mapDiv = document.getElementById('map');
    
    toggleBtn.addEventListener('click', function() {
        mapaActivo = !mapaActivo;
        
        if (mapaActivo) {
            // Activar interacciones
            map.dragging.enable();
            map.scrollWheelZoom.enable();
            map.doubleClickZoom.enable();
            map.touchZoom.enable();
            map.boxZoom.enable();
            map.keyboard.enable();
            
            // Cambiar estilos
            mapDiv.classList.remove('map-locked');
            mapDiv.classList.add('map-active');
            toggleBtn.textContent = '🔒 Bloquear Mapa';
            toggleBtn.classList.add('map-active-btn');
        } else {
            // Desactivar interacciones
            map.dragging.disable();
            map.scrollWheelZoom.disable();
            map.doubleClickZoom.disable();
            map.touchZoom.disable();
            map.boxZoom.disable();
            map.keyboard.disable();
            
            // Cambiar estilos
            mapDiv.classList.remove('map-active');
            mapDiv.classList.add('map-locked');
            toggleBtn.textContent = '🔓 Activar Mapa';
            toggleBtn.classList.remove('map-active-btn');
        }
    });
}

// Inicializar el mapa con Mapbox
function inicializarMapa() {
    // Crear mapa centrado en Santiago, Chile con interacciones desactivadas
    map = L.map('map', {
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomControl: true
    }).setView([-33.4489, -70.6693], 12);
    
    // Agregar capa de Mapbox (mucho más precisa)
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: '© <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 19,
        id: 'mapbox/streets-v12',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: MAPBOX_TOKEN
    }).addTo(map);
    
    console.log('Mapa Mapbox inicializado correctamente');
}

// Configurar autocompletado con Nominatim (OpenStreetMap)
function configurarAutocompletado() {
    let timeoutOrigen, timeoutDestino;
    
    // Autocompletado para Centro de Evento
    centroEventoInput.addEventListener('input', function() {
        clearTimeout(timeoutOrigen);
        const query = this.value.trim();
        
        if (query.length < 3) {
            sugerenciasOrigen.classList.remove('active');
            return;
        }
        
        timeoutOrigen = setTimeout(() => {
            buscarLugar(query, sugerenciasOrigen, true);
        }, 500);
    });
    
    // Autocompletado para Destino Final
    destinoFinalInput.addEventListener('input', function() {
        clearTimeout(timeoutDestino);
        const query = this.value.trim();
        
        if (query.length < 3) {
            sugerenciasDestino.classList.remove('active');
            return;
        }
        
        timeoutDestino = setTimeout(() => {
            buscarLugar(query, sugerenciasDestino, false);
        }, 500);
    });
    
    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.form-group')) {
            sugerenciasOrigen.classList.remove('active');
            sugerenciasDestino.classList.remove('active');
        }
    });
}

// Buscar lugares - Sistema Híbrido (Base de datos local + Mapbox + Nominatim)
async function buscarLugar(query, contenedorSugerencias, esOrigen) {
    try {
        console.log('🔍 Buscando:', query);
        
        // PASO 1: Buscar en base de datos local (instantáneo)
        const resultadosLocales = buscarEnBaseDatosLocal(query);
        console.log('📦 Resultados locales:', resultadosLocales.length);
        
        // PASO 2: Buscar en Mapbox (en paralelo)
        const promesaMapbox = buscarEnMapbox(query);
        
        // Si hay resultados locales, mostrarlos inmediatamente
        if (resultadosLocales.length > 0) {
            const resultadosMapbox = await promesaMapbox;
            const todosCombinados = [...resultadosLocales, ...resultadosMapbox];
            // Eliminar duplicados por nombre similar
            const unicos = eliminarDuplicados(todosCombinados);
            console.log('✅ Total lugares encontrados:', unicos.length);
            mostrarSugerencias(unicos, contenedorSugerencias, esOrigen);
            return;
        }
        
        // Si no hay resultados locales, esperar Mapbox
        const resultadosMapbox = await promesaMapbox;
        
        if (resultadosMapbox.length > 0) {
            console.log('✅ Resultados de Mapbox:', resultadosMapbox.length);
            mostrarSugerencias(resultadosMapbox, contenedorSugerencias, esOrigen);
            return;
        }
        
        // PASO 3: Si Mapbox no encuentra nada, usar Nominatim como último recurso
        console.log('🔄 Usando búsqueda alternativa (Nominatim)...');
        await buscarLugarNominatim(query, contenedorSugerencias, esOrigen);
        
    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        await buscarLugarNominatim(query, contenedorSugerencias, esOrigen);
    }
}

// Buscar en base de datos local
function buscarEnBaseDatosLocal(query) {
    const queryLower = query.toLowerCase().trim();
    
    return LUGARES_PREDEFINIDOS
        .filter(lugar => {
            const nombreMatch = lugar.nombre.toLowerCase().includes(queryLower);
            const direccionMatch = lugar.direccion.toLowerCase().includes(queryLower);
            return nombreMatch || direccionMatch;
        })
        .map(lugar => ({
            display_name: `${lugar.nombre} - ${lugar.direccion}`,
            lat: lugar.lat,
            lon: lugar.lon,
            nombre: lugar.nombre,
            esLocal: true // Marcar como resultado local
        }))
        .slice(0, 3); // Máximo 3 resultados locales
}

// Buscar en Mapbox
async function buscarEnMapbox(query) {
    try {
        let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=CL&language=es&limit=5&proximity=-70.6693,-33.4489&types=place,address,poi,locality,neighborhood`;
        
        let response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 401) {
                console.error('❌ Token de Mapbox inválido');
                return [];
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        let data = await response.json();
        
        // Si no hay resultados, intentar búsqueda más amplia
        if (!data.features || data.features.length === 0) {
            url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}&country=CL&language=es&limit=5&proximity=-70.6693,-33.4489`;
            response = await fetch(url);
            data = await response.json();
        }
        
        if (!data.features || data.features.length === 0) {
            return [];
        }
        
        return data.features.map(feature => ({
            display_name: feature.place_name,
            lat: feature.center[1],
            lon: feature.center[0],
            nombre: feature.text,
            esLocal: false
        }));
        
    } catch (error) {
        console.error('Error en Mapbox:', error);
        return [];
    }
}

// Eliminar duplicados por similitud de nombres
function eliminarDuplicados(lugares) {
    const vistos = new Set();
    return lugares.filter(lugar => {
        const clave = lugar.nombre.toLowerCase().trim();
        if (vistos.has(clave)) {
            return false;
        }
        vistos.add(clave);
        return true;
    });
}

// Búsqueda alternativa con Nominatim (OpenStreetMap)
async function buscarLugarNominatim(query, contenedorSugerencias, esOrigen) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},Chile&limit=5&addressdetails=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'RegresoFeliz/1.0'
            }
        });
        const lugares = await response.json();
        
        console.log('📍 Resultados de Nominatim:', lugares.length);
        
        if (lugares.length === 0) {
            console.log('⚠️ No se encontraron resultados para:', query);
        }
        
        mostrarSugerencias(lugares, contenedorSugerencias, esOrigen);
    } catch (error) {
        console.error('❌ Error en búsqueda de Nominatim:', error);
        mostrarSugerencias([], contenedorSugerencias, esOrigen);
    }
}

// Mostrar sugerencias de lugares
function mostrarSugerencias(lugares, contenedor, esOrigen) {
    contenedor.innerHTML = '';
    
    if (lugares.length === 0) {
        contenedor.innerHTML = '<div class="sugerencia-item">No se encontraron resultados</div>';
        contenedor.classList.add('active');
        return;
    }
    
    lugares.forEach(lugar => {
        const div = document.createElement('div');
        div.className = 'sugerencia-item';
        
        // Distinguir si es un resultado local o de API
        const icono = lugar.esLocal ? '⭐' : '📍';
        
        div.innerHTML = `
            <div class="sugerencia-nombre">${icono} ${lugar.display_name.split(',')[0]}</div>
            <div class="sugerencia-direccion">${lugar.display_name}</div>
        `;
        
        div.addEventListener('click', () => {
            seleccionarLugar(lugar, esOrigen);
            contenedor.classList.remove('active');
        });
        
        contenedor.appendChild(div);
    });
    
    contenedor.classList.add('active');
}

// Seleccionar un lugar
function seleccionarLugar(lugar, esOrigen) {
    const coords = {
        lat: parseFloat(lugar.lat),
        lng: parseFloat(lugar.lon)
    };
    
    if (esOrigen) {
        centroEventoInput.value = lugar.display_name;
        origenCoords = coords;
        
        // Agregar o actualizar marcador de origen
        if (origenMarker) {
            map.removeLayer(origenMarker);
        }
        origenMarker = L.marker([coords.lat, coords.lng], {
            title: 'Centro de Evento'
        }).addTo(map).bindPopup('Centro de Evento').openPopup();
        
        console.log('Origen seleccionado:', lugar.display_name);
    } else {
        destinoFinalInput.value = lugar.display_name;
        destinoCoords = coords;
        
        // Agregar o actualizar marcador de destino
        if (destinoMarker) {
            map.removeLayer(destinoMarker);
        }
        destinoMarker = L.marker([coords.lat, coords.lng], {
            title: 'Destino Final'
        }).addTo(map).bindPopup('Destino Final').openPopup();
        
        console.log('Destino seleccionado:', lugar.display_name);
    }
    
    // Si ambos están seleccionados, calcular ruta
    if (origenCoords && destinoCoords) {
        calcularRuta();
    }
}

// Calcular y mostrar la mejor ruta usando Mapbox Directions API
async function calcularRuta() {
    if (!origenCoords || !destinoCoords) {
        console.log('Esperando ambas ubicaciones...', { origen: !!origenCoords, destino: !!destinoCoords });
        return;
    }

    console.log('🗺️ Calculando mejor ruta entre:', origenCoords, 'y', destinoCoords);

    try {
        // Usar Mapbox Directions API para calcular la mejor ruta
        // Parámetros:
        // - driving-traffic: Considera tráfico en tiempo real
        // - alternatives=true: Muestra rutas alternativas
        // - steps=true: Instrucciones paso a paso
        // - geometries=geojson: Formato GeoJSON para el mapa
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${origenCoords.lng},${origenCoords.lat};${destinoCoords.lng},${destinoCoords.lat}?alternatives=false&geometries=geojson&steps=false&overview=full&access_token=${MAPBOX_TOKEN}`;
        
        console.log('📡 Solicitando ruta a Mapbox...');
        const response = await fetch(url);
        
        if (!response.ok) {
            console.warn('⚠️ Mapbox Directions no disponible, usando OSRM como fallback...');
            return await calcularRutaOSRM();
        }
        
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            
            // Limpiar ruta anterior si existe
            if (routeLayer) {
                map.removeLayer(routeLayer);
            }
            
            // Dibujar la mejor ruta en el mapa
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            routeLayer = L.polyline(coordinates, {
                color: '#667eea',
                weight: 6,
                opacity: 0.8,
                lineJoin: 'round',
                lineCap: 'round'
            }).addTo(map);
            
            // Ajustar vista del mapa para mostrar toda la ruta con padding
            map.fitBounds(routeLayer.getBounds(), { padding: [80, 80] });
            
            // Calcular distancia y duración (Mapbox ya optimiza la ruta)
            const distanciaKm = (route.distance / 1000).toFixed(2);
            const duracionMin = Math.round(route.duration / 60);
            const costoTotal = PRECIO_BASE + (parseFloat(distanciaKm) * COSTO_POR_KM);
            // Guardar valores solo en variables globales para WhatsApp
            window._cotizacion_costo = costoTotal;
            window._cotizacion_distancia = distanciaKm;
            window._cotizacion_duracion = duracionMin;
            
            console.log('✅ Mejor ruta calculada:', { 
                distancia: distanciaKm + ' km', 
                duracion: duracionMin + ' min', 
                costo: '$' + costoTotal 
            });
        } else {
            console.error('❌ No se pudo calcular la ruta');
            mostrarMensaje('No se pudo calcular la ruta. Verifica las ubicaciones.', 'error');
        }
    } catch (error) {
        console.error('❌ Error al calcular ruta con Mapbox:', error);
        // Fallback a OSRM si Mapbox falla
        console.log('🔄 Intentando con OSRM...');
        await calcularRutaOSRM();
    }
}

// Calcular ruta con OSRM (Open Source Routing Machine) como fallback
async function calcularRutaOSRM() {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${origenCoords.lng},${origenCoords.lat};${destinoCoords.lng},${destinoCoords.lat}?overview=full&geometries=geojson`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            
            // Dibujar ruta en el mapa
            if (routeLayer) {
                map.removeLayer(routeLayer);
            }
            
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            routeLayer = L.polyline(coordinates, {
                color: '#667eea',
                weight: 5,
                opacity: 0.7
            }).addTo(map);
            
            // Ajustar vista del mapa para mostrar toda la ruta
            map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });
            
            // Calcular distancia y duración
            const distanciaKm = (route.distance / 1000).toFixed(2);
            const duracionMin = Math.round(route.duration / 60);
            const costoTotal = PRECIO_BASE + (parseFloat(distanciaKm) * COSTO_POR_KM);
            
            // Guardar valores solo en variables globales para WhatsApp
            window._cotizacion_costo = costoTotal;
            window._cotizacion_distancia = distanciaKm;
            window._cotizacion_duracion = duracionMin;
            
            console.log('✅ Ruta calculada con OSRM');
        } else {
            mostrarMensaje('No se pudo calcular la ruta. Verifica las ubicaciones.', 'error');
        }
    } catch (error) {
        console.error('Error al calcular la ruta:', error);
        mostrarMensaje('Error al calcular la ruta. Intenta nuevamente.', 'error');
    }
}

// Validación de formato de patente (ejemplo para formato chileno)
function validarPatente(patente) {
    // Formato: LLLL00 o LL0000
    const formatoNuevo = /^[A-Z]{4}\d{2}$/i;
    const formatoAntiguo = /^[A-Z]{2}\d{4}$/i;
    return formatoNuevo.test(patente) || formatoAntiguo.test(patente);
}

// Validación de teléfono
function validarTelefono(telefono) {
    // Eliminar espacios y guiones
    const telefonoLimpio = telefono.replace(/[\s-]/g, '');
    // Validar que tenga entre 8 y 15 dígitos
    return /^\d{8,15}$/.test(telefonoLimpio);
}

// Mostrar mensaje
function mostrarMensaje(texto, tipo) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 5000);
}

// Manejar envío del formulario
form.addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Obtener valores del formulario
    const formData = {
        nombre: document.getElementById('nombre').value.trim(),
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        centroEvento: document.getElementById('centroEvento').value.trim(),
        destinoFinal: document.getElementById('destinoFinal').value.trim(),
        distancia: window._cotizacion_distancia ? window._cotizacion_distancia + ' km' : '',
        duracion: window._cotizacion_duracion ? window._cotizacion_duracion + ' min' : '',
        costo: window._cotizacion_costo ? '$' + window._cotizacion_costo : '',
        numeroPersonas: document.getElementById('numeroPersonas').value,
        marcaModelo: document.getElementById('marcaModelo').value.trim(),
        tipoTransmision: document.getElementById('tipoTransmision').value,
        patente: document.getElementById('patente').value.trim().toUpperCase(),
        seguro: document.querySelector('input[name="seguro"]:checked').value
    };
    
    // Validaciones adicionales
    if (!validarTelefono(formData.telefono)) {
        mostrarMensaje('Por favor, ingrese un número de teléfono válido', 'error');
        return;
    }
    
    if (!validarPatente(formData.patente)) {
        mostrarMensaje('Por favor, ingrese una patente válida (Ej: ABCD12 o AB1234)', 'error');
        return;
    }
    
    if (formData.numeroPersonas < 1) {
        mostrarMensaje('El número de personas debe ser al menos 1', 'error');
        return;
    }
    
    // Mostrar los datos en consola (aquí podrías enviarlos a un servidor)
    console.log('Datos del formulario:', formData);
    
    // Mensaje de éxito
    mostrarMensaje('¡Reserva enviada exitosamente! Nos contactaremos pronto.', 'exito');
    
    // Limpiar formulario después de 2 segundos
    setTimeout(() => {
        form.reset();
        document.getElementById('distanciaContainer').style.display = 'none';
        
        // Limpiar mapa y marcadores
        if (origenMarker) map.removeLayer(origenMarker);
        if (destinoMarker) map.removeLayer(destinoMarker);
        if (routeLayer) map.removeLayer(routeLayer);
        
        origenMarker = null;
        destinoMarker = null;
        routeLayer = null;
        origenCoords = null;
        destinoCoords = null;
        
        // Resetear vista del mapa
        map.setView([-33.4489, -70.6693], 12);
    }, 2000);
});

// Formatear patente automáticamente
document.getElementById('patente').addEventListener('input', function(e) {
    e.target.value = e.target.value.toUpperCase();
});

// Validación en tiempo real para el correo
document.getElementById('correo').addEventListener('blur', function(e) {
    if (e.target.value && !e.target.validity.valid) {
        mostrarMensaje('Por favor, ingrese un correo electrónico válido', 'error');
    }
});

// Validación en tiempo real para el teléfono
document.getElementById('telefono').addEventListener('blur', function(e) {
    if (e.target.value && !validarTelefono(e.target.value)) {
        mostrarMensaje('Formato de teléfono inválido. Use solo números (8-15 dígitos)', 'error');
    }
});

// Configurar actualización del resumen en tiempo real
function configurarActualizacionResumen() {
    // Actualizar nombre
    document.getElementById('nombre').addEventListener('input', function(e) {
        document.getElementById('resumen-nombre').textContent = e.target.value || '--';
    });
    
    // Actualizar correo
    document.getElementById('correo').addEventListener('input', function(e) {
        document.getElementById('resumen-correo').textContent = e.target.value || '--';
    });
    
    // Actualizar teléfono
    document.getElementById('telefono').addEventListener('input', function(e) {
        document.getElementById('resumen-telefono').textContent = e.target.value || '--';
    });
    
    // Actualizar segundo teléfono
    document.getElementById('telefono2').addEventListener('input', function(e) {
        const valor = e.target.value;
        const resumenItem = document.getElementById('resumen-telefono2-item');
        if (valor) {
            document.getElementById('resumen-telefono2').textContent = valor;
            resumenItem.style.display = 'flex';
        } else {
            document.getElementById('resumen-telefono2').textContent = '--';
            resumenItem.style.display = 'none';
        }
    });
    
    // Actualizar hora de presentación
    document.getElementById('horaPresentacion').addEventListener('change', function(e) {
        document.getElementById('resumen-hora').textContent = e.target.value || '--';
    });
    
    // Actualizar centro de evento
    centroEventoInput.addEventListener('input', function(e) {
        document.getElementById('resumen-origen').textContent = e.target.value || '--';
    });
    
    // Actualizar destino final
    destinoFinalInput.addEventListener('input', function(e) {
        document.getElementById('resumen-destino').textContent = e.target.value || '--';
    });
    
    // Actualizar vehículo
    document.getElementById('marcaModelo').addEventListener('input', function(e) {
        document.getElementById('resumen-vehiculo').textContent = e.target.value || '--';
    });
    
    // Actualizar patente
    document.getElementById('patente').addEventListener('input', function(e) {
        document.getElementById('resumen-patente').textContent = e.target.value.toUpperCase() || '--';
    });
    
    // Actualizar personas
    document.getElementById('numeroPersonas').addEventListener('input', function(e) {
        document.getElementById('resumen-personas').textContent = e.target.value ? `${e.target.value} persona(s)` : '--';
    });
    
    // Actualizar fecha de reserva
    document.getElementById('fechaReserva').addEventListener('change', function(e) {
        document.getElementById('resumen-fecha').textContent = e.target.value || '--';
    });
}

// Actualizar resumen con información de ruta
function actualizarResumenRuta(distanciaKm, duracionMin, costoTotal) {
    // Esta función ya no actualiza el resumen visual de distancia/costo
    // Solo se mantiene para compatibilidad si es llamada en otro lugar
    // Los valores se guardan en variables globales
    window._cotizacion_costo = costoTotal;
    window._cotizacion_distancia = distanciaKm;
    window._cotizacion_duracion = duracionMin;
}

// Enviar reserva por WhatsApp
document.getElementById('reservaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Recopilar datos del formulario
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;
    const telefono2 = document.getElementById('telefono2').value;
    const horaPresentacion = document.getElementById('horaPresentacion').value;
    const centroEvento = document.getElementById('centroEvento').value;
    const destinoFinal = document.getElementById('destinoFinal').value;
    const numeroPersonas = document.getElementById('numeroPersonas').value;
    const marcaModelo = document.getElementById('marcaModelo').value;
    const transmision = document.getElementById('tipoTransmision').value;
    const patente = document.getElementById('patente').value;
    const seguroRadio = document.querySelector('input[name="seguro"]:checked');
    const seguro = seguroRadio ? seguroRadio.value : '';
    const fechaReserva = document.getElementById('fechaReserva').value;
    const codigoDescuento = document.getElementById('codigoDescuento').value.trim();
    
    // Formatear valores con separador de miles y sin decimales
    function formatearPesos(valor) {
        return Number(valor).toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    // Obtener el costo original como número
    console.log('DEBUG - Costo antes de redondear:', window._cotizacion_costo);
    let costoOriginal = Math.round(window._cotizacion_costo || 0);
    console.log('DEBUG - Costo original redondeado:', costoOriginal);
    let descuento = 0;
    let costoFinal = costoOriginal;
    let detalleDescuento = '';
    if (codigoDescuento === '123' && costoOriginal > 0) {
        descuento = Math.round(costoOriginal * 0.10);
        costoFinal = costoOriginal - descuento;
        console.log('DEBUG - Descuento:', descuento, 'Costo final:', costoFinal);
        detalleDescuento = `\n*Precio original: $${formatearPesos(costoOriginal)}*\n*Descuento (10%): -$${formatearPesos(descuento)}*\n*Total: $${formatearPesos(costoFinal)}*`;
    }
    const costo = costoFinal ? '$' + formatearPesos(costoFinal) : '';
    
    // Validar campos obligatorios
    if (!nombre || !correo || !telefono || !horaPresentacion || !centroEvento || !destinoFinal || !numeroPersonas || 
        !marcaModelo || !transmision || !patente || !seguro) {
        mostrarMensaje('Por favor, complete todos los campos del formulario', 'error');
        return;
    }
    
    // Obtener datos de ruta solo de variables globales
    const distancia = window._cotizacion_distancia ? window._cotizacion_distancia + ' km' : '--';
    const duracion = window._cotizacion_duracion ? window._cotizacion_duracion + ' min' : '--';
    
    // Obtener nombre corto de ubicaciones (solo primera parte antes de la coma)
    const origenCorto = centroEvento.split(',')[0].trim();
    const destinoCorto = destinoFinal.split(',')[0].trim();
    
    // Crear mensaje para WhatsApp
    const mensaje = `⭐ *NUEVA RESERVA – REGRESOFELIZ*\n\n*📅 Fecha de reserva:* ${fechaReserva}\n*👤 Cliente:* ${nombre}\n*📧 Correo:* ${correo}\n*📱 Teléfono:* ${telefono}${telefono2 ? '\n*🚨 Tel. Emergencia:* ' + telefono2 : ''}\n*⏰ Hora de presentación:* ${horaPresentacion}\n\n*🚗 Datos del viaje*\n* *Origen:* ${origenCorto}\n* *Destino:* ${destinoCorto}\n* *Distancia:* ${distancia}\n* *Duración estimada:* ${duracion}\n* *Pasajeros:* ${numeroPersonas}\n\n*🚘 Vehículo*\n* *Marca/Modelo:* ${marcaModelo}\n* *Transmisión:* ${transmision === 'automatico' ? 'Automático' : 'Mecánico'}\n* *Patente:* ${patente.toUpperCase()}\n* *Seguro:* ${seguro === 'si' ? 'Sí' : 'No'}\n\n*🟢 COTIZACIÓN HECHA*${detalleDescuento ? detalleDescuento : '\n*💰 VALOR: ' + costo + '*'}\n\n_Reserva generada desde regresofeliz.cl_`;
    
    // Codificar mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Número de WhatsApp (sin +)
    const numeroWhatsApp = '56926974449';
    
    // Detectar si es móvil y usar el método apropiado
    const esMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    // URL de WhatsApp (usar api.whatsapp.com para escritorio para mejor compatibilidad con emojis)
    const urlWhatsApp = esMobile 
        ? `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`
        : `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensajeCodificado}`;
    
    if (esMobile) {
        // En móvil, redirigir directamente
        window.location.href = urlWhatsApp;
    } else {
        // En escritorio, abrir en nueva pestaña
        window.open(urlWhatsApp, '_blank');
    }
    
        // Mostrar mensaje de confirmación
    mostrarMensaje('Redirigiendo a WhatsApp...', 'success');
});
