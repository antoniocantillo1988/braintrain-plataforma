// src/pages/AdminUsuarios.jsx
// Panel de administración: gestión de usuarios
import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { Search, Trash2, Save, ShieldCheck } from 'lucide-react';

export default function AdminUsuarios() {
  const { user: yo } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [edits, setEdits] = useState({}); // { [id]: { nombre_usuario, tipo } }
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const res = await api.get('/admin/usuarios');
      setUsuarios(res.usuarios || []);
      setEdits({});
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const valor = (u, campo) => edits[u.id]?.[campo] ?? u[campo];
  const cambiar = (u, campo, v) =>
    setEdits({ ...edits, [u.id]: { ...edits[u.id], [campo]: v } });

  async function guardar(u) {
    setMensaje(null);
    try {
      await api.put('/admin/usuarios', {
        id: u.id,
        nombre_usuario: valor(u, 'nombre_usuario'),
        tipo: Number(valor(u, 'tipo')),
      });
      setMensaje({ tipo: 'ok', texto: `Usuario «${valor(u, 'nombre_usuario')}» actualizado.` });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  async function eliminar(u) {
    if (!window.confirm(`¿Eliminar a ${u.nombre_usuario} y todas sus citas y conversaciones? Esta acción no se puede deshacer.`)) return;
    setMensaje(null);
    try {
      await api.del('/admin/usuarios', { id: u.id });
      setMensaje({ tipo: 'ok', texto: 'Usuario eliminado.' });
      await cargar();
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  const filtrados = usuarios.filter((u) =>
    `${u.nombre_usuario} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
  );
  const input = 'w-full rounded-lg border border-crema-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage-400';

  if (cargando) return <p className="text-sm text-stone-400">Cargando…</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="font-serif text-3xl font-bold text-tierra-800">Modificar usuarios</h1>
        <p className="mt-1 text-stone-500">{usuarios.length} usuarios registrados.</p>
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

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o email…"
          className={`${input} pl-9`}
        />
      </div>

      <div className="space-y-3">
        {filtrados.map((u) => {
          const esYo = u.id === yo?.id;
          const modificado = edits[u.id] && (
            valor(u, 'nombre_usuario') !== u.nombre_usuario || Number(valor(u, 'tipo')) !== Number(u.tipo)
          );
          return (
            <div key={u.id} className="card-orienta !p-4 grid items-center gap-3 md:grid-cols-[1.4fr_1.4fr_1fr_auto]">
              <input
                value={valor(u, 'nombre_usuario') ?? ''}
                onChange={(e) => cambiar(u, 'nombre_usuario', e.target.value)}
                className={input}
                aria-label="Nombre"
              />
              <p className="truncate text-sm text-stone-500">{u.email}</p>
              <select
                value={Number(valor(u, 'tipo'))}
                onChange={(e) => cambiar(u, 'tipo', Number(e.target.value))}
                disabled={esYo}
                className={input}
                aria-label="Rol"
              >
                <option value={0}>Usuario</option>
                <option value={1}>Administrador</option>
              </select>
              <div className="flex items-center justify-end gap-2">
                {esYo && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-oro-600">
                    <ShieldCheck size={14} /> Tú
                  </span>
                )}
                <button
                  onClick={() => guardar(u)}
                  disabled={!modificado}
                  className="btn-primary !px-4 !py-2 disabled:!bg-stone-200 disabled:!text-stone-400 disabled:!shadow-none"
                >
                  <Save size={14} /> Guardar
                </button>
                {!esYo && (
                  <button onClick={() => eliminar(u)} className="p-2 text-stone-400 hover:text-terracota-600" aria-label="Eliminar usuario">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filtrados.length === 0 && (
          <p className="rounded-xl bg-crema-100 p-4 text-sm text-stone-500">No se han encontrado usuarios.</p>
        )}
      </div>
    </div>
  );
}
