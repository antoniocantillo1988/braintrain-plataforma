// src/lib/api.js
// Wrapper sobre fetch que añade el token JWT automáticamente
// y centraliza el manejo de errores.

const BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('orienta_token');

  // Se construye la cabecera base.
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Se añade el token de autorización solo si existe.
  // Esto evita enviar 'Authorization: Bearer null' en peticiones autenticadas.
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

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
  del: (path) => apiFetch(path, { method: 'DELETE' }),
};
