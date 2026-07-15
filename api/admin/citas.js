// api/admin/citas.js
import { query, json, requireAuth } from '../_db.js';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;

  // Solo admin
  if (user.tipo !== 1) return json(res, 403, { error: 'Acceso denegado.' });

  // GET - listar todas las citas
  if (req.method === 'GET') {
    try {
      const citas = await query(
        `SELECT c.*, d.fecha, d.hora_inicio, d.hora_fin,
                u.nombre_usuario, u.email
         FROM citas c
         JOIN disponibilidad d ON c.disponibilidad_id = d.id
         JOIN usuarios u ON c.usuario_id = u.id
         ORDER BY d.fecha ASC, d.hora_inicio ASC`
      );
      return json(res, 200, { citas });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  // PUT - confirmar cita con enlace
  if (req.method === 'PUT') {
    const { cita_id, enlace_videollamada, estado } = req.body || {};
    if (!cita_id) return json(res, 400, { error: 'Falta cita_id.' });
    try {
      await query(
        'UPDATE citas SET estado = ?, enlace_videollamada = ? WHERE id = ?',
        [estado || 'confirmada', enlace_videollamada || '', cita_id]
      );
      return json(res, 200, { ok: true });
    } catch (err) {
      return json(res, 500, { error: err.message });
    }
  }

  return json(res, 405, { error: 'Método no permitido' });
};
