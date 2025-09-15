import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../models/db.js';

export const login = async (req, res, next) => {
  try {
    const { usuario, contrasena } = req.body;
    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }
    const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    const valid = await bcrypt.compare(contrasena, user.contrasena_hash);
    if (!valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    const token = jwt.sign({ id: user.id, rol: user.rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });
    res.json({ token, usuario: user.usuario, rol: user.rol });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await pool.query('SELECT id, usuario, rol, fecha_creacion FROM usuarios WHERE id = $1', [userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
