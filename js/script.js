// GOOGLE MAPS CONFIGURATION - Key se carga desde el backend
let GOOGLE_MAPS_KEY = '';

// EMAILJS CONFIGURATION
(function() {
    if (typeof emailjs !== 'undefined') {
        emailjs.init({ publicKey: 'GbZ0qGGvRDFXJe93D' });
    }
})();

// BASE DE DATOS LOCAL - Centros de Eventos y Lugares Populares en Chile
const LUGARES_PREDEFINIDOS = [
    // Centros de Eventos - Santiago
    { nombre: 'Centro de Eventos La Fragua', direccion: 'La Fragua, Colina, Santiago', lat: -33.1867, lon: -70.6782, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Botánico', direccion: 'Sendero Estero, Peñalolén, Santiago', lat: -33.5089, lon: -70.5128, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Casona San José', direccion: 'Av. Santa Rosa, La Pintana, Santiago', lat: -33.5856, lon: -70.6344, categoria: 'centro_eventos' },
    { nombre: 'Espacio Riesco', direccion: 'Av. El Salto 5000, Huechuraba, Santiago', lat: -33.3594, lon: -70.6403, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Casona Reina Sur', direccion: 'Camino Longitudinal Sur, San Bernardo', lat: -33.6167, lon: -70.7167, categoria: 'centro_eventos' },
    { nombre: 'Casona El Rosario', direccion: 'Casona El Rosario, Maipú, Santiago', lat: -33.6262636, lon: -70.7708171, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Punta Cali', direccion: 'Camino El Melocotón, Pirque', lat: -33.6789, lon: -70.5756, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Santa Martina', direccion: 'Camino Padre Hurtado, Peñaflor', lat: -33.6089, lon: -70.9128, categoria: 'centro_eventos' },
    { nombre: 'Haras Los Lingues', direccion: 'Camino Los Lingues, Buin', lat: -33.7389, lon: -70.7456, categoria: 'centro_eventos' },
    { nombre: 'Entre Nogales', direccion: 'Entre Nogales, Buin, Región Metropolitana', lat: -33.7142557, lon: -70.769195, categoria: 'centro_eventos' },
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
    { nombre: 'Fundo San Miguel de Colina', direccion: 'Fundo San Miguel de Colina, Colina, Santiago', lat: -33.2090564, lon: -70.6948704, categoria: 'centro_eventos' },
    { nombre: 'Centro de Evento Parque San Rafael', direccion: '30, Ruta 5 000, Lampa, Región Metropolitana', lat: -33.2050121, lon: -70.7741778, categoria: 'centro_eventos' },
    { nombre: 'Centro de Eventos Bracco', direccion: 'El Rodeo 2109, San Bernardo, Región Metropolitana', lat: -33.6771491, lon: -70.7546112, categoria: 'centro_eventos' },
    { nombre: 'Camino Las Encinas', direccion: 'Cam. Las Encinas, Pirque, Región Metropolitana', lat: -33.7159061, lon: -70.5636266, categoria: 'centro_eventos' }
];

// Variables globales para Google Maps
let map;
let origenMarker = null;
let destinoMarker = null;
let directionsRenderer = null;
let origenCoords = null;
let destinoCoords = null;
let paradasAdicionales = []; // Array para almacenar paradas adicionales
let paradaMarkers = []; // Array para los marcadores de paradas
let geocoder = null;
let placesService = null;
let directionsService = null;

// Constantes de precio
const PRECIO_BASE = 30000;
const COSTO_POR_KM = 700;
const COSTO_PARADA_ADICIONAL = 2000;

// Obtener elementos del DOM
const form = document.getElementById('reservaForm');
const mensaje = document.getElementById('mensaje');
const centroEventoInput = document.getElementById('centroEvento');
const destinoFinalInput = document.getElementById('destinoFinal');
const sugerenciasOrigen = document.getElementById('sugerencias-origen');
const sugerenciasDestino = document.getElementById('sugerencias-destino');

// Cargar Google Maps dinámicamente con la key del backend
function cargarGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=es&region=CL&loading=async`;
        script.async = true;
        script.defer = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
        document.head.appendChild(script);
    });
}

// Mostrar/ocultar loading del mapa
function mostrarMapaLoading(show) {
    const mapDiv = document.getElementById('map');
    if (!mapDiv) return;
    let loader = document.getElementById('map-loading');
    if (show) {
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'map-loading';
            loader.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f0f0f0;z-index:10;border-radius:12px;';
            loader.innerHTML = '<div style="border:4px solid #e0e0e0;border-top:4px solid #667eea;border-radius:50%;width:40px;height:40px;animation:spinMap 0.8s linear infinite;"></div><p style="margin-top:12px;color:#666;font-size:14px;">Cargando mapa...</p>';
            const style = document.createElement('style');
            style.textContent = '@keyframes spinMap{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
            document.head.appendChild(style);
        }
        mapDiv.style.position = 'relative';
        mapDiv.appendChild(loader);
    } else {
        if (loader) loader.remove();
    }
}

// Botón volver al inicio (solo en index.html)
document.addEventListener('DOMContentLoaded', async function() {
    const btnVolverInicio = document.getElementById('btnVolverInicio');
    
    if (btnVolverInicio) {
        btnVolverInicio.addEventListener('click', function() {
            window.location.href = 'index.html';
        });
    }
    
    // Mostrar loading en el mapa mientras carga
    mostrarMapaLoading(true);
    
    // Obtener API Key usando la promesa pre-iniciada en el <head> (o fallback)
    try {
        let apiKey;
        if (window.__gmapsKeyPromise) {
            apiKey = await window.__gmapsKeyPromise;
        } else {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
            const API_URL = isLocal ? 'http://localhost:3000' : 'https://regresofeliz.onrender.com';
            const resp = await fetch(`${API_URL}/api/maps-key`);
            const data = await resp.json();
            if (data.ok && data.key) {
                apiKey = data.key;
            }
        }
        
        if (apiKey) {
            GOOGLE_MAPS_KEY = apiKey;
            await cargarGoogleMaps(GOOGLE_MAPS_KEY);
        } else {
            console.error('No se pudo obtener la API Key de Google Maps');
        }
    } catch (error) {
        console.error('Error al cargar Google Maps:', error);
    }
    
    // Ocultar loading del mapa
    mostrarMapaLoading(false);
    
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
            map.setOptions({
                draggable: true,
                scrollwheel: true,
                disableDoubleClickZoom: false,
                gestureHandling: 'auto'
            });
            
            // Cambiar estilos
            mapDiv.classList.remove('map-locked');
            mapDiv.classList.add('map-active');
            toggleBtn.textContent = '🔒 Bloquear Mapa';
            toggleBtn.classList.add('map-active-btn');
        } else {
            // Desactivar interacciones
            map.setOptions({
                draggable: false,
                scrollwheel: false,
                disableDoubleClickZoom: true,
                gestureHandling: 'none'
            });
            
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
        const resultadosLocales = buscarEnBaseDatosLocal(query);
        const promesaGoogle = buscarEnGooglePlaces(query);
        
        if (resultadosLocales.length > 0) {
            const resultadosGoogle = await promesaGoogle;
            const todosCombinados = [...resultadosLocales, ...resultadosGoogle];
            const unicos = eliminarDuplicados(todosCombinados);
            mostrarSugerenciasParada(unicos, contenedorSugerencias, index);
            return;
        }
        
        const resultadosGoogle = await promesaGoogle;
        
        if (resultadosGoogle.length > 0) {
            mostrarSugerenciasParada(resultadosGoogle, contenedorSugerencias, index);
            return;
        }
        
        mostrarSugerenciasParada([], contenedorSugerencias, index);
        
    } catch (error) {
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
    // Si es un resultado de Google Places (sin coordenadas), resolver placeId
    if (!lugar.esLocal && lugar.placeId && !lugar.lat) {
        geocoder.geocode({ placeId: lugar.placeId }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                lugar.lat = location.lat();
                lugar.lon = location.lng();
                aplicarSeleccionParada(lugar, index);
            }
        });
    } else {
        aplicarSeleccionParada(lugar, index);
    }
}

// Aplicar la selección de parada al mapa
function aplicarSeleccionParada(lugar, index) {
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
        paradasAdicionales[index].marker.setMap(null);
    }
    
    // Agregar marcador al mapa (color naranja para paradas)
    const marker = new google.maps.Marker({
        position: coords,
        map: map,
        title: `Parada ${index + 1}`,
        icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png'
        }
    });
    
    const infoWindow = new google.maps.InfoWindow({
        content: `Parada ${index + 1}`
    });
    infoWindow.open(map, marker);
    
    paradasAdicionales[index].marker = marker;
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
        paradasAdicionales[index].marker.setMap(null);
    }
    
    // Marcar como eliminada (no eliminar del array para mantener índices)
    if (paradasAdicionales[index]) {
        paradasAdicionales[index] = null;
    }
    // Recalcular ruta
    if (origenCoords && destinoCoords) {
        calcularRuta();
    }
}

// Inicializar el mapa con Google Maps
function inicializarMapa() {
    // Crear mapa centrado en Santiago, Chile con interacciones desactivadas
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: -33.4489, lng: -70.6693 },
        zoom: 12,
        draggable: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        gestureHandling: 'none',
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
    });
    
    // Inicializar servicios de Google Maps
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
        polylineOptions: {
            strokeColor: '#667eea',
            strokeWeight: 6,
            strokeOpacity: 0.8
        }
    });
    placesService = new google.maps.places.AutocompleteService();
}

// Configurar autocompletado con Google Places
function configurarAutocompletado() {
    let timeoutOrigen, timeoutDestino;
    
    // Autocompletado para Centro de Evento
    centroEventoInput.addEventListener('input', function() {
        clearTimeout(timeoutOrigen);
        const query = this.value.trim();
        
        // Resetear indicador visual cuando el usuario modifica el texto
        origenCoords = null;
        const origenStatus = document.getElementById('origenStatus');
        if (origenStatus) {
            origenStatus.style.display = 'none';
        }
        centroEventoInput.style.borderColor = '';
        
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
        
        // Resetear indicador visual cuando el usuario modifica el texto
        destinoCoords = null;
        const destinoStatus = document.getElementById('destinoStatus');
        if (destinoStatus) {
            destinoStatus.style.display = 'none';
        }
        destinoFinalInput.style.borderColor = '';
        
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

// Buscar lugares - Sistema Híbrido (Base de datos local + Google Places)
async function buscarLugar(query, contenedorSugerencias, esOrigen) {
    try {
        // PASO 1: Buscar en base de datos local (instantáneo)
        const resultadosLocales = buscarEnBaseDatosLocal(query);
        // PASO 2: Buscar en Google Places (en paralelo)
        const promesaGoogle = buscarEnGooglePlaces(query);
        
        // Si hay resultados locales, combinar con Google
        if (resultadosLocales.length > 0) {
            const resultadosGoogle = await promesaGoogle;
            const todosCombinados = [...resultadosLocales, ...resultadosGoogle];
            const unicos = eliminarDuplicados(todosCombinados);
            mostrarSugerencias(unicos, contenedorSugerencias, esOrigen);
            return;
        }
        
        // Si no hay resultados locales, usar Google Places
        const resultadosGoogle = await promesaGoogle;
        
        if (resultadosGoogle.length > 0) {
            mostrarSugerencias(resultadosGoogle, contenedorSugerencias, esOrigen);
            return;
        }
        
        mostrarSugerencias([], contenedorSugerencias, esOrigen);
        
    } catch (error) {
        mostrarSugerencias([], contenedorSugerencias, esOrigen);
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
            esLocal: true
        }))
        .slice(0, 3);
}

// Buscar en Google Places Autocomplete
async function buscarEnGooglePlaces(query) {
    return new Promise((resolve) => {
        if (!placesService) {
            resolve([]);
            return;
        }
        
        placesService.getPlacePredictions({
            input: query,
            componentRestrictions: { country: 'cl' },
            language: 'es',
            locationBias: {
                center: { lat: -33.4489, lng: -70.6693 },
                radius: 100000
            }
        }, (predictions, status) => {
            if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
                resolve([]);
                return;
            }
            
            const resultados = predictions.map(prediction => ({
                display_name: prediction.description,
                nombre: prediction.structured_formatting.main_text,
                placeId: prediction.place_id,
                esLocal: false,
                // lat/lon se resolverán al seleccionar
                lat: null,
                lon: null
            }));
            
            resolve(resultados);
        });
    });
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
    // Si es un resultado de Google Places (sin coordenadas), resolver placeId
    if (!lugar.esLocal && lugar.placeId && !lugar.lat) {
        geocoder.geocode({ placeId: lugar.placeId }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                lugar.lat = location.lat();
                lugar.lon = location.lng();
                aplicarSeleccion(lugar, esOrigen);
            }
        });
    } else {
        aplicarSeleccion(lugar, esOrigen);
    }
}

// Aplicar la selección del lugar al mapa
function aplicarSeleccion(lugar, esOrigen) {
    const coords = {
        lat: parseFloat(lugar.lat),
        lng: parseFloat(lugar.lon)
    };
    
    if (esOrigen) {
        centroEventoInput.value = lugar.display_name;
        origenCoords = coords;
        
        // Mostrar indicador visual de éxito
        const origenStatus = document.getElementById('origenStatus');
        if (origenStatus) {
            origenStatus.style.display = 'block';
            origenStatus.style.color = '#4CAF50';
        }
        centroEventoInput.style.borderColor = '#4CAF50';
        
        // Agregar o actualizar marcador de origen
        if (origenMarker) {
            origenMarker.setMap(null);
        }
        origenMarker = new google.maps.Marker({
            position: coords,
            map: map,
            title: 'Centro de Evento',
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            }
        });
        
        const infoOrigen = new google.maps.InfoWindow({ content: 'Centro de Evento' });
        infoOrigen.open(map, origenMarker);
    } else {
        destinoFinalInput.value = lugar.display_name;
        destinoCoords = coords;
        
        // Mostrar indicador visual de éxito
        const destinoStatus = document.getElementById('destinoStatus');
        if (destinoStatus) {
            destinoStatus.style.display = 'block';
            destinoStatus.style.color = '#4CAF50';
        }
        destinoFinalInput.style.borderColor = '#4CAF50';
        
        // Agregar o actualizar marcador de destino
        if (destinoMarker) {
            destinoMarker.setMap(null);
        }
        destinoMarker = new google.maps.Marker({
            position: coords,
            map: map,
            title: 'Destino Final',
            icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }
        });
        
        const infoDestino = new google.maps.InfoWindow({ content: 'Destino Final' });
        infoDestino.open(map, destinoMarker);
    }
    
    // Si ambos están seleccionados, calcular ruta
    if (origenCoords && destinoCoords) {
        calcularRuta();
    }
}

// Calcular y mostrar la mejor ruta usando Google Maps Directions API
async function calcularRuta() {
    if (!origenCoords || !destinoCoords) {
        return;
    }
    
    // Obtener paradas válidas para el costo adicional (no afectan kilómetros)
    const paradasValidas = paradasAdicionales.filter(p => p !== null && p.coords !== null);
    
    const request = {
        origin: new google.maps.LatLng(origenCoords.lat, origenCoords.lng),
        destination: new google.maps.LatLng(destinoCoords.lat, destinoCoords.lng),
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        region: 'cl'
    };
    
    directionsService.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
            // Dibujar la ruta en el mapa
            directionsRenderer.setDirections(result);
            
            const route = result.routes[0];
            const leg = route.legs[0];
            
            // Calcular distancia y duración
            const distanciaKm = (leg.distance.value / 1000).toFixed(2);
            const duracionMin = Math.round(leg.duration.value / 60);
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
            console.log('📊 Detalles de cotización:', { 
                distancia: distanciaKm + ' km (solo origen-destino)', 
                duracion: duracionMin + ' min', 
                costoBase: '$' + costoBase.toLocaleString('es-CL'),
                paradas: paradasValidas.length,
                costoParadas: '$' + costoParadas.toLocaleString('es-CL') + ' ($2000 c/u)',
                costoTotal: '$' + costoTotal.toLocaleString('es-CL'),
                formularioListoParaEnviar: true
            });
        } else {
            mostrarMensaje('No se pudo calcular la ruta. Verifica las ubicaciones.', 'error');
        }
    });
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

// Función para mostrar pantalla de carga
function mostrarPantallaCarga() {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999998;
        animation: fadeIn 0.3s ease-in;
    `;
    
    overlay.innerHTML = `
        <div style="text-align: center;">
            <div style="border: 8px solid #f3f3f3; border-top: 8px solid #667eea; border-radius: 50%; width: 80px; height: 80px; animation: spin 1s linear infinite; margin: 0 auto 30px;"></div>
            <h2 style="color: white; font-size: 24px; margin-bottom: 10px;">Enviando cotización...</h2>
            <p style="color: #ccc; font-size: 16px;">Por favor espera un momento</p>
        </div>
    `;
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
}

// Función para ocultar pantalla de carga
function ocultarPantallaCarga() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.remove();
    }
    document.body.style.overflow = 'auto';
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
    
    // Validar que se haya calculado la ruta (origen y destino deben estar definidos)
    if (!origenCoords || !destinoCoords) {
        mostrarMensaje('⚠️ Por favor, selecciona el origen y destino usando las sugerencias del mapa para calcular el costo del servicio.', 'error');
        // Resaltar los campos
        centroEventoInput.style.border = '2px solid #ff4444';
        destinoFinalInput.style.border = '2px solid #ff4444';
        setTimeout(() => {
            centroEventoInput.style.border = '';
            destinoFinalInput.style.border = '';
        }, 3000);
        return;
    }
    
    // Calcular costos y descuentos
    let costoOriginal = Math.round(window._cotizacion_costo || 0);
    
    // Validar que el costo se haya calculado correctamente
    if (costoOriginal === 0 || !window._cotizacion_costo) {
        mostrarMensaje('⚠️ Error al calcular el costo. Por favor, verifica que el origen y destino sean correctos y que la ruta se haya calculado.', 'error');
        return;
    }
    let descuento = 0;
    let costoFinal = costoOriginal;
    
    if ((codigoDescuento === '123' || codigoDescuento.toUpperCase() === 'CONYYJAVIER' || 
         codigoDescuento.toUpperCase() === 'AGUSTINYCATALINA' || codigoDescuento.toUpperCase() === 'DSCT10OFF' || 
         codigoDescuento.toUpperCase() === 'SABINE10' || codigoDescuento.toUpperCase() === 'MACARENAYDIEGO' || 
         codigoDescuento.toUpperCase() === 'MACABABY') && costoOriginal > 0) {
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
    
    // Mostrar pantalla de carga
    mostrarPantallaCarga();
    
    try {
        // Detectar si estamos en local o producción
        const isLocal = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
        
        const API_URL = isLocal 
            ? 'http://localhost:3000' 
            : 'https://regresofeliz.onrender.com';
        // Enviar datos al backend
        const response = await fetch(`${API_URL}/api/cotizacion`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosFormulario)
        });
        
        const resultado = await response.json();
        
        if (resultado.ok === true) {
            // Enviar notificación por correo
            console.log('📧 Intentando enviar correo de notificación...');
            console.log('EmailJS disponible:', typeof emailjs !== 'undefined');
            
            if (typeof emailjs !== 'undefined') {
                try {
                    console.log('📤 Enviando correo con datos:', {
                        to_email: 'soporte.regresofeliz@gmail.com',
                        nombre_cliente: nombre,
                        correo_cliente: correo,
                        telefono_cliente: telefono,
                        fecha_servicio: fechaReserva,
                        hora_presentacion: horaPresentacion,
                        origen: centroEvento,
                        destino: destinoFinal,
                        costo_final: `$${costoFinal.toLocaleString('es-CL')}`
                    });
                    
                    const emailResponse = await emailjs.send('service_r0f1jfl', 'template_36qwypo', {
                        to_email: 'soporte.regresofeliz@gmail.com',
                        nombre_cliente: nombre,
                        correo_cliente: correo,
                        telefono_cliente: telefono,
                        fecha_servicio: fechaReserva,
                        hora_presentacion: horaPresentacion,
                        origen: centroEvento,
                        destino: destinoFinal,
                        costo_final: `$${costoFinal.toLocaleString('es-CL')}`,
                        link_google_sheet: 'https://docs.google.com/spreadsheets/d/1DIQGWq6PNK8aER5_KS3xBZ8nKwZHz8kvIKOqIR_Hr0M/edit'
                    });
                    
                    console.log('✅ Correo enviado exitosamente:', emailResponse);
                    alert('✅ Cotización guardada y correo de notificación enviado');
                } catch (error) {
                    console.error('❌ Error al enviar correo EmailJS:', error);
                    console.error('Detalles del error:', error.text || error.message || error);
                    alert('⚠️ Cotización guardada pero el correo de notificación falló. Error: ' + (error.text || error.message || 'Desconocido'));
                    // Continuar aunque falle el correo
                }
            } else {
                console.error('❌ EmailJS no está cargado en esta página');
                alert('⚠️ EmailJS no disponible - la cotización se guardó pero no se envió notificación por correo');
            }
            
            ocultarPantallaCarga();
            window.location.href = 'cotizacion-exitosa.html';
        } else {
            ocultarPantallaCarga();
            mostrarMensaje('Error al guardar la cotización. Por favor, intenta nuevamente.', 'error');
        }
        
    } catch (error) {
        ocultarPantallaCarga();
        mostrarMensaje('Error de conexión con el servidor.', 'error');
    }
});
