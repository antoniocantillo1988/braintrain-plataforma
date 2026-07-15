// api/chat/index.js
// Usa DeepSeek API (gratuito, 500 requests/día, funciona en Vercel)
// Formato compatible con OpenAI, solo cambia base URL y modelo
import { query, json, requireAuth } from '../_db.js';

export default async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return json(res, 401, { error: 'No autenticado. Inicia sesión.' });
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  const { mensaje, historial } = req.body || {};
  if (!mensaje || !mensaje.trim()) {
    return json(res, 400, { error: 'El mensaje no puede estar vacío.' });
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

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return json(res, 500, {
      error: 'DEEPSEEK_API_KEY no configurada. Pasos:\n' +
        '1) Ve a https://platform.deepseek.com/ y crea cuenta (gratis)\n' +
        '2) Ve a API Keys → "Create API key"\n' +
        '3) Copia la key y ponla como DEEPSEEK_API_KEY en Vercel'
    });
  }

  try {
    const messages = [
      {
        role: 'system',
        content: `Eres "Ori", un asistente terapéutico de orientación psicoeducativa con enfoque socrático.

REGLAS:
- Eres cálido, empático, paciente. Respondes con preguntas que invitan a reflexionar.
- NUNCA diagnosticas ni recetas.
- Empieza con validación emocional corta. Luego 1-2 preguntas. Máximo 4 oraciones.
- Todo lo que el usuario escriba se usará en terapia para conocerlo mejor.
- Responde SIEMPRE en español.`
      },
      ...(historial || []).slice(-10),
      { role: 'user', content: mensaje.trim() }
    ];

    console.log('[chat] Llamando a DeepSeek...');
    const resAPI = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!resAPI.ok) {
      let errMsg = `Error ${resAPI.status}`;
      try { const d = await resAPI.json(); errMsg = d.error?.message || errMsg; } catch {}
      console.error('[chat] DeepSeek error:', errMsg);
      return json(res, 502, { error: 'Error de la IA: ' + errMsg });
    }

    const data = await resAPI.json();
    const respuesta = data?.choices?.[0]?.message?.content?.trim() || 'Cuéntame más... ¿qué te hace sentir así?';

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
