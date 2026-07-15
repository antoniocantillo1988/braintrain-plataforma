// src/pages/Citas.jsx
import { useState, useEffect, useCallback } from 'react';
import { DayPicker } from 'react-day-picker';
import { es } from 'date-fns/locale';
import 'react-day-picker/dist/style.css';
import { api } from '../lib/api';

import { useAuth } from '../context/AuthContext';
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

// src/pages/Citas.jsx
export default function Citas() {
  const { user } = useAuth();
  const [huecos, setHuecos] = useState([]);
  const [misCitas, setMisCitas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(new Date());
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const limiteReserva = new Date(Date.now() + 2 * 60 * 60 * 1000);

  // Define una función de recarga que se puede llamar desde cualquier lugar.
  // useCallback se asegura de que la función no se recree en cada render,
  // a menos que 'user' cambie.
  const recargarDatos = useCallback(async () => {
    setCargando(true);
    // Se ha refactorizado la carga para que sea más robusta:
    // 1. Se cargan los huecos disponibles (público).
    // 2. Si lo anterior tiene éxito y hay un usuario, se cargan sus citas (privado).
    // Esto evita que un fallo al cargar las citas del usuario impida ver el calendario.
    try {
      const resDisponibilidad = await api.get('/citas/disponibilidad');
      setHuecos(resDisponibilidad.huecos || []);

      if (user) {
        // Envolvemos la llamada autenticada en su propio try/catch
        try {
          const resMisCitas = await api.get('/citas/mis-citas');
          setMisCitas(resMisCitas.citas || []);
        } catch (err) {
          console.error("Error al cargar las citas del usuario:", err);
          setMisCitas([]); // Si falla, nos aseguramos de que la lista esté vacía.
        }
      } else {
        setMisCitas([]);
      }
    } catch (err) {
      // Este error es solo si falla la llamada pública a /disponibilidad
      console.error("Error al cargar la disponibilidad de citas:", err);
      setHuecos([]);
      setMisCitas([]);
    } finally {
      setCargando(false);
    }
  }, [user]); // La función depende del estado del usuario.

  // Ejecuta la recarga de datos cuando el componente se monta por primera vez
  // y cada vez que el estado de autenticación del usuario cambia.
  useEffect(() => {
    recargarDatos();
  }, [recargarDatos]);

  async function reservar() {
    if (!user) {
      setMensaje({ tipo: 'error', texto: 'Debes iniciar sesión para confirmar tu reserva.' });
      return;
    }

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
      recargarDatos(); // Recargamos todo tras la reserva
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al procesar la reserva.' });
    } finally {
      setEnviando(false);
    }
  }

  // ... (el resto del código: cancelarCita y renderizado permanecen iguales)
  async function cancelarCita(cita_id) {
    if (!window.confirm('¿Seguro que quieres cancelar esta cita?')) return;
    try {
      const res = await api.post('/citas/cancelar', { cita_id });
      setMensaje({ tipo: 'ok', texto: res.mensaje });
      recargarDatos();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  const diasDisponibles = [...new Set(huecos.map(h => new Date(h.fecha + 'T00:00:00')))];

  if (cargando) return <div className="sm:pl-52 p-6 text-stone-400 text-sm">Cargando…</div>;

  const year = diaSeleccionado?.getFullYear();
  const month = String(diaSeleccionado?.getMonth() + 1).padStart(2, '0');
  const day = String(diaSeleccionado?.getDate()).padStart(2, '0');
  const fechaComparar = `${year}-${month}-${day}`;
  const huecosDelDia = huecos?.filter(h => h.fecha === fechaComparar) || [];

  return (
    // Añadimos una 'key' que cambia con el estado de autenticación.
    // Esto fuerza a React a remontar el componente al iniciar/cerrar sesión,
    // reseteando su estado interno y evitando problemas de sincronización.
    // El ID del usuario se usa para crear una clave única por usuario.
    <div key={user?.id || 'anonimo'} className="sm:pl-52 pb-24 max-w-2xl p-4">
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
          {huecosDelDia.length === 0 ? (
            <p className="text-sm text-stone-400">No hay huecos este día.</p>
          ) : (
            huecosDelDia.map((h) => {
              const fechaHueco = new Date(`${h.fecha}T${h.hora_inicio || '00:00'}`);
              const esPasadoOProximo = fechaHueco < limiteReserva;

              return (
                <button
                  key={h.id}
                  disabled={esPasadoOProximo}
                  onClick={() => setSeleccionado(seleccionado?.id === h.id ? null : h)}
                  className={`px-4 py-2 rounded-lg text-sm border transition font-medium ${
                    esPasadoOProximo 
                      ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed'
                      : seleccionado?.id === h.id 
                        ? 'bg-teal-600 text-white' 
                        : 'border-stone-300 text-stone-700 hover:border-teal-400'
                  }`}
                >
                  {h.hora_inicio?.slice(0, 5) || '--:--'}
                </button>
              );
            })
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
            {user ? (
              <button 
                  onClick={reservar} 
                  disabled={enviando}
                  className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                  {enviando ? 'Enviando...' : 'Confirmar reserva'}
              </button>
            ) : <p className="text-sm text-teal-800">Debes <a href="/login" className="font-bold underline">iniciar sesión</a> para poder reservar.</p>}
          </div>
        )}
      </section>

      {/* ── Mis citas ── */}
      {user && (
        <section>
          <h2 className="text-base font-semibold text-stone-700 mb-4">Tus próximas citas</h2>
          {misCitas.length > 0 ? (
            misCitas.map((c) => (
              <div key={c.id} className="bg-white border border-stone-200 rounded-xl p-4 mb-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{formatFecha(c.fecha)} · {c.hora_inicio.slice(0, 5)}</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_ESTILOS[c.estado]}`}>
                    {c.estado}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {c.estado === 'confirmada' && <a href={c.enlace_videollamada} target="_blank" rel="noreferrer" className="text-teal-600 text-xs font-bold">🎥 Unirse</a>}
                  {c.estado === 'confirmada' && <button onClick={() => cancelarCita(c.id)} className="text-red-500 font-bold text-lg">✕</button>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-stone-500 bg-stone-50 rounded-lg p-4">Aún no tienes ninguna cita programada.</p>
          )}
        </section>
      )}
    </div>
  );
}