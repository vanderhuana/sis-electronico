import { pool } from '../models/db.js';

export const consultaRapida = async (req, res) => {
  const { q } = req.query;
  if (!q) {
    console.error('Consulta rápida: falta q', req.query);
    return res.status(400).json({ clientes: [], productos: [] });
  }
  try {
    const clientesPromise = pool.query(
      `SELECT c.id, c.nombre, c.correo, c.telefono,
         ARRAY(
           SELECT p.nombre FROM detalle_ventas dv
           JOIN productos p ON p.id = dv.producto_id
           WHERE dv.cliente_id = c.id
           LIMIT 5
         ) AS productos_comprados
       FROM clientes c
       WHERE LOWER(c.nombre) LIKE LOWER($1) OR LOWER(c.correo) LIKE LOWER($1) OR CAST(c.id AS TEXT) = $2
       ORDER BY c.nombre LIMIT 15`,
      [`%${q}%`, q]
    );
    const productosPromise = pool.query(
      `SELECT nombre, codigo_sku, stock, precio_venta FROM productos WHERE 
         LOWER(nombre) LIKE LOWER($1) OR LOWER(codigo_sku) LIKE LOWER($1) OR CAST(id AS TEXT) = $2
         ORDER BY nombre LIMIT 15`,
      [`%${q}%`, q]
    );
    const [clientes, productos] = await Promise.all([clientesPromise, productosPromise]);
    return res.json({ clientes: clientes.rows, productos: productos.rows });
  } catch (err) {
    console.error('Error en consulta rápida:', err);
    res.status(500).json({ clientes: [], productos: [] });
  }
};
