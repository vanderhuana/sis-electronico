import { pool } from '../models/db.js';

export const getClients = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

export const getClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM clientes WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const createClient = async (req, res, next) => {
  try {
    const { nombre, correo, telefono, direccion } = req.body;
    if (!nombre) {
      return res.status(400).json({ error: 'Nombre requerido' });
    }
    if (correo && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(correo)) {
      return res.status(400).json({ error: 'Correo inválido' });
    }
    const result = await pool.query(
      'INSERT INTO clientes (nombre, correo, telefono, direccion) VALUES ($1,$2,$3,$4) RETURNING *',
      [nombre, correo, telefono, direccion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nombre, correo, telefono, direccion } = req.body;
    if (correo && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(correo)) {
      return res.status(400).json({ error: 'Correo inválido' });
    }
    const result = await pool.query(
      'UPDATE clientes SET nombre=$1, correo=$2, telefono=$3, direccion=$4 WHERE id=$5 RETURNING *',
      [nombre, correo, telefono, direccion, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM clientes WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado', cliente: result.rows[0] });
  } catch (err) {
    next(err);
  }
};
