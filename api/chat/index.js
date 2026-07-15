// api/chat/index.js
import { query, json, requireAuth } from '../_db.js';

export default async function handler(req, res) {
  // Solo usuarios autenticados
  const user = requireAuth(req, res);
  if (!user) return json(res, 401, { error: 'No autenticado. Inicia sesión.' });
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  const { mensaje, historial } = req.body || {};
  if (!mensaje || !mensaje.trim()) {
    return json(res, 400, { error: 'El mensaje no puede estar vacío.' });
  }

  try {
    // 1. Guardamos el mensaje del usuario en BD
    // Buscamos o creamos la conversación del usuario
    let [conversacion] = await query(
      'SELECT id FROM conversaciones_chat WHERE usuario_id = ? ORDER BY id DESC LIMIT 1',
      [user.id]
    );

    let conversacion_id;
    if (!conversacion) {
      const result = await query(
        'INSERT INTO conversaciones_chat (usuario_id, estado) VALUES (?, "abierta")',
        [user.id]
      );
      conversacion_id = result.insertId;
    } else {
      conversacion_id = conversacion.id;
    }

    // Guardamos mensaje del usuario
    await query(
      'INSERT INTO mensajes_chat (conversacion_id, autor, texto) VALUES (?, "usuario", ?)',
      [conversacion_id, mensaje.trim()]
    );

    // 2. Construimos el prompt socrático con el historial
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json(res, 500, { error: 'OPENAI_API_KEY no configurada en Vercel.' });
    }

    const messages = [
      {
        role: 'system',
        content: `Eres "Ori", un asistente terapéutico de orientación psicoeducativa con enfoque socrático. Tus características:

PERSONALIDAD:
- Eres cálido, empático, paciente y uses un lenguaje cercano como un terapeuta infantil.
- Respondes con preguntas socráticas que invitan a la reflexión, no con respuestas directas.
- Tu objetivo es que la persona llegue a sus propias conclusiones.
- Usas un tono amable, tranquilizador, con metáforas sencillas cuando sea útil.
- NUNCA diagnosticas, NUNCA recetas, NUNCA tratas condiciones médicas.
- Si el usuario expresa ideas de autolesión o peligro, responde con recursos de ayuda profesional (línea de crisis) pero manteniendo el tono.

ESTRUCTURA DE RESPUESTA:
- Empieza con una frase corta de validación emocional.
- Luego haz 1 o 2 preguntas que guíen la reflexión.
- Máximo 4 oraciones. Sé conciso.
- Usa un lenguaje metafórico simple cuando sea adecuado (ej: "imagina que tus pensamientos son nubes que pasan...").

IMPORTANTE: Recuerda que todo lo que el usuario escriba será utilizado en terapia para conocerlo mejor. No uses esa frase textualmente, pero tenlo presente para hacer preguntas significativas.

IDIOMA: Responde siempre en español, adaptándote al nivel del usuario.`
      },
      ...(historial || []).slice(-20), // últimos 20 mensajes de contexto
      { role: 'user', content: mensaje.trim() }
    ];

    // 3. Llamamos a OpenAI
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('[chat] OpenAI error:', openaiRes.status, errText);
      let mensajeError = 'Error al contactar con la IA.';
      if (openaiRes.status === 401) {
        mensajeError = 'La API Key de OpenAI no es válida. Revisa OPENAI_API_KEY en Vercel.';
      } else if (openaiRes.status === 429) {
        mensajeError = 'La IA está sobrecargada. Espera un momento y vuelve a intentarlo.';
      } else if (errText) {
        try {
          const parsed = JSON.parse(errText);
          mensajeError = parsed.error?.message || mensajeError;
        } catch {}
      }
      return json(res, 502, { error: mensajeError });
    }

    const data = await openaiRes.json();
    const respuesta = data.choices?.[0]?.message?.content || 'Lo siento, no pude procesar eso.';

    // 4. Guardamos la respuesta en BD
    await query(
      'INSERT INTO mensajes_chat (conversacion_id, autor, texto) VALUES (?, "ia", ?)',
      [conversacion_id, respuesta]
    );

    return json(res, 200, {
      respuesta,
      conversacion_id,
    });

  } catch (err) {
    console.error('[chat]', err.message);
    return json(res, 500, { error: 'Error del servidor: ' + err.message });
  }
}
