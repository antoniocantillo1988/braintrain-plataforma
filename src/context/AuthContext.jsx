// src/context/AuthContext.jsx
// Gestiona la sesión del usuario en toda la app.
// Guarda el token en localStorage para que persista entre recargas.

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // mientras leemos localStorage

  // Al montar, recuperamos la sesión guardada
  useEffect(() => {
    const savedToken = localStorage.getItem('orienta_token');
    const savedUser = localStorage.getItem('orienta_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function login(tokenRecibido, datosUsuario) {
    setToken(tokenRecibido);
    setUser(datosUsuario);
    localStorage.setItem('orienta_token', tokenRecibido);
    localStorage.setItem('orienta_user', JSON.stringify(datosUsuario));
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('orienta_token');
    localStorage.removeItem('orienta_user');
  }

  const isAdmin = user?.tipo === 1;

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
