import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // ================= EMAIL + PASSWORD LOGIN =================
    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const token =
                response.data.token ||
                response.data.accessToken ||
                response.data.jwt;

            if (!token) {
                throw new Error("Token missing");
            }

            // ✅ Save auth state
            login(token, response.data.role);

            // ✅ Redirect
            navigate("/dashboard");

        } catch (err) {
            setError("Invalid email or password");
        } finally {
            setLoading(false);
        }
    };

    // ================= GOOGLE LOGIN =================
    const handleGoogleLogin = () => {
        window.location.href =
            "http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

                {/* Header */}
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Welcome Back
                </h2>
                <p className="text-center text-gray-500 mt-2">
                    Login to continue
                </p>

                {/* Error */}
                {error && (
                    <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
                        {error}
                    </div>
                )}

                {/* Email Login Form */}
                <form onSubmit={handleLogin} className="mt-6 space-y-5">

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                📧
                            </span>
                            <input
                                type="email"
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>

                        <div className="relative">
                            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                                🔒
                            </span>

                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full pl-10 pr-12 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 text-sm text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Login Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                {/* OR Divider */}
                <div className="flex items-center gap-2 my-6">
                    <div className="flex-1 h-px bg-gray-300" />
                    <span className="text-sm text-gray-500">OR</span>
                    <div className="flex-1 h-px bg-gray-300" />
                </div>

                {/* Google Login Button */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full border border-gray-300 py-2.5 rounded-lg flex items-center justify-center gap-3 hover:bg-gray-50 transition"
                >
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span className="font-medium text-gray-700">
                        Continue with Google
                    </span>
                </button>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    © 2026 Realtime Collaboration Platform
                </p>
            </div>
        </div>
    );
};

export default Login;
