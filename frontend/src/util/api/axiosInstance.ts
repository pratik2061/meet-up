import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Flag and queue to prevent concurrent /auth/refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// URL endpoints where a 401 should NEVER attempt token refresh
const AUTH_BYPASS_URLS = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isBypassUrl = AUTH_BYPASS_URLS.some((url) =>
      originalRequest.url?.includes(url),
    );

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isBypassUrl
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.get("/auth/refresh");
        processQueue(null);

        // Retry the original request after refreshing
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        // Refresh token is also invalid or expired
        if (
          window.location.pathname !== "/login" &&
          window.location.pathname !== "/signup"
        ) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Generic API response template for Axios
export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  statusCode?: number;
}

export interface UniversalErrorResponse {
  response: {
    data: {
      message: string;
    };
  };
}
