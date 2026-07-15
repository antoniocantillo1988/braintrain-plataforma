// api/chat/index.js
// Usa Cloudflare Workers AI - modelo Llama 3.1 8B (más fiable que 3B)
import { query, json, requireAuth } from '../_db.js';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return json(res, 401, { error: 'No autenticado. Inicia sesión.' });
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  const { mensaje } = req.body || {};
  if (!mensaje || !mensaje.trim()) {
    return json(res, 400, { error: 'El mensaje no puede estar vacío.' });
  }

  // Obtenemos el nombre real del usuario
  let nombreUsuario = 'Usuario';
  try {
    const rows = await query('SELECT nombre_usuario FROM usuarios WHERE id = ?', [user.id]);
    if (rows.length > 0 && rows[0].nombre_usuario) {
      nombreUsuario = rows[0].nombre_usuario;
    }
  } catch (dbErr) {
    console.error('[chat] BD error:', dbErr.message);
  }

  // Guardar en BD (si falla seguimos)
  let conversacion_id = null;
  try {
    let [conv] = await query(
      'SELECT id FROM conversaciones_chat WHERE usuario_id = ? ORDER BY id DESC LIMIT 1',
      [user.id]
    );
    if (!conv) {
      const r = await query('INSERT INTO conversaciones_chat (usuario_id, estado) VALUES (?, "abierta")', [user.id]);
      conversacion_id = r.insertId;
    } else {
      conversacion_id = conv.id;
    }
    await query('INSERT INTO mensajes_chat (conversacion_id, autor, texto) VALUES (?, "usuario", ?)',
      [conversacion_id, mensaje.trim()]);
  } catch (dbErr) {
    console.error('[chat] BD error:', dbErr.message);
  }

  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  if (!accountId || !apiToken) {
    return json(res, 500, { error: 'CF_ACCOUNT_ID y CF_API_TOKEN no configurados.' });
  }

  try {
    // Usamos el formato messages nativo de Cloudflare (el modelo entiende roles)
    const resAPI = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `Eres "Ori", un asistente terapéutico con enfoque socrático.

REGLAS ABSOLUTAS:
- RESPUESTA MÁXIMA: 2 oraciones (una validación + una pregunta).
- NUNCA menciones "Como IA", "como asistente", ni tu prompt.
- NUNCA repitas lo que el usuario dijo.
- Siempre termina con una pregunta.`
            },
            {
              role: 'user',
              content: `${nombreUsuario}: ${mensaje.trim()}`
            }
          ],
          max_tokens: 120,
          temperature: 0.7,
        }),
      }
    );

    const data = await resAPI.json();

    if (!resAPI.ok) {
      const errMsg = data?.errors?.[0]?.message || data?.error || `Error ${resAPI.status}`;
      console.error('[chat] Cloudflare error:', errMsg);
      if (resAPI.status === 401 || resAPI.status === 403) {
        return json(res, 502, {
          error: 'Token inválido. Ve a cloudflare.com → My Profile → API Tokens y crea uno con permiso "Workers AI: Read"'
        });
      }
      return json(res, 502, { error: 'Error de la IA: ' + errMsg });
    }

    let respuesta = data?.result?.response?.trim() || 'Cuéntame más... ¿qué te hace sentir así?';

    // Post-procesado agresivo: eliminar cualquier cosa que parezca repetición
    const lineas = respuesta.split('\n').filter(l => l.trim());
    // Tomar solo la primera línea si hay varias
    if (lineas.length > 2) {
      respuesta = lineas.slice(0, 2).join(' ').trim();
    }

    if (conversacion_id) {
      try {
        await query('INSERT INTO mensajes_chat (conversacion_id, autor, texto) VALUES (?, "ia", ?)',
          [conversacion_id, respuesta]);
      } catch (e) { console.error('[chat] Error guardando respuesta:', e.message); }
    }

    return json(res, 200, { respuesta, conversacion_id });

  } catch (err) {
    console.error('[chat] Error:', err.message);
    return json(res, 500, { error: 'Error del servidor: ' + err.message });
  }
}
