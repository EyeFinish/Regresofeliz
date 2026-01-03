# 📱 Sistema de Mensajes con Google Apps Script - RegresoFeliz

## 🎯 ¿Qué hace este sistema?

Convierte tu Google Sheets en un sistema profesional donde:
- ✅ Las celdas muestran solo "📩 Ver cotización" (limpio y compacto)
- ✅ El mensaje completo se guarda oculto en la nota de la celda
- ✅ Al hacer clic, se abre un popup elegante con el mensaje
- ✅ Botón para copiar directo al portapapeles
- ✅ No depende de servidores externos

## 📋 Instalación (5 minutos)

### Paso 1: Abrir el Editor de Apps Script
1. Abre tu Google Sheet de cotizaciones: https://docs.google.com/spreadsheets/d/1DIQGWq6PNK8aER5_KS3xBZ8nKwZHz8kvIKOqIR_Hr0M
2. Ve al menú: **Extensiones** → **Apps Script**
3. Se abrirá una nueva pestaña con el editor

### Paso 2: Copiar el Código
1. En el editor, verás un archivo llamado `Código.gs`
2. **Borra todo** el código que aparece por defecto
3. Abre el archivo `codigo.gs` de esta carpeta
4. Copia TODO el contenido
5. Pégalo en el editor de Apps Script

### Paso 3: Guardar y Ejecutar
1. Haz clic en el icono de **💾 Guardar** (o Ctrl+S)
2. Dale un nombre al proyecto: "RegresoFeliz - Sistema de Mensajes"
3. Cierra la pestaña del editor
4. Vuelve a tu Google Sheet
5. **Recarga la página** (F5)

### Paso 4: Autorizar Permisos
1. Verás un nuevo menú en la parte superior: **📱 RegresoFeliz**
2. Haz clic en: **RegresoFeliz** → **🔄 Formatear mensajes**
3. Google te pedirá autorización:
   - Haz clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Haz clic en "Avanzado"
   - Haz clic en "Ir a RegresoFeliz (no seguro)"
   - Haz clic en "Permitir"
4. Listo, el script está autorizado

## 🚀 Cómo Usar

### Para ver un mensaje:
1. Haz clic en cualquier celda que diga "📩 Ver cotización"
2. Ve al menú: **📱 RegresoFeliz** → **Mostrar Mensaje**
3. Se abrirá un popup con el mensaje completo
4. Haz clic en "📋 Copiar Mensaje"
5. Pega en WhatsApp (Ctrl+V)

### Para formatear mensajes antiguos:
Si tienes cotizaciones anteriores con el mensaje completo visible:
1. Ve al menú: **📱 RegresoFeliz** → **🔄 Formatear mensajes**
2. El script convertirá automáticamente todos los mensajes largos a "📩 Ver cotización"

## 🔧 Cómo Funciona por Dentro

### Cuando llega una nueva cotización:
```javascript
// El servidor guarda el mensaje completo en la celda AB
guardarEnGoogleSheets(datos) {
  // ... 
  mensajeCotizacion = "🎉 ¡Hola Juan! ..."
  // ...
}
```

### El Apps Script automáticamente:
```javascript
// Detecta la celda con mensaje largo
onEdit(e) {
  if (mensaje.length > 50) {
    // Guarda el mensaje en la nota de la celda
    celda.setNote(mensajeCompleto);
    
    // Muestra solo el indicador
    celda.setValue('📩 Ver cotización');
    
    // Aplica formato bonito
    celda.setBackground('#E8F0FE')
         .setFontColor('#1a73e8');
  }
}
```

### Al hacer clic:
```javascript
// Recupera el mensaje de la nota
mostrarMensaje() {
  const mensaje = celda.getNote();
  
  // Crea un popup HTML con el mensaje
  const html = crearPopup(mensaje);
  
  // Lo muestra
  SpreadsheetApp.getUi().showModalDialog(html);
}
```

## 🎨 Personalización

### Cambiar el emoji del indicador:
Busca la línea 52 y cambia el emoji:
```javascript
celda.setValue('📩 Ver cotización');  // Cambiar por: '💬 Ver mensaje', '📧 Leer', etc.
```

### Cambiar los colores:
Busca la línea 53-56 y ajusta:
```javascript
celda.setBackground('#E8F0FE')  // Color de fondo (azul claro)
    .setFontColor('#1a73e8')    // Color del texto (azul)
```

### Cambiar el diseño del popup:
Busca la línea 106-200 (HTML del popup) y personaliza el CSS.

## ⚙️ Integración Automática con el Servidor

El servidor ya está configurado para funcionar con este sistema:

```javascript
// En server.js línea 154
const mensajeCotizacion = crearMensajeCotizacion(datos);

// Guarda el mensaje completo en la columna AB
fila[27] = mensajeCotizacion;
```

El Apps Script detecta automáticamente cuando se agrega una nueva fila y formatea la celda.

## 🔄 Actualizaciones Futuras

Si quieres agregar funciones como:
- 📲 Enviar directo a WhatsApp desde el popup
- 📊 Estadísticas de mensajes enviados
- 🎨 Plantillas de mensajes personalizables
- 📧 Enviar por email desde Google Sheets

Solo tienes que editar el archivo `codigo.gs` y agregar las funciones.

## ❓ Troubleshooting

### "No veo el menú RegresoFeliz"
- Recarga la página (F5)
- Espera 10 segundos después de recargar
- Revisa que el código esté guardado en Apps Script

### "No se formatea automáticamente"
- El script solo formatea celdas con más de 50 caracteres
- Usa el menú "Formatear mensajes" para forzar el formato

### "Error de permisos"
- Ve a: https://myaccount.google.com/permissions
- Busca "RegresoFeliz"
- Revoca y vuelve a autorizar

## 📞 Soporte

Si tienes problemas, revisa:
1. Que el código esté completo en Apps Script
2. Que hayas autorizado los permisos
3. Que la columna AB (28) sea la correcta
4. Que los mensajes tengan más de 50 caracteres

---

**Desarrollado para RegresoFeliz** 🚗✨
Tu Angelito de Confianza
