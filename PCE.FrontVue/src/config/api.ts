// Configuración de la URL base del API según el entorno
const getApiBaseUrl = (): string => {
  // En desarrollo (vite dev server): usa /api (proxy del vite)
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // En producción (Docker): usa la URL del gateway con /api
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // Si estamos en localhost/127.0.0.1, usar gateway en puerto 5000 con /api
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//localhost:5000/api`;
  }
  
  // En otros casos, usar la misma URL pero con puerto 5000 y /api
  return `${protocol}//${hostname}:5000/api`;
};

export const API_BASE_URL = getApiBaseUrl();
