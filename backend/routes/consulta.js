import express from 'express';
import { consultaRapida } from '../controllers/consultaController.js';
const router = express.Router();

// GET /api/consulta?tipo=cliente|producto&q=texto
router.get('/', consultaRapida);

export default router;
