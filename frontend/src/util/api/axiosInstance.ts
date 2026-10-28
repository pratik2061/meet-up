import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// CSRF token caching and queue
let csrfToken: string | null = null;
let csrfPromise: Promise<string | null> | null = null;

export const getCsrfToken = async (): Promise<string | null> => {
  if (csrfToken) return csrfToken;
  if (!csrfPromise) {
    csrfPromise = axiosInstance
      .get<{ csrfToken: string }>("/csrf-token")
      .then((res) => {
        csrfToken = res.data.csrfToken;
        return csrfToken;
      })
      .catch((err) => {
        console.error("Failed to fetch CSRF token:", err);
        return null;
      })
      .finally(() => {
        csrfPromise = null;
      });
  }
  return csrfPromise;
};

// Eagerly prefetch CSRF token on startup
getCsrfToken();

// Request interceptor to attach x-csrf-token for state-changing requests
axiosInstance.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase();
  const isMutating =
    method && ["post", "patch", "put", "delete"].includes(method);

  if (isMutating && !config.url?.includes("/csrf-token")) {
    const token = await getCsrfToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["x-csrf-token"] = token;
    }
  }

  return config;
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

    // Handle invalid or expired CSRF token (403 Forbidden with CSRF error)
    if (
      error.response?.status === 403 &&
      typeof error.response?.data?.message === "string" &&
      error.response.data.message.toLowerCase().includes("csrf") &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      csrfToken = null;
      const newToken = await getCsrfToken();
      if (newToken) {
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers["x-csrf-token"] = newToken;
        return axiosInstance(originalRequest);
      }
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
        const PUBLIC_ROUTES = [
          "/",
          "/login",
          "/signup",
          "/reset-password",
          "/auth/callback",
        ];
        if (!PUBLIC_ROUTES.includes(window.location.pathname)) {
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
