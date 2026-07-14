// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Asegúrate de que esta línea exista en la parte superior de src/App.jsx
import Dashboard from './pages/Dashboard';

// Importa la nueva página Home
import Home from './components/Home'; 
import Login from './pages/Login';
import Register from './pages/Register';
// ... (resto de tus importaciones: Dashboard, Citas, etc.)

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
          {/* RUTA PÚBLICA: Home */}
          <Route path="/" element={<Home />} />
          
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* Rutas privadas */}
          <Route path="/dashboard" element={<PrivatePage><Dashboard /></PrivatePage>} />
          <Route path="/citas"      element={<PrivatePage><Citas /></PrivatePage>} />
          {/* ... resto de rutas ... */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}