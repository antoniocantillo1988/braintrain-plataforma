import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // ajusta la ruta a tu cliente Supabase existente

export default function ReservaCita() {
  const [huecos, setHuecos] = useState([]);
  const [misCitas, setMisCitas] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [motivo, setMotivo] = useState('');
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  async function cargarDatos() {
    setCargando(true);
    const { data: { user } } = await supabase.auth.getUser();

    const [{ data: disponibilidad }, { data: citas }] = await Promise.all([
      supabase
        .from('disponibilidad')
        .select('*')
        .eq('ocupado', false)
        .gte('fecha', new Date().toISOString().split('T')[0])
        .order('fecha', { ascending: true })
        .order('hora_inicio', { ascending: true }),
      user
        ? supabase
            .from('citas')
            .select('*, disponibilidad(fecha, hora_inicio, hora_fin)')
            .eq('usuario_id', user.id)
            .order('created_at', { ascending: false })
        : { data: [] },
    ]);

    setHuecos(disponibilidad || []);
    setMisCitas(citas || []);
    setCargando(false);
  }

  // Agrupa huecos disponibles por fecha para mostrarlos en un calendario simple
  const huecosPorFecha = huecos.reduce((acc, h) => {
    (acc[h.fecha] = acc[h.fecha] || []).push(h);
    return acc;
  }, {});

  async function confirmarReserva() {
    if (!seleccionado) return;
    setEnviando(true);
    setMensaje(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMensaje({ tipo: 'error', texto: 'Tienes que iniciar sesión para reservar una cita.' });
      setEnviando(false);
      return;
    }

    const { error } = await supabase.from('citas').insert({
      usuario_id: user.id,
      disponibilidad_id: seleccionado.id,
      motivo_consulta: motivo,
      estado: 'pendiente',
    });

    if (error) {
      setMensaje({ tipo: 'error', texto: 'No se pudo crear la cita. Inténtalo de nuevo.' });
    } else {
      setMensaje({ tipo: 'ok', texto: 'Cita solicitada. Te confirmaremos el enlace de videollamada en breve.' });
      setSeleccionado(null);
      setMotivo('');
      cargarDatos();
    }
    setEnviando(false);
  }

  if (cargando) return <p className="p-6 text-sm text-stone-500">Cargando disponibilidad…</p>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      <section>
        <h2 className="text-xl font-semibold mb-4">Reserva una consulta</h2>

        {Object.keys(huecosPorFecha).length === 0 && (
          <p className="text-sm text-stone-500">No hay huecos disponibles por ahora. Vuelve a comprobarlo más tarde.</p>
        )}

        <div className="space-y-4">
          {Object.entries(huecosPorFecha).map(([fecha, lista]) => (
            <div key={fecha}>
              <p className="text-sm font-medium text-stone-600 mb-2">
                {new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
                  weekday: 'long', day: 'numeric', month: 'long',
                })}
              </p>
              <div className="flex flex-wrap gap-2">
                {lista.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setSeleccionado(h)}
                    className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                      seleccionado?.id === h.id
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'border-stone-300 hover:border-teal-500'
                    }`}
                  >
                    {h.hora_inicio.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {seleccionado && (
          <div className="mt-6 p-4 border border-stone-200 rounded-xl space-y-3">
            <p className="text-sm">
              Vas a reservar el{' '}
              <strong>
                {new Date(seleccionado.fecha + 'T00:00:00').toLocaleDateString('es-ES')}
              </strong>{' '}
              a las <strong>{seleccionado.hora_inicio.slice(0, 5)}</strong>
            </p>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Cuéntanos brevemente el motivo de la consulta (opcional)"
              className="w-full border border-stone-300 rounded-lg p-2 text-sm"
              rows={3}
            />
            <button
              onClick={confirmarReserva}
              disabled={enviando}
              className="bg-teal-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {enviando ? 'Reservando…' : 'Confirmar reserva'}
            </button>
          </div>
        )}

        {mensaje && (
          <p className={`mt-4 text-sm ${mensaje.tipo === 'ok' ? 'text-teal-700' : 'text-red-600'}`}>
            {mensaje.texto}
          </p>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">Tus citas</h3>
        {misCitas.length === 0 ? (
          <p className="text-sm text-stone-500">Todavía no has reservado ninguna cita.</p>
        ) : (
          <div className="space-y-2">
            {misCitas.map((c) => (
              <div key={c.id} className="border border-stone-200 rounded-lg p-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium">
                    {new Date(c.disponibilidad.fecha + 'T00:00:00').toLocaleDateString('es-ES')} ·{' '}
                    {c.disponibilidad.hora_inicio.slice(0, 5)}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${
                      c.estado === 'confirmada'
                        ? 'bg-teal-100 text-teal-700'
                        : c.estado === 'cancelada'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {c.estado}
                  </span>
                </div>
                {c.enlace_videollamada && c.estado === 'confirmada' && (
                  <a
                    href={c.enlace_videollamada}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm"
                  >
                    Unirse
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
