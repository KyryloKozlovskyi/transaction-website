import axios from "axios";
import { auth } from "../../config/config";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Create axios instance with auth interceptor
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add request interceptor to include Firebase token
apiClient.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          "API Request with auth:",
          config.method.toUpperCase(),
          config.url
        );
      } catch (error) {
        console.error("Error getting Firebase token:", error);
      }
    } else {
      console.warn("No Firebase user logged in for request:", config.url);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
export { API_URL };
