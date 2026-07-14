// api/_calendar.js
const { google } = require('googleapis');

function getCalendarClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://braintrain-plataforma-orienta-emocional-bi5ihyxov.vercel.app/api/auth/google/callback'
  );

  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  return google.calendar({ version: 'v3', auth });
}

// Crea un evento en Google Calendar con enlace de Meet automático
async function crearEventoCalendar({ fecha, hora_inicio, hora_fin, nombre_usuario, email_usuario, motivo }) {
  const calendar = getCalendarClient();

  // Construir fechas ISO completas
  const inicio = new Date(`${fecha}T${hora_inicio}`).toISOString();
  const fin    = new Date(`${fecha}T${hora_fin}`).toISOString();

  const evento = {
    summary: `Consulta Orienta — ${nombre_usuario}`,
    description: motivo
      ? `Motivo de consulta: ${motivo}`
      : 'Consulta de orientación psicoeducativa.',
    start: { dateTime: inicio, timeZone: 'Europe/Madrid' },
    end:   { dateTime: fin,    timeZone: 'Europe/Madrid' },
    attendees: [
      { email: email_usuario },
    ],
    conferenceData: {
      createRequest: {
        requestId: `orienta-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  };

  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: evento,
    conferenceDataVersion: 1,
    sendUpdates: 'all', // manda email automático al usuario
  });

  return {
    evento_id: res.data.id,
    enlace_meet: res.data.conferenceData?.entryPoints?.[0]?.uri || '',
    enlace_evento: res.data.htmlLink,
  };
}

// Cancela un evento en Google Calendar
async function cancelarEventoCalendar(evento_id) {
  const calendar = getCalendarClient();
  await calendar.events.delete({
    calendarId: 'primary',
    eventId: evento_id,
    sendUpdates: 'all',
  });
}

module.exports = { crearEventoCalendar, cancelarEventoCalendar };
