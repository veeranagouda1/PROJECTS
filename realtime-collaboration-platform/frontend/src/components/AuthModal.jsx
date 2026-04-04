import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser, clearError } from "../features/auth/authSlice";

const s = {
    overlay: {
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.38)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, backdropFilter: "blur(4px)",
    },
    modal: {
        background: "#fff", borderRadius: "16px",
        padding: "44px 48px", width: "420px",
        boxShadow: "0 24px 80px rgba(0,0,0,0.18)",
        position: "relative",
    },
    closeBtn: {
        position: "absolute", top: "16px", right: "20px",
        background: "none", border: "none",
        fontSize: "22px", color: "#aaa", cursor: "pointer",
        lineHeight: 1, fontFamily: "inherit",
    },
    tabs: {
        display: "flex", marginBottom: "28px",
        borderBottom: "2px solid #f0f0f0",
    },
    tab: (active) => ({
        flex: 1, padding: "10px 0",
        background: "none", border: "none",
        fontSize: "15px", fontWeight: active ? 700 : 500,
        color: active ? "#111" : "#aaa",
        cursor: "pointer", fontFamily: "inherit",
        borderBottom: active ? "2px solid #111" : "2px solid transparent",
        marginBottom: "-2px", transition: "all 0.15s",
    }),
    heading: {
        fontSize: "22px", fontWeight: 700,
        color: "#111", marginBottom: "6px", letterSpacing: "-0.4px",
    },
    sub: { fontSize: "14px", color: "#777", marginBottom: "24px" },
    googleBtn: {
        width: "100%", padding: "12px",
        border: "1px solid #ddd", borderRadius: "10px",
        background: "#fff", fontSize: "14px", fontWeight: 500,
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        gap: "10px", color: "#111", fontFamily: "inherit",
    },
    divider: {
        display: "flex", alignItems: "center",
        gap: "12px", margin: "20px 0",
    },
    divLine: { flex: 1, height: "1px", background: "#eee" },
    divText: { fontSize: "13px", color: "#bbb" },
    input: {
        width: "100%", padding: "12px 16px",
        border: "1px solid #e0e0e0", borderRadius: "10px",
        fontSize: "14px", outline: "none",
        boxSizing: "border-box", color: "#111",
        background: "#fff", fontFamily: "inherit", marginBottom: "12px",
    },
    submitBtn: (loading) => ({
        width: "100%", padding: "13px",
        background: "#111", color: "#fff",
        border: "none", borderRadius: "10px",
        fontSize: "15px", fontWeight: 600,
        cursor: loading ? "not-allowed" : "pointer",
        marginTop: "4px", fontFamily: "inherit",
        opacity: loading ? 0.7 : 1,
    }),
    error: {
        fontSize: "13px", color: "#c53030",
        marginBottom: "14px", padding: "10px 14px",
        background: "#fff5f5", borderRadius: "8px",
        border: "1px solid #fed7d7",
    },
};

export default function AuthModal({ show, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, accessToken } = useSelector((s) => s.auth);

    const [tab, setTab] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        if (accessToken && show) {
            onClose();
            navigate("/dashboard");
        }
    }, [accessToken]);

    useEffect(() => {
        dispatch(clearError());
        setName(""); setEmail(""); setPassword("");
    }, [tab]);

    if (!show) return null;

    const handleSubmit = () => {
        if (tab === "login") {
            dispatch(loginUser({ email, password }));
        } else {
            dispatch(registerUser({ name, email, password }));
        }
    };

    return (
        <div style={s.overlay} onClick={onClose}>
            <div style={s.modal} onClick={(e) => e.stopPropagation()}>
                <button style={s.closeBtn} onClick={onClose}>×</button>

                <div style={s.tabs}>
                    <button style={s.tab(tab === "login")} onClick={() => setTab("login")}>Log in</button>
                    <button style={s.tab(tab === "register")} onClick={() => setTab("register")}>Sign up</button>
                </div>

                <h2 style={s.heading}>{tab === "login" ? "Welcome back" : "Create your account"}</h2>
                <p style={s.sub}>{tab === "login" ? "Enter your details to continue." : "Start collaborating in seconds."}</p>

                <button style={s.googleBtn}>
                    <svg width="18" height="18" viewBox="0 0 18 18">
                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
                        <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
                    </svg>
                    Continue with Google
                </button>

                <div style={s.divider}>
                    <div style={s.divLine} /><span style={s.divText}>or</span><div style={s.divLine} />
                </div>

                {error && <div style={s.error}>{error}</div>}

                {tab === "register" && (
                    <input style={s.input} type="text" placeholder="Full name"
                        value={name} onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                )}
                <input style={s.input} type="email" placeholder="Email"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
                <input style={s.input} type="password" placeholder="Password"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />

                <button style={s.submitBtn(loading)} onClick={handleSubmit} disabled={loading}>
                    {loading
                        ? (tab === "login" ? "Logging in..." : "Creating account...")
                        : (tab === "login" ? "Log in" : "Create account")}
                </button>
            </div>
        </div>
    );
}