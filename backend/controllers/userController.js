import bcrypt from 'bcrypt';
import { pool } from '../models/db.js';

export const createUser = async (req, res, next) => {
  try {
    const { usuario, contrasena, rol } = req.body;
    if (!usuario || !contrasena || !rol) {
      return res.status(400).json({ error: 'Usuario, contraseña y rol requeridos' });
    }
    if (!['administrador', 'vendedor'].includes(rol)) {
      return res.status(400).json({ error: 'Rol inválido' });
    }
    const hash = await bcrypt.hash(contrasena, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (usuario, contrasena_hash, rol) VALUES ($1, $2, $3) RETURNING id, usuario, rol',
      [usuario, hash, rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Usuario ya existe' });
    }
    next(err);
  }
};
