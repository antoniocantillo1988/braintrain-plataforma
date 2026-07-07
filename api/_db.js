// api/_db.js
const mysql = require('mysql2/promise');
const crypto = require('crypto'); // viene con Node.js, sin instalar nada

// ─── Base de datos ───────────────────────────────────────────
let pool;
function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      waitForConnections: true,
      connectionLimit: 5,
    });
  }
  return pool;
}

async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

// ─── Contraseñas (sin bcryptjs, usa crypto nativo) ───────────
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  // Contraseña en texto plano (usuarios legacy de la BD original)
  if (!stored.startsWith('scrypt:')) {
    return password === stored;
  }
  const [, salt, hash] = stored.split(':');
  const hashVerify = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === hashVerify;
}

// ─── Tokens JWT casero (sin jsonwebtoken, usa crypto nativo) ──
function createToken(payload) {
  const secret = process.env.JWT_SECRET;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({
    ...payload,
    exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 // 7 días
  })).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

function verifyToken(req) {
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

function requireAuth(req, res) {
  const user = verifyToken(req);
  if (!user) {
    res.status(401).json({ error: 'No autenticado. Inicia sesión.' });
    return null;
  }
  return user;
}

function json(res, status, data) {
  res.status(status).json(data);
}

module.exports = { query, json, hashPassword, verifyPassword, createToken, verifyToken, requireAuth };
