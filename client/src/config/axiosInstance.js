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

// Queue for requests waiting on a token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// On 401: refresh once, retry, or redirect to login
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      processQueue(error);
      isRefreshing = false;
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {
        refreshToken,
      });
      const newToken = data.accessToken;
      localStorage.setItem("authToken", newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      processQueue(null, newToken);
      isRefreshing = false;
      return axiosInstance(original);
    } catch (refreshError) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
      processQueue(refreshError);
      isRefreshing = false;
      window.location.href = "/login";
      return Promise.reject(refreshError);
    }
  },
);

export default axiosInstance;
