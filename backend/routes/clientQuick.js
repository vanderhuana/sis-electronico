import express from 'express';
import { getClientQuickInfo } from '../controllers/clientQuickController.js';
// import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/:id/quick', getClientQuickInfo);

export default router;
