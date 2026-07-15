// api/citas/reservar.js
import { query, json, requireAuth } from '../_db.js';
import { crearEventoCalendar } from '../_calendar.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // --- BLOQUE DE DEPURACIÓN DE JWT ---
  // Este bloque es para diagnosticar el error 401 en Vercel.
  // Reemplaza temporalmente a `requireAuth` con una verificación manual y logs detallados.
  console.log('[reservar DEBUG] Iniciando verificación de autenticación.');
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('[reservar DEBUG] Cabecera de autorización no encontrada o con formato incorrecto.');
    return json(res, 401, { error: 'Authentication header missing or malformed.' });
  }

  const token = authHeader.split(' ')[1];
  console.log(`[reservar DEBUG] Token recibido (primeros 20 chars): ${token.substring(0, 20)}...`);
  console.log(`[reservar DEBUG] ¿Está la variable de entorno JWT_SECRET disponible? ${!!process.env.JWT_SECRET}`);

  let user;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('[reservar DEBUG] Verificación de JWT exitosa. Usuario:', user);
  } catch (err) {
    console.error('[reservar DEBUG] ¡FALLO en la verificación de JWT!', err.name, err.message);
    return json(res, 401, { error: `JWT Verification Failed: ${err.message}` });
  }
  // --- FIN DEL BLOQUE DE DEPURACIÓN ---

  if (!user) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  const { disponibilidad_id, motivo_consulta } = req.body || {};
  if (!disponibilidad_id) return json(res, 400, { error: 'Falta el hueco seleccionado.' });

  let google_evento_id_creado = null; // Variable para rastrear el evento de Google

  try {
    // Comprobamos que el hueco sigue libre
    const huecos = await query(
      'SELECT * FROM disponibilidad WHERE id = ? AND ocupado = 0',
      [disponibilidad_id]
    );
    if (huecos.length === 0) {
      return json(res, 409, { error: 'Este hueco ya no está disponible.' });
    }
    const hueco = huecos[0];

    // --- NUEVA VALIDACIÓN: Mínimo 2 horas de antelación ---
    const fechaCita = new Date(`${hueco.fecha}T${hueco.hora_inicio}`);
    const ahora = new Date();
    // Calculamos la diferencia en milisegundos y convertimos a horas
    const diferenciaHoras = (fechaCita - ahora) / (1000 * 60 * 60);

    if (diferenciaHoras <= 2) {
      return json(res, 400, { 
        error: 'Las reservas deben realizarse con al menos 2 horas de antelación.' 
      });
    }
    // ------------------------------------------------------

    // Obtenemos datos del usuario para el evento
    const usuarios = await query(
      'SELECT nombre_usuario, email FROM usuarios WHERE id = ?',
      [user.id]
    );
    const { nombre_usuario, email } = usuarios[0];

    // Creamos el evento en Google Calendar con Meet automático
    const eventoGoogle = await crearEventoCalendar({
      fecha:          hueco.fecha,
      hora_inicio:    hueco.hora_inicio,
      hora_fin:       hueco.hora_fin,
      nombre_usuario,
      email_usuario:  email,
      motivo:         motivo_consulta || '',
    });
    google_evento_id_creado = eventoGoogle.evento_id; // Guardamos el ID por si necesitamos revertir

    // Guardamos la cita en la BD con el enlace de Meet ya incluido
    await query(
      `INSERT INTO citas 
        (usuario_id, disponibilidad_id, motivo_consulta, estado, google_evento_id, enlace_meet)
       VALUES (?, ?, ?, 'confirmada', ?, ?)`,
      [user.id, disponibilidad_id, motivo_consulta || '', eventoGoogle.evento_id, eventoGoogle.enlace_meet]
    );

    // Marcamos el hueco como ocupado
    await query('UPDATE disponibilidad SET ocupado = 1 WHERE id = ?', [disponibilidad_id]);

    // Envío de correo de notificación a Antonio
    try {
      // Se crea el transportador aquí para evitar un crash si las variables de entorno no están definidas.
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: '"Sistema de Citas" <tu-email@gmail.com>',
        to: 'antonio.es.cantillo@gmail.com',
        subject: 'Nueva reserva de cita',
        html: `
          <h1>Nueva reserva realizada</h1>
          <p>Se ha reservado una nueva cita:</p>
          <ul>
            <li><b>Usuario:</b> ${nombre_usuario}</li>
            <li><b>Email:</b> ${email}</li>
            <li><b>Fecha:</b> ${hueco.fecha}</li>
            <li><b>Hora:</b> ${hueco.hora_inicio}</li>
            <li><b>Motivo:</b> ${motivo_consulta || 'No especificado'}</li>
          </ul>
        `
      });
    } catch (emailErr) {
      console.error('[reservar] Error al enviar email de notificación:', emailErr.message);
      // No devolvemos error aquí para que el usuario reciba su confirmación aunque falle el email interno
    }

    return json(res, 201, {
      ok: true,
      enlace_meet: eventoGoogle.enlace_meet,
      mensaje: '✅ Cita confirmada. Recibirás un email con el enlace de Google Meet.',
    });

  } catch (err) {
    console.error('[reservar]', err.message);

    // --- LÓGICA DE REVERSIÓN ---
    // Si se creó un evento en Google pero algo falló después, lo cancelamos.
    if (google_evento_id_creado) {
      console.log(`[reservar] Intentando revertir la creación del evento de Google: ${google_evento_id_creado}`);
      await cancelarEventoCalendar(google_evento_id_creado).catch(revertErr => {
        console.error('[reservar] Error crítico al intentar revertir el evento de Google:', revertErr.message);
      });
    }
    return json(res, 500, { error: 'Error al crear la cita: ' + err.message });
  }
}