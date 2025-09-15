
import express from 'express';
import { getProducts, getProduct, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();


// CRUD productos (sin protección para pruebas)
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

// Subida de imagen
router.post('/upload', upload.single('imagen'), (req, res) => {
	if (!req.file) return res.status(400).json({ error: 'No se subió archivo' });
	res.json({ url: `/uploads/${req.file.filename}` });
});

export default router;
