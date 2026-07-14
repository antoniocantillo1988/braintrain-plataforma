// api/citas/cancelar.js
const { query, json, requireAuth } = require('../_db');
const { cancelarEventoCalendar } = require('../_calendar');

module.exports = async function handler(req, res) {
  // 1. Verificamos autenticación
  const user = requireAuth(req, res);
  if (!user) return;
  
  // 2. Verificamos método
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Método no permitido' });
  }

  const { cita_id } = req.body || {};
  if (!cita_id) {
    return json(res, 400, { error: 'Falta el ID de la cita.' });
  }

  try {
    // 3. Buscamos la cita, incluyendo el ID del evento de Google
    const citas = await query(
      'SELECT disponibilidad_id, google_evento_id FROM citas WHERE id = ? AND usuario_id = ? AND estado = "confirmada"',
      [cita_id, user.id]
    );
    
    if (citas.length === 0) {
      return json(res, 404, { error: 'Cita no encontrada o ya está cancelada.' });
    }

    const { disponibilidad_id, google_evento_id } = citas[0];

    // 4. Intentamos cancelar en Google Calendar si existe el ID
    if (google_evento_id) {
      try {
        await cancelarEventoCalendar(google_evento_id);
      } catch (googleErr) {
        console.error('[cancelar] Error al borrar de Google:', googleErr.message);
        // Continuamos aunque falle el borrado en Google, para no bloquear la BD
      }
    }

    // 5. Liberamos el hueco de disponibilidad
    await query('UPDATE disponibilidad SET ocupado = 0 WHERE id = ?', [disponibilidad_id]);

    // 6. Marcamos la cita como cancelada en nuestra base de datos
    await query('UPDATE citas SET estado = "cancelada" WHERE id = ?', [cita_id]);

    return json(res, 200, { mensaje: 'Cita cancelada correctamente.' });

  } catch (err) {
    console.error('[cancelar]', err.message);
    return json(res, 500, { error: 'Error al cancelar la cita: ' + err.message });
  }
};