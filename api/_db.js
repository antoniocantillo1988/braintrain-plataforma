// api/_db.js
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ─── Base de datos ───────────────────────────────────────────
let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '4000'),
      database: process.env.DB_DATABASE || process.env.DB_NAME || 'test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
      },
      waitForConnections: true,
      connectionLimit: 5,
      dateStrings: true,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// ─── Contraseñas ───────────
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored.startsWith('scrypt:')) {
    return password === stored;
  }
  const [, salt, hash] = stored.split(':');
  const hashVerify = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === hashVerify;
}

// ─── Tokens JWT ──
export function createToken(payload) {
  // Se usa la librería estándar para crear tokens de forma robusta.
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // La expiración se maneja automáticamente.
  );
}

export function verifyToken(req) {
  try {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return null;

    const token = auth.slice(7);

    // Se usa la librería estándar que gestiona firma, expiración y errores.
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return payload;
  } catch (err) {
    // jwt.verify lanza una excepción si el token es inválido o ha expirado.
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

export function json(res, status, data) {
  res.status(status).json(data);
}