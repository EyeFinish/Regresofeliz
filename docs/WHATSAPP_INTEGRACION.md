# 📱 Integración WhatsApp Business API - RegresoFeliz

Esta guía te ayudará a conectar tu proyecto con la API de WhatsApp Business para enviar y recibir mensajes automáticos.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Configuración Inicial](#configuración-inicial)
3. [Instalación](#instalación)
4. [Configuración de Credenciales](#configuración-de-credenciales)
5. [Configurar Webhook](#configurar-webhook)
6. [Ejecutar el Servidor](#ejecutar-el-servidor)
7. [Probar la Integración](#probar-la-integración)
8. [Despliegue en Producción](#despliegue-en-producción)
9. [Solución de Problemas](#solución-de-problemas)

---

## 🎯 Requisitos Previos

Antes de comenzar, necesitas:

- ✅ Cuenta de **Meta for Developers** (Facebook Developer)
- ✅ Cuenta de **Meta Business**
- ✅ Número de teléfono verificado (no usado en WhatsApp personal)
- ✅ **Node.js** instalado (versión 14 o superior)
- ✅ Editor de código (VS Code recomendado)

---

## 🚀 Configuración Inicial

### Paso 1: Crear App en Meta for Developers

1. Ve a [Facebook Developer Console](https://developers.facebook.com/)
2. Haz clic en **"Mis Apps"** → **"Crear App"**
3. Selecciona tipo: **"Business"**
4. Completa los datos de la app:
   - Nombre de la app: `RegresoFeliz WhatsApp`
   - Email de contacto
   - Cuenta de Meta Business

### Paso 2: Agregar Producto WhatsApp

1. En tu app, busca **"WhatsApp"** en la sección de productos
2. Haz clic en **"Configurar"**
3. Sigue el asistente de configuración

### Paso 3: Obtener Credenciales

Necesitarás estos datos (guárdalos en un lugar seguro):

#### 📱 Phone Number ID
- Ve a: **WhatsApp** → **Números de teléfono**
- Copia el **"Phone Number ID"**

#### 🔑 Access Token (Token de Acceso)
- Ve a: **WhatsApp** → **Configuración**
- En "Configuración de API", copia el **Access Token temporal**
- **IMPORTANTE**: Este token expira en 24 horas. Para producción necesitas un token permanente.

#### 🏢 Business Account ID
- Ve a: **WhatsApp** → **Inicio**
- Copia el **"WhatsApp Business Account ID"**

#### ⚠️ Para Token Permanente:
1. Ve a: **Configuración** → **Básico**
2. Copia el **App ID** y **App Secret**
3. Genera un token de larga duración usando la API de Facebook

---

## 💻 Instalación

### 1. Instalar Dependencias

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Esto instalará:
- `express` - Framework web
- `body-parser` - Parsear JSON
- `dotenv` - Manejar variables de entorno

### 2. Instalar Dependencias Opcionales (Desarrollo)

```bash
npm install --save-dev nodemon
```

---

## 🔐 Configuración de Credenciales

### 1. Crear archivo `.env`

Copia el archivo de ejemplo:

```bash
copy .env.example .env
```

O crea un nuevo archivo `.env` en la raíz del proyecto.

### 2. Editar `.env` con tus credenciales

```env
# Token de acceso de WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxx

# ID del número de teléfono
WHATSAPP_PHONE_NUMBER_ID=123456789012345

# ID de la cuenta de WhatsApp Business
WHATSAPP_BUSINESS_ACCOUNT_ID=987654321098765

# Token de verificación del webhook (crea uno seguro)
WEBHOOK_VERIFY_TOKEN=mi_token_super_secreto_123

# Puerto del servidor
PORT=3000

# Número de teléfono del negocio
BUSINESS_PHONE=56926974449
```

### 3. Actualizar `config/whatsapp-config.js`

Opcionalmente, puedes cargar estas variables desde `.env`:

```javascript
const WHATSAPP_CONFIG = {
    ACCESS_TOKEN: process.env.WHATSAPP_ACCESS_TOKEN || 'TU_ACCESS_TOKEN_AQUI',
    PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID || 'TU_PHONE_NUMBER_ID_AQUI',
    // ... resto de la configuración
};
```

---

## 🌐 Configurar Webhook

Para recibir mensajes de WhatsApp, debes configurar un webhook.

### Opción A: Desarrollo Local con ngrok

1. **Instalar ngrok**:
   - Descarga desde [ngrok.com](https://ngrok.com/)
   - O instala con npm: `npm install -g ngrok`

2. **Ejecutar tu servidor local**:
   ```bash
   npm start
   ```

3. **Crear túnel público**:
   ```bash
   ngrok http 3000
   ```

4. **Copiar URL de ngrok**:
   ```
   Forwarding: https://xxxx-xxx-xxx.ngrok.io -> http://localhost:3000
   ```

### Opción B: Servidor en la Nube

Despliega en:
- **Heroku**: https://heroku.com
- **Railway**: https://railway.app
- **Render**: https://render.com
- **DigitalOcean**: https://digitalocean.com

### Configurar en Meta Developer Console

1. Ve a: **WhatsApp** → **Configuración**
2. En **"Webhook"**, haz clic en **"Configurar"**
3. Ingresa:
   - **URL del webhook**: `https://tu-dominio.com/webhook`
   - **Token de verificación**: El mismo que pusiste en `.env` (WEBHOOK_VERIFY_TOKEN)
4. Haz clic en **"Verificar y guardar"**
5. Suscríbete a los campos:
   - ✅ `messages` - Para recibir mensajes
   - ✅ `message_status` - Para estados de mensajes

---

## ▶️ Ejecutar el Servidor

### Modo Producción
```bash
npm start
```

### Modo Desarrollo (con auto-reload)
```bash
npm run dev
```

Verás algo como:
```
🚀 ============================================
   Servidor WhatsApp Webhook - RegresoFeliz
============================================
📡 Servidor corriendo en puerto 3000
🔗 Webhook URL: http://localhost:3000/webhook
💚 Health check: http://localhost:3000/health
============================================
```

---

## 🧪 Probar la Integración

### 1. Verificar que el servidor está funcionando

Abre en tu navegador:
```
http://localhost:3000/health
```

Deberías ver:
```json
{
  "status": "ok",
  "service": "RegresoFeliz WhatsApp Webhook",
  "timestamp": "2025-12-29T..."
}
```

### 2. Probar envío de mensaje

En el formulario de tu sitio:
1. Completa todos los campos
2. Haz clic en "Cotizar Angelito"
3. El cliente debería recibir un mensaje de confirmación automático en WhatsApp

### 3. Probar recepción de mensajes

1. Desde el número de prueba de WhatsApp
2. Envía un mensaje a tu número de WhatsApp Business
3. El servidor debe:
   - Recibir el mensaje
   - Procesar la intención
   - Responder automáticamente

Verás en la consola:
```
📨 Webhook recibido
📱 Mensaje recibido de: 56912345678
💬 Texto: hola
✅ Respuesta enviada: wamid.xxx
```

---

## 🚀 Despliegue en Producción

### Heroku (Recomendado para principiantes)

1. **Instalar Heroku CLI**:
   ```bash
   npm install -g heroku
   ```

2. **Login y crear app**:
   ```bash
   heroku login
   heroku create regresofeliz-whatsapp
   ```

3. **Configurar variables de entorno**:
   ```bash
   heroku config:set WHATSAPP_ACCESS_TOKEN=tu_token
   heroku config:set WHATSAPP_PHONE_NUMBER_ID=tu_phone_id
   heroku config:set WEBHOOK_VERIFY_TOKEN=tu_verify_token
   ```

4. **Desplegar**:
   ```bash
   git push heroku main
   ```

5. **Configurar webhook en Meta**:
   - URL: `https://regresofeliz-whatsapp.herokuapp.com/webhook`

### Railway (Alternativa moderna)

1. Conecta tu repositorio de GitHub
2. Railway detecta Node.js automáticamente
3. Configura las variables de entorno en el panel
4. Despliega con un clic

---

## 🔧 Solución de Problemas

### ❌ "Webhook verification failed"

**Solución**:
- Verifica que el `WEBHOOK_VERIFY_TOKEN` en `.env` coincida con el de Meta
- Asegúrate de que el servidor esté corriendo
- Revisa que la URL sea accesible públicamente

### ❌ "Access token expired"

**Solución**:
- Genera un token de larga duración
- O actualiza el token temporal cada 24 horas

### ❌ "Message sending failed"

**Solución**:
- Verifica que el número de destino esté en formato internacional
- Asegúrate de que el número está registrado (en modo prueba)
- Revisa que el `ACCESS_TOKEN` y `PHONE_NUMBER_ID` sean correctos

### ❌ No recibo mensajes en el webhook

**Solución**:
- Verifica que estés suscrito a los eventos `messages`
- Comprueba que el servidor esté corriendo
- Revisa los logs del servidor para errores

### 📝 Ver Logs en Producción

**Heroku**:
```bash
heroku logs --tail
```

**Railway**:
- Panel web → Deployments → View logs

---

## 📚 Recursos Adicionales

- [Documentación oficial WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference)
- [Postman Collection](https://www.postman.com/meta/workspace/whatsapp-business-platform)
- [Foro de Desarrolladores](https://developers.facebook.com/community/)

---

## 💡 Funcionalidades Implementadas

✅ Envío de mensajes de texto  
✅ Envío de confirmación automática de reservas  
✅ Recepción de mensajes  
✅ Respuestas automáticas inteligentes  
✅ Procesamiento de intenciones (saludos, cotizaciones, info)  
✅ Estados de mensajes (enviado, entregado, leído)  
✅ Webhook verificado y seguro  

---

## 📞 Soporte

Si tienes problemas o preguntas:

1. Revisa la sección de [Solución de Problemas](#solución-de-problemas)
2. Consulta la [documentación oficial](https://developers.facebook.com/docs/whatsapp)
3. Contacta al equipo técnico de RegresoFeliz

---

## 📄 Licencia

Este proyecto es parte de RegresoFeliz © 2025

---

¡Listo! 🎉 Ya tienes WhatsApp Business API integrado en tu proyecto.
