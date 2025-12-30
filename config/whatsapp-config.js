// Configuración de WhatsApp Business API
// IMPORTANTE: En producción, estas credenciales deben estar en variables de entorno

const WHATSAPP_CONFIG = {
    // Token de acceso de la API de WhatsApp Business
    // Obtenerlo en: https://developers.facebook.com/apps/
    ACCESS_TOKEN: 'EAAMUDy7NfmQBQWlZCRSqPIzzlZAYSyq86wYYqJq66QbVZBpCT6upV4JYEzBwc5V8QICDaUk60UIMhQhme4S4UKrc1o3nmvdIZB12Lz0TuPldqGPyWSS4fawxDShLpihUjZBvGyFTeiZB8NCsd5dK7NWzj0ZBPX5XE3GZASIUjZBrBOWMjzyOuIkvNkzfqIKAx8WxQ2GW7SaIcPXUvdHF8q1VdFTj7XLuCh3clNxpcHdadeVy63p8k4tUBEQ8XKWJsPoG5LfqZCJMZBZAGui0QZBbZC30Nm',
    
    // ID del número de teléfono de WhatsApp Business
    // Se encuentra en: WhatsApp Business Account > Números de teléfono
    PHONE_NUMBER_ID: '899556756578934',
    
    // ID de la cuenta de WhatsApp Business
    BUSINESS_ACCOUNT_ID: '116083575580639',
    
    // Token de verificación para el webhook (puedes elegir cualquier string)
    WEBHOOK_VERIFY_TOKEN: 'tu_token_de_verificacion_secreto_123',
    
    // Versión de la API de WhatsApp
    API_VERSION: 'v18.0',
    
    // URL base de la API
    API_BASE_URL: 'https://graph.facebook.com',
    
    // Número de teléfono del negocio (formato internacional sin +)
    BUSINESS_PHONE: '56926974449', // +56 9 2697 4449
    
    // Configuración de mensajes
    MESSAGES: {
        // Mensaje de confirmación de reserva
        CONFIRMACION_RESERVA: (datos) => `
🎉 *Reserva Confirmada - RegresoFeliz*

¡Hola ${datos.nombre}! 👋

Tu solicitud de angelito ha sido recibida exitosamente.

📅 *Fecha:* ${datos.fecha}
🕐 *Hora:* ${datos.hora}
📍 *Origen:* ${datos.origen}
🏠 *Destino:* ${datos.destino}
💰 *Total:* $${datos.total.toLocaleString('es-CL')}

${datos.paradas && datos.paradas.length > 0 ? `🛑 *Paradas adicionales:* ${datos.paradas.length}\n` : ''}
Pronto nos comunicaremos contigo para confirmar los detalles.

¿Tienes alguna pregunta? ¡Responde a este mensaje!

_Tu angelito de confianza_ ✨
        `.trim(),
        
        // Mensaje de bienvenida
        BIENVENIDA: `
¡Hola! 👋 Bienvenido a *RegresoFeliz*

Somos tu servicio profesional de chofer de reemplazo (angelito) 🚗✨

¿En qué podemos ayudarte?
1️⃣ Cotizar servicio
2️⃣ Información sobre tarifas
3️⃣ Hablar con un asesor

Responde con el número de opción.
        `.trim(),
        
        // Mensaje de error
        ERROR: 'Lo sentimos, ocurrió un error al procesar tu solicitud. Por favor, intenta nuevamente o contacta a nuestro soporte.',
    }
};

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WHATSAPP_CONFIG;
}
