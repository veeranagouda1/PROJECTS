import axios from "axios";
import { safeStorage, storageKeys } from "../utils/storage";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {

  // Read JWT token from safeStorage instead of localStorage
  const token =
    safeStorage.getItem(storageKeys.TOKEN) ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
