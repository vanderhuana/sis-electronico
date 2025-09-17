import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import { pool } from './models/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import clientRoutes from './routes/clients.js';
import clientQuickRoutes from './routes/clientQuick.js';
import reportRoutes from './routes/reports.js';
import consultaRoutes from './routes/consulta.js';
import dashboardRoutes from './routes/dashboard.js';
import salesRoutes from './routes/sales.js';

const app = express();
app.use(cors());
app.use(express.json());


// Servir archivos estáticos de la carpeta uploads
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/clients', clientQuickRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/consulta', consultaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/sales', salesRoutes);

app.get('/', (req, res) => {
  res.send('SIS Electrónico API funcionando');
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend SIS Electrónico escuchando en puerto ${PORT}`);
});
