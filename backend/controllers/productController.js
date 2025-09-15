import { pool } from '../models/db.js';

export const getProducts = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM productos ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    let { codigo_sku, nombre, descripcion, categoria, precio_compra, precio_venta, stock, proveedor, imagen_url } = req.body;
    if (!nombre || !precio_venta || stock === undefined) {
      return res.status(400).json({ error: 'Campos obligatorios faltantes' });
    }
    if (precio_venta <= 0 || (precio_compra && precio_compra < 0) || stock < 0) {
      return res.status(400).json({ error: 'Valores inválidos' });
    }
    // Generar SKU dinámico si no se proporciona
    if (!codigo_sku || codigo_sku.trim() === '') {
      // Ejemplo: PRD-<timestamp>-<random>
      codigo_sku = `PRD-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    }
    const result = await pool.query(
      'INSERT INTO productos (codigo_sku, nombre, descripcion, categoria, precio_compra, precio_venta, stock, proveedor, imagen_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
      [codigo_sku, nombre, descripcion, categoria, precio_compra, precio_venta, stock, proveedor, imagen_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'SKU ya existe' });
    }
    next(err);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stockChange } = req.body;
    if (typeof stockChange === 'number') {
      // Solo actualizar el stock
      const result = await pool.query(
        'UPDATE productos SET stock = stock + $1 WHERE id = $2 RETURNING *',
        [stockChange, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
      res.json(result.rows[0]);
      return;
    }
    // Actualización normal de producto
    const { nombre, descripcion, categoria, precio_compra, precio_venta, stock, proveedor, imagen_url } = req.body;
    const result = await pool.query(
      'UPDATE productos SET nombre=$1, descripcion=$2, categoria=$3, precio_compra=$4, precio_venta=$5, stock=$6, proveedor=$7, imagen_url=$8 WHERE id=$9 RETURNING *',
      [nombre, descripcion, categoria, precio_compra, precio_venta, stock, proveedor, imagen_url, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado', producto: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
