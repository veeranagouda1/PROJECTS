import axios from "axios";
import { safeStorage, storageKeys } from "../utils/storage.js";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

api.interceptors.request.use((config) => {
  const token = safeStorage.getItem(storageKeys.TOKEN);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
