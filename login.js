// api/auth/login.js
// POST /api/auth/login
// Body: { email, password }
// Gestiona migración automática de cuentas legacy (contraseña en texto plano)

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, json } from '../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Método no permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return json(res, 400, { error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const rows = await query(
      'SELECT id, email, password_legacy, password_hash, nombre_usuario, tipo FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      // No decimos si el email existe o no (seguridad)
      return json(res, 401, { error: 'Email o contraseña incorrectos.' });
    }

    const user = rows[0];
    let valid = false;

    if (user.password_hash) {
      // Cuenta ya migrada: comparar con bcrypt
      valid = await bcrypt.compare(password, user.password_hash);
    } else if (user.password_legacy) {
      // Cuenta legacy (texto plano): comparar directamente
      valid = password === user.password_legacy;

      if (valid) {
        // ¡Migrar en este momento! Guardamos el hash y borramos el legacy.
        const hash = await bcrypt.hash(password, 12);
        await query(
          "UPDATE usuarios SET password_hash = ?, password_legacy = '' WHERE id = ?",
          [hash, user.id]
        );
      }
    }

    if (!valid) {
      return json(res, 401, { error: 'Email o contraseña incorrectos.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return json(res, 200, {
      token,
      user: {
        id: user.id,
        email: user.email,
        nombre_usuario: user.nombre_usuario,
        tipo: user.tipo,  // 1 = admin (Antonio), 0 = usuario
      },
    });

  } catch (err) {
    console.error('[login]', err);
    return json(res, 500, { error: 'Error interno. Inténtalo de nuevo.' });
  }
}
