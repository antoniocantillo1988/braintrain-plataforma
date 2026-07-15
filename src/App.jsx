// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Citas from './pages/Citas';
import Login from './pages/Login'; // Asegúrate de tener este archivo
import Register from './pages/Register'; // Asegúrate de tener este archivo

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rutas principales */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/citas" element={<Layout><Citas /></Layout>} />
          <Route path="/login" element={<Layout><Login /></Layout>} />
          <Route path="/registro" element={<Layout><Register /></Layout>} />
          
          {/* Ruta de fallback para evitar pantalla en blanco */}
          <Route path="*" element={<Layout><Home /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}