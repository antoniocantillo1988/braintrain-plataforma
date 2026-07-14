// api/citas/cancelar.js
const { query, json, requireAuth } = require('../_db');

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  const { cita_id } = req.body || {};
  if (!cita_id) return json(res, 400, { error: 'Falta el ID de la cita.' });

  try {
    // 1. Buscamos la cita para saber qué hueco de disponibilidad tenemos que liberar
    const citas = await query(
      'SELECT disponibilidad_id FROM citas WHERE id = ? AND usuario_id = ? AND estado = "confirmada"',
      [cita_id, user.id]
    );
    
    if (citas.length === 0) {
      return json(res, 404, { error: 'Cita no encontrada o ya está cancelada.' });
    }

    const disp_id = citas[0].disponibilidad_id;

    // 2. Liberamos el hueco en el calendario
    await query('UPDATE disponibilidad SET ocupado = 0 WHERE id = ?', [disp_id]);

    // 3. Marcamos la cita como cancelada
    await query('UPDATE citas SET estado = "cancelada" WHERE id = ?', [cita_id]);

    return json(res, 200, { mensaje: 'Cita cancelada correctamente.' });

  } catch (err) {
    console.error('[cancelar]', err.message);
    return json(res, 500, { error: 'Error al cancelar la cita: ' + err.message });
  }
};