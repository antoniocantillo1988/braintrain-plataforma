// api/chat/index.js
// Usa Google Gemini API (gratuito, 60 req/min, no requiere tarjeta)
import { query, json, requireAuth } from '../_db.js';

const SYSTEM_PROMPT = `Eres "Ori", un asistente terapéutico de orientación psicoeducativa con enfoque socrático.

PERSONALIDAD:
- Eres cálido, empático, paciente. Usas lenguaje cercano de terapeuta infantil.
- Respondes con preguntas socráticas que invitan a la reflexión, no con respuestas directas.
- Tu objetivo es que la persona llegue a sus propias conclusiones.
- NUNCA diagnosticas, NUNCA recetas, NUNCA tratas condiciones médicas.
- Si hay ideas de autolesión, ofrece recursos profesionales.

ESTRUCTURA:
- Empieza con validación emocional corta.
- Luego 1-2 preguntas que guíen la reflexión.
- Máximo 4 oraciones. Sé conciso.
- Usa metáforas simples si es adecuado.

IMPORTANTE: Todo lo que el usuario escriba se usará en terapia para conocerlo mejor.
IDIOMA: Siempre español.`;

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return json(res, 500, { error: 'GEMINI_API_KEY no configurada. Obtén una gratis en https://aistudio.google.com/apikey' });
  }

  try {
    // Construimos historial en formato Gemini
    const contents = [];
    contents.push({ role: 'user', parts: [{ text: SYSTEM_PROMPT }] });
    contents.push({ role: 'model', parts: [{ text: 'Entendido. Actuaré como Ori, el asistente terapéutico socrático.' }] });

    // Añadimos historial previo si existe
    if (historial && historial.length > 0) {
      for (const msg of historial.slice(-10)) {
        if (msg.role === 'user' || msg.role === 'assistant') {
          contents.push({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          });
        }
      }
    }

    // Mensaje actual del usuario
    contents.push({ role: 'user', parts: [{ text: mensaje.trim() }] });

    console.log('[chat] Llamando a Gemini API...');
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
          },
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      const errMsg = data?.error?.message || `Error ${geminiRes.status}`;
      console.error('[chat] Gemini error:', errMsg);
      return json(res, 502, { error: 'Error de la IA: ' + errMsg });
    }

    const respuesta = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude procesar eso.';

    // Guardamos respuesta en BD si podemos
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
