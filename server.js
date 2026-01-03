const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const ExcelJS = require('exceljs');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3000;
const JSON_FILE = path.join(__dirname, 'cotizaciones.json');
const EXCEL_FILE = path.join(__dirname, 'cotizaciones.xlsx');

// Configuración de Google Sheets
const SPREADSHEET_ID = '1DIQGWq6PNK8aER5_KS3xBZ8nKwZHz8kvIKOqIR_Hr0M';
const CREDENTIALS_FILE = path.join(__dirname, 'augmented-clock-483201-v4-5f1f5be512c5.json');

// Inicializar cliente de Google Sheets
async function getGoogleSheetsClient() {
    let auth;
    
    // En producción (Render), usar variables de entorno
    if (process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_CLIENT_EMAIL) {
        auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
    } 
    // En local, usar archivo JSON
    else if (fs.existsSync(CREDENTIALS_FILE)) {
        auth = new google.auth.GoogleAuth({
            keyFile: CREDENTIALS_FILE,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
    } else {
        throw new Error('No se encontraron credenciales de Google Sheets');
    }
    
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
}

// Función para crear el mensaje de cotización formateado
function crearMensajeCotizacion(datos) {
    const descuentoTexto = datos.descuentoAplicado > 0 
        ? `🎉 *DESCUENTO APLICADO*: -$${datos.descuentoAplicado.toLocaleString('es-CL')} (Código: ${datos.codigoDescuento})\n` 
        : '';
    
    const paradasTexto = datos.numParadas > 0 
        ? `🛑 *Paradas adicionales*: ${datos.numParadas} ($${(datos.numParadas * 2000).toLocaleString('es-CL')})\n   ${datos.paradasAdicionales}\n\n` 
        : '';
    
    const mensaje = `
🎉 *¡Hola ${datos.nombre.split(' ')[0]}!* 🎉

Gracias por confiar en *RegresoFeliz* 🚗✨

📋 *DETALLES DE TU COTIZACIÓN*

📅 *Fecha del servicio*: ${datos.fechaReserva || 'Por confirmar'}
⏰ *Hora de presentación*: ${datos.horaPresentacion}

🗺️ *RUTA*
📍 *Origen*: ${datos.centroEvento}
🏁 *Destino*: ${datos.destinoFinal}
${paradasTexto}📏 *Distancia*: ${datos.distanciaKm} km
⏱️ *Duración estimada*: ${datos.duracionMin} minutos
👥 *Pasajeros*: ${datos.numeroPersonas} persona(s)

🚙 *TU VEHÍCULO*
🔧 *Modelo*: ${datos.marcaModelo}
⚙️ *Transmisión*: ${datos.tipoTransmision}
🔢 *Patente*: ${datos.patente}
🛡️ *Seguro*: ${datos.seguro}

💰 *COTIZACIÓN*
💵 *Costo base*: $${datos.costoBase.toLocaleString('es-CL')}
${descuentoTexto}✅ *TOTAL A PAGAR*: *$${datos.costoFinal.toLocaleString('es-CL')}*

📞 *CONTACTO*
${datos.telefono}${datos.telefono2 ? `\n📱 Emergencia: ${datos.telefono2}` : ''}
📧 ${datos.correo}

¿Confirmamos tu reserva? 🎊

_RegresoFeliz - Tu Angelito de confianza_ 😇
`.trim();
    
    return mensaje;
}

// Función para guardar en Google Sheets
async function guardarEnGoogleSheets(datos) {
    try {
        const sheets = await getGoogleSheetsClient();
        
        // Crear mensaje de cotización para el cliente
        const mensajeCotizacion = crearMensajeCotizacion(datos);
        console.log(`📝 Mensaje generado (${mensajeCotizacion.length} caracteres)`);
        
        // Crear link de WhatsApp (formato: +56XXXXXXXXX sin espacios ni caracteres especiales)
        const telefonoLimpio = datos.telefono.replace(/\D/g, ''); // Eliminar todo excepto números
        const telefonoConPrefijo = telefonoLimpio.startsWith('56') ? telefonoLimpio : '56' + telefonoLimpio;
        const linkWhatsApp = `https://wa.me/${telefonoConPrefijo}`;
        
        // Preparar fila de datos
        const fila = [
            datos.fechaRegistro,
            datos.fechaReserva || '',
            datos.horaPresentacion || '',
            '', // Separador DATOS CLIENTE
            datos.nombre || '',
            datos.correo || '',
            datos.telefono || '',
            datos.telefono2 || '',
            '', // Separador DATOS VIAJE
            datos.centroEvento || '',
            datos.destinoFinal || '',
            datos.paradasAdicionales || '',
            datos.numParadas || 0,
            datos.distanciaKm || '',
            datos.duracionMin || '',
            datos.numeroPersonas || '',
            '', // Separador DATOS VEHÍCULO
            datos.marcaModelo || '',
            datos.tipoTransmision || '',
            datos.patente || '',
            datos.seguro || '',
            '', // Separador COTIZACIÓN
            datos.costoBase || 0,
            datos.costoFinal || 0,
            datos.codigoDescuento || '',
            datos.descuentoAplicado || 0,
            '', // Separador COMUNICACIÓN
            mensajeCotizacion,  // Mensaje completo para copiar
            linkWhatsApp        // Link de WhatsApp
        ];
        
        // Verificar si la hoja tiene encabezados
        const result = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: 'A1:AC1',
        });
        
        // Verificar si necesitamos actualizar encabezados (si no existen o están incompletos)
        const encabezadosExistentes = result.data.values ? result.data.values[0] : [];
        const tieneColumnaComunicacion = encabezadosExistentes[26] && encabezadosExistentes[26].includes('COMUNICACIÓN');
        const necesitaActualizacion = !result.data.values || result.data.values.length === 0 || encabezadosExistentes.length < 29 || !tieneColumnaComunicacion;
        
        // Si no hay encabezados o están incompletos, crearlos/actualizarlos y formatear
        if (necesitaActualizacion) {
            console.log('📝 Actualizando encabezados de Google Sheets... (Columnas actuales: ' + encabezadosExistentes.length + ')');
            // Crear encabezados
            await sheets.spreadsheets.values.update({
                spreadsheetId: SPREADSHEET_ID,
                range: 'A1:AC1',
                valueInputOption: 'RAW',
                resource: {
                    values: [[
                        'FECHA REGISTRO', 'FECHA SERVICIO', 'HORA SERVICIO',
                        '📋 DATOS CLIENTE',
                        'NOMBRE COMPLETO', 'EMAIL', 'TELÉFONO', 'TELÉFONO EMERGENCIA',
                        '🚗 DATOS VIAJE',
                        'ORIGEN (CENTRO EVENTO)', 'DESTINO FINAL', 'PARADAS ADICIONALES',
                        'Nº PARADAS', 'DISTANCIA (KM)', 'DURACIÓN (MIN)', 'PERSONAS',
                        '🔧 DATOS VEHÍCULO',
                        'MARCA Y MODELO', 'TRANSMISIÓN', 'PATENTE', 'SEGURO',
                        '💰 COTIZACIÓN',
                        'COSTO BASE ($)', 'COSTO FINAL ($)', 'CÓDIGO DESCUENTO', 'DESCUENTO ($)',
                        '📱 COMUNICACIÓN',
                        'MENSAJE PARA CLIENTE', 'LINK WHATSAPP'
                    ]]
                }
            });
            
            // Formatear encabezados
            const headerFormats = [
                // Columnas A-C (Fechas) - Azul claro
                { range: 'A1:C1', backgroundColor: { red: 0.8, green: 0.9, blue: 1 } },
                // Columna D (Separador Cliente) - Morado
                { range: 'D1', backgroundColor: { red: 0.6, green: 0.4, blue: 0.9 } },
                // Columnas E-H (Cliente) - Verde claro
                { range: 'E1:H1', backgroundColor: { red: 0.8, green: 1, blue: 0.8 } },
                // Columna I (Separador Viaje) - Morado
                { range: 'I1', backgroundColor: { red: 0.6, green: 0.4, blue: 0.9 } },
                // Columnas J-P (Viaje) - Amarillo claro
                { range: 'J1:P1', backgroundColor: { red: 1, green: 1, blue: 0.8 } },
                // Columna Q (Separador Vehículo) - Morado
                { range: 'Q1', backgroundColor: { red: 0.6, green: 0.4, blue: 0.9 } },
                // Columnas R-U (Vehículo) - Naranja claro
                { range: 'R1:U1', backgroundColor: { red: 1, green: 0.9, blue: 0.7 } },
                // Columna V (Separador Cotización) - Morado
                { range: 'V1', backgroundColor: { red: 0.6, green: 0.4, blue: 0.9 } },
                // Columnas W-Z (Cotización) - Rosa claro
                { range: 'W1:Z1', backgroundColor: { red: 1, green: 0.8, blue: 0.9 } },
                // Columna AA (Separador Comunicación) - Morado
                { range: 'AA1', backgroundColor: { red: 0.6, green: 0.4, blue: 0.9 } },
                // Columnas AB-AC (Comunicación) - Azul cielo
                { range: 'AB1:AC1', backgroundColor: { red: 0.7, green: 0.9, blue: 1 } }
            ];
            
            const requests = headerFormats.map(format => ({
                repeatCell: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 0,
                        endRowIndex: 1,
                        startColumnIndex: format.range.charCodeAt(0) - 65,
                        endColumnIndex: format.range.includes(':') 
                            ? format.range.split(':')[1].match(/[A-Z]+/)[0].charCodeAt(0) - 64
                            : format.range.charCodeAt(0) - 64
                    },
                    cell: {
                        userEnteredFormat: {
                            backgroundColor: format.backgroundColor,
                            textFormat: { bold: true, fontSize: 10 },
                            horizontalAlignment: 'CENTER',
                            verticalAlignment: 'MIDDLE'
                        }
                    },
                    fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
                }
            }));
            
            // Agregar bordes y congelar primera fila
            requests.push({
                updateSheetProperties: {
                    properties: {
                        sheetId: 0,
                        gridProperties: { frozenRowCount: 1 }
                    },
                    fields: 'gridProperties.frozenRowCount'
                }
            });
            
            // Agregar bordes gruesos para los encabezados
            requests.push({
                updateBorders: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 0,
                        endRowIndex: 1,
                        startColumnIndex: 0,
                        endColumnIndex: 29
                    },
                    top: {
                        style: 'SOLID_THICK',
                        width: 2,
                        color: { red: 0.2, green: 0.2, blue: 0.2 }
                    },
                    bottom: {
                        style: 'SOLID_THICK',
                        width: 2,
                        color: { red: 0.2, green: 0.2, blue: 0.2 }
                    },
                    left: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.4, green: 0.4, blue: 0.4 }
                    },
                    right: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.4, green: 0.4, blue: 0.4 }
                    },
                    innerVertical: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.6, green: 0.6, blue: 0.6 }
                    }
                }
            });
            
            // Agregar bordes sutiles a todas las celdas de datos
            requests.push({
                updateBorders: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 1, // Desde fila 2 (datos)
                        startColumnIndex: 0,
                        endColumnIndex: 29
                    },
                    top: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.9, green: 0.9, blue: 0.9 }
                    },
                    bottom: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.9, green: 0.9, blue: 0.9 }
                    },
                    left: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.9, green: 0.9, blue: 0.9 }
                    },
                    right: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.9, green: 0.9, blue: 0.9 }
                    },
                    innerHorizontal: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.9, green: 0.9, blue: 0.9 }
                    },
                    innerVertical: {
                        style: 'SOLID',
                        width: 1,
                        color: { red: 0.9, green: 0.9, blue: 0.9 }
                    }
                }
            });
            
            // Configurar texto ajustado (wrap) para la columna del mensaje (AB = columna 27)
            requests.push({
                repeatCell: {
                    range: {
                        sheetId: 0,
                        startRowIndex: 1, // Desde la fila 2 (después del encabezado)
                        startColumnIndex: 27, // Columna AB
                        endColumnIndex: 28
                    },
                    cell: {
                        userEnteredFormat: {
                            wrapStrategy: 'WRAP',
                            verticalAlignment: 'TOP'
                        }
                    },
                    fields: 'userEnteredFormat(wrapStrategy,verticalAlignment)'
                }
            });
            
            // Ajustar anchos de columna
            const columnWidths = [
                { startIndex: 0, endIndex: 1, width: 150 },   // A - Fecha Registro
                { startIndex: 1, endIndex: 2, width: 120 },   // B - Fecha Servicio
                { startIndex: 2, endIndex: 3, width: 100 },   // C - Hora
                { startIndex: 3, endIndex: 4, width: 30 },    // D - Separador
                { startIndex: 4, endIndex: 5, width: 200 },   // E - Nombre
                { startIndex: 5, endIndex: 6, width: 220 },   // F - Email
                { startIndex: 6, endIndex: 7, width: 120 },   // G - Teléfono
                { startIndex: 7, endIndex: 8, width: 120 },   // H - Tel. Emergencia
                { startIndex: 8, endIndex: 9, width: 30 },    // I - Separador
                { startIndex: 9, endIndex: 10, width: 300 },  // J - Origen
                { startIndex: 10, endIndex: 11, width: 300 }, // K - Destino
                { startIndex: 11, endIndex: 12, width: 250 }, // L - Paradas
                { startIndex: 12, endIndex: 13, width: 80 },  // M - Nº Paradas
                { startIndex: 13, endIndex: 14, width: 100 }, // N - Distancia
                { startIndex: 14, endIndex: 15, width: 100 }, // O - Duración
                { startIndex: 15, endIndex: 16, width: 80 },  // P - Personas
                { startIndex: 16, endIndex: 17, width: 30 },  // Q - Separador
                { startIndex: 17, endIndex: 18, width: 180 }, // R - Marca/Modelo
                { startIndex: 18, endIndex: 19, width: 100 }, // S - Transmisión
                { startIndex: 19, endIndex: 20, width: 90 },  // T - Patente
                { startIndex: 20, endIndex: 21, width: 120 }, // U - Seguro
                { startIndex: 21, endIndex: 22, width: 30 },  // V - Separador
                { startIndex: 22, endIndex: 23, width: 120 }, // W - Costo Base
                { startIndex: 23, endIndex: 24, width: 120 }, // X - Costo Final
                { startIndex: 24, endIndex: 25, width: 130 }, // Y - Código
                { startIndex: 25, endIndex: 26, width: 100 }, // Z - Descuento
                { startIndex: 26, endIndex: 27, width: 30 },  // AA - Separador
                { startIndex: 27, endIndex: 28, width: 250 }, // AB - Mensaje completo
                { startIndex: 28, endIndex: 29, width: 250 }  // AC - Link WhatsApp
            ];
            
            columnWidths.forEach(col => {
                requests.push({
                    updateDimensionProperties: {
                        range: {
                            sheetId: 0,
                            dimension: 'COLUMNS',
                            startIndex: col.startIndex,
                            endIndex: col.endIndex
                        },
                        properties: { pixelSize: col.width },
                        fields: 'pixelSize'
                    }
                });
            });
            
            await sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                resource: { requests }
            });
            
            console.log('✅ Formato aplicado a encabezados');
        } else {
            console.log('ℹ️ Encabezados ya están completos, no se necesita actualización');
        }
        
        // Agregar nueva fila al final
        console.log('📝 Guardando fila con ' + fila.length + ' columnas en Google Sheets...');
        console.log('📱 Mensaje generado: ' + (mensajeCotizacion ? 'SÍ (' + mensajeCotizacion.length + ' caracteres)' : 'NO'));
        console.log('🔗 Link WhatsApp: ' + linkWhatsApp);
        
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'A:AC',
            valueInputOption: 'RAW',
            resource: {
                values: [fila]
            }
        });
        
        console.log('✅ Datos guardados en Google Sheets');
        return true;
    } catch (error) {
        console.error('❌ Error al guardar en Google Sheets:', error.message);
        return false;
    }
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // Servir archivos estáticos

// Función para formatear fecha en formato chileno
function formatearFechaChilena(fecha) {
    const d = new Date(fecha);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const anio = d.getFullYear();
    const horas = String(d.getHours()).padStart(2, '0');
    const minutos = String(d.getMinutes()).padStart(2, '0');
    const segundos = String(d.getSeconds()).padStart(2, '0');
    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
}

// Función para cargar cotizaciones desde JSON
function cargarCotizaciones() {
    if (fs.existsSync(JSON_FILE)) {
        const data = fs.readFileSync(JSON_FILE, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

// Función para guardar cotizaciones en JSON
function guardarCotizacionesJSON(cotizaciones) {
    fs.writeFileSync(JSON_FILE, JSON.stringify(cotizaciones, null, 2), 'utf8');
}

// Función para generar archivo Excel desde JSON
async function generarExcelDesdeJSON() {
    const cotizaciones = cargarCotizaciones();
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cotizaciones');
        
    // Crear encabezados con formato
    const headerRow = worksheet.addRow([
        'FECHA REGISTRO', 'FECHA SERVICIO', 'HORA SERVICIO',
        '════ DATOS CLIENTE ════',
        'NOMBRE COMPLETO', 'EMAIL', 'TELÉFONO', 'TELÉFONO EMERGENCIA',
        '════ DATOS VIAJE ════',
        'ORIGEN (CENTRO EVENTO)', 'DESTINO FINAL', 'PARADAS ADICIONALES', 
        'Nº PARADAS', 'DISTANCIA (KM)', 'DURACIÓN (MIN)', 'PERSONAS',
        '════ DATOS VEHÍCULO ════',
        'MARCA Y MODELO', 'TRANSMISIÓN', 'PATENTE', 'SEGURO',
        '════ COTIZACIÓN ════',
        'COSTO BASE ($)', 'COSTO FINAL ($)', 'CÓDIGO DESCUENTO', 'DESCUENTO ($)'
    ]);
    
    // Aplicar formato a los encabezados
    headerRow.eachCell((cell, colNumber) => {
        if (cell.value && cell.value.toString().includes('════')) {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4472C4' }
            };
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
        } else {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD9E1F2' }
            };
            cell.font = { bold: true, size: 10 };
        }
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    });
    
    // Agregar todas las cotizaciones desde JSON
    cotizaciones.forEach(datos => {
        const newRow = worksheet.addRow([
            datos.fechaRegistro,
            datos.fechaReserva || '',
            datos.horaPresentacion || '',
            '',
            datos.nombre || '',
            datos.correo || '',
            datos.telefono || '',
            datos.telefono2 || '',
            '',
            datos.centroEvento || '',
            datos.destinoFinal || '',
            datos.paradasAdicionales || '',
            datos.numParadas || 0,
            datos.distanciaKm || '',
            datos.duracionMin || '',
            datos.numeroPersonas || '',
            '',
            datos.marcaModelo || '',
            datos.tipoTransmision || '',
            datos.patente || '',
            datos.seguro || '',
            '',
            datos.costoBase || 0,
            datos.costoFinal || 0,
            datos.codigoDescuento || '',
            datos.descuentoAplicado || 0
        ]);
        
        newRow.eachCell((cell, colNumber) => {
            if ([4, 9, 17, 22].includes(colNumber)) {
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFE7E6E6' }
                };
            }
            
            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
            };
            
            if ([23, 24, 26].includes(colNumber) && cell.value) {
                cell.numFmt = '#,##0';
            }
        });
    });
    
    // Ajustar anchos de columna
    worksheet.columns = [
        { width: 18 }, { width: 14 }, { width: 12 }, { width: 5 },
        { width: 25 }, { width: 30 }, { width: 13 }, { width: 13 }, { width: 5 },
        { width: 40 }, { width: 40 }, { width: 35 }, { width: 10 }, { width: 12 }, { width: 12 }, { width: 10 }, { width: 5 },
        { width: 20 }, { width: 12 }, { width: 10 }, { width: 10 }, { width: 5 },
        { width: 13 }, { width: 13 }, { width: 16 }, { width: 13 }
    ];
    
    // Inmovilizar primera fila
    worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];
    
    // Guardar el archivo
    await workbook.xlsx.writeFile(EXCEL_FILE);
}

// Endpoint para recibir cotizaciones
app.post('/api/cotizacion', async (req, res) => {
    try {
        const datos = req.body;
        console.log('📝 Nueva cotización recibida:', datos);
        
        // Agregar timestamp
        const fechaRegistro = formatearFechaChilena(new Date());
        const cotizacionCompleta = {
            fechaRegistro,
            ...datos
        };
        
        // Guardar en Google Sheets (prioritario)
        const guardadoEnSheets = await guardarEnGoogleSheets(cotizacionCompleta);
        
        // Guardar en JSON como respaldo
        const cotizaciones = cargarCotizaciones();
        cotizaciones.push(cotizacionCompleta);
        guardarCotizacionesJSON(cotizaciones);
        console.log('✅ Cotización guardada en JSON (respaldo local)');
        
        // Intentar actualizar Excel en tiempo real (opcional)
        try {
            await generarExcelDesdeJSON();
            console.log('✅ Excel actualizado en tiempo real');
        } catch (excelError) {
            console.warn('⚠️  Excel no actualizado (puede estar abierto).');
        }
        
        res.json({ 
            ok: true, 
            mensaje: 'Cotización guardada correctamente',
            timestamp: fechaRegistro,
            guardadoEnSheets: guardadoEnSheets
        });
        
        console.log('✅ Respuesta enviada al cliente: { ok: true }');
        
    } catch (error) {
        console.error('❌ Error al guardar cotización:', error);
        res.status(500).json({ 
            ok: false, 
            mensaje: 'Error al guardar la cotización',
            error: error.message 
        });
    }
});

// Endpoint para descargar el archivo Excel
app.get('/descargar-cotizaciones', async (req, res) => {
    try {
        console.log('📥 Generando Excel actualizado desde JSON...');
        
        // Generar Excel actualizado desde JSON
        await generarExcelDesdeJSON();
        
        if (fs.existsSync(EXCEL_FILE)) {
            res.download(EXCEL_FILE, 'cotizaciones.xlsx', (err) => {
                if (err) {
                    console.error('Error al descargar archivo:', err);
                    res.status(500).send('Error al descargar el archivo');
                }
            });
        } else {
            res.status(404).send('No hay cotizaciones disponibles');
        }
    } catch (error) {
        console.error('❌ Error al generar Excel:', error);
        res.status(500).send('Error al generar el archivo Excel');
    }
});

// Ruta principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Endpoint para ver el mensaje de cotización
app.get('/mensaje/:id', (req, res) => {
    const mensajeId = req.params.id;
    const mensaje = mensajesGenerados.get(mensajeId);
    
    if (!mensaje) {
        return res.status(404).send('<h1>Mensaje no encontrado</h1><p>Este mensaje puede haber expirado o el enlace es inválido.</p>');
    }
    
    // Convertir el mensaje de WhatsApp a HTML
    const mensajeHtml = mensaje
        .replace(/\n/g, '<br>')
        .replace(/\*([^*]+)\*/g, '<strong>$1</strong>'); // Negrita
    
    const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mensaje de Cotización - RegresoFeliz</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
            }
            .container {
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                max-width: 600px;
                width: 100%;
                padding: 40px;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 3px solid #667eea;
            }
            .logo {
                font-size: 48px;
                margin-bottom: 10px;
            }
            h1 {
                color: #667eea;
                font-size: 24px;
                margin-bottom: 5px;
            }
            .subtitle {
                color: #666;
                font-size: 14px;
            }
            .mensaje {
                background: #f8f9fa;
                border-left: 4px solid #667eea;
                padding: 25px;
                border-radius: 10px;
                line-height: 1.8;
                color: #333;
                white-space: pre-wrap;
                margin-bottom: 30px;
            }
            .botones {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            .btn {
                flex: 1;
                min-width: 200px;
                padding: 15px 25px;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                text-align: center;
                text-decoration: none;
                display: inline-block;
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5568d3;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
            }
            .btn-secondary {
                background: #25D366;
                color: white;
            }
            .btn-secondary:hover {
                background: #20ba5a;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(37, 211, 102, 0.4);
            }
            .mensaje-copiado {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 15px 25px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s;
                z-index: 1000;
            }
            .mensaje-copiado.show {
                opacity: 1;
                transform: translateY(0);
            }
            @media (max-width: 600px) {
                .container {
                    padding: 25px;
                }
                .btn {
                    min-width: 100%;
                }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🚗✨</div>
                <h1>Mensaje de Cotización</h1>
                <p class="subtitle">RegresoFeliz - Tu Angelito de Confianza</p>
            </div>
            
            <div class="mensaje" id="mensaje">${mensajeHtml}</div>
            
            <div class="botones">
                <button class="btn btn-primary" onclick="copiarMensaje()">
                    📋 Copiar Mensaje
                </button>
                <a href="whatsapp://send?text=${encodeURIComponent(mensaje)}" class="btn btn-secondary">
                    💬 Compartir por WhatsApp
                </a>
            </div>
        </div>
        
        <div class="mensaje-copiado" id="notificacion">
            ✅ Mensaje copiado al portapapeles
        </div>
        
        <script>
            function copiarMensaje() {
                const texto = ${JSON.stringify(mensaje)};
                navigator.clipboard.writeText(texto).then(() => {
                    const notif = document.getElementById('notificacion');
                    notif.classList.add('show');
                    setTimeout(() => {
                        notif.classList.remove('show');
                    }, 3000);
                });
            }
        </script>
    </body>
    </html>
    `;
    
    res.send(html);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor RegresoFeliz iniciado correctamente`);
    console.log(`📡 Escuchando en http://localhost:${PORT}`);
    console.log(`📊 Las cotizaciones se guardan en: ${EXCEL_FILE}`);
    console.log(`💾 Para descargar el Excel: http://localhost:${PORT}/descargar-cotizaciones\n`);
});
