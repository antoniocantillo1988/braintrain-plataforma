// api/chat/historial.js
import { query, json, requireAuth } from '../_db.js';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return json(res, 401, { error: 'No autenticado.' });
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido' });

  try {
    const [conversacion] = await query(
      'SELECT id FROM conversaciones_chat WHERE usuario_id = ? ORDER BY id DESC LIMIT 1',
      [user.id]
    );

    if (!conversacion) {
      return json(res, 200, { mensajes: [] });
    }

    const mensajes = await query(
      'SELECT id, autor, texto, creado_en FROM mensajes_chat WHERE conversacion_id = ? ORDER BY id ASC',
      [conversacion.id]
    );

    return json(res, 200, { mensajes, conversacion_id: conversacion.id });
  } catch (err) {
    console.error('[historial]', err.message);
    return json(res, 500, { error: err.message });
  }
}
