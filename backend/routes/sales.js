import express from 'express';
import { createSale, getSaleReceipt, getSales } from '../controllers/salesController.js';
// import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Registrar venta, historial y recibo PDF (sin protección para pruebas)
router.post('/', createSale);
router.get('/', getSales);
router.get('/:id/receipt', getSaleReceipt);

export default router;
