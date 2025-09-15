import { pool } from '../models/db.js';
import PDFDocument from 'pdfkit';

export const getSales = async (req, res, next) => {
  try {
    // Obtener ventas con nombre de cliente
    const ventasRes = await pool.query(`
      SELECT v.*, c.nombre AS cliente_nombre
      FROM ventas v
      JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.id DESC
    `);
    const ventas = ventasRes.rows;
    // Para cada venta, obtener productos
    for (const venta of ventas) {
      const detalleRes = await pool.query(`
        SELECT dv.cantidad, dv.precio_unitario, dv.precio_unitario * dv.cantidad AS precio_total, p.nombre AS producto_nombre
        FROM detalle_ventas dv
        JOIN productos p ON dv.producto_id = p.id
        WHERE dv.venta_id = $1
      `, [venta.id]);
      venta.productos = detalleRes.rows;
    }
    res.json(ventas);
  } catch (err) {
    next(err);
  }
};

export const createSale = async (req, res, next) => {
  try {
    const { usuario_id, cliente_id, items, descuento = 0, impuesto = 0, metodo_pago } = req.body;
    if (!usuario_id || !cliente_id || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Datos de venta incompletos' });
    }
    // Verificar stock y calcular totales
    let subtotal = 0;
    for (const item of items) {
      const prodRes = await pool.query('SELECT stock, precio_venta FROM productos WHERE id = $1', [item.producto_id]);
      const prod = prodRes.rows[0];
      if (!prod) return res.status(404).json({ error: `Producto ID ${item.producto_id} no existe` });
      if (prod.stock < item.cantidad) return res.status(400).json({ error: `Stock insuficiente para producto ID ${item.producto_id}` });
      subtotal += prod.precio_venta * item.cantidad;
    }
    const total = subtotal - descuento + impuesto;
    // Registrar venta
    const ventaRes = await pool.query(
      'INSERT INTO ventas (usuario_id, cliente_id, subtotal, descuento, impuesto, total, metodo_pago) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id',
      [usuario_id, cliente_id, subtotal, descuento, impuesto, total, metodo_pago]
    );
    const venta_id = ventaRes.rows[0].id;
    // Registrar detalle y reducir stock
    for (const item of items) {
      await pool.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES ($1,$2,$3,$4)',
        [venta_id, item.producto_id, item.cantidad, item.precio_unitario]
      );
      await pool.query('UPDATE productos SET stock = stock - $1 WHERE id = $2', [item.cantidad, item.producto_id]);
    }
    res.status(201).json({ venta_id, pdf_url: `/api/sales/${venta_id}/receipt` });
  } catch (err) {
    next(err);
  }
};

export const getSaleReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Obtener datos de venta y detalle
    const ventaRes = await pool.query('SELECT * FROM ventas WHERE id = $1', [id]);
    if (ventaRes.rows.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });
    const venta = ventaRes.rows[0];
    const detalleRes = await pool.query('SELECT dv.*, p.nombre FROM detalle_ventas dv JOIN productos p ON dv.producto_id = p.id WHERE dv.venta_id = $1', [id]);
    // Generar PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    doc.fontSize(18).text('Recibo de Venta', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Venta ID: ${venta.id}`);
    doc.text(`Cliente ID: ${venta.cliente_id}`);
    doc.text(`Usuario ID: ${venta.usuario_id}`);
    doc.text(`Fecha: ${venta.fecha}`);
    doc.text(`Método de pago: ${venta.metodo_pago}`);
    doc.moveDown();
    doc.text('Productos:');
    detalleRes.rows.forEach(item => {
      doc.text(`- ${item.nombre} x${item.cantidad} @ ${item.precio_unitario}`);
    });
    doc.moveDown();
    doc.text(`Subtotal: ${venta.subtotal}`);
    doc.text(`Descuento: ${venta.descuento}`);
    doc.text(`Impuesto: ${venta.impuesto}`);
    doc.text(`Total: ${venta.total}`);
    doc.end();
  } catch (err) {
    next(err);
  }
};
