// api/auth/login.js
import { query, json, verifyPassword, hashPassword, createToken } from '../_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  // 1. Recibimos 'identificador' (email o usuario) y 'password'
  const { identificador, password } = req.body || {};
  
  if (!identificador || !password) {
    return json(res, 400, { error: 'Usuario/Email y contraseña obligatorios.' });
  }

  try {
    // 2. Buscamos por email O por nombre_usuario
    const rows = await query(
      'SELECT id, email, password_legacy, nombre_usuario, tipo FROM usuarios WHERE email = ? OR nombre_usuario = ?',
      [identificador.toLowerCase(), identificador] 
    );

    // 3. Verificamos si existe el usuario
    if (rows.length === 0) {
      return json(res, 401, { error: 'Credenciales incorrectas.' });
    }

    const user = rows[0];
    
    // 4. Verificamos la contraseña
    const valid = verifyPassword(password, user.password_legacy);
    if (!valid) {
      return json(res, 401, { error: 'Credenciales incorrectas.' });
    }

    // 5. Migración a hash seguro si es necesario
    if (!user.password_legacy.startsWith('scrypt:')) {
      await query('UPDATE usuarios SET password_legacy = ? WHERE id = ?', [hashPassword(password), user.id]);
    }

    // 6. Creamos el token
    const token = createToken({ id: user.id, email: user.email, tipo: user.tipo });

    // 7. Respuesta exitosa
    return json(res, 200, {
      token,
      user: { id: user.id, email: user.email, nombre_usuario: user.nombre_usuario, tipo: user.tipo },
    });

  } catch (err) {
    console.error('[login]', err.message);
    return json(res, 500, { error: 'Error de servidor: ' + err.message });
  }
}
