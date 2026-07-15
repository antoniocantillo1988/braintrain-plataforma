// api/chat/index.js
// Usa Hugging Face Inference API (100% gratuito)
// Modelo: mistralai/Mistral-7B-Instruct-v0.3
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

  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    return json(res, 500, {
      error: 'HF_API_KEY no configurada. Pasos: 1) huggingface.co/join (cuenta gratis) 2) huggingface.co/settings/tokens 3) New token → tipo "Inferencia" 4) Copia el token y ponlo como HF_API_KEY en Vercel'
    });
  }

  try {
    // Construimos prompt con formato Mistral Instruct
    let prompt = `<s>[INST] Eres "Ori", un asistente terapéutico de orientación psicoeducativa con enfoque socrático.

REGLAS:
- Eres cálido, empático, paciente. Respondes con preguntas que invitan a reflexionar.
- NUNCA diagnosticas ni recetas.
- Empieza con validación emocional corta. Luego 1-2 preguntas. Máximo 4 oraciones.
- Todo lo que el usuario escriba se usará en terapia para conocerlo mejor.
- Responde SIEMPRE en español.

`;

    if (historial && historial.length > 0) {
      for (const msg of historial.slice(-6)) {
        const quien = msg.role === 'user' ? 'Usuario' : 'Ori';
        prompt += `${quien}: ${msg.content}\n`;
      }
    }

    prompt += `Usuario: ${mensaje.trim()}\n[/INST]\nOri:`;

    console.log('[chat] Llamando a Hugging Face...');
    const hfRes = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.3',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 300,
            temperature: 0.7,
            return_full_text: false,
          },
        }),
      }
    );

    const data = await hfRes.json();

    if (!hfRes.ok) {
      const errMsg = data?.error || `Error ${hfRes.status}`;
      console.error('[chat] HF error:', errMsg);

      if (hfRes.status === 401 || hfRes.status === 403) {
        return json(res, 502, {
          error: 'Token inválido. Ve a huggingface.co/settings/tokens, crea un token NUEVO con tipo "Inferencia" (Read).'
        });
      }
      if (hfRes.status === 503) {
        return json(res, 502, {
          error: 'Modelo descargándose (1ra vez). Espera 20s y vuelve a intentar.'
        });
      }
      return json(res, 502, { error: 'Error de la IA: ' + errMsg });
    }

    let respuesta = '';
    if (Array.isArray(data) && data[0]?.generated_text) {
      respuesta = data[0].generated_text.trim();
    } else if (data?.generated_text) {
      respuesta = data.generated_text.trim();
    }

    if (!respuesta) {
      respuesta = 'Cuéntame más sobre eso... ¿qué te hace sentir así?';
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
