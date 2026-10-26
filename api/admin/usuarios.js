// api/admin/usuarios.js
// Gestión de usuarios (solo administradores, tipo = 1)
import { query, json, requireAdmin } from '../_db.js';

export default async function handler(req, res) {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    // GET - listar usuarios
    if (req.method === 'GET') {
      const usuarios = await query(
        'SELECT id, email, nombre_usuario, tipo FROM usuarios ORDER BY tipo DESC, nombre_usuario ASC'
      );
      return json(res, 200, { usuarios });
    }

    // PUT - editar nombre y/o rol
    if (req.method === 'PUT') {
      const { id, nombre_usuario, tipo } = req.body || {};
      if (!id) return json(res, 400, { error: 'Falta id.' });

      const [usuario] = await query('SELECT id, nombre_usuario, tipo FROM usuarios WHERE id = ?', [id]);
      if (!usuario) return json(res, 404, { error: 'Usuario no encontrado.' });

      const nuevoTipo = tipo === undefined ? Number(usuario.tipo) : Number(tipo);
      if (![0, 1].includes(nuevoTipo)) return json(res, 400, { error: 'Tipo no válido.' });
      if (Number(id) === admin.id && nuevoTipo !== 1) {
        return json(res, 400, { error: 'No puedes quitarte a ti mismo el rol de administrador.' });
      }
      const nuevoNombre = (nombre_usuario ?? usuario.nombre_usuario ?? '').toString().trim();
      if (!nuevoNombre) return json(res, 400, { error: 'El nombre no puede estar vacío.' });

      await query('UPDATE usuarios SET nombre_usuario = ?, tipo = ? WHERE id = ?', [
        nuevoNombre,
        nuevoTipo,
        id,
      ]);
      return json(res, 200, { ok: true });
    }

    // DELETE - eliminar usuario y sus datos asociados
    if (req.method === 'DELETE') {
      const { id } = req.body || {};
      if (!id) return json(res, 400, { error: 'Falta id.' });
      if (Number(id) === admin.id) {
        return json(res, 400, { error: 'No puedes eliminar tu propia cuenta.' });
      }

      // Liberar los huecos de sus citas activas
      await query(
        `UPDATE disponibilidad SET ocupado = 0
         WHERE id IN (SELECT disponibilidad_id FROM citas WHERE usuario_id = ? AND estado <> 'cancelada')`,
        [id]
      );
      await query('DELETE FROM citas WHERE usuario_id = ?', [id]);
      await query(
        'DELETE FROM mensajes_chat WHERE conversacion_id IN (SELECT id FROM conversaciones_chat WHERE usuario_id = ?)',
        [id]
      );
      await query('DELETE FROM conversaciones_chat WHERE usuario_id = ?', [id]);
      await query('DELETE FROM usuarios WHERE id = ?', [id]);
      return json(res, 200, { ok: true });
    }

    return json(res, 405, { error: 'Método no permitido' });
  } catch (err) {
    console.error('[admin/usuarios]', err.message);
    return json(res, 500, { error: err.message });
  }
}
