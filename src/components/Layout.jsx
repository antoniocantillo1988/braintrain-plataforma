// src/components/Layout.jsx
import { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MessageSquare, BookOpen, Calendar, Home, LogOut, Phone,
  CalendarCheck, Users, ShieldCheck, Menu, X, LayoutDashboard,
  Info, ClipboardList, FileText, FolderOpen,
} from 'lucide-react';

const AVISO_LEGAL =
  'Aviso Legal: Antonio Cantillo 74944739K acogido a la Política de Protección de datos y privacidad acorde a la LOPD.';

function NavItem({ to, icon: Icon, children, onClick, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition border-l-4 ${
          isActive
            ? 'bg-sage-50 text-sage-700 border-terracota-500'
            : 'border-transparent text-stone-600 hover:bg-crema-100 hover:text-sage-700'
        }`
      }
    >
      <Icon size={19} /> {children}
    </NavLink>
  );
}

function Marca({ onClick }) {
  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-3">
      <img src="/orienta-icon.png" alt="Orienta" className="h-14 w-14 object-contain" />
      <div className="leading-none">
        <span className="block text-2xl font-extrabold text-sage-500">Orienta</span>
        <span className="mt-1 block text-[10px] font-medium tracking-[0.32em] text-sage-600">PSICOLOGÍA</span>
      </div>
    </Link>
  );
}

function MenuLateral({ onNavigate }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function salir() {
    logout();
    onNavigate?.();
    navigate('/');
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Marca onClick={onNavigate} />
        <p className="mt-3 font-serif text-sm italic text-terracota-500">Acompañamos a quien cuida</p>

        {/* Para todo el mundo */}
        <nav className="mt-8 space-y-1">
          <NavItem to="/" icon={Home} onClick={onNavigate} end>Inicio</NavItem>
          <NavItem to="/citas" icon={Calendar} onClick={onNavigate}>Consultas</NavItem>
          <NavItem to="/talleres" icon={BookOpen} onClick={onNavigate}>Talleres</NavItem>
          <NavItem to="/material" icon={FolderOpen} onClick={onNavigate}>Materiales y guías</NavItem>
          <NavItem to="/acerca-de" icon={Info} onClick={onNavigate}>Acerca de nosotros</NavItem>
        </nav>

        {/* Solo para usuarios con sesión */}
        {user && (
          <div className="mt-8">
            <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sage-600">
              Mi espacio
            </p>
            <div className="space-y-1">
              <NavItem to="/dashboard" icon={LayoutDashboard} onClick={onNavigate}>Mi panel</NavItem>
              <NavItem to="/chat" icon={MessageSquare} onClick={onNavigate}>Chat</NavItem>
              <NavItem to="/tareas" icon={ClipboardList} onClick={onNavigate}>Tareas</NavItem>
              <NavItem to="/informes" icon={FileText} onClick={onNavigate}>Informes</NavItem>
            </div>
          </div>
        )}

        {/* Solo para administradores (tipo 1) */}
        {isAdmin && (
          <div className="mt-8">
            <p className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-oro-600">
              <ShieldCheck size={14} /> Administración
            </p>
            <div className="space-y-1">
              <NavItem to="/admin/citas" icon={CalendarCheck} onClick={onNavigate}>Modificar citas</NavItem>
              <NavItem to="/admin/usuarios" icon={Users} onClick={onNavigate}>Modificar usuarios</NavItem>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 space-y-4">
        <a
          href="https://wa.me/34678766839"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold text-sage-600 hover:text-sage-800"
        >
          <Phone size={18} /> Contacto WhatsApp
        </a>

        <div className="rounded-2xl border border-oro-200 bg-oro-50 p-4">
          {user ? (
            <button
              onClick={salir}
              className="flex w-full items-center justify-center gap-2 text-sm font-medium text-terracota-600 hover:text-terracota-700"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          ) : (
            <>
              <Link
                to="/login"
                onClick={onNavigate}
                className="mb-2 block rounded-full bg-sage-500 py-2 text-center text-sm font-semibold text-white hover:bg-sage-600"
              >
                Iniciar sesión
              </Link>
              <Link to="/registro" onClick={onNavigate} className="block text-center text-sm text-sage-700 underline">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }) {
  const { user, isAdmin } = useAuth();
  const [abierto, setAbierto] = useState(false);

  return (
    <div className="flex min-h-screen bg-crema-50">
      {/* Menú lateral (escritorio) */}
      <aside className="fixed hidden h-full w-64 overflow-y-auto border-r border-crema-200 bg-white p-6 md:block">
        <MenuLateral />
      </aside>

      {/* Menú móvil */}
      {abierto && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-tierra-800/40" onClick={() => setAbierto(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-white p-6 shadow-xl">
            <button
              onClick={() => setAbierto(false)}
              className="absolute right-4 top-4 text-stone-500"
              aria-label="Cerrar menú"
            >
              <X size={22} />
            </button>
            <MenuLateral onNavigate={() => setAbierto(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col md:ml-64">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-crema-200 bg-white/90 px-4 py-3 backdrop-blur">
          <button
            onClick={() => setAbierto(true)}
            className="text-sage-700 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={24} />
          </button>
          <span className="hidden md:block" />
          {user ? (
            <span className="flex items-center gap-2 text-sm font-semibold text-tierra-700">
              Hola, {user.nombre_usuario}
              {isAdmin && (
                <span className="rounded-full bg-oro-100 px-2 py-0.5 text-[11px] font-semibold text-oro-600">
                  Administrador
                </span>
              )}
            </span>
          ) : (
            <span className="text-sm text-stone-400">Invitado</span>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-8">{children ?? <Outlet />}</main>

        {/* Pie de página */}
        <footer className="border-t border-crema-200 bg-crema-100 px-6 py-6 text-center">
          <p className="mx-auto max-w-3xl text-xs leading-relaxed text-stone-500">{AVISO_LEGAL}</p>
          <p className="mt-2 text-xs text-stone-400">© {new Date().getFullYear()} Orienta Psicología</p>
        </footer>
      </div>
    </div>
  );
}
