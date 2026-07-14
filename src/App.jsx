// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Páginas públicas
import Login from './pages/Login';
import Register from './pages/Register';

// Páginas privadas (se irán completando en los siguientes pasos)
import Dashboard from './pages/Dashboard';
import Citas from './pages/Citas';
import Chat from './pages/Chat';
import BrainTrain from './pages/BrainTrain';
import Talleres from './pages/Talleres';

// Panel de admin
// import Admin from './pages/Admin';  // lo añadiremos en el paso de admin

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
          {/* Ruta raíz → login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Rutas públicas */}
          <Route path="/login"    element={<Login />} />
          <Route path="/registro" element={<Register />} />

          {/* Rutas privadas */}
          <Route path="/dashboard"  element={<PrivatePage><Dashboard /></PrivatePage>} />
          <Route path="/citas"      element={<PrivatePage><Citas /></PrivatePage>} />
          <Route path="/chat"       element={<PrivatePage><Chat /></PrivatePage>} />
          <Route path="/braintrain" element={<PrivatePage><BrainTrain /></PrivatePage>} />
          <Route path="/talleres"   element={<PrivatePage><Talleres /></PrivatePage>} />

          {/* Admin solo accesible si tipo === 1 */}
          {/* <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><Admin /></Layout></ProtectedRoute>} /> */}

          {/* Cualquier otra ruta */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

<Layout>
   <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/citas" element={<Citas />} />
   </Routes>
</Layout>