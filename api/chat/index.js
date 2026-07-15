// api/chat/index.js
// Usa Cloudflare Workers AI (gratuito: 100k requests/día)
import { query, json, requireAuth } from '../_db.js';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return json(res, 401, { error: 'No autenticado. Inicia sesión.' });
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  const { mensaje, historial } = req.body || {};
  if (!mensaje || !mensaje.trim()) {
    return json(res, 400, { error: 'El mensaje no puede estar vacío.' });
  }

  // Obtenemos el nombre real del usuario desde BD
  let nombreUsuario = 'Usuario';
  try {
    const rows = await query('SELECT nombre_usuario FROM usuarios WHERE id = ?', [user.id]);
    if (rows.length > 0 && rows[0].nombre_usuario) {
      nombreUsuario = rows[0].nombre_usuario;
    }
  } catch (dbErr) {
    console.error('[chat] Error obteniendo nombre:', dbErr.message);
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
    return json(res, 500, {
      error: 'CF_ACCOUNT_ID y CF_API_TOKEN no configurados.'
    });
  }

  try {
    // Nuevo prompt ultra-estricto para respuestas cortas y sin repeticiones
    let prompt = `<s>[INST] <<SYS>>
Eres "Ori", un asistente terapéutico de orientación psicoeducativa con enfoque socrático.

REGLAS ESTRICTAS (CÚMPLELAS SIEMPRE):
1. MÁXIMO 2 ORACIONES por respuesta. Una de validación + una pregunta.
2. NUNCA repitas el mensaje del usuario ni el historial.
3. NUNCA uses más de 30 palabras.
4. NUNCA diagnosticas ni recetas.
5. Siempre en español, tono cálido y cercano.
Ejemplo bueno: "Entiendo cómo te sientes. ¿Qué crees que te llevó a pensar así?"
<</SYS>>

`;

    // Pasamos el historial SIN etiquetas "Usuario:" — solo el contenido
    // para que el modelo no los repita
    if (historial && historial.length > 0) {
      // Solo los últimos 4 intercambios para mantenerlo corto
      const ultimos = historial.slice(-4);
      for (const msg of ultimos) {
        prompt += `${msg.content}\n`;
      }
    }

    // Último mensaje del usuario con su nombre real
    prompt += `${nombreUsuario}: ${mensaje.trim()}\n[/INST]\nOri:`;

    console.log('[chat] Llamando a Cloudflare AI. Usuario:', nombreUsuario);
    const resAPI = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-3b-instruct`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          max_tokens: 150,
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

    // Limpiar posibles repeticiones del prompt en la respuesta
    if (historial && historial.length > 0) {
      for (const msg of historial) {
        respuesta = respuesta.replace(msg.content, '').trim();
      }
    }
    // Quitar "Ori:" si el modelo lo incluye
    respuesta = respuesta.replace(/^Ori:\s*/i, '');
    // Quitar el nombre del usuario si aparece
    respuesta = respuesta.replace(new RegExp(`${nombreUsuario}:\\s*`, 'gi'), '');

    if (!respuesta) {
      respuesta = 'Cuéntame más sobre eso...';
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
