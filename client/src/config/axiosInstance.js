import axios from "axios";
import { API_URL } from "./api.js";

const axiosInstance = axios.create();

// Attach current token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const clearSession = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userData");
};

let refreshInFlight = null;

/**
 * Exchange the refresh token for a new access token. Concurrent callers
 * (several 401s, the socket reconnecting) share one request. Resolves to the
 * new token; on failure the session is cleared and the user sent to /login.
 */
export function refreshAccessToken() {
  if (refreshInFlight) return refreshInFlight;

  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return Promise.reject(new Error("No refresh token"));
  }

  refreshInFlight = axios
    .post(`${API_URL}/auth/refresh-token`, { refreshToken })
    .then(({ data }) => {
      localStorage.setItem("authToken", data.accessToken);
      return data.accessToken;
    })
    .catch((error) => {
      clearSession();
      window.location.href = "/login";
      throw error;
    })
    .finally(() => {
      refreshInFlight = null;
    });

  return refreshInFlight;
}

// On 401: refresh once and retry the request
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original?._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    const newToken = await refreshAccessToken().catch(() => null);
    if (!newToken) return Promise.reject(error);

    original.headers.Authorization = `Bearer ${newToken}`;
    return axiosInstance(original);
  },
);

export default axiosInstance;
