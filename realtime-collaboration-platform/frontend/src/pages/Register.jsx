import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Register = () => {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // 🔐 Google OAuth Register/Login
    const handleGoogleRegister = () => {
        window.location.href =
            "http://localhost:8080/oauth2/authorization/google";
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await api.post("/auth/register", {
                fullName: name,
                email,
                password,
            });

            navigate("/login");
        } catch (err) {
            setError(err?.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

                {/* Header */}
                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Create Account
                </h2>
                <p className="text-center text-gray-500 mt-2">
                    Sign up to get started
                </p>

                {/* Google Register */}
                <button
                    type="button"
                    onClick={handleGoogleRegister}
                    className="w-full mt-6 flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-50 transition"
                >
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="w-5 h-5"
                    />
                    <span className="text-sm font-medium text-gray-700">
                        Continue with Google
                    </span>
                </button>

                {/* Divider */}
                <div className="flex items-center my-6">
                    <div className="flex-grow h-px bg-gray-300" />
                    <span className="px-3 text-sm text-gray-400">OR</span>
                    <div className="flex-grow h-px bg-gray-300" />
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleRegister} className="space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-3 text-sm text-gray-500"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(!showConfirmPassword)
                                }
                                className="absolute inset-y-0 right-3 text-sm text-gray-500"
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    {/* Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
