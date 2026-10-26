// Test local de las funciones serverless admin (simula Vercel)
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.DB_HOST = 'gateway01.eu-central-1.prod.aws.tidbcloud.com';
process.env.DB_PORT = '4000';
process.env.DB_USER = '2jEqLDdEE141aUh.root';
process.env.DB_PASSWORD = 'iNPpLxNNJ9zvEqTb';
process.env.DB_DATABASE = 'test';

import jwt from 'jsonwebtoken';

function mockRes() {
  let statusCode = null, body = null;
  return {
    get status() { return statusCode; },
    get body() { return body; },
    status(s) { statusCode = s; return this; },
    json(d) { body = d; return this; },
  };
}

async function call(handler, method, body, token) {
  const req = {
    method,
    body,
    headers: token ? { authorization: `Bearer ${token}` } : {},
  };
  const res = mockRes();
  await handler(req, res);
  return { status: res.status, body: res.body };
}

const { default: huecos } = await import('./api/admin/huecos.js');
const { default: usuarios } = await import('./api/admin/usuarios.js');
const { query } = await import('./api/_db.js');

// Buscar un admin real en la BD
const admins = await query('SELECT id, email, tipo FROM usuarios WHERE tipo = 1 LIMIT 1');
console.log('ADMIN EN BD:', admins);
if (!admins.length) {
  console.log('No hay ningún usuario tipo 1 (admin) en la BD — por eso la pestaña de usuarios puede fallar.');
  process.exit(0);
}
const token = jwt.sign({ id: admins[0].id, email: admins[0].email, tipo: 1 }, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('\n--- GET /admin/usuarios ---');
console.log(await call(usuarios, 'GET', null, token));

console.log('\n--- POST /admin/huecos (prueba) ---');
console.log(await call(huecos, 'POST', { fecha: '2030-01-01', hora_inicio: '10:00', hora_fin: '11:00', modalidad: 'online' }, token));

// Limpiar el hueco de prueba
await query("DELETE FROM disponibilidad WHERE fecha = '2030-01-01'");

console.log('\n--- GET /admin/citas ---');
const { default: citas } = await import('./api/admin/citas.js');
console.log(await call(citas, 'GET', null, token));

process.exit(0);
