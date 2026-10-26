// api/admin/huecos.js
import { query, json, requireAdmin } from '../_db.js';

export default async function handler(req, res) {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return; // requireAdmin ya ha respondido (401/403)

    // POST - crear hueco
    if (req.method === 'POST') {
      const { fecha, hora_inicio, hora_fin, modalidad } = req.body || {};
      if (!fecha || !hora_inicio || !hora_fin) {
        return json(res, 400, { error: 'Fecha, hora inicio y hora fin son obligatorios.' });
      }
      if (hora_fin <= hora_inicio) {
        return json(res, 400, { error: 'La hora de fin debe ser posterior a la de inicio.' });
      }
      // CORREGIDO: 4 columnas → 4 marcadores (antes había solo 3 "?" y daba error SQL)
      await query(
        'INSERT INTO disponibilidad (fecha, hora_inicio, hora_fin, modalidad) VALUES (?, ?, ?, ?)',
        [fecha, hora_inicio, hora_fin, modalidad === 'online' ? 'online' : 'presencial']
      );
      return json(res, 201, { ok: true });
    }

    // DELETE - borrar hueco libre
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return json(res, 400, { error: 'Falta id.' });
      await query('DELETE FROM disponibilidad WHERE id = ? AND ocupado = 0', [id]);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: 'Método no permitido' });
  } catch (err) {
    console.error('[admin/huecos]', err.message);
    return json(res, 500, { error: err.message });
  }
}
