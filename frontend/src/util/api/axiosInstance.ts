import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        await axiosInstance.get("/auth/refresh");

        // Retry the original request after refreshing
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token is also invalid or expired
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
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
