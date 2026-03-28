# Configuración del Proyecto

## Configuración Inicial

### 1. Clonar el repositorio
```bash
git clone https://github.com/EyeFinish/Regresofeliz.git
cd Regresofeliz
```

### 2. Configurar API Keys

El proyecto utiliza tokens de API que no se suben a GitHub por seguridad. Debes crear tu propio archivo de configuración:

1. Copia el archivo de ejemplo:
   ```bash
   cp js/config.example.js js/config.js
   ```

2. Edita `js/config.js` y reemplaza `TU_TOKEN_DE_MAPBOX_AQUI` con tu token real de Mapbox.

3. Para obtener un token de Mapbox:
   - Visita https://account.mapbox.com/access-tokens/
   - Crea una cuenta o inicia sesión
   - Crea un nuevo token de acceso público
   - Copia el token y pégalo en `js/config.js`

### 3. Configuración en Producción (Render)

Para deployar en Render u otro servicio:

1. Asegúrate de que `js/config.js` existe en el servidor con el token correcto
2. El archivo `js/config.js` debe crearse manualmente en el servidor o mediante variables de entorno del servicio de hosting

## Estructura de Archivos

```
js/
├── config.js           # Tu configuración local (NO SE SUBE A GITHUB)
├── config.example.js   # Plantilla de configuración (SE SUBE A GITHUB)
└── script.js          # Script principal que usa CONFIG
```

## Notas de Seguridad

- **NUNCA** hagas commit del archivo `js/config.js` 
- **NUNCA** compartas tu token de Mapbox públicamente
- En Mapbox, configura las restricciones de URL para que tu token solo funcione en tu dominio
