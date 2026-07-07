// api/auth/login.js
const { query, json, verifyPassword, hashPassword, createToken } = require('../_db');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  // 1. Ahora recibimos 'identificador' (que puede ser email o usuario) y 'password'
  const { identificador, password } = req.body || {};
  
  if (!identificador || !password) {
    return json(res, 400, { error: 'Usuario/Email y contraseña obligatorios.' });
  }

  try {
    // 2. Modificamos la consulta para buscar por email O por nombre_usuario
    const rows = await query(
      'SELECT id, email, password, nombre_usuario, tipo FROM usuarios WHERE email = ? OR nombre_usuario = ?',
      [identificador.toLowerCase(), identificador] // Pasamos el valor dos veces para los dos '?'
    );

    // 3. Si no encuentra a nadie con ese email ni con ese usuario
    if (rows.length === 0) {
      return json(res, 401, { error: 'Credenciales incorrectas.' });
    }

    const user = rows[0];
    
    // 4. Verificamos la contraseña
    const valid = verifyPassword(password, user.password);
    if (!valid) {
      return json(res, 401, { error: 'Credenciales incorrectas.' });
    }

    // 5. Si era texto plano, lo migramos a hash seguro (mantenemos tu lógica original)
    if (!user.password.startsWith('scrypt:')) {
      await query('UPDATE usuarios SET password = ? WHERE id = ?', [hashPassword(password), user.id]);
    }

    // 6. Creamos el token de sesión
    const token = createToken({ id: user.id, email: user.email, tipo: user.tipo });

    // 7. Devolvemos los datos correctos
    return json(res, 200, {
      token,
      user: { id: user.id, email: user.email, nombre_usuario: user.nombre_usuario, tipo: user.tipo },
    });

  } catch (err) {
    console.error('[login]', err.message);
    return json(res, 500, { error: 'Error de servidor: ' + err.message });
  }
};
