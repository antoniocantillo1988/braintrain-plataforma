// src/components/ProtectedRoute.jsx
// Envuelve rutas privadas: si no hay sesión, redirige a /login
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  // Mientras cargamos la sesión de localStorage, no hacemos nada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-stone-400 text-sm">Cargando…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.tipo !== 1) return <Navigate to="/dashboard" replace />;

  return children;
}
