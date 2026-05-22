import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// error handling
axiosInstance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    console.log("Response received:", response);
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger

    return Promise.reject(error);
  },
);

// Generic API response template for Axios
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  statusCode?: number;
}
