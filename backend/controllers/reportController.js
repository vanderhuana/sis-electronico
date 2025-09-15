import ExcelJS from 'exceljs';
// PDF de ventas por rango
export const exportVentasPDF = async (req, res, next) => {
  try {
    let { desde, hasta } = req.query;
    if (desde === hasta) {
      desde = `${desde} 00:00:00`;
      hasta = `${hasta} 23:59:59`;
    }
    const result = await pool.query(
      `SELECT v.id, v.fecha, c.nombre AS cliente, v.total
       FROM ventas v
       JOIN clientes c ON v.cliente_id = c.id
       WHERE v.fecha >= $1 AND v.fecha <= $2
       ORDER BY v.fecha DESC`,
      [desde, hasta]
    );
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Reporte de Ventas por Rango', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Desde: ${desde}  Hasta: ${hasta}`);
    doc.moveDown();
    result.rows.forEach(v => {
      doc.text(`ID: ${v.id} | Fecha: ${v.fecha} | Cliente: ${v.cliente} | Total: ${v.total}`);
    });
    doc.end();
  } catch (err) {
    next(err);
  }
};

// PDF de productos más vendidos
export const exportProductosVendidosPDF = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.nombre, SUM(dv.cantidad) AS cantidad_total
       FROM detalle_ventas dv
       JOIN productos p ON dv.producto_id = p.id
       GROUP BY p.nombre
       ORDER BY cantidad_total DESC
       LIMIT 10`
    );
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Productos Más Vendidos', { align: 'center' });
    doc.moveDown();
    result.rows.forEach(p => {
      doc.text(`Producto: ${p.nombre} | Cantidad Vendida: ${p.cantidad_total}`);
    });
    doc.end();
  } catch (err) {
    next(err);
  }
};

// PDF de clientes con más compras
export const exportClientesComprasPDF = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.nombre, COUNT(v.id) AS compras
       FROM ventas v
       JOIN clientes c ON v.cliente_id = c.id
       GROUP BY c.nombre
       ORDER BY compras DESC
       LIMIT 10`
    );
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Clientes con Más Compras', { align: 'center' });
    doc.moveDown();
    result.rows.forEach(c => {
      doc.text(`Cliente: ${c.nombre} | Compras: ${c.compras}`);
    });
    doc.end();
  } catch (err) {
    next(err);
  }
};

// Excel de ventas por rango
export const exportVentasExcel = async (req, res, next) => {
  try {
    let { desde, hasta } = req.query;
    if (desde === hasta) {
      desde = `${desde} 00:00:00`;
      hasta = `${hasta} 23:59:59`;
    }
    const result = await pool.query(
      `SELECT v.id, v.fecha, c.nombre AS cliente, v.total
       FROM ventas v
       JOIN clientes c ON v.cliente_id = c.id
       WHERE v.fecha >= $1 AND v.fecha <= $2
       ORDER BY v.fecha DESC`,
      [desde, hasta]
    );
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Ventas');
    sheet.addRow(['ID', 'Fecha', 'Cliente', 'Total']);
    result.rows.forEach(v => {
      sheet.addRow([v.id, v.fecha, v.cliente, v.total]);
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ventas.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// Excel de productos más vendidos
export const exportProductosVendidosExcel = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.nombre, SUM(dv.cantidad) AS cantidad_total
       FROM detalle_ventas dv
       JOIN productos p ON dv.producto_id = p.id
       GROUP BY p.nombre
       ORDER BY cantidad_total DESC
       LIMIT 10`
    );
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Productos Vendidos');
    sheet.addRow(['Producto', 'Cantidad Vendida']);
    result.rows.forEach(p => {
      sheet.addRow([p.nombre, p.cantidad_total]);
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=productos_mas_vendidos.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};

// Excel de clientes con más compras
export const exportClientesComprasExcel = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.nombre, COUNT(v.id) AS compras
       FROM ventas v
       JOIN clientes c ON v.cliente_id = c.id
       GROUP BY c.nombre
       ORDER BY compras DESC
       LIMIT 10`
    );
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Clientes Compras');
    sheet.addRow(['Cliente', 'Compras']);
    result.rows.forEach(c => {
      sheet.addRow([c.nombre, c.compras]);
    });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=clientes_mas_compras.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
};
// Reporte de ventas por rango de fechas
export const getVentasPorRango = async (req, res, next) => {
  try {
    let { desde, hasta } = req.query;
    // Si las fechas son iguales, ajusta para incluir todo el día
    if (desde === hasta) {
      desde = `${desde} 00:00:00`;
      hasta = `${hasta} 23:59:59`;
    }
    const result = await pool.query(
      `SELECT v.id, v.fecha, c.nombre AS cliente, v.total
       FROM ventas v
       JOIN clientes c ON v.cliente_id = c.id
       WHERE v.fecha BETWEEN $1 AND $2
       ORDER BY v.fecha DESC`,
      [desde, hasta]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Reporte de productos más vendidos
export const getProductosMasVendidos = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p.nombre, SUM(dv.cantidad) AS cantidad_total
       FROM detalle_ventas dv
       JOIN productos p ON dv.producto_id = p.id
       GROUP BY p.nombre
       ORDER BY cantidad_total DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

// Reporte de clientes con más compras
export const getClientesMasCompras = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT c.nombre, COUNT(v.id) AS compras
       FROM ventas v
       JOIN clientes c ON v.cliente_id = c.id
       GROUP BY c.nombre
       ORDER BY compras DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};
import { pool } from '../models/db.js';
import PDFDocument from 'pdfkit';

export const getIncomeByRange = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    const result = await pool.query(
      'SELECT SUM(total) as ingresos FROM ventas WHERE fecha >= $1 AND fecha <= $2',
      [desde, hasta]
    );
    res.json({ ingresos: result.rows[0].ingresos || 0 });
  } catch (err) {
    next(err);
  }
};

export const getMonthlyIncome = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT to_char(fecha, 'YYYY-MM') as mes, SUM(total) as ingresos FROM ventas GROUP BY mes ORDER BY mes`
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const getLowStock = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM productos WHERE stock <= 5 ORDER BY stock ASC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const exportIncomePDF = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    const result = await pool.query(
      'SELECT fecha, total FROM ventas WHERE fecha >= $1 AND fecha <= $2 ORDER BY fecha',
      [desde, hasta]
    );
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Reporte de Ingresos', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Desde: ${desde}  Hasta: ${hasta}`);
    doc.moveDown();
    result.rows.forEach(v => {
      doc.text(`Fecha: ${v.fecha} - Total: ${v.total}`);
    });
    doc.end();
  } catch (err) {
    next(err);
  }
};

export const exportLowStockPDF = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM productos WHERE stock <= 5 ORDER BY stock ASC');
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Reporte de Stock Bajo', { align: 'center' });
    doc.moveDown();
    result.rows.forEach(p => {
      doc.text(`SKU: ${p.codigo_sku} - ${p.nombre} - Stock: ${p.stock}`);
    });
    doc.end();
  } catch (err) {
    next(err);
  }
};
