// api/admin/huecos.js
const { query, json, requireAuth } = require('../_db');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  if (user.tipo !== 'admin') return json(res, 403, { error: 'Acceso denegado.' });

  // POST - crear hueco
  if (req.method === 'POST') {
    const { fecha, hora_inicio, hora_fin } = req.body || {};
    if (!fecha || !hora_inicio || !hora_fin) {
      return json(res, 400, { error: 'Fecha, hora inicio y hora fin son obligatorios.' });
    }
    try {
      await query(
        'INSERT INTO disponibilidad (fecha, hora_inicio, hora_fin) VALUES (?, ?, ?)',
        [fecha, hora_inicio, hora_fin]
      );
      return json(res, 201, { ok: true });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  // DELETE - borrar hueco libre
  if (req.method === 'DELETE') {
    const { id } = req.body || {};
    if (!id) return json(res, 400, { error: 'Falta id.' });
    try {
      await query('DELETE FROM disponibilidad WHERE id = ? AND ocupado = 0', [id]);
      return json(res, 200, { ok: true });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  return json(res, 405, { error: 'Método no permitido' });
};
