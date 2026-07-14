// src/pages/Citas.jsx
import { useState, useEffect } from 'react';
import { api } from '../lib/api';

function formatFecha(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  });
}

const ESTADO_ESTILOS = {
  pendiente:  'bg-amber-100 text-amber-700',
  confirmada: 'bg-teal-100 text-teal-700',
  cancelada:  'bg-red-100 text-red-600',
  completada: 'bg-stone-100 text-stone-500',
};

export default function Citas() {
  const [huecos, setHuecos] = useState([]);
  const [misCitas, setMisCitas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => { cargarDatos(); }, []);

  async function cargarDatos() {
    setCargando(true);
    try {
      const [d, c] = await Promise.all([
        api.get('/citas/disponibilidad'),
        api.get('/citas/mis-citas'),
      ]);
      setHuecos(d.huecos || []);
      setMisCitas(c.citas || []);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setCargando(false);
    }
  }

  async function reservar() {
    if (!seleccionado) return;
    setEnviando(true);
    setMensaje(null);
    try {
      const res = await api.post('/citas/reservar', {
        disponibilidad_id: seleccionado.id,
        motivo_consulta: motivo,
      });
      setMensaje({ tipo: 'ok', texto: res.mensaje });
      setSeleccionado(null);
      setMotivo('');
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setEnviando(false);
    }
  }


  //CANCELAR CITA
async function cancelarCita(cita_id) {
    if (!window.confirm('¿Seguro que quieres cancelar esta cita? El hueco volverá a quedar libre.')) return;
    setCargando(true);
    setMensaje(null);
    try {
      const res = await api.post('/citas/cancelar', { cita_id });
      setMensaje({ tipo: 'ok', texto: res.mensaje });
      cargarDatos(); // Recargamos las listas para que desaparezca la cita
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
      setCargando(false);
    }
  }

  // Agrupa huecos por fecha
  const porFecha = huecos.reduce((acc, h) => {
    (acc[h.fecha] = acc[h.fecha] || []).push(h);
    return acc;
  }, {});

  if (cargando) return <div className="sm:pl-52 p-6 text-stone-400 text-sm">Cargando…</div>;

  return (
    <div className="sm:pl-52 pb-24 max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Consulta con Antonio</h1>
      <p className="text-stone-500 text-sm mb-8">
        Reserva una sesión de videollamada. Recibirás el enlace de Google Meet una vez confirmada.
      </p>

      {/* ── Selector de huecos ── */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-stone-700 mb-4">Huecos disponibles</h2>

        {Object.keys(porFecha).length === 0 ? (
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 text-sm text-stone-500">
            No hay huecos disponibles en este momento. Vuelve a comprobarlo pronto.
          </div>
        ) : (
          <div className="space-y-5">
            {Object.entries(porFecha).map(([fecha, lista]) => (
              <div key={fecha}>
                <p className="text-sm font-medium text-stone-500 mb-2 capitalize">
                  {formatFecha(fecha)}
                </p>
                <div className="flex flex-wrap gap-2">
                  {lista.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setSeleccionado(seleccionado?.id === h.id ? null : h)}
                      className={`px-4 py-2 rounded-lg text-sm border transition font-medium ${
                        seleccionado?.id === h.id
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'border-stone-300 text-stone-700 hover:border-teal-400'
                      }`}
                    >
                      {h.hora_inicio.slice(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Formulario de reserva */}
        {seleccionado && (
          <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-teal-800">
              📅 {formatFecha(seleccionado.fecha)} · {seleccionado.hora_inicio.slice(0, 5)}
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="¿Cuál es el motivo de la consulta? (opcional)"
              rows={3}
              className="w-full border border-teal-200 bg-white rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            />
            <div className="flex gap-2">
              <button
                onClick={reservar}
                disabled={enviando}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
              >
                {enviando ? 'Reservando…' : 'Confirmar reserva'}
              </button>
              <button
                onClick={() => setSeleccionado(null)}
                className="text-stone-400 hover:text-stone-600 px-3 py-2 text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {mensaje && (
          <p className={`mt-4 text-sm font-medium ${
            mensaje.tipo === 'ok' ? 'text-teal-700' : 'text-red-600'
          }`}>
            {mensaje.tipo === 'ok' ? '✅' : '❌'} {mensaje.texto}
          </p>
        )}
      </section>

      {/* ── Mis citas ── */}
      <section>
        <h2 className="text-base font-semibold text-stone-700 mb-4">Tus citas</h2>
        {misCitas.length === 0 ? (
          <p className="text-sm text-stone-400">Todavía no tienes ninguna cita.</p>
        ) : (
          <div className="space-y-3">
            {misCitas.map((c) => (
              <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-stone-800">
                      {formatFecha(c.fecha)} · {c.hora_inicio.slice(0, 5)}
                    </p>
                    {c.motivo_consulta && (
                      <p className="text-xs text-stone-400 mt-0.5">{c.motivo_consulta}</p>
                    )}
                    <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_ESTILOS[c.estado] || ''}`}>
                      {c.estado}
                    </span>
                  </div>
                  
{/* PEGA ESTO EN SU LUGAR */}
                  <div className="flex items-center gap-3">
                    {c.enlace_videollamada && c.estado === 'confirmada' && (
                      <a
                        href={c.enlace_videollamada}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                      >
                        🎥 Unirse
                      </a>
                    )}
                    {c.estado === 'confirmada' && (
                      <button
                        onClick={() => cancelarCita(c.id)}
                        className="text-red-400 hover:text-red-600 font-bold text-lg px-2"
                        title="Cancelar esta cita"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  {/* HASTA AQUÍ */}

                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
