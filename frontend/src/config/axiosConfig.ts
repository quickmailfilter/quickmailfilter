// Axios API Configuration with Error Handling
import axios from "axios";
import { toast } from "sonner";

/**
 * Configure axios with global error handling and logging
 * This provides better error messages for network issues
 */

export const configureAxios = () => {
  // Response interceptor for better error handling
  axios.interceptors.response.use(
    (response) => {
      return response;
    },
    (error) => {
      if (!error.response) {
        // Network error - no response from server
        if (error.code === "ECONNABORTED") {
          console.error("Request timeout - server not responding");
        } else if (error.code === "ERR_NETWORK") {
          console.error(
            "Network error - check server is running and CORS is configured",
          );
        } else {
          console.error("Network request failed:", error.message);
        }
      } else {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 400:
            console.error("Bad request (400):", data);
            break;
          case 401:
            console.error("Unauthorized (401) - check authentication");
            break;
          case 403:
            console.error("Forbidden (403) - access denied");
            break;
          case 404:
            console.error(
              "Not found (404) - endpoint does not exist:",
              error.config?.url,
            );
            break;
          case 429:
            console.error("Rate limited (429) - too many requests");
            toast.error("Too many requests. Please try again later.");
            break;
          case 500:
            console.error("Internal server error (500)");
            break;
          case 503:
            console.error(
              "Service unavailable (503):",
              data?.message || "Server not available",
            );
            break;
          default:
            console.error(`HTTP Error ${status}:`, data);
        }
      }

      return Promise.reject(error);
    },
  );

  // Request interceptor for logging
  axios.interceptors.request.use(
    (config) => {
      // Log API calls in development
      if (process.env.NODE_ENV === "development") {
        console.debug(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
};

export default configureAxios;
