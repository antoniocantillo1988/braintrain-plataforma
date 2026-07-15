// src/components/Layout.jsx
//import { useAuth } from '../context/AuthContext'; // Importamos el contexto
//import { MessageSquare, Brain, BookOpen, Calendar, Home, LogOut, Phone } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth(); // Obtenemos usuario y función de logout

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Banner Lateral Fijo */}
      <aside className="w-64 bg-white border-r border-stone-200 p-8 hidden md:flex flex-col justify-between fixed h-full overflow-y-auto">
        <div>
          <h2 className="text-xl font-bold text-teal-800 mb-8">Antonio Cantillo</h2>
          
          {/* Navegación */}
          <nav className="space-y-4">
            <a href="/" className="flex items-center gap-3 text-stone-600 hover:text-teal-700"><Home size={20} /> Inicio</a>
            <a href="/citas" className="flex items-center gap-3 text-stone-600 hover:text-teal-700"><Calendar size={20} /> Consultas</a>
            
            {user && (
              <>
                <a href="/chat" className="flex items-center gap-3 text-stone-600 hover:text-teal-700"><MessageSquare size={20} /> Chat</a>
                <a href="/braintrain" className="flex items-center gap-3 text-stone-600 hover:text-teal-700"><Brain size={20} /> BrainTrain</a>
                <a href="/talleres" className="flex items-center gap-3 text-stone-600 hover:text-teal-700"><BookOpen size={20} /> Talleres</a>
              </>
            )}
          </nav>
        </div>

        {/* Zona Inferior */}
        <div className="space-y-4">
          {/* WhatsApp */}
          <a href="https://wa.me/34678766839" target="_blank" rel="noopener noreferrer" 
             className="flex items-center gap-2 text-teal-600 font-semibold hover:text-teal-800">
            <Phone size={18} /> Contacto WhatsApp
          </a>

          {/* Login/Logout */}
          <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
            {user ? (
              <button onClick={logout} className="w-full text-sm text-red-600 flex items-center justify-center gap-2">
                <LogOut size={16} /> Cerrar Sesión
              </button>
            ) : (
              <>
                <a href="/login" className="block text-sm bg-teal-600 text-white text-center py-2 rounded-lg mb-2">Iniciar Sesión</a>
                <a href="/registro" className="block text-sm text-teal-700 text-center underline">Registrarse</a>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 md:ml-64">
        {/* Cabecera con nombre de usuario */}
        <header className="bg-white border-b border-stone-200 p-4 flex justify-end">
          {user ? (
            <span className="text-sm font-semibold text-stone-700">Hola, {user.nombre}</span>
          ) : (
            <span className="text-sm text-stone-400">Invitado</span>
          )}
        </header>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}