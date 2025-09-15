import { pool } from '../models/db.js';

export const getClientQuickInfo = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Últimas compras
    const comprasRes = await pool.query(
      `SELECT v.id, v.fecha, v.total FROM ventas v WHERE v.cliente_id = $1 ORDER BY v.fecha DESC LIMIT 5`,
      [id]
    );
    // Total gastado
    const totalRes = await pool.query(
      `SELECT COALESCE(SUM(total),0) as total_gastado FROM ventas WHERE cliente_id = $1`,
      [id]
    );
    res.json({
      ultimas_compras: comprasRes.rows,
      total_gastado: totalRes.rows[0].total_gastado
    });
  } catch (err) {
    next(err);
  }
};
