/**
 * Centralized API & Socket URL configuration.
 * All components and contexts should import from here instead of
 * re-declaring `import.meta.env.VITE_API_URL` individually.
 *
 * Set these in your .env file:
 *   VITE_API_URL    - e.g. https://miniproject-ckza.onrender.com/api
 *   VITE_SOCKET_URL - e.g. https://miniproject-ckza.onrender.com
 */
export const API_URL =
    import.meta.env.VITE_API_URL || "https://miniproject-ckza.onrender.com/api" || "http://localhost:5000/api";

export const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "https://miniproject-ckza.onrender.com" || "http://localhost:5000";
