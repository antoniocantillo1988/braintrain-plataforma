// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Importa tus páginas
import Home from './components/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Citas from './pages/Citas';
// ... (resto de tus importaciones)

// Función para envolver páginas protegidas
function PrivatePage({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS (Envueltas en Layout para que se vea el menú lateral) */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/registro" element={<Layout><Register /></Layout>} />

          {/* RUTAS PRIVADAS (Requieren login) */}
          <Route path="/citas" element={<PrivatePage><Citas /></PrivatePage>} />
          {/* ... resto de rutas privadas ... */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}