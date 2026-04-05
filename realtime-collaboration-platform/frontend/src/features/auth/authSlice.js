import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../services/api";
import { getUserFromToken } from "../../services/jwtUtils";

// ─── Helper: save tokens + decode user ────────────────────
function saveSession(accessToken, refreshToken) {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    return getUserFromToken(accessToken); // { email, role, exp }
}

// ─── Thunks ───────────────────────────────────────────────

export const loginUser = createAsyncThunk(
    "auth/login",
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/login", { email, password });
            const { accessToken, refreshToken } = res.data;
            const user = saveSession(accessToken, refreshToken);
            return { accessToken, refreshToken, user };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Login failed. Please check your credentials."
            );
        }
    }
);

export const registerUser = createAsyncThunk(
    "auth/register",
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/register", { name, email, password });
            const { accessToken, refreshToken } = res.data;
            const user = saveSession(accessToken, refreshToken);
            return { accessToken, refreshToken, user };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Registration failed. Try a different email."
            );
        }
    }
);

// Google: frontend gets idToken from Google SDK, sends to backend
export const googleLoginUser = createAsyncThunk(
    "auth/google",
    async (idToken, { rejectWithValue }) => {
        try {
            const res = await API.post("/auth/google", { idToken });
            const { accessToken, refreshToken } = res.data;
            const user = saveSession(accessToken, refreshToken);
            return { accessToken, refreshToken, user };
        } catch (err) {
            return rejectWithValue(
                err.response?.data?.message || "Google login failed."
            );
        }
    }
);

export const fetchProfile = createAsyncThunk(
    "auth/profile",
    async (_, { rejectWithValue }) => {
        try {
            const res = await API.get("/user/profile");
            return res.data; // { name, email, ... }
        } catch {
            return rejectWithValue(null);
        }
    }
);

// ─── Initial state ────────────────────────────────────────
const storedToken = localStorage.getItem("accessToken");
const storedUser = getUserFromToken(storedToken); // decode on page load

const initialState = {
    accessToken: storedToken,
    refreshToken: localStorage.getItem("refreshToken"),
    user: storedUser,   // { email, role } decoded from JWT
    profile: null,      // full profile from /user/profile (name etc.)
    loading: false,
    error: null,
};

// ─── Slice ────────────────────────────────────────────────
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
        const handlePending = (state) => {
            state.loading = true;
            state.error = null;
        };
        const handleFulfilled = (state, action) => {
            state.loading = false;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.user = action.payload.user;
        };
        const handleRejected = (state, action) => {
            state.loading = false;
            state.error = action.payload;
        };

        builder
            .addCase(loginUser.pending, handlePending)
            .addCase(loginUser.fulfilled, handleFulfilled)
            .addCase(loginUser.rejected, handleRejected)

            .addCase(registerUser.pending, handlePending)
            .addCase(registerUser.fulfilled, handleFulfilled)
            .addCase(registerUser.rejected, handleRejected)

            .addCase(googleLoginUser.pending, handlePending)
            .addCase(googleLoginUser.fulfilled, handleFulfilled)
            .addCase(googleLoginUser.rejected, handleRejected)

            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.profile = action.payload;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;