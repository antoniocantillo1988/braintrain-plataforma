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
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_DATABASE || process.env.DB_NAME || 'test',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // Se pasa la configuración SSL como un string JSON para máxima compatibilidad en Vercel.
      ssl: { rejectUnauthorized: true },
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
// Se revierte a la versión síncrona para solucionar el error 'FUNCTION_INVOCATION_FAILED'.
// Esto es más estable en algunos entornos de Vercel, aunque menos performante.
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt:')) {
    // Si no hay hash o el formato es incorrecto, no se puede verificar.
    return false;
  }
  const [, salt, hash] = stored.split(':');
  const hashToCompare = Buffer.from(hash, 'hex');
  // Usamos la versión síncrona.
  const derivedKey = crypto.scryptSync(password, salt, 64);

  // Comparamos los hashes de forma segura para prevenir ataques de temporización.
  // Nos aseguramos de que los buffers tengan la misma longitud.
  if (hashToCompare.length !== derivedKey.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashToCompare, derivedKey);
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

// Esta función ahora solo verifica el token y devuelve el payload o null.
// Ya no envía una respuesta HTTP, eliminando efectos secundarios.
export function requireAuth(req, res) {
  const user = verifyToken(req);
  return user;
}

export function json(res, status, data) {
  res.status(status).json(data);
}

// Verifica el token Y comprueba en la BD que el usuario sigue siendo administrador
// (tipo = 1). Si no lo es, responde 401/403 por sí misma y devuelve null.
export async function requireAdmin(req, res) {
  const payload = verifyToken(req);
  if (!payload) {
    json(res, 401, { error: 'No autenticado. Inicia sesión.' });
    return null;
  }
  const rows = await query('SELECT id, tipo FROM usuarios WHERE id = ?', [payload.id]);
  if (rows.length === 0 || Number(rows[0].tipo) !== 1) {
    json(res, 403, { error: 'Acceso denegado.' });
    return null;
  }
  return { id: rows[0].id, tipo: 1 };
}
