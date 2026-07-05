// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre_usuario: '',
    email: '',
    password: '',
    password2: '',
  });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password !== form.password2) {
      return setError('Las contraseñas no coinciden.');
    }
    if (form.password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }

    setCargando(true);
    try {
      const data = await api.post('/auth/register', {
        email: form.email,
        password: form.password,
        nombre_usuario: form.nombre_usuario,
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-8">

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-teal-700">Orienta</h1>
          <p className="text-stone-500 text-sm mt-1">Psicología infantil · Desarrollo 0–6</p>
        </div>

        <h2 className="text-xl font-semibold text-stone-800 mb-6">Crear cuenta</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Tu nombre
            </label>
            <input
              type="text"
              name="nombre_usuario"
              value={form.nombre_usuario}
              onChange={handleChange}
              required
              placeholder="María García"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="tu@email.com"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Contraseña <span className="text-stone-400 font-normal">(mínimo 8 caracteres)</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Repite la contraseña
            </label>
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              required
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
            {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </form>

        {/* Aviso RGPD mínimo */}
        <p className="text-xs text-stone-400 text-center mt-4 leading-relaxed">
          Al registrarte aceptas que tus datos se traten para la prestación del servicio
          de orientación psicoeducativa. Más info en la{' '}
          <a href="/privacidad" className="underline">política de privacidad</a>.
        </p>

        <p className="text-center text-sm text-stone-500 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-teal-600 hover:underline font-medium">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
