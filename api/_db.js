// api/_db.js
import mysql from 'mysql2/promise';
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
  const secret = process.env.JWT_SECRET;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

export function verifyToken(req) {
  try {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const token = auth.slice(7);
    const [header, body, sig] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', process.env.JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');
    if (sig !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
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

export function json(res, status, data) {
  res.status(status).json(data);
}