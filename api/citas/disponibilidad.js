// api/citas/disponibilidad.js
import { query, json } from '../_db.js'; // Eliminamos requireAuth

export default async function handler(req, res) {
  // Eliminamos la validación de usuario, ya que queremos que sea público
  if (req.method !== 'GET') return json(res, 405, { error: 'Método no permitido' });

  try {
    const hoy = new Date().toISOString().split('T')[0];
    const huecos = await query(
      'SELECT * FROM disponibilidad WHERE ocupado = 0 AND fecha >= ? ORDER BY fecha, hora_inicio',
      [hoy]
    );
    return json(res, 200, { huecos });
  } catch (err) {
    console.error('[disponibilidad]', err.message);
    return json(res, 500, { error: err.message });
  }
};
