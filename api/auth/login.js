// api/auth/login.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query, json } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Método no permitido' });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return json(res, 400, { error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const rows = await query(
      'SELECT id, email, password, nombre_usuario, tipo FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return json(res, 401, { error: 'Email o contraseña incorrectos.' });
    }

    const user = rows[0];
    let valid = false;

    // Si la contraseña empieza por $2 es un hash bcrypt, si no es texto plano (legacy)
    if (user.password && user.password.startsWith('$2')) {
      valid = await bcrypt.compare(password, user.password);
    } else {
      // Contraseña en texto plano (usuarios legacy de tu BD original)
      valid = password === user.password;

      if (valid) {
        // Migramos a bcrypt automáticamente
        const hash = await bcrypt.hash(password, 12);
        await query('UPDATE usuarios SET password = ? WHERE id = ?', [hash, user.id]);
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
        tipo: user.tipo,
      },
    });

  } catch (err) {
    console.error('[login error]', err.message);
    return json(res, 500, { error: 'Error interno: ' + err.message });
  }
};
