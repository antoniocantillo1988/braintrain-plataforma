// src/pages/Citas.jsx
import { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
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
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());
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

  async function cancelarCita(cita_id) {
    if (!window.confirm('¿Seguro que quieres cancelar esta cita? El hueco volverá a quedar libre.')) return;
    setCargando(true);
    try {
      const res = await api.post('/citas/cancelar', { cita_id });
      setMensaje({ tipo: 'ok', texto: res.mensaje });
      cargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
      setCargando(false);
    }
  }

  // Identificar días con huecos para el calendario
  const diasDisponibles = [...new Set(huecos.map(h => new Date(h.fecha + 'T00:00:00')))];

  if (cargando) return <div className="sm:pl-52 p-6 text-stone-400 text-sm">Cargando…</div>;

  return (
    <div className="sm:pl-52 pb-24 max-w-2xl p-4">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Consulta con Antonio</h1>
      <p className="text-stone-500 text-sm mb-8">Reserva una sesión de videollamada.</p>

      {/* ── Calendario Interactivo ── */}
      <section className="mb-10 bg-white p-4 rounded-xl border border-stone-200 inline-block">
        <DayPicker
          mode="single"
          selected={diaSeleccionado}
          onSelect={setDiaSeleccionado}
          locale={es}
          modifiers={{ disponible: diasDisponibles }}
          modifiersStyles={{
            disponible: { color: '#0f766e', fontWeight: 'bold', border: '1px solid #0f766e' }
          }}
        />
      </section>

      {/* ── Huecos del día seleccionado ── */}
      <section className="mb-10">
        <h2 className="text-base font-semibold text-stone-700 mb-4">
          Huecos para el {diaSeleccionado?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
        </h2>
        
        <div className="flex flex-wrap gap-2">
    {/* Usamos una lógica de comparación de cadenas directa para evitar errores de zona horaria */}
    {huecos.filter(h => {
        // Convertimos el día seleccionado a formato YYYY-MM-DD local
        const year = diaSeleccionado.getFullYear();
        const month = String(diaSeleccionado.getMonth() + 1).padStart(2, '0');
        const day = String(diaSeleccionado.getDate()).padStart(2, '0');
        const fechaComparar = `${year}-${month}-${day}`;
        
        return h.fecha === fechaComparar;
    }).length === 0 ? (
      <p className="text-sm text-stone-400">No hay huecos este día.</p>
    ) : (
      huecos.filter(h => {
        const year = diaSeleccionado.getFullYear();
        const month = String(diaSeleccionado.getMonth() + 1).padStart(2, '0');
        const day = String(diaSeleccionado.getDate()).padStart(2, '0');
        const fechaComparar = `${year}-${month}-${day}`;
        return h.fecha === fechaComparar;
      }).map((h) => (
        <button
          key={h.id}
          onClick={() => setSeleccionado(seleccionado?.id === h.id ? null : h)}
          className={`px-4 py-2 rounded-lg text-sm border transition font-medium ${
            seleccionado?.id === h.id ? 'bg-teal-600 text-white' : 'border-stone-300 text-stone-700 hover:border-teal-400'
          }`}
        >
          {h.hora_inicio.slice(0, 5)}
        </button>
      ))
    )}
  </div>

        {seleccionado && (
          <div className="mt-6 bg-teal-50 border border-teal-200 rounded-xl p-4 space-y-3">
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Motivo de consulta (opcional)"
              rows={3}
              className="w-full border border-teal-200 rounded-lg p-2.5 text-sm"
            />
            <button onClick={reservar} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm">Confirmar reserva</button>
          </div>
        )}
      </section>

      {/* ── Mis citas ── */}
      <section>
        <h2 className="text-base font-semibold text-stone-700 mb-4">Tus citas</h2>
        {misCitas.map((c) => (
          <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-4 mb-3 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium">{formatFecha(c.fecha)} · {c.hora_inicio.slice(0, 5)}</p>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_ESTILOS[c.estado]}`}>
                {c.estado}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {c.estado === 'confirmada' && <a href={c.enlace_videollamada} target="_blank" className="text-teal-600 text-xs font-bold">🎥 Unirse</a>}
              {c.estado === 'confirmada' && <button onClick={() => cancelarCita(c.id)} className="text-red-500 font-bold text-lg">✕</button>}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}