/**
 * Módulo de integración con WhatsApp Business API
 * Para uso en el frontend (solo envío de mensajes)
 */

class WhatsAppAPI {
    constructor(config) {
        this.accessToken = config.ACCESS_TOKEN;
        this.phoneNumberId = config.PHONE_NUMBER_ID;
        this.apiVersion = config.API_VERSION;
        this.apiBaseUrl = config.API_BASE_URL;
    }

    /**
     * Construye la URL de la API
     */
    getApiUrl() {
        return `${this.apiBaseUrl}/${this.apiVersion}/${this.phoneNumberId}/messages`;
    }

    /**
     * Envía un mensaje de texto a un número de WhatsApp
     * @param {string} to - Número de teléfono en formato internacional (ej: 56912345678)
     * @param {string} message - Texto del mensaje
     */
    async enviarMensajeTexto(to, message) {
        try {
            const response = await fetch(this.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    recipient_type: 'individual',
                    to: to,
                    type: 'text',
                    text: {
                        preview_url: false,
                        body: message
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Error al enviar mensaje');
            }

            return {
                success: true,
                messageId: data.messages[0].id,
                data: data
            };

        } catch (error) {
            console.error('Error enviando mensaje de WhatsApp:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Envía un mensaje con plantilla (template)
     * @param {string} to - Número de teléfono
     * @param {string} templateName - Nombre de la plantilla
     * @param {string} languageCode - Código de idioma (ej: 'es' o 'es_MX')
     * @param {Array} components - Componentes de la plantilla
     */
    async enviarMensajePlantilla(to, templateName, languageCode = 'es', components = []) {
        try {
            const response = await fetch(this.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'template',
                    template: {
                        name: templateName,
                        language: {
                            code: languageCode
                        },
                        components: components
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Error al enviar plantilla');
            }

            return {
                success: true,
                messageId: data.messages[0].id,
                data: data
            };

        } catch (error) {
            console.error('Error enviando plantilla de WhatsApp:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Envía un mensaje con ubicación
     * @param {string} to - Número de teléfono
     * @param {number} latitude - Latitud
     * @param {number} longitude - Longitud
     * @param {string} name - Nombre del lugar
     * @param {string} address - Dirección
     */
    async enviarUbicacion(to, latitude, longitude, name, address) {
        try {
            const response = await fetch(this.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: to,
                    type: 'location',
                    location: {
                        latitude: latitude,
                        longitude: longitude,
                        name: name,
                        address: address
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Error al enviar ubicación');
            }

            return {
                success: true,
                messageId: data.messages[0].id,
                data: data
            };

        } catch (error) {
            console.error('Error enviando ubicación de WhatsApp:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Envía confirmación de reserva de RegresoFeliz
     * @param {Object} datosReserva - Datos de la reserva
     */
    async enviarConfirmacionReserva(datosReserva) {
        const mensaje = WHATSAPP_CONFIG.MESSAGES.CONFIRMACION_RESERVA(datosReserva);
        
        // Limpiar número de teléfono (quitar espacios, guiones, etc)
        const telefono = datosReserva.telefono.replace(/[^\d]/g, '');
        
        return await this.enviarMensajeTexto(telefono, mensaje);
    }

    /**
     * Validar formato de número de teléfono
     * @param {string} phoneNumber - Número a validar
     */
    validarNumeroTelefono(phoneNumber) {
        // Quitar caracteres no numéricos
        const cleaned = phoneNumber.replace(/[^\d]/g, '');
        
        // Debe tener al menos 10 dígitos
        if (cleaned.length < 10) {
            return {
                valid: false,
                error: 'El número debe tener al menos 10 dígitos'
            };
        }

        return {
            valid: true,
            cleaned: cleaned
        };
    }
}

// Exportar para uso en el navegador
if (typeof window !== 'undefined') {
    window.WhatsAppAPI = WhatsAppAPI;
}

// Exportar para Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WhatsAppAPI;
}
