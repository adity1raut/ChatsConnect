/**
 * Centralized API & Socket URL configuration.
 * All components and contexts should import from here.
 *
 * Production builds always talk to the deployed backend.
 * In development (`npm run dev`), set VITE_BACKEND_URL in client/.env to use
 * a local backend, e.g. VITE_BACKEND_URL=http://localhost:5000
 */
const PRODUCTION_BACKEND_URL = "https://chatconnect-backend.azurewebsites.net";

const BASE_URL = (
  (import.meta.env.DEV && import.meta.env.VITE_BACKEND_URL) ||
  PRODUCTION_BACKEND_URL
).replace(/\/+$/, "");

export const API_URL = `${BASE_URL}/api`;
export const SOCKET_URL = BASE_URL;
export const AI_API_URL = `${BASE_URL}/api/ai`;
