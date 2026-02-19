import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Request interceptor → attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 🚨 Response interceptor → handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token invalid / expired
            localStorage.removeItem("token");
            localStorage.removeItem("role");

            // Force logout
            window.location.href = "/login";
        }

        return Promise.reject(error);
    }
);

export default api;
