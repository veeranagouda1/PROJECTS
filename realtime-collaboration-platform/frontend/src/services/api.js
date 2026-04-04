import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api",
});

// Attach JWT to every request automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If 401 → clear tokens and redirect to home
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export default API;