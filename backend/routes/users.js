import express from 'express';
import { createUser } from '../controllers/userController.js';
import { authenticateJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Solo admin puede crear usuarios
// Para pruebas iniciales, permitir crear usuarios sin autenticación
router.post('/', createUser);

export default router;
