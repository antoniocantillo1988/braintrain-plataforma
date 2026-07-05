// src/components/Layout.jsx
// Estructura base de todas las páginas con sesión activa
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',    label: 'Inicio',       icon: '🏠' },
  { to: '/citas',        label: 'Consultas',    icon: '📅' },
  { to: '/chat',         label: 'Chat 24h',     icon: '💬' },
  { to: '/braintrain',   label: 'Brain Train',  icon: '🧠' },
  { to: '/talleres',     label: 'Talleres',     icon: '🎓' },
];

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="text-teal-700 font-bold text-lg">Orienta</span>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <NavLink
                to="/admin"
                className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium"
              >
                Panel admin
              </NavLink>
            )}
            <span className="text-sm text-stone-600 hidden sm:block">
              Hola, {user?.nombre_usuario}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm text-stone-400 hover:text-red-500 transition"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        {children}
      </main>

      {/* Barra de navegación inferior (mobile) */}
      <nav className="bg-white border-t border-stone-200 fixed bottom-0 left-0 right-0 z-30 sm:hidden">
        <div className="flex justify-around">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 text-xs transition ${
                  isActive ? 'text-teal-600' : 'text-stone-400'
                }`
              }
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Navegación lateral (desktop) */}
      <nav className="hidden sm:flex fixed left-0 top-14 h-full w-52 bg-white border-r border-stone-200 flex-col pt-6 px-4 gap-1 z-20">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive
                  ? 'bg-teal-50 text-teal-700 font-medium'
                  : 'text-stone-500 hover:bg-stone-50'
              }`
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
