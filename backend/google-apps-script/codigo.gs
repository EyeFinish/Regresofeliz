/**
 * SCRIPT DE GOOGLE SHEETS - REGRESOFELIZ
 * Sistema de visualización de mensajes de cotización
 * 
 * INSTALACIÓN:
 * 1. Abre tu Google Sheet de cotizaciones
 * 2. Ve a Extensiones > Apps Script
 * 3. Borra todo el código que aparece
 * 4. Copia y pega este código completo
 * 5. Guarda (Ctrl+S)
 * 6. Cierra y vuelve a abrir el Google Sheet
 * 7. Autoriza los permisos cuando te lo pida
 */

// Configuración
const COLUMNA_MENSAJE = 28; // Columna AB (donde está el mensaje)
const FILA_INICIO = 2; // Primera fila de datos (después del encabezado)

/**
 * Se ejecuta cuando se abre el documento
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📱 RegresoFeliz')
    .addItem('🔄 Formatear mensajes', 'formatearTodasLasCeldas')
    .addItem('ℹ️ Ayuda', 'mostrarAyuda')
    .addToUi();
}

/**
 * Se ejecuta cuando se edita una celda
 */
function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  const range = e.range;
  
  // Solo procesar si es la columna del mensaje y tiene contenido largo
  if (range.getColumn() === COLUMNA_MENSAJE && range.getRow() >= FILA_INICIO) {
    const valor = range.getValue();
    
    // Si el mensaje tiene más de 50 caracteres, formatear la celda
    if (valor && typeof valor === 'string' && valor.length > 50) {
      formatearCeldaMensaje(range);
    }
  }
}

/**
 * Formatea una celda de mensaje para mostrar solo el icono
 */
function formatearCeldaMensaje(celda) {
  const mensajeCompleto = celda.getValue();
  
  // Guardar el mensaje completo en una nota
  celda.setNote(mensajeCompleto);
  
  // Mostrar solo el indicador en la celda
  celda.setValue('📩 Ver cotización');
  
  // Aplicar formato
  celda.setBackground('#E8F0FE')
    .setFontColor('#1a73e8')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle');
}

/**
 * Formatea todas las celdas de mensajes existentes
 */
function formatearTodasLasCeldas() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const ultimaFila = sheet.getLastRow();
  
  if (ultimaFila < FILA_INICIO) {
    SpreadsheetApp.getUi().alert('No hay datos para formatear');
    return;
  }
  
  let procesadas = 0;
  
  for (let fila = FILA_INICIO; fila <= ultimaFila; fila++) {
    const celda = sheet.getRange(fila, COLUMNA_MENSAJE);
    const valor = celda.getValue();
    
    // Solo formatear si tiene un mensaje largo y no está ya formateado
    if (valor && typeof valor === 'string' && valor.length > 50 && !valor.includes('📩')) {
      formatearCeldaMensaje(celda);
      procesadas++;
    }
  }
  
  SpreadsheetApp.getUi().alert(`✅ Se formatearon ${procesadas} mensajes`);
}

/**
 * Muestra el mensaje completo cuando se hace clic en una celda
 */
function mostrarMensaje() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const celda = sheet.getActiveCell();
  
  if (celda.getColumn() !== COLUMNA_MENSAJE || celda.getRow() < FILA_INICIO) {
    SpreadsheetApp.getUi().alert('⚠️ Por favor, selecciona una celda de mensaje');
    return;
  }
  
  const mensajeCompleto = celda.getNote();
  
  if (!mensajeCompleto) {
    SpreadsheetApp.getUi().alert('⚠️ No hay mensaje guardado en esta celda');
    return;
  }
  
  // Crear HTML para el popup
  const html = HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
    <head>
      <base target="_top">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 0;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          padding: 30px;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 3px solid #667eea;
        }
        .header h2 {
          color: #667eea;
          margin: 0;
          font-size: 24px;
        }
        .mensaje {
          background: #f8f9fa;
          border-left: 4px solid #667eea;
          padding: 20px;
          border-radius: 8px;
          white-space: pre-wrap;
          line-height: 1.6;
          color: #333;
          font-size: 14px;
          margin-bottom: 20px;
          max-height: 400px;
          overflow-y: auto;
        }
        .botones {
          display: flex;
          gap: 10px;
          justify-content: center;
        }
        .btn {
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .btn-copiar {
          background: #667eea;
          color: white;
        }
        .btn-copiar:hover {
          background: #5568d3;
          transform: translateY(-2px);
        }
        .btn-cerrar {
          background: #6c757d;
          color: white;
        }
        .btn-cerrar:hover {
          background: #5a6268;
        }
        .notificacion {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 15px 25px;
          border-radius: 8px;
          display: none;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📋 Cotización RegresoFeliz</h2>
        </div>
        
        <div class="mensaje" id="mensaje">${mensajeCompleto.replace(/\n/g, '<br>')}</div>
        
        <div class="botones">
          <button class="btn btn-copiar" onclick="copiarMensaje()">
            📋 Copiar Mensaje
          </button>
          <button class="btn btn-cerrar" onclick="google.script.host.close()">
            ✖️ Cerrar
          </button>
        </div>
      </div>
      
      <div class="notificacion" id="notificacion">
        ✅ Mensaje copiado al portapapeles
      </div>
      
      <script>
        function copiarMensaje() {
          const mensaje = document.getElementById('mensaje').innerText;
          
          // Copiar al portapapeles
          navigator.clipboard.writeText(mensaje).then(() => {
            // Mostrar notificación
            const notif = document.getElementById('notificacion');
            notif.style.display = 'block';
            
            setTimeout(() => {
              notif.style.display = 'none';
            }, 2000);
          }).catch(err => {
            alert('Error al copiar: ' + err);
          });
        }
      </script>
    </body>
    </html>
  `)
  .setWidth(700)
  .setHeight(600);
  
  SpreadsheetApp.getUi().showModalDialog(html, '💬 Mensaje de Cotización');
}

/**
 * Muestra ayuda sobre cómo usar el sistema
 */
function mostrarAyuda() {
  const mensaje = `
📱 SISTEMA DE MENSAJES REGRESOFELIZ

🎯 ¿CÓMO FUNCIONA?

1️⃣ Cuando llegue una nueva cotización:
   • La columna AB mostrará "📩 Ver cotización"
   • El mensaje completo está guardado en la nota

2️⃣ Para ver el mensaje:
   • Haz clic en la celda "📩 Ver cotización"
   • Ve al menú: RegresoFeliz > Mostrar Mensaje
   • Se abrirá un popup con el mensaje completo

3️⃣ Para copiar el mensaje:
   • En el popup, haz clic en "📋 Copiar Mensaje"
   • Pégalo en WhatsApp (Ctrl+V)

🔄 FORMATEAR MENSAJES ANTIGUOS:

Si tienes cotizaciones anteriores con el mensaje completo visible:
   • Ve al menú: RegresoFeliz > Formatear mensajes
   • Esto convertirá todos los mensajes largos a "📩 Ver cotización"

⚠️ IMPORTANTE:
   • No edites manualmente las celdas con "📩 Ver cotización"
   • Si quieres ver el mensaje completo, usa el menú RegresoFeliz
  `;
  
  SpreadsheetApp.getUi().alert(mensaje);
}

/**
 * Agrega un menú contextual personalizado
 */
function onSelectionChange(e) {
  const range = e.range;
  const sheet = range.getSheet();
  
  if (range.getColumn() === COLUMNA_MENSAJE && range.getRow() >= FILA_INICIO) {
    // Agregar opción al menú contextual (solo si está en la columna correcta)
    const ui = SpreadsheetApp.getUi();
    // Nota: Los menús contextuales personalizados son limitados en Apps Script
    // Por eso usamos el menú principal "RegresoFeliz"
  }
}
