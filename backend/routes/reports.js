import express from 'express';
import { getIncomeByRange, getMonthlyIncome, getLowStock, exportIncomePDF, exportLowStockPDF, getVentasPorRango, getProductosMasVendidos, getClientesMasCompras, exportVentasPDF, exportProductosVendidosPDF, exportClientesComprasPDF, exportVentasExcel, exportProductosVendidosExcel, exportClientesComprasExcel } from '../controllers/reportController.js';
// import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Exportar PDF y Excel de reportes
router.get('/ventas/pdf', exportVentasPDF);
router.get('/productos-mas-vendidos/pdf', exportProductosVendidosPDF);
router.get('/clientes-mas-compras/pdf', exportClientesComprasPDF);
router.get('/ventas/excel', exportVentasExcel);
router.get('/productos-mas-vendidos/excel', exportProductosVendidosExcel);
router.get('/clientes-mas-compras/excel', exportClientesComprasExcel);

router.get('/income', getIncomeByRange);
router.get('/monthly', getMonthlyIncome);
router.get('/low-stock', getLowStock);
router.get('/income/pdf', exportIncomePDF);
router.get('/low-stock/pdf', exportLowStockPDF);

// Nuevos reportes
router.get('/ventas', getVentasPorRango);
router.get('/productos-mas-vendidos', getProductosMasVendidos);
router.get('/clientes-mas-compras', getClientesMasCompras);

export default router;
