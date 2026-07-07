// api/auth/login.js
const { query, json, verifyPassword, hashPassword, createToken } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  const { email, password } = req.body || {};
  if (!email || !password) return json(res, 400, { error: 'Email y contraseña obligatorios.' });

  try {
    const rows = await query(
      'SELECT id, email, password, nombre_usuario, tipo FROM usuarios WHERE email = ?',
      [email.toLowerCase()]
    );

    if (rows.length === 0) return json(res, 401, { error: 'Email o contraseña incorrectos.' });

    const user = rows[0];
    const valid = verifyPassword(password, user.password);
    if (!valid) return json(res, 401, { error: 'Email o contraseña incorrectos.' });

    // Si era texto plano, lo migramos a hash seguro
    if (!user.password.startsWith('scrypt:')) {
      await query('UPDATE usuarios SET password = ? WHERE id = ?', [hashPassword(password), user.id]);
    }

    const token = createToken({ id: user.id, email: user.email, tipo: user.tipo });

    return json(res, 200, {
      token,
      user: { id: user.id, email: user.email, nombre_usuario: user.nombre_usuario, tipo: user.tipo },
    });

  } catch (err) {
    console.error('[login]', err.message);
    return json(res, 500, { error: 'Error de servidor: ' + err.message });
  }
};
