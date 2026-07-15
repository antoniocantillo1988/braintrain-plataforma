// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home'; // <--- ESTO DEBE COINCIDIR CON LA CARPETA src/pages/
import Citas from './pages/Citas';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/citas" element={<Layout><Citas /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}