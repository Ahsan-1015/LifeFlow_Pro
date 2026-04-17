import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("flowpilot_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ECONNABORTED") {
      error.userMessage = "This request is taking too long. Please try again in a moment.";
    } else if (error.code === "ERR_NETWORK") {
      error.userMessage = "Cannot reach the server right now. Please make sure the backend is running.";
    } else {
      error.userMessage = error.response?.data?.message || "Something went wrong while loading data.";
    }

    return Promise.reject(error);
  }
);

export default api;
