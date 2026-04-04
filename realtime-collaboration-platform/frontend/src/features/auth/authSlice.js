import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";

// ─── Thunks ───────────────────────────────────────────────

export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/login", { email, password });
            return res.data; // { accessToken, refreshToken }
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Login failed. Please try again."
            );
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/register",
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/register", { name, email, password });
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Registration failed. Please try again."
            );
        }
    }
);

export const googleLogin = createAsyncThunk(
    "auth/google",
    async (idToken, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/google", { idToken });
            return res.data;
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Google login failed."
            );
        }
    }
);

export const fetchProfile = createAsyncThunk(
    "auth/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get("/user/profile");
            return res.data;
        } catch (err) {
            return rejectWithValue("Could not fetch profile.");
        }
    }
);

// ─── Slice ────────────────────────────────────────────────

const initialState = {
    accessToken: localStorage.getItem("accessToken") || null,
    refreshToken: localStorage.getItem("refreshToken") || null,
    user: null,
    loading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout(state) {
            state.accessToken = null;
            state.refreshToken = null;
            state.user = null;
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        },
        clearError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // ── Login ──
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                localStorage.setItem("accessToken", action.payload.accessToken);
                localStorage.setItem("refreshToken", action.payload.refreshToken);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── Register ──
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                localStorage.setItem("accessToken", action.payload.accessToken);
                localStorage.setItem("refreshToken", action.payload.refreshToken);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });

        // ── Google ──
        builder
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                localStorage.setItem("accessToken", action.payload.accessToken);
                localStorage.setItem("refreshToken", action.payload.refreshToken);
            })
            .addCase(googleLogin.rejected, (state, action) => {
                state.error = action.payload;
            });

        // ── Profile ──
        builder
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.user = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;