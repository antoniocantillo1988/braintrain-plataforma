// api/citas/reservar.js
import { query, json, requireAuth } from '../_db.js';
import { crearEventoCalendar } from '../_calendar.js';
import nodemailer from 'nodemailer';

// Configuración del transportador de correos
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  if (req.method !== 'POST') return json(res, 405, { error: 'Método no permitido' });

  const { disponibilidad_id, motivo_consulta } = req.body || {};
  if (!disponibilidad_id) return json(res, 400, { error: 'Falta el hueco seleccionado.' });

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

    // Obtenemos datos del usuario para el evento
    const usuarios = await query(
      'SELECT nombre_usuario, email FROM usuarios WHERE id = ?',
      [user.id]
    );
    const { nombre_usuario, email } = usuarios[0];

    // Creamos el evento en Google Calendar con Meet automático
    const { evento_id, enlace_meet } = await crearEventoCalendar({
      fecha:          hueco.fecha,
      hora_inicio:    hueco.hora_inicio,
      hora_fin:       hueco.hora_fin,
      nombre_usuario,
      email_usuario:  email,
      motivo:         motivo_consulta || '',
    });

    // Guardamos la cita en la BD con el enlace de Meet ya incluido
    await query(
      `INSERT INTO citas 
        (usuario_id, disponibilidad_id, motivo_consulta, estado, google_evento_id, enlace_meet)
       VALUES (?, ?, ?, 'confirmada', ?, ?)`,
      [user.id, disponibilidad_id, motivo_consulta || '', evento_id, enlace_meet]
    );

    // Marcamos el hueco como ocupado
    await query('UPDATE disponibilidad SET ocupado = 1 WHERE id = ?', [disponibilidad_id]);

    // Envío de correo de notificación a Antonio
    try {
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
      enlace_meet,
      mensaje: '✅ Cita confirmada. Recibirás un email con el enlace de Google Meet.',
    });

  } catch (err) {
    console.error('[reservar]', err.message);
    return json(res, 500, { error: 'Error al crear la cita: ' + err.message });
  }
};