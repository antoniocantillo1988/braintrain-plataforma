// api/_db.js
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

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

const scryptAsync = promisify(scrypt);

// ─── Contraseñas ───────────
// Usamos la versión asíncrona de scrypt para no bloquear el event loop,
// lo que es crítico en entornos serverless como Vercel.
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scryptAsync(password, salt, 64)).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt:')) {
    // Si no hay hash o el formato es incorrecto, no se puede verificar.
    return false;
  }
  const [, salt, hash] = stored.split(':');
  const hashToCompare = Buffer.from(hash, 'hex');
  const derivedKey = (await scryptAsync(password, salt, 64));

  // Comparamos los hashes de forma segura para prevenir ataques de temporización.
  // Nos aseguramos de que los buffers tengan la misma longitud.
  if (hashToCompare.length !== derivedKey.length) {
    return false;
  }
  return timingSafeEqual(hashToCompare, derivedKey);
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