import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminCitas() {
  const [citas, setCitas] = useState([]);
  const [nuevoHueco, setNuevoHueco] = useState({ fecha: '', hora_inicio: '', hora_fin: '' });
  const [enlaces, setEnlaces] = useState({});

  useEffect(() => {
    cargarCitas();
  }, []);

  async function cargarCitas() {
    const { data } = await supabase
      .from('citas')
      .select('*, disponibilidad(fecha, hora_inicio)')
      .order('created_at', { ascending: false });
    setCitas(data || []);
  }

  async function crearHueco(e) {
    e.preventDefault();
    const { error } = await supabase.from('disponibilidad').insert(nuevoHueco);
    if (!error) setNuevoHueco({ fecha: '', hora_inicio: '', hora_fin: '' });
  }

  async function confirmarCita(citaId) {
    const enlace = enlaces[citaId];
    if (!enlace) return;
    await supabase
      .from('citas')
      .update({ estado: 'confirmada', enlace_videollamada: enlace })
      .eq('id', citaId);
    cargarCitas();
  }

  async function cancelarCita(citaId) {
    await supabase.from('citas').update({ estado: 'cancelada' }).eq('id', citaId);
    cargarCitas();
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Añadir hueco disponible</h2>
        <form onSubmit={crearHueco} className="flex flex-wrap gap-2 items-end">
          <input
            type="date"
            value={nuevoHueco.fecha}
            onChange={(e) => setNuevoHueco({ ...nuevoHueco, fecha: e.target.value })}
            className="border border-stone-300 rounded-lg p-2 text-sm"
            required
          />
          <input
            type="time"
            value={nuevoHueco.hora_inicio}
            onChange={(e) => setNuevoHueco({ ...nuevoHueco, hora_inicio: e.target.value })}
            className="border border-stone-300 rounded-lg p-2 text-sm"
            required
          />
          <input
            type="time"
            value={nuevoHueco.hora_fin}
            onChange={(e) => setNuevoHueco({ ...nuevoHueco, hora_fin: e.target.value })}
            className="border border-stone-300 rounded-lg p-2 text-sm"
            required
          />
          <button className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm">Añadir</button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Citas solicitadas</h2>
        <div className="space-y-3">
          {citas.map((c) => (
            <div key={c.id} className="border border-stone-200 rounded-lg p-4 text-sm space-y-2">
              <p>
                <strong>{new Date(c.disponibilidad.fecha + 'T00:00:00').toLocaleDateString('es-ES')}</strong>{' '}
                · {c.disponibilidad.hora_inicio.slice(0, 5)} · Estado: <em>{c.estado}</em>
              </p>
              {c.motivo_consulta && <p className="text-stone-500">Motivo: {c.motivo_consulta}</p>}

              {c.estado === 'pendiente' && (
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="Enlace de Meet/Zoom"
                    value={enlaces[c.id] || ''}
                    onChange={(e) => setEnlaces({ ...enlaces, [c.id]: e.target.value })}
                    className="border border-stone-300 rounded-lg p-2 text-sm flex-1"
                  />
                  <button
                    onClick={() => confirmarCita(c.id)}
                    className="bg-teal-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => cancelarCita(c.id)}
                    className="border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
