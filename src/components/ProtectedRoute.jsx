// src/components/ProtectedRoute.jsx
// Envuelve rutas privadas: sin sesión → /login; adminOnly → solo tipo 1
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-stone-400 text-sm">Cargando…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && Number(user.tipo) !== 1) return <Navigate to="/dashboard" replace />;

  return children;
}
