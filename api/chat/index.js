// api/chat/index.js
// Usa Cloudflare Workers AI (gratuito: 100k requests/día, sin tarjeta)
// Modelo: Llama 3.2 3B Instruct de Meta
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

  const accountId = process.env.CF_ACCOUNT_ID;
  const apiToken = process.env.CF_API_TOKEN;
  if (!accountId || !apiToken) {
    return json(res, 500, {
      error: 'CF_ACCOUNT_ID y CF_API_TOKEN no configurados. Pasos:\n' +
        '1) Crea cuenta gratis en cloudflare.com\n' +
        '2) Ve a Workers & Pages → Workers AI\n' +
        '3) Copia tu Account ID (en la URL: /account/{ACCOUNT_ID}/workers-ai)\n' +
        '4) Ve a My Profile → API Tokens → Create Token → Workers AI → Read\n' +
        '5) Pon CF_ACCOUNT_ID y CF_API_TOKEN en Vercel'
    });
  }

  try {
    // Construimos mensajes en formato Llama Instruct
    let prompt = `<s>[INST] <<SYS>>
Eres "Ori", un asistente terapéutico de orientación psicoeducativa con enfoque socrático.

REGLAS:
- Eres cálido, empático, paciente. Respondes con preguntas que invitan a reflexionar.
- NUNCA diagnosticas ni recetas.
- Empieza con validación emocional corta. Luego 1-2 preguntas. Máximo 4 oraciones.
- Todo lo que el usuario escriba se usará en terapia para conocerlo mejor.
- Responde SIEMPRE en español.
<</SYS>>

`;

    if (historial && historial.length > 0) {
      for (const msg of historial.slice(-6)) {
        const quien = msg.role === 'user' ? 'Usuario' : 'Ori';
        prompt += `${quien}: ${msg.content}\n`;
      }
    }

    prompt += `Usuario: ${mensaje.trim()}\n[/INST]\nOri:`;

    console.log('[chat] Llamando a Cloudflare AI...');
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
          max_tokens: 300,
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

    const respuesta = data?.result?.response?.trim() || 'Cuéntame más... ¿qué te hace sentir así?';

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
