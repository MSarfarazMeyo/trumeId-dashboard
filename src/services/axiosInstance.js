import axios from "axios";
import { LOCAL_STORAGE } from "../lib/constants";

const axiosInstance = axios.create({
  baseURL:
    import.meta.env.VITE_APP_BASE_API_URL ||
    "https://nobis-bk.vercel.app/api/v1",
  // headers: {
  //   'ngrok-skip-browser-warning': 'true', // ✅ Add this header to all requests
  // },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(LOCAL_STORAGE.TOKEN_KEY);
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
