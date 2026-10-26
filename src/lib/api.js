// src/lib/api.js
// Wrapper sobre fetch que añade el token JWT automáticamente
// y centraliza el manejo de errores.

const BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('orienta_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Solo se añade el token si existe (evita enviar 'Bearer null')
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  // Sesión caducada: limpiamos y mandamos a /login (excepto en login/registro,
  // donde un 401 significa "credenciales incorrectas")
  if (res.status === 401 && token && !path.startsWith('/auth/')) {
    localStorage.removeItem('orienta_token');
    localStorage.removeItem('orienta_user');
    window.location.href = '/login';
    throw new Error('Tu sesión ha caducado. Inicia sesión de nuevo.');
  }

  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }

  return data;
}

// Atajos semánticos
export const api = {
  get: (path) => apiFetch(path, { method: 'GET' }),
  post: (path, body) => apiFetch(path, { method: 'POST', body }),
  put: (path, body) => apiFetch(path, { method: 'PUT', body }),
  // CORREGIDO: DELETE ahora puede llevar body (los endpoints admin lo leen de req.body)
  del: (path, body) => apiFetch(path, { method: 'DELETE', body }),
};
