import { pool } from '../models/db.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    // Total ventas del mes
    const ventasMes = await pool.query(`SELECT COALESCE(SUM(total),0) as total_ventas FROM ventas WHERE date_part('month', fecha) = date_part('month', CURRENT_DATE) AND date_part('year', fecha) = date_part('year', CURRENT_DATE)`);
    // Ingresos del día
    const ingresosDia = await pool.query(`SELECT COALESCE(SUM(total),0) as ingresos_dia FROM ventas WHERE fecha::date = CURRENT_DATE`);
    // Stock bajo
    const stockBajo = await pool.query(`SELECT COUNT(*) as productos_bajo_stock FROM productos WHERE stock <= 5`);
    // Clientes registrados
    const clientes = await pool.query(`SELECT COUNT(*) as total_clientes FROM clientes`);
    // Gráfico ingresos últimos 12 meses
    const ingresosMeses = await pool.query(`SELECT to_char(fecha, 'YYYY-MM') as mes, SUM(total) as ingresos FROM ventas WHERE fecha >= CURRENT_DATE - INTERVAL '12 months' GROUP BY mes ORDER BY mes`);
    // Top 5 productos más vendidos
    const topProductos = await pool.query(`SELECT p.nombre, SUM(dv.cantidad) as cantidad_vendida FROM detalle_ventas dv JOIN productos p ON dv.producto_id = p.id GROUP BY p.nombre ORDER BY cantidad_vendida DESC LIMIT 5`);
    res.json({
      total_ventas_mes: ventasMes.rows[0].total_ventas,
      ingresos_dia: ingresosDia.rows[0].ingresos_dia,
      productos_bajo_stock: stockBajo.rows[0].productos_bajo_stock,
      total_clientes: clientes.rows[0].total_clientes,
      ingresos_meses: ingresosMeses.rows,
      top_productos: topProductos.rows
    });
  } catch (err) {
    next(err);
  }
};
