// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Citas from './pages/Citas';
import Chat from './pages/Chat';
import BrainTrain from './pages/BrainTrain';
import Talleres from './pages/Talleres';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminCitas from './pages/AdminCitas';
import AdminUsuarios from './pages/AdminUsuarios';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Layout (menú lateral + pie) compartido por todas las rutas */}
          <Route element={<Layout />}>
            {/* Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/citas" element={<Citas />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />

            {/* Requieren sesión */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/braintrain" element={<ProtectedRoute><BrainTrain /></ProtectedRoute>} />
            <Route path="/talleres" element={<ProtectedRoute><Talleres /></ProtectedRoute>} />

            {/* Solo administradores (tipo 1) */}
            <Route path="/admin/citas" element={<ProtectedRoute adminOnly><AdminCitas /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute adminOnly><AdminUsuarios /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
