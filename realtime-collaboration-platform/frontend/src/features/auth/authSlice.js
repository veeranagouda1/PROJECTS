import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";
import { getUserFromToken } from "../../services/jwtUtils";

// ── Helper ────────────────────────────────────────────────
function persistSession(accessToken, refreshToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return getUserFromToken(accessToken); // { email, role, exp }
}

// ── Thunks ────────────────────────────────────────────────

// POST /api/auth/login → { accessToken, refreshToken }
export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/login", { email, password });
            const user = persistSession(res.data.accessToken, res.data.refreshToken);
            return { ...res.data, user };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.response?.data ||
                "Login failed. Please check your credentials."
            );
        }
    }
);

// POST /api/auth/register → { accessToken, refreshToken }
// RegisterRequest needs: email, password, name
export const registerUser = createAsyncThunk(
    "auth/register",
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/register", { name, email, password });
            const user = persistSession(res.data.accessToken, res.data.refreshToken);
            return { ...res.data, user };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message ||
                err.response?.data ||
                "Registration failed. Email may already be registered."
            );
        }
    }
);

// POST /api/auth/google → { idToken } → { accessToken, refreshToken }
export const googleLoginUser = createAsyncThunk(
    "auth/google",
    async (idToken, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/google", { idToken });
            const user = persistSession(res.data.accessToken, res.data.refreshToken);
            return { ...res.data, user };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Google login failed."
            );
        }
    }
);

// POST /api/auth/logout → sends refreshToken in body
export const logoutUser = createAsyncThunk(
    "auth/logout",
    async (_, { getState }) => {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
            try {
                await API.post("/auth/logout", { refreshToken });
            } catch {
                // Ignore errors — still clear local state
            }
        }
    }
);

// GET /api/user/profile → ProfileResponse { email, fullName, bio, phone }
export const fetchProfile = createAsyncThunk(
    "auth/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get("/user/profile");
            return res.data; // { email, fullName, bio, phone }
        } catch {
            return rejectWithValue(null);
        }
    }
);

// PUT /api/user/profile → UpdateProfileRequest { fullName, bio, phone }
export const updateProfile = createAsyncThunk(
    "auth/updateProfile",
    async ({ fullName, bio, phone }, { rejectWithValue }) => {
        try {
            const res = await API.put("/user/profile", { fullName, bio, phone });
            return res.data;
        } catch (err) {
            return rejectWithValue(err.response?.data?.message || "Update failed.");
        }
    }
);

// ── Initial state ─────────────────────────────────────────
const storedToken = localStorage.getItem("accessToken");

const initialState = {
    accessToken: storedToken,
    refreshToken: localStorage.getItem("refreshToken"),
    user: getUserFromToken(storedToken), // { email, role } or null
    profile: null,   // { email, fullName, bio, phone } from /user/profile
    loading: false,
    error: null,
};

// ── Slice ─────────────────────────────────────────────────
const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            state.profile = null;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        const pending = (state) => { state.loading = true; state.error = null; };
        const fulfilled = (state, action) => {
            state.loading = false;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.user = action.payload.user;
        };
        const rejected = (state, action) => {
            state.loading = false;
            state.error = action.payload;
        };

        builder
            .addCase(loginUser.pending, pending)
            .addCase(loginUser.fulfilled, fulfilled)
            .addCase(loginUser.rejected, rejected)

            .addCase(registerUser.pending, pending)
            .addCase(registerUser.fulfilled, fulfilled)
            .addCase(registerUser.rejected, rejected)

            .addCase(googleLoginUser.pending, pending)
            .addCase(googleLoginUser.fulfilled, fulfilled)
            .addCase(googleLoginUser.rejected, rejected)

            .addCase(logoutUser.fulfilled, (state) => {
                state.accessToken = null;
                state.refreshToken = null;
                state.user = null;
                state.profile = null;
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
            })

            // ProfileResponse: { email, fullName, bio, phone }
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;