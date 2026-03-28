# RegresoFeliz - Despliegue en Render

## 📋 Pasos para desplegar:

### 1. Preparar repositorio GitHub
```bash
git init
git add .
git commit -m "Preparado para Render"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/felizregreso.git
git push -u origin main
```

### 2. Crear cuenta en Render
- Ve a https://render.com
- Regístrate con tu cuenta de GitHub

### 3. Crear Web Service
1. Click en "New +" → "Web Service"
2. Conecta tu repositorio de GitHub
3. Configura:
   - **Name**: `regresofeliz`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 4. Variables de entorno (opcional)
Si necesitas configurar algo específico, agrega en "Environment":
- No se necesitan por ahora

### 5. Deploy
- Click en "Create Web Service"
- Render desplegará automáticamente
- Tu URL será: `https://regresofeliz.onrender.com`

## 🔧 Después del despliegue:

1. Copia la URL de tu servicio (ej: `https://regresofeliz.onrender.com`)
2. Ya no necesitas actualizar nada en el código, el frontend detecta automáticamente si está en local o producción

## ⚠️ Importante:

- El plan gratuito de Render "duerme" después de 15 minutos de inactividad
- La primera carga puede tardar 30-60 segundos en despertar
- **Todas las cotizaciones se guardan en Google Sheets** (persistencia permanente)

## 🚀 Actualizaciones futuras:

Simplemente haz push a GitHub:
```bash
git add .
git commit -m "Actualización"
git push
```

Render desplegará automáticamente los cambios.
