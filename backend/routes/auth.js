import express from 'express';
import { login, me } from '../controllers/authController.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.get('/me', authenticateJWT, me);

export default router;
