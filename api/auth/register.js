// api/auth/register.js
// POST /api/auth/register
// Body: { email, password, nombre_usuario }

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, json } from '../_db.js';

export default async function handler(req, res) {
  // Solo aceptamos POST
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Método no permitido' });
  }

  const { email, password, nombre_usuario } = req.body;

  // Validación básica
  if (!email || !password || !nombre_usuario) {
    return json(res, 400, { error: 'Email, contraseña y nombre son obligatorios.' });
  }
  if (password.length < 8) {
    return json(res, 400, { error: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json(res, 400, { error: 'El email no tiene un formato válido.' });
  }

  try {
    // ¿Ya existe ese email?
    const existing = await query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );
    if (existing.length > 0) {
      return json(res, 409, { error: 'Ya existe una cuenta con ese email.' });
    }

    // Hash de la contraseña (coste 12 = seguro pero rápido)
    const password_hash = await bcrypt.hash(password, 12);

    // Insertar usuario
    // tipo: 0 = usuario normal, 1 = admin (Antonio)
    const result = await query(
      `INSERT INTO usuarios (email, password_legacy, password_hash, nombre_usuario, tipo)
       VALUES (?, '', ?, ?, 0)`,
      [email.toLowerCase(), password_hash, nombre_usuario.trim()]
    );

    const userId = result.insertId;

    // Generar JWT (expira en 7 días)
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase(), tipo: 0 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return json(res, 201, {
      token,
      user: { id: userId, email: email.toLowerCase(), nombre_usuario, tipo: 0 },
    });

  } catch (err) {
    console.error('[register]', err);
    return json(res, 500, { error: 'Error interno. Inténtalo de nuevo.' });
  }
}
