// api/auth/register.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, json } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Método no permitido' });
  }

  const { email, password, nombre_usuario } = req.body;

  if (!email || !password || !nombre_usuario) {
    return json(res, 400, { error: 'Email, contraseña y nombre son obligatorios.' });
  }
  if (password.length < 8) {
    return json(res, 400, { error: 'La contraseña debe tener al menos 8 caracteres.' });
  }

  try {
    const existing = await query(
      'SELECT id FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );
    if (existing.length > 0) {
      return json(res, 409, { error: 'Ya existe una cuenta con ese email.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const result = await query(
      'INSERT INTO usuarios (email, password, nombre_usuario, tipo) VALUES (?, ?, ?, 0)',
      [email.toLowerCase(), password_hash, nombre_usuario.trim()]
    );

    const userId = result.insertId;

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase(), tipo: 0 },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return json(res, 201, {
      token,
      user: {
        id: userId,
        email: email.toLowerCase(),
        nombre_usuario: nombre_usuario.trim(),
        tipo: 0,
      },
    });

  } catch (err) {
    console.error('[register error]', err.message);
    return json(res, 500, { error: 'Error interno: ' + err.message });
  }
};
