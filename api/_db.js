// api/_db.js
// Conexión compartida a MySQL (awardspace)
// Los archivos con _ delante son ignorados por Vercel como rutas.

import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 5,      // awardspace limita conexiones simultáneas
      queueLimit: 0,
      ssl: false,               // awardspace no requiere SSL en plan gratuito
    });
  }
  return pool;
}

// Ejecutar una query con parámetros de forma segura (evita SQL injection)
export async function query(sql, params = []) {
  const pool = getPool();
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Respuesta JSON estandarizada para las funciones API
export function json(res, status, data) {
  res.status(status).json(data);
}

// Middleware: extrae y verifica el JWT del header Authorization
import jwt from 'jsonwebtoken';

export function verifyToken(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
    return null;
  }
  return user;
}
