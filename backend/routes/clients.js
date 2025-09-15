import express from 'express';
import { getClients, getClient, createClient, updateClient, deleteClient } from '../controllers/clientController.js';
// import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

// CRUD clientes (sin protección para pruebas)
router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', createClient);
router.put('/:id', updateClient);
router.delete('/:id', deleteClient);

export default router;
