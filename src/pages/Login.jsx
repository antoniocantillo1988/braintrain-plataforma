// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  // 1. Cambiamos 'email' por 'identificador' en el estado
  const [form, setForm] = useState({ identificador: '', password: '' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      // 2. Se enviará { identificador, password } al backend
      const data = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex items-center justify-center py-6">
      <div className="w-full max-w-md rounded-3xl border border-crema-200 bg-white p-8 shadow-suave">
        
        {/* Logo / nombre */}
        <div className="text-center mb-8">
          <img src="/orienta-icon.png" alt="Orienta" className="mx-auto h-20 w-20 object-contain" />
          <h1 className="text-3xl font-extrabold text-sage-500 mt-2">Orienta</h1>
          <p className="text-[10px] font-medium tracking-[0.32em] text-sage-600">PSICOLOGÍA</p>
          <p className="mt-2 font-serif text-sm italic text-terracota-500">Acompañamos a quien cuida</p>
        </div>

        <h2 className="text-xl font-semibold text-tierra-800 mb-6">Iniciar sesión</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email o Nombre de usuario
            </label>
            {/* 3. Cambiamos type="email" a type="text" y name="email" a name="identificador" */}
            <input
              type="text"
              name="identificador"
              value={form.identificador}
              onChange={handleChange}
              required
              autoComplete="username"
              placeholder="tu@email.com o tu_usuario"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-3 py-2.5">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-teal-600 hover:underline font-medium">
            Regístrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
