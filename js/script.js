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
    { nombre: 'Casa Granada', direccion: 'Sector Las Lilas 22, Chada, Paine', lat: -33.8914, lon: -70.7119, categoria: 'centro_eventos' },
    { nombre: 'Casona Los Nogales', direccion: 'Cam. La Manreza S/N, Talagante', lat: -33.6544, lon: -70.9392, categoria: 'centro_eventos' },
    { nombre: 'Casa García-Huidobro', direccion: 'Caletera Gral San Martín, Chicureo, Colina', lat: -33.2005, lon: -70.6491, categoria: 'centro_eventos' },
    { nombre: 'Camino Loreto 418', direccion: 'Camino Loreto, Rinconada de Parral, Coltauco', lat: -34.2425, lon: -71.0612, categoria: 'centro_eventos' },
    
    // Ubicaciones populares - Santiago
    { nombre: 'Plaza de Armas', direccion: 'Plaza de Armas, Santiago Centro', lat: -33.4378, lon: -70.6503, categoria: 'plaza' },
    { nombre: 'Costanera Center', direccion: 'Av. Andrés Bello 2425, Providencia', lat: -33.4183, lon: -70.6067, categoria: 'mall' },
    { nombre: 'Parque Bicentenario Vitacura', direccion: 'Av. Bicentenario, Vitacura', lat: -33.4000, lon: -70.5833, categoria: 'parque' },
    { nombre: 'Parque Araucano', direccion: 'Av. Presidente Riesco, Las Condes', lat: -33.4067, lon: -70.5733, categoria: 'parque' },
    { nombre: 'Estadio Nacional', direccion: 'Av. Grecia 2001, Ñuñoa', lat: -33.4650, lon: -70.6100, categoria: 'estadio' },
    { nombre: 'Aeropuerto Arturo Merino Benítez', direccion: 'Pudahuel, Santiago', lat: -33.3930, lon: -70.7858, categoria: 'aeropuerto' },
    { nombre: 'Fundo San Miguel de Colina', direccion: 'Fundo San Miguel de Colina, Colina, Santiago', lat: -33.2090564, lon: -70.6948704, categoria: 'centro_eventos' }
];

// Variables globales para Leaflet y Mapbox
let map;
let origenMarker = null;
let destinoMarker = null;
let routeLayer = null;
let origenCoords = null;
let destinoCoords = null;
let paradasAdicionales = []; // Array para almacenar paradas adicionales
let paradaMarkers = []; // Array para los marcadores de paradas

// Constantes de precio
const PRECIO_BASE = 25000;
const COSTO_POR_KM = 600;
const COSTO_PARADA_ADICIONAL = 2000;

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
    configurarParadasAdicionales();
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

// Configurar paradas adicionales
function configurarParadasAdicionales() {
    const btnAgregar = document.getElementById('btnAgregarParada');
    const paradasContainer = document.getElementById('paradasContainer');
    
    btnAgregar.addEventListener('click', function() {
        const paradaIndex = paradasAdicionales.length;
        
        // Crear elemento de parada adicional
        const paradaDiv = document.createElement('div');
        paradaDiv.className = 'parada-adicional';
        paradaDiv.dataset.index = paradaIndex;
        paradaDiv.innerHTML = `
            <div class="parada-header">
                <span class="parada-numero">Parada ${paradaIndex + 1}</span>
                <button type="button" class="btn-eliminar-parada" data-index="${paradaIndex}">✕</button>
            </div>
            <input type="text" class="input-parada" data-index="${paradaIndex}" placeholder="Ingrese dirección de la parada">
            <div class="sugerencias sugerencias-parada" id="sugerencias-parada-${paradaIndex}"></div>
        `;
        
        paradasContainer.appendChild(paradaDiv);
        
        // Agregar objeto de parada al array
        paradasAdicionales.push({
            coords: null,
            direccion: '',
            marker: null
        });
        
        // Configurar autocompletado para esta parada
        const inputParada = paradaDiv.querySelector('.input-parada');
        const sugerenciasParada = paradaDiv.querySelector('.sugerencias-parada');
        
        let timeoutParada;
        inputParada.addEventListener('input', function() {
            clearTimeout(timeoutParada);
            const query = this.value.trim();
            
            if (query.length < 3) {
                sugerenciasParada.classList.remove('active');
                return;
            }
            
            timeoutParada = setTimeout(() => {
                buscarLugarParada(query, sugerenciasParada, paradaIndex);
            }, 500);
        });
        
        // Configurar botón eliminar
        const btnEliminar = paradaDiv.querySelector('.btn-eliminar-parada');
        btnEliminar.addEventListener('click', function() {
            eliminarParada(paradaIndex);
        });
    });
}

// Buscar lugar para parada adicional
async function buscarLugarParada(query, contenedorSugerencias, index) {
    try {
        console.log('🔍 Buscando parada:', query);
        
        const resultadosLocales = buscarEnBaseDatosLocal(query);
        const promesaMapbox = buscarEnMapbox(query);
        
        if (resultadosLocales.length > 0) {
            const resultadosMapbox = await promesaMapbox;
            const todosCombinados = [...resultadosLocales, ...resultadosMapbox];
            const unicos = eliminarDuplicados(todosCombinados);
            mostrarSugerenciasParada(unicos, contenedorSugerencias, index);
            return;
        }
        
        const resultadosMapbox = await promesaMapbox;
        
        if (resultadosMapbox.length > 0) {
            mostrarSugerenciasParada(resultadosMapbox, contenedorSugerencias, index);
            return;
        }
        
        await buscarLugarNominatimParada(query, contenedorSugerencias, index);
        
    } catch (error) {
        console.error('❌ Error en búsqueda de parada:', error);
        await buscarLugarNominatimParada(query, contenedorSugerencias, index);
    }
}

// Búsqueda con Nominatim para parada
async function buscarLugarNominatimParada(query, contenedorSugerencias, index) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},Chile&limit=5&addressdetails=1`;
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'RegresoFeliz/1.0'
            }
        });
        const lugares = await response.json();
        
        mostrarSugerenciasParada(lugares, contenedorSugerencias, index);
    } catch (error) {
        console.error('❌ Error en búsqueda de Nominatim para parada:', error);
        mostrarSugerenciasParada([], contenedorSugerencias, index);
    }
}

// Mostrar sugerencias para parada adicional
function mostrarSugerenciasParada(lugares, contenedor, index) {
    contenedor.innerHTML = '';
    
    if (lugares.length === 0) {
        contenedor.innerHTML = '<div class="sugerencia-item">No se encontraron resultados</div>';
        contenedor.classList.add('active');
        return;
    }
    
    lugares.forEach(lugar => {
        const div = document.createElement('div');
        div.className = 'sugerencia-item';
        
        const icono = lugar.esLocal ? '⭐' : '📍';
        
        div.innerHTML = `
            <div class="sugerencia-nombre">${icono} ${lugar.display_name.split(',')[0]}</div>
            <div class="sugerencia-direccion">${lugar.display_name}</div>
        `;
        
        div.addEventListener('click', () => {
            seleccionarLugarParada(lugar, index);
            contenedor.classList.remove('active');
        });
        
        contenedor.appendChild(div);
    });
    
    contenedor.classList.add('active');
}

// Seleccionar lugar para parada adicional
function seleccionarLugarParada(lugar, index) {
    const coords = {
        lat: parseFloat(lugar.lat),
        lng: parseFloat(lugar.lon)
    };
    
    // Actualizar datos de la parada
    paradasAdicionales[index].coords = coords;
    paradasAdicionales[index].direccion = lugar.display_name;
    
    // Actualizar input
    const inputParada = document.querySelector(`.input-parada[data-index="${index}"]`);
    if (inputParada) {
        inputParada.value = lugar.display_name;
    }
    
    // Eliminar marcador anterior si existe
    if (paradasAdicionales[index].marker) {
        map.removeLayer(paradasAdicionales[index].marker);
    }
    
    // Agregar marcador al mapa (usar color diferente para paradas)
    const marker = L.marker([coords.lat, coords.lng], {
        title: `Parada ${index + 1}`,
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map).bindPopup(`Parada ${index + 1}`).openPopup();
    
    paradasAdicionales[index].marker = marker;
    
    console.log(`Parada ${index + 1} seleccionada:`, lugar.display_name);
    
    // Recalcular ruta si hay origen y destino
    if (origenCoords && destinoCoords) {
        calcularRuta();
    }
}

// Eliminar parada adicional
function eliminarParada(index) {
    const paradaDiv = document.querySelector(`.parada-adicional[data-index="${index}"]`);
    if (paradaDiv) {
        paradaDiv.remove();
    }
    
    // Eliminar marcador del mapa
    if (paradasAdicionales[index] && paradasAdicionales[index].marker) {
        map.removeLayer(paradasAdicionales[index].marker);
    }
    
    // Marcar como eliminada (no eliminar del array para mantener índices)
    if (paradasAdicionales[index]) {
        paradasAdicionales[index] = null;
    }
    
    console.log(`Parada ${index + 1} eliminada`);
    
    // Recalcular ruta
    if (origenCoords && destinoCoords) {
        calcularRuta();
    }
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
    
    // SOLO calcular ruta entre origen y destino (sin paradas para el cálculo de km)
    let waypoints = `${origenCoords.lng},${origenCoords.lat}`;
    waypoints += `;${destinoCoords.lng},${destinoCoords.lat}`;
    
    // Obtener paradas válidas para el costo adicional (no afectan kilómetros)
    const paradasValidas = paradasAdicionales.filter(p => p !== null && p.coords !== null);
    
    console.log('🛣️ Calculando distancia solo entre origen-destino. Paradas adicionales:', paradasValidas.length);

    try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${waypoints}?alternatives=false&geometries=geojson&steps=false&overview=full&access_token=${MAPBOX_TOKEN}`;
        
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
            
            // Calcular distancia, duración y costo (incluyendo paradas adicionales)
            const distanciaKm = (route.distance / 1000).toFixed(2);
            const duracionMin = Math.round(route.duration / 60);
            const costoBase = PRECIO_BASE + (parseFloat(distanciaKm) * COSTO_POR_KM);
            const costoParadas = paradasValidas.length * COSTO_PARADA_ADICIONAL;
            const costoSinRedondeo = costoBase + costoParadas;
            // Redondear hacia abajo al múltiplo de 1000 y restar 10 (ej: 40.878 → 39.990)
            const costoTotal = Math.floor(costoSinRedondeo / 1000) * 1000 - 10;
            
            // Guardar valores solo en variables globales para WhatsApp
            window._cotizacion_costo = costoTotal;
            window._cotizacion_distancia = distanciaKm;
            window._cotizacion_duracion = duracionMin;
            window._cotizacion_num_paradas = paradasValidas.length;
            window._cotizacion_costo_paradas = costoParadas;
            
            console.log('✅ Mejor ruta calculada:', { 
                distancia: distanciaKm + ' km (solo origen-destino)', 
                duracion: duracionMin + ' min', 
                costoBase: '$' + costoBase,
                paradas: paradasValidas.length,
                costoParadas: '$' + costoParadas + ' ($2000 c/u)',
                costoTotal: '$' + costoTotal 
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
        // SOLO calcular ruta entre origen y destino (sin paradas para el cálculo de km)
        let waypoints = `${origenCoords.lng},${origenCoords.lat}`;
        waypoints += `;${destinoCoords.lng},${destinoCoords.lat}`;
        
        // Obtener paradas válidas para el costo adicional (no afectan kilómetros)
        const paradasValidas = paradasAdicionales.filter(p => p !== null && p.coords !== null);
        
        const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;
        
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
            
            // Calcular distancia, duración y costo (incluyendo paradas adicionales)
            const distanciaKm = (route.distance / 1000).toFixed(2);
            const duracionMin = Math.round(route.duration / 60);
            const costoBase = PRECIO_BASE + (parseFloat(distanciaKm) * COSTO_POR_KM);
            const costoParadas = paradasValidas.length * COSTO_PARADA_ADICIONAL;
            const costoSinRedondeo = costoBase + costoParadas;
            // Redondear hacia abajo al múltiplo de 1000 y restar 10 (ej: 40.878 → 39.990)
            const costoTotal = Math.floor(costoSinRedondeo / 1000) * 1000 - 10;
            
            // Guardar valores solo en variables globales para WhatsApp
            window._cotizacion_costo = costoTotal;
            window._cotizacion_distancia = distanciaKm;
            window._cotizacion_duracion = duracionMin;
            window._cotizacion_num_paradas = paradasValidas.length;
            window._cotizacion_costo_paradas = costoParadas;
            
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

// Función para mostrar notificación fullscreen
function mostrarNotificacionFullscreen() {
    console.log('🎉 Mostrando notificación fullscreen...');
    
    // Bloquear scroll del body
    document.body.style.overflow = 'hidden';
    
    // Crear overlay fullscreen
    const overlay = document.createElement('div');
    overlay.id = 'notificacion-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999999;
        animation: fadeIn 0.5s ease-in;
        margin: 0;
        padding: 20px;
        box-sizing: border-box;
    `;
    
    // Contenido de la notificación
    const contenido = document.createElement('div');
    contenido.style.cssText = `
        background: white;
        padding: 60px 40px;
        border-radius: 20px;
        box-shadow: 0 30px 80px rgba(0,0,0,0.4);
        text-align: center;
        max-width: 600px;
        width: 90%;
        animation: slideUp 0.6s ease-out;
        position: relative;
    `;
    
    contenido.innerHTML = `
        <div style="font-size: 80px; margin-bottom: 20px;">✅</div>
        <h1 style="color: #667eea; font-size: 32px; margin-bottom: 20px; font-weight: bold;">
            ¡Cotización Enviada!
        </h1>
        <p style="color: #555; font-size: 18px; line-height: 1.6; margin-bottom: 15px;">
            Tu solicitud ha sido recibida exitosamente.
        </p>
        <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
            Nos contactaremos contigo en brevedad con el detalle y valor de tu cotización.
        </p>
        <p style="color: #764ba2; font-size: 20px; font-weight: bold;">
            ¡Muchas gracias por tu preferencia! 💜
        </p>
        <div style="margin-top: 30px; color: #999; font-size: 14px;">
            Serás redirigido al inicio en unos segundos...
        </div>
    `;
    
    overlay.appendChild(contenido);
    document.body.appendChild(overlay);
    
    // Agregar animaciones CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        @keyframes slideUp {
            from { 
                opacity: 0;
                transform: translateY(50px);
            }
            to { 
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
}

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

// Enviar cotización al backend (sin redirección a WhatsApp)
document.getElementById('reservaForm').addEventListener('submit', async function(e) {
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
    
    // Validar campos obligatorios
    if (!nombre || !correo || !telefono || !horaPresentacion || !centroEvento || !destinoFinal || !numeroPersonas || 
        !marcaModelo || !transmision || !patente || !seguro) {
        mostrarMensaje('Por favor, complete todos los campos del formulario', 'error');
        return;
    }
    
    // Calcular costos y descuentos
    let costoOriginal = Math.round(window._cotizacion_costo || 0);
    let descuento = 0;
    let costoFinal = costoOriginal;
    
    if ((codigoDescuento === '123' || codigoDescuento.toUpperCase() === 'CONYYJAVIER' || 
         codigoDescuento.toUpperCase() === 'AGUSTINYCATALINA' || codigoDescuento.toUpperCase() === 'DSCT10OFF' || 
         codigoDescuento.toUpperCase() === 'SABINE10') && costoOriginal > 0) {
        descuento = Math.round(costoOriginal * 0.10);
        costoFinal = costoOriginal - descuento;
    }
    
    // Obtener paradas adicionales
    const paradasValidas = paradasAdicionales.filter(p => p !== null && p.coords !== null);
    const paradasTexto = paradasValidas.map(p => p.direccion).join(' | ');
    
    // Preparar datos para enviar al backend
    const datosFormulario = {
        fechaReserva: fechaReserva,
        nombre: nombre,
        correo: correo,
        telefono: telefono,
        telefono2: telefono2,
        horaPresentacion: horaPresentacion,
        centroEvento: centroEvento,
        destinoFinal: destinoFinal,
        paradasAdicionales: paradasTexto,
        numParadas: paradasValidas.length,
        numeroPersonas: numeroPersonas,
        marcaModelo: marcaModelo,
        tipoTransmision: transmision,
        patente: patente.toUpperCase(),
        seguro: seguro,
        distanciaKm: window._cotizacion_distancia || '',
        duracionMin: window._cotizacion_duracion || '',
        costoBase: costoOriginal,
        costoFinal: costoFinal,
        codigoDescuento: codigoDescuento,
        descuentoAplicado: descuento
    };
    
    console.log('📤 Enviando cotización al servidor...', datosFormulario);
    
    try {
        // Detectar si estamos en local o producción
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000' 
            : window.location.origin;
        
        // Enviar datos al backend
        const response = await fetch(`${API_URL}/api/cotizacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosFormulario)
        });
        
        const resultado = await response.json();
        
        if (resultado.ok) {
            console.log('✅ Cotización guardada correctamente');
            
            // Mostrar notificación fullscreen
            mostrarNotificacionFullscreen();
            
            // Redirigir a inicio después de 4 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 4000);
            
            return; // No limpiar el formulario aquí, se redirige a inicio
            
            // Limpiar formulario después de 3 segundos (código ya no usado)
            setTimeout(() => {
                form.reset();
                document.getElementById('distanciaContainer').style.display = 'none';
                
                // Limpiar mapa y marcadores
                if (origenMarker) map.removeLayer(origenMarker);
                if (destinoMarker) map.removeLayer(destinoMarker);
                if (routeLayer) map.removeLayer(routeLayer);
                
                // Limpiar marcadores de paradas adicionales
                paradasAdicionales.forEach(parada => {
                    if (parada && parada.marker) {
                        map.removeLayer(parada.marker);
                    }
                });
                
                origenMarker = null;
                destinoMarker = null;
                routeLayer = null;
                origenCoords = null;
                destinoCoords = null;
                paradasAdicionales = [];
                
                // Limpiar el contenedor de paradas adicionales
                const paradasContainer = document.getElementById('paradasContainer');
                if (paradasContainer) {
                    paradasContainer.innerHTML = '';
                }
                
                // Resetear vista del mapa
                map.setView([-33.4489, -70.6693], 12);
                
                // Resetear resumen
                document.getElementById('resumen-fecha').textContent = '--';
                document.getElementById('resumen-nombre').textContent = '--';
                document.getElementById('resumen-correo').textContent = '--';
                document.getElementById('resumen-telefono').textContent = '--';
                document.getElementById('resumen-hora').textContent = '--';
                document.getElementById('resumen-origen').textContent = '--';
                document.getElementById('resumen-destino').textContent = '--';
                document.getElementById('resumen-duracion').textContent = '--';
                document.getElementById('resumen-vehiculo').textContent = '--';
                document.getElementById('resumen-patente').textContent = '--';
                document.getElementById('resumen-personas').textContent = '--';
            }, 3000);
            
        } else {
            mostrarMensaje('Error al guardar la cotización. Por favor, intenta nuevamente.', 'error');
            console.error('❌ Error del servidor:', resultado.mensaje);
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        mostrarMensaje('Error de conexión con el servidor. Asegúrate de que el servidor esté funcionando (ejecuta: node server.js)', 'error');
    }
});
