// Variables globales para Leaflet y OpenStreetMap
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

// Inicializar mapa Leaflet cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
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

// Inicializar el mapa de Leaflet
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
    
    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    console.log('Mapa Leaflet inicializado correctamente');
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

// Buscar lugares con Nominatim API
async function buscarLugar(query, contenedorSugerencias, esOrigen) {
    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)},Chile&limit=5&addressdetails=1`;
        const response = await fetch(url);
        const lugares = await response.json();
        
        mostrarSugerencias(lugares, contenedorSugerencias, esOrigen);
    } catch (error) {
        console.error('Error al buscar lugares:', error);
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
        div.innerHTML = `
            <div class="sugerencia-nombre">${lugar.display_name.split(',')[0]}</div>
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

// Calcular y mostrar la ruta usando OSRM (Open Source Routing Machine)
async function calcularRuta() {
    if (!origenCoords || !destinoCoords) {
        console.log('Esperando ambas ubicaciones...', { origen: !!origenCoords, destino: !!destinoCoords });
        return;
    }

    console.log('Calculando ruta entre:', origenCoords, 'y', destinoCoords);

    try {
        // Usar OSRM para calcular la ruta
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
            const costoTotal = (PRECIO_BASE + (parseFloat(distanciaKm) * COSTO_POR_KM)).toLocaleString('es-CL');
            
            // Mostrar información
            document.getElementById('distanciaKm').textContent = `${distanciaKm} km`;
            document.getElementById('duracionEstimada').textContent = `${duracionMin} min`;
            document.getElementById('costoTotal').textContent = `$${costoTotal}`;
            document.getElementById('distanciaContainer').style.display = 'block';
            
            // Actualizar resumen
            actualizarResumenRuta(distanciaKm, duracionMin, costoTotal);
            
            console.log('Ruta calculada exitosamente:', { distanciaKm, duracionMin, costoTotal });
        } else {
            console.error('No se pudo calcular la ruta');
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
        distancia: document.getElementById('distanciaKm').textContent,
        duracion: document.getElementById('duracionEstimada').textContent,
        costo: document.getElementById('costoTotal').textContent,
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
}

// Actualizar resumen con información de ruta
function actualizarResumenRuta(distanciaKm, duracionMin, costoTotal) {
    document.getElementById('resumen-distancia').textContent = `${distanciaKm} km`;
    document.getElementById('resumen-duracion').textContent = `${duracionMin} min`;
    document.getElementById('resumen-costo').textContent = `$${costoTotal}`;
}

// Enviar reserva por WhatsApp
document.getElementById('reservaForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Recopilar datos del formulario
    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const telefono = document.getElementById('telefono').value;
    const centroEvento = document.getElementById('centroEvento').value;
    const destinoFinal = document.getElementById('destinoFinal').value;
    const numeroPersonas = document.getElementById('numeroPersonas').value;
    const marcaModelo = document.getElementById('marcaModelo').value;
    const transmision = document.getElementById('tipoTransmision').value;
    const patente = document.getElementById('patente').value;
    const seguroRadio = document.querySelector('input[name="seguro"]:checked');
    const seguro = seguroRadio ? seguroRadio.value : '';
    
    // Obtener datos de ruta del resumen
    const distancia = document.getElementById('resumen-distancia').textContent;
    const duracion = document.getElementById('resumen-duracion').textContent;
    const costo = document.getElementById('resumen-costo').textContent;
    
    // Validar campos obligatorios
    if (!nombre || !correo || !telefono || !centroEvento || !destinoFinal || !numeroPersonas || 
        !marcaModelo || !transmision || !patente || !seguro) {
        mostrarMensaje('Por favor, complete todos los campos del formulario', 'error');
        return;
    }
    
    // Crear enlaces de Google Maps para las ubicaciones
    const linkOrigen = origenCoords 
        ? `https://www.google.com/maps?q=${origenCoords.lat},${origenCoords.lng}`
        : '';
    const linkDestino = destinoCoords 
        ? `https://www.google.com/maps?q=${destinoCoords.lat},${destinoCoords.lng}`
        : '';
    
    // Crear mensaje para WhatsApp
    const mensaje = `🚗 *REGRESOFELIZ - NUEVA RESERVA*

👤 *DATOS DEL CLIENTE*
Nombre: *${nombre}*
📧 Correo: ${correo}
📱 Telefono: ${telefono}

📍 *INFORMACION DEL VIAJE*
Origen: ${centroEvento}
${linkOrigen ? `Ver en mapa: ${linkOrigen}` : ''}

Destino: ${destinoFinal}
${linkDestino ? `Ver en mapa: ${linkDestino}` : ''}

Distancia: *${distancia}*
Duracion: *${duracion}*
👥 Pasajeros: *${numeroPersonas} persona(s)*

🚙 *DATOS DEL VEHICULO*
Marca/Modelo: *${marcaModelo}*
Transmision: *${transmision === 'automatico' ? 'Automatico' : 'Mecanico'}*
Patente: *${patente.toUpperCase()}*
Seguro: ${seguro === 'si' ? '✅ Si' : '❌ No'}

💰 *COSTO TOTAL: ${costo}*

_Reserva desde regresofeliz.cl_`;
    
    // Codificar mensaje para URL
    const mensajeCodificado = encodeURIComponent(mensaje);
    
    // Número de WhatsApp (sin +)
    const numeroWhatsApp = '56956130912';
    
    // URL de WhatsApp
    const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;
    
    // Detectar si es móvil y usar el método apropiado
    const esMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
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
