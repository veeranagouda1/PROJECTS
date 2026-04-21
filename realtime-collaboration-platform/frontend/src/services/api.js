import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: { "Content-Type": "application/json" },
});

// ── Request interceptor: attach JWT ──────────────────────────────────────────
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ── Response interceptor: silent token refresh on 401 ────────────────────────
let isRefreshing = false;
// Queue of { resolve, reject } for requests that came in while refreshing
let waitingQueue = [];

function processQueue(error, newToken = null) {
    waitingQueue.forEach(({ resolve, reject }) => {
        if (error) reject(error);
        else resolve(newToken);
    });
    waitingQueue = [];
}

API.interceptors.response.use(
    (res) => res,
    async (err) => {
        const original = err.config;

        // Only attempt refresh on 401, and only once per request (_retry flag)
        if (err.response?.status !== 401 || original._retry) {
            return Promise.reject(err);
        }

        // Don't try to refresh if the failed request IS the refresh endpoint
        // (avoids infinite loop)
        if (original.url?.includes("/auth/refresh")) {
            clearSession();
            return Promise.reject(err);
        }

        original._retry = true;

        if (isRefreshing) {
            // Another refresh is already in flight — queue this request
            return new Promise((resolve, reject) => {
                waitingQueue.push({ resolve, reject });
            }).then((newToken) => {
                original.headers.Authorization = `Bearer ${newToken}`;
                return API(original);
            }).catch((e) => Promise.reject(e));
        }

        isRefreshing = true;

        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
            clearSession();
            return Promise.reject(err);
        }

        try {
            // Call refresh endpoint directly with axios (not API instance)
            // to avoid the interceptor triggering again
            const res = await axios.post(
                "http://localhost:8080/api/auth/refresh",
                { refreshToken },
                { headers: { "Content-Type": "application/json" } }
            );

            const { accessToken, refreshToken: newRefreshToken } = res.data;

            // Persist new tokens
            localStorage.setItem("accessToken", accessToken);
            if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
            }

            // Update default header for future requests
            API.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

            // Unblock queued requests
            processQueue(null, accessToken);

            // Retry the original request with the new token
            original.headers.Authorization = `Bearer ${accessToken}`;
            return API(original);

        } catch (refreshError) {
            // Refresh failed — session is truly expired, kick user to login
            processQueue(refreshError, null);
            clearSession();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

function clearSession() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    // Redirect to landing — use replace so back button doesn't return to dashboard
    window.location.replace("/");
}

export default API;