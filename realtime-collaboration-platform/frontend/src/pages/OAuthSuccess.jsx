import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const OAuthSuccess = () => {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = params.get("token");
        const role = params.get("role");

        if (!token || !role) {
            navigate("/login");
            return;
        }

        // store token + role
        login(token, role);

        // role-based redirect
        if (role === "OWNER") navigate("/dashboard/owner");
        else if (role === "EDITOR") navigate("/dashboard/editor");
        else navigate("/dashboard/viewer");

    }, [params, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <p className="text-lg font-medium">Signing you in with Google…</p>
        </div>
    );
};

export default OAuthSuccess;
