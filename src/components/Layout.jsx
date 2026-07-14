// src/components/Layout.jsx
export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Banner Lateral Fijo */}
      <aside className="w-64 bg-white border-r border-stone-200 p-8 hidden md:flex flex-col justify-between fixed h-full">
        <div>
          <h2 className="text-xl font-bold text-teal-800 mb-8">Antonio Cantillo</h2>
          <nav className="space-y-4">
            <a href="/" className="block text-stone-600 hover:text-teal-700">Inicio</a>
            <a href="/citas" className="block text-stone-600 hover:text-teal-700">Consultas</a>
          </nav>
        </div>
        
        <div className="bg-teal-50 p-4 rounded-xl border border-teal-100">
          <p className="text-sm text-teal-800 mb-3 font-medium">¿Acceso a tu espacio?</p>
          <a href="/login" className="block text-sm bg-teal-600 text-white text-center py-2 rounded-lg mb-2">Iniciar Sesión</a>
          <a href="/registro" className="block text-sm text-teal-700 text-center underline">Registrarse</a>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-8">
        {children}
      </main>
    </div>
  );
}