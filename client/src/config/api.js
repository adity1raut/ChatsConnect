/**
 * Centralized API & Socket URL configuration.
 * All components and contexts should import from here instead of
 * re-declaring `import.meta.env.VITE_BACKEND_URL` individually.
 *
 * Set ONE variable in your .env file:
 *   VITE_BACKEND_URL - e.g. https://miniproject-ckza.onrender.com
 *                       or   http://localhost:5000
 */
const BASE_URL = "https://chatconnect-backend.azurewebsites.net";

export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;
export const AI_API_URL = `${BASE_URL}/api/ai`;
