// src/pages/AdminCitas.jsx
// Panel de administración: gestión de citas y de huecos de disponibilidad
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { Video, Check, X, Trash2, Plus } from 'lucide-react';

const ESTADO_ESTILOS = {
  pendiente:  'bg-oro-100 text-oro-600',
  confirmada: 'bg-sage-100 text-sage-700',
  cancelada:  'bg-terracota-100 text-terracota-600',
  completada: 'bg-stone-100 text-stone-500',
};

const FILTROS = ['todas', 'pendiente', 'confirmada', 'completada', 'cancelada'];

function formatFecha(fecha) {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function AdminCitas() {
  const [citas, setCitas] = useState([]);
  const [huecos, setHuecos] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);
  const [enlaces, setEnlaces] = useState({}); // enlace editable por cita
  const [nuevo, setNuevo] = useState({ fecha: '', hora_inicio: '', hora_fin: '', modalidad: 'online' });

  const cargar = useCallback(async () => {
    try {
      const [c, h] = await Promise.all([
        api.get('/admin/citas'),
        api.get('/citas/disponibilidad'),
      ]);
      setCitas(c.citas || []);
      setHuecos(h.huecos || []);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function ejecutar(fn, textoOk) {
    setMensaje(null);
    try {
      await fn();
      setMensaje({ tipo: 'ok', texto: textoOk });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  const cambiarEstado = (c, estado) =>
    ejecutar(
      () => api.put('/admin/citas', {
        cita_id: c.id,
        estado,
        enlace_videollamada: enlaces[c.id] ?? c.enlace_videollamada ?? '',
      }),
      `Cita marcada como ${estado}.`
    );

  const eliminarCita = (c) => {
    if (!window.confirm(`¿Eliminar definitivamente la cita de ${c.nombre_usuario}?`)) return;
    ejecutar(() => api.del('/admin/citas', { cita_id: c.id }), 'Cita eliminada.');
  };

  const crearHueco = (e) => {
    e.preventDefault();
    ejecutar(async () => {
      await api.post('/admin/huecos', nuevo);
      setNuevo({ ...nuevo, hora_inicio: '', hora_fin: '' });
    }, 'Hueco creado.');
  };

  const eliminarHueco = (h) => {
    if (!window.confirm('¿Eliminar este hueco libre?')) return;
    ejecutar(() => api.del('/admin/huecos', { id: h.id }), 'Hueco eliminado.');
  };

  const citasFiltradas = citas.filter((c) => filtro === 'todas' || c.estado === filtro);
  const input = 'w-full rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400';

  if (cargando) return <p className="text-sm text-stone-400">Cargando…</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-12">
      <header>
        <h1 className="font-serif text-3xl font-bold text-tierra-800">Modificar citas</h1>
        <p className="mt-1 text-stone-500">Gestiona las reservas y tu disponibilidad.</p>
      </header>

      {mensaje && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${
          mensaje.tipo === 'ok'
            ? 'border-sage-200 bg-sage-50 text-sage-700'
            : 'border-terracota-200 bg-terracota-50 text-terracota-700'
        }`}>
          {mensaje.texto}
        </div>
      )}

      {/* ── Citas ── */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-tierra-800">Citas ({citasFiltradas.length})</h2>
          <div className="flex flex-wrap gap-2">
            {FILTROS.map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition ${
                  filtro === f ? 'bg-sage-500 text-white' : 'bg-white text-stone-600 border border-crema-300 hover:bg-crema-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {citasFiltradas.length === 0 ? (
          <p className="rounded-xl bg-crema-100 p-4 text-sm text-stone-500">No hay citas con este filtro.</p>
        ) : (
          <div className="space-y-3">
            {citasFiltradas.map((c) => (
              <div key={c.id} className="card-orienta !p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-tierra-800">{c.nombre_usuario}
                      <span className="ml-2 text-xs font-normal text-stone-400">{c.email}</span>
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {formatFecha(c.fecha)} · {c.hora_inicio?.slice(0, 5)}–{c.hora_fin?.slice(0, 5)}
                    </p>
                    {c.motivo_consulta && (
                      <p className="mt-1 text-sm italic text-stone-500">“{c.motivo_consulta}”</p>
                    )}
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_ESTILOS[c.estado] || ''}`}>
                    {c.estado}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <input
                    type="url"
                    placeholder="Enlace de videollamada"
                    value={enlaces[c.id] ?? c.enlace_videollamada ?? ''}
                    onChange={(e) => setEnlaces({ ...enlaces, [c.id]: e.target.value })}
                    className={`${input} flex-1 min-w-[12rem]`}
                  />
                  {c.enlace_videollamada && (
                    <a href={c.enlace_videollamada} target="_blank" rel="noreferrer" className="btn-outline !px-3 !py-2">
                      <Video size={14} /> Abrir
                    </a>
                  )}
                  {c.estado !== 'confirmada' && c.estado !== 'cancelada' && (
                    <button onClick={() => cambiarEstado(c, 'confirmada')} className="btn-primary !px-4 !py-2">
                      <Check size={14} /> Confirmar
                    </button>
                  )}
                  {c.estado === 'confirmada' && (
                    <>
                      <button onClick={() => cambiarEstado(c, 'confirmada')} className="btn-outline !px-3 !py-2">
                        Guardar enlace
                      </button>
                      <button onClick={() => cambiarEstado(c, 'completada')} className="btn-outline !px-3 !py-2">
                        Completada
                      </button>
                    </>
                  )}
                  {c.estado !== 'cancelada' && (
                    <button onClick={() => cambiarEstado(c, 'cancelada')} className="btn-outline !px-3 !py-2 !text-terracota-600 !border-terracota-200">
                      <X size={14} /> Cancelar
                    </button>
                  )}
                  <button onClick={() => eliminarCita(c)} className="p-2 text-stone-400 hover:text-terracota-600" aria-label="Eliminar cita">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Huecos ── */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-tierra-800">Huecos de disponibilidad</h2>

        <form onSubmit={crearHueco} className="card-orienta !p-4 grid items-end gap-3 sm:grid-cols-5">
          <label className="text-xs font-medium text-stone-600">Fecha
            <input type="date" required value={nuevo.fecha} onChange={(e) => setNuevo({ ...nuevo, fecha: e.target.value })} className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-medium text-stone-600">Inicio
            <input type="time" required value={nuevo.hora_inicio} onChange={(e) => setNuevo({ ...nuevo, hora_inicio: e.target.value })} className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-medium text-stone-600">Fin
            <input type="time" required value={nuevo.hora_fin} onChange={(e) => setNuevo({ ...nuevo, hora_fin: e.target.value })} className={`${input} mt-1`} />
          </label>
          <label className="text-xs font-medium text-stone-600">Modalidad
            <select value={nuevo.modalidad} onChange={(e) => setNuevo({ ...nuevo, modalidad: e.target.value })} className={`${input} mt-1`}>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
            </select>
          </label>
          <button type="submit" className="btn-primary !py-2.5"><Plus size={16} /> Añadir</button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {huecos.length === 0 ? (
            <p className="text-sm text-stone-400">No hay huecos libres.</p>
          ) : (
            huecos.map((h) => (
              <span key={h.id} className="inline-flex items-center gap-2 rounded-full border border-crema-300 bg-white py-1.5 pl-4 pr-2 text-sm text-stone-700">
                {formatFecha(h.fecha)} · {h.hora_inicio?.slice(0, 5)}
                {h.modalidad && <em className="text-xs text-stone-400">{h.modalidad}</em>}
                <button onClick={() => eliminarHueco(h)} className="rounded-full p-1 text-stone-400 hover:bg-terracota-100 hover:text-terracota-600" aria-label="Eliminar hueco">
                  <X size={14} />
                </button>
              </span>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
