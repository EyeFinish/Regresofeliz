const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const ExcelJS = require('exceljs');

const app = express();
const PORT = process.env.PORT || 3000;
const JSON_FILE = path.join(__dirname, 'cotizaciones.json');
const EXCEL_FILE = path.join(__dirname, 'cotizaciones.xlsx');

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
        
        // Cargar cotizaciones existentes
        const cotizaciones = cargarCotizaciones();
        
        // Agregar nueva cotización
        cotizaciones.push(cotizacionCompleta);
        
        // Guardar en JSON (siempre funciona)
        guardarCotizacionesJSON(cotizaciones);
        console.log('✅ Cotización guardada en JSON');
        
        // Intentar actualizar Excel en tiempo real
        try {
            await generarExcelDesdeJSON();
            console.log('✅ Excel actualizado en tiempo real');
        } catch (excelError) {
            console.warn('⚠️  Excel no actualizado (puede estar abierto). Datos seguros en JSON.');
        }
        
        res.json({ 
            ok: true, 
            mensaje: 'Cotización guardada correctamente',
            timestamp: fechaRegistro
        });
        
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

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n🚀 Servidor RegresoFeliz iniciado correctamente`);
    console.log(`📡 Escuchando en http://localhost:${PORT}`);
    console.log(`📊 Las cotizaciones se guardan en: ${EXCEL_FILE}`);
    console.log(`💾 Para descargar el Excel: http://localhost:${PORT}/descargar-cotizaciones\n`);
});
