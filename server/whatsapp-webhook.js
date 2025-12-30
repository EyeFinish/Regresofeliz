/**
 * Servidor Backend para WhatsApp Business API - RegresoFeliz
 * Este servidor maneja los webhooks de WhatsApp para recibir y responder mensajes
 * 
 * INSTALACIÓN:
 * npm install express body-parser dotenv
 * 
 * CONFIGURACIÓN:
 * 1. Crear archivo .env con las credenciales
 * 2. Ejecutar: node server/whatsapp-webhook.js
 * 3. Configurar webhook en Meta Developer Console
 */

const express = require('express');
const bodyParser = require('body-parser');
const WhatsAppAPI = require('../js/whatsapp-api');
const WHATSAPP_CONFIG = require('../config/whatsapp-config');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar WhatsApp API
const whatsappAPI = new WhatsAppAPI(WHATSAPP_CONFIG);

// ============================================
// WEBHOOK VERIFICATION (GET)
// ============================================
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('📥 Verificación de webhook recibida');

    if (mode === 'subscribe' && token === WHATSAPP_CONFIG.WEBHOOK_VERIFY_TOKEN) {
        console.log('✅ Webhook verificado exitosamente');
        res.status(200).send(challenge);
    } else {
        console.error('❌ Verificación de webhook fallida');
        res.sendStatus(403);
    }
});

// ============================================
// RECIBIR MENSAJES (POST)
// ============================================
app.post('/webhook', async (req, res) => {
    try {
        const body = req.body;

        console.log('📨 Webhook recibido:', JSON.stringify(body, null, 2));

        // Verificar que es una notificación de WhatsApp Business
        if (body.object !== 'whatsapp_business_account') {
            console.log('⚠️ Objeto no reconocido:', body.object);
            return res.sendStatus(404);
        }

        // Procesar cada entrada
        for (const entry of body.entry) {
            for (const change of entry.changes) {
                const value = change.value;

                // Procesar mensajes recibidos
                if (value.messages && value.messages.length > 0) {
                    const message = value.messages[0];
                    await procesarMensaje(message, value);
                }

                // Procesar cambios de estado de mensajes
                if (value.statuses && value.statuses.length > 0) {
                    const status = value.statuses[0];
                    procesarEstadoMensaje(status);
                }
            }
        }

        res.sendStatus(200);

    } catch (error) {
        console.error('❌ Error procesando webhook:', error);
        res.sendStatus(500);
    }
});

// ============================================
// PROCESAR MENSAJE RECIBIDO
// ============================================
async function procesarMensaje(message, value) {
    const from = message.from; // Número del cliente
    const messageId = message.id;
    const timestamp = message.timestamp;

    console.log('\n📱 Mensaje recibido de:', from);
    console.log('🆔 ID:', messageId);

    // Obtener información del contacto si está disponible
    const contactName = value.contacts?.[0]?.profile?.name || 'Cliente';
    console.log('👤 Contacto:', contactName);

    let respuesta = '';

    // Procesar según el tipo de mensaje
    switch (message.type) {
        case 'text':
            const texto = message.text.body.toLowerCase().trim();
            console.log('💬 Texto:', texto);
            respuesta = procesarMensajeTexto(texto, contactName);
            break;

        case 'location':
            const location = message.location;
            console.log('📍 Ubicación recibida:', location.latitude, location.longitude);
            respuesta = `Gracias por compartir tu ubicación. Te contactaremos pronto.`;
            break;

        case 'interactive':
            const interactive = message.interactive;
            console.log('🔘 Interacción:', interactive);
            respuesta = procesarInteraccion(interactive);
            break;

        default:
            console.log('⚠️ Tipo de mensaje no manejado:', message.type);
            respuesta = 'Recibimos tu mensaje. Un asesor te responderá pronto.';
    }

    // Enviar respuesta automática
    if (respuesta) {
        try {
            const resultado = await whatsappAPI.enviarMensajeTexto(from, respuesta);
            if (resultado.success) {
                console.log('✅ Respuesta enviada:', resultado.messageId);
            } else {
                console.error('❌ Error enviando respuesta:', resultado.error);
            }
        } catch (error) {
            console.error('❌ Error al enviar respuesta:', error);
        }
    }
}

// ============================================
// PROCESAR MENSAJE DE TEXTO
// ============================================
function procesarMensajeTexto(texto, contactName) {
    const saludoNombre = contactName !== 'Cliente' ? ` ${contactName}` : '';

    // Detectar intenciones básicas
    if (/^(hola|hi|hey|buenos|buenas)/i.test(texto)) {
        return `¡Hola${saludoNombre}! 👋 Bienvenido a *RegresoFeliz*

Somos tu servicio de chofer de reemplazo (angelito) 🚗✨

¿Cómo podemos ayudarte?
1️⃣ Cotizar servicio
2️⃣ Información sobre tarifas
3️⃣ Hablar con un asesor

Responde con el número o escribe tu consulta.`;
    }

    // Cotización
    if (/cotiz|precio|costo|cuanto|tarifa|valor/i.test(texto)) {
        return `💰 *Tarifas RegresoFeliz*

📦 Precio base: $25.000
📏 Costo por km: $600/km
🛑 Parada adicional: $2.000

Para una cotización exacta, visita:
🔗 regresofeliz.cl/formulario.html

¿Te gustaría agendar un servicio?`;
    }

    // Información del servicio
    if (/servicio|como funcion|que es|info|informacion/i.test(texto)) {
        return `🚗 *¿Qué es RegresoFeliz?*

Somos un servicio profesional de chofer de reemplazo.

✅ Conductores profesionales
✅ Tu auto, tu comodidad
✅ Disponible 24/7
✅ Cobertura en toda la RM

Perfecto para:
🎉 Fiestas y eventos
💒 Matrimonios
🍽️ Celebraciones
😴 Cuando estás cansado

¿Necesitas agendar?`;
    }

    // Horarios
    if (/horario|disponib|cuando|hora/i.test(texto)) {
        return `🕐 *Disponibilidad*

Estamos disponibles:
📅 Todos los días
⏰ 19:00 - 06:00 hrs

Para agendar:
🔗 regresofeliz.cl/formulario.html
📱 O escríbenos por acá

¿En qué fecha necesitas el servicio?`;
    }

    // Números (opciones del menú)
    if (texto === '1') {
        return `💰 Para cotizar tu servicio:

1️⃣ Visita: regresofeliz.cl/formulario.html
2️⃣ Ingresa origen y destino
3️⃣ Obtén cotización instantánea

O envíame:
📍 Tu ubicación de origen
📍 Tu destino

¡Y te cotizo al instante!`;
    }

    if (texto === '2') {
        return `💵 *Tarifas RegresoFeliz*

💰 Precio base: $25.000
📏 Por kilómetro: $600
🛑 Parada adicional: $2.000

Ejemplo:
📍 20 km de distancia
💵 $25.000 + (20 × $600) = $37.000

¿Quieres una cotización personalizada?`;
    }

    if (texto === '3') {
        return `👨‍💼 *Contacto con Asesor*

Un asesor se comunicará contigo pronto.

Mientras tanto, puedes:
🔗 Cotizar en: regresofeliz.cl
📱 WhatsApp: +56 9 2697 4449

¿Hay algo más en lo que pueda ayudarte?`;
    }

    // Respuesta por defecto
    return `Gracias por tu mensaje${saludoNombre}. 

Un asesor revisará tu consulta y te responderá pronto.

Para cotizar tu servicio:
🔗 regresofeliz.cl/formulario.html

¿Necesitas algo más?`;
}

// ============================================
// PROCESAR INTERACCIÓN (BOTONES)
// ============================================
function procesarInteraccion(interactive) {
    if (interactive.type === 'button_reply') {
        const buttonId = interactive.button_reply.id;
        
        switch (buttonId) {
            case 'cotizar':
                return 'Visita regresofeliz.cl/formulario.html para cotizar tu servicio';
            case 'informacion':
                return 'RegresoFeliz es tu servicio de chofer de reemplazo de confianza';
            case 'contacto':
                return 'Un asesor se comunicará contigo pronto';
            default:
                return 'Gracias por tu interés';
        }
    }
    
    return null;
}

// ============================================
// PROCESAR ESTADO DE MENSAJE
// ============================================
function procesarEstadoMensaje(status) {
    const messageId = status.id;
    const estado = status.status;
    const timestamp = status.timestamp;

    console.log(`📊 Estado de mensaje ${messageId}: ${estado}`);

    // Estados posibles: sent, delivered, read, failed
    switch (estado) {
        case 'sent':
            console.log('✉️ Mensaje enviado');
            break;
        case 'delivered':
            console.log('📬 Mensaje entregado');
            break;
        case 'read':
            console.log('👁️ Mensaje leído');
            break;
        case 'failed':
            console.error('❌ Mensaje falló');
            if (status.errors) {
                console.error('Errores:', status.errors);
            }
            break;
    }
}

// ============================================
// ENDPOINT DE PRUEBA
// ============================================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'RegresoFeliz WhatsApp Webhook',
        timestamp: new Date().toISOString()
    });
});

// ============================================
// ENDPOINT PARA ENVIAR MENSAJE MANUAL
// ============================================
app.post('/enviar-mensaje', async (req, res) => {
    try {
        const { telefono, mensaje } = req.body;

        if (!telefono || !mensaje) {
            return res.status(400).json({
                error: 'Se requiere telefono y mensaje'
            });
        }

        const resultado = await whatsappAPI.enviarMensajeTexto(telefono, mensaje);

        if (resultado.success) {
            res.json({
                success: true,
                messageId: resultado.messageId
            });
        } else {
            res.status(500).json({
                success: false,
                error: resultado.error
            });
        }

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            error: error.message
        });
    }
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
    console.log('\n🚀 ============================================');
    console.log('   Servidor WhatsApp Webhook - RegresoFeliz');
    console.log('============================================');
    console.log(`📡 Servidor corriendo en puerto ${PORT}`);
    console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook`);
    console.log(`💚 Health check: http://localhost:${PORT}/health`);
    console.log('============================================\n');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
});
