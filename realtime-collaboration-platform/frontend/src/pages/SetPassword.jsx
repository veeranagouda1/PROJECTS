import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/axios";

const SetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // 🔒 Block access if token missing
    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            await api.post(
                "/auth/set-password",
                { password },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            // ✅ Success → redirect to login
            navigate("/login");

        } catch (err) {
            setError(
                err?.response?.data?.message || "Failed to set password"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">

                <h2 className="text-3xl font-bold text-center text-gray-800">
                    Set Your Password
                </h2>

                <p className="text-center text-gray-500 mt-2">
                    Complete your account setup
                </p>

                {error && (
                    <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                    >
                        {loading ? "Saving..." : "Set Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SetPassword;

