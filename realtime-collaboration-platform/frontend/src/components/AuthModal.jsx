import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    loginUser,
    registerUser,
    googleLoginUser,
    clearError,
} from "../features/auth/authSlice";

// ─── Google Client ID — must match your backend ───────────
const GOOGLE_CLIENT_ID =
    "769453934960-76o89h3pd85e3kbk2fbie898s5sna7og.apps.googleusercontent.com";

// ─── Load Google Identity Services script once ────────────
let googleScriptLoaded = false;
function loadGoogleScript() {
    if (googleScriptLoaded || document.getElementById("google-gsi")) return;
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.id = "google-gsi";
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    googleScriptLoaded = true;
}

// ─── Styles ───────────────────────────────────────────────
const s = {
    overlay: {
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, backdropFilter: "blur(6px)",
    },
    modal: {
        background: "#fff", borderRadius: "20px",
        padding: "48px 52px", width: "440px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
        position: "relative", animation: "modalIn 0.2s ease",
    },
    closeBtn: {
        position: "absolute", top: "18px", right: "22px",
        background: "none", border: "none",
        fontSize: "20px", color: "#bbb",
        cursor: "pointer", fontFamily: "inherit",
        width: "32px", height: "32px",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "50%", transition: "background 0.15s",
    },
    tabs: {
        display: "flex", marginBottom: "32px",
        borderBottom: "1.5px solid #f0f0f0",
    },
    tab: (active) => ({
        flex: 1, padding: "10px 0",
        background: "none", border: "none",
        fontSize: "15px", fontWeight: active ? 700 : 500,
        color: active ? "#111" : "#bbb",
        cursor: "pointer", fontFamily: "inherit",
        borderBottom: active ? "2px solid #111" : "2px solid transparent",
        marginBottom: "-1.5px", transition: "all 0.15s",
    }),
    heading: {
        fontSize: "24px", fontWeight: 700,
        color: "#111", marginBottom: "6px", letterSpacing: "-0.5px",
    },
    sub: { fontSize: "14px", color: "#888", marginBottom: "28px", lineHeight: 1.5 },
    googleBtn: {
        width: "100%", padding: "13px",
        border: "1.5px solid #e8e8e8", borderRadius: "12px",
        background: "#fff", fontSize: "14px", fontWeight: 600,
        cursor: "pointer", display: "flex",
        alignItems: "center", justifyContent: "center",
        gap: "10px", color: "#111", fontFamily: "inherit",
        transition: "all 0.15s", marginBottom: "4px",
    },
    divider: {
        display: "flex", alignItems: "center",
        gap: "14px", margin: "22px 0",
    },
    divLine: { flex: 1, height: "1px", background: "#f0f0f0" },
    divText: { fontSize: "12px", color: "#ccc", fontWeight: 500 },
    inputWrap: { position: "relative", marginBottom: "12px" },
    inputLabel: {
        display: "block", fontSize: "12px",
        fontWeight: 600, color: "#666",
        marginBottom: "6px", letterSpacing: "0.2px",
    },
    input: {
        width: "100%", padding: "12px 16px",
        border: "1.5px solid #e8e8e8", borderRadius: "10px",
        fontSize: "14px", outline: "none",
        boxSizing: "border-box", color: "#111",
        background: "#fff", fontFamily: "inherit",
        transition: "border-color 0.15s",
    },
    submitBtn: (loading) => ({
        width: "100%", padding: "14px",
        background: "#111", color: "#fff",
        border: "none", borderRadius: "12px",
        fontSize: "15px", fontWeight: 700,
        cursor: loading ? "not-allowed" : "pointer",
        marginTop: "8px", fontFamily: "inherit",
        opacity: loading ? 0.75 : 1,
        transition: "all 0.15s", letterSpacing: "-0.2px",
    }),
    error: {
        fontSize: "13px", color: "#c53030",
        marginBottom: "16px", padding: "12px 16px",
        background: "#fff5f5", borderRadius: "10px",
        border: "1px solid #fed7d7", lineHeight: 1.5,
    },
    success: {
        fontSize: "13px", color: "#276749",
        marginBottom: "16px", padding: "12px 16px",
        background: "#f0fff4", borderRadius: "10px",
        border: "1px solid #c6f6d5",
    },
};

// ─── Google SVG icon ──────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
    );
}

// ─── Reusable input field ─────────────────────────────────
function Field({ label, type, placeholder, value, onChange, onKeyDown }) {
    return (
        <div style={s.inputWrap}>
            <label style={s.inputLabel}>{label}</label>
            <input
                style={s.input}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                onKeyDown={onKeyDown}
                onFocus={(e) => (e.target.style.borderColor = "#111")}
                onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
            />
        </div>
    );
}

// ─── Main modal ───────────────────────────────────────────
export default function AuthModal({ show, onClose }) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, accessToken, user } = useSelector((st) => st.auth);

    const [tab, setTab] = useState("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);

    // Load Google script on mount
    useEffect(() => { loadGoogleScript(); }, []);

    // Redirect on successful login
    useEffect(() => {
        if (accessToken && user && show) {
            onClose();
            // Role-based redirect
            if (user.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        }
    }, [accessToken, user]);

    // Reset form when tab changes
    useEffect(() => {
        dispatch(clearError());
        setName(""); setEmail(""); setPassword("");
    }, [tab]);

    if (!show) return null;

    // ── Email/password submit ──
    const handleSubmit = () => {
        if (!email.trim() || !password.trim()) return;
        if (tab === "login") {
            dispatch(loginUser({ email: email.trim(), password }));
        } else {
            if (!name.trim()) return;
            dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
        }
    };

    // ── Google login using GSI ──
    const handleGoogle = () => {
        if (!window.google) {
            alert("Google sign-in is loading, please try again in a moment.");
            return;
        }
        setGoogleLoading(true);

        const client = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: "openid email profile",
            callback: () => { }, // not used — we use id_token flow below
        });

        // Use ID token flow instead
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: async (response) => {
                setGoogleLoading(false);
                if (response.credential) {
                    dispatch(googleLoginUser(response.credential));
                }
            },
            auto_select: false,
        });

        window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                setGoogleLoading(false);
                // Fallback: show one-tap or popup
                window.google.accounts.id.renderButton(
                    document.getElementById("g-btn-container"),
                    { theme: "outline", size: "large", width: 340 }
                );
            }
        });
    };

    return (
        <>
            <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

            <div style={s.overlay} onClick={onClose}>
                <div style={s.modal} onClick={(e) => e.stopPropagation()}>

                    {/* Close */}
                    <button
                        style={s.closeBtn}
                        onClick={onClose}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                    >×</button>

                    {/* Tabs */}
                    <div style={s.tabs}>
                        <button style={s.tab(tab === "login")} onClick={() => setTab("login")}>Log in</button>
                        <button style={s.tab(tab === "register")} onClick={() => setTab("register")}>Sign up</button>
                    </div>

                    {/* Heading */}
                    <h2 style={s.heading}>
                        {tab === "login" ? "Welcome back" : "Create your account"}
                    </h2>
                    <p style={s.sub}>
                        {tab === "login"
                            ? "Sign in to continue to CollabX."
                            : "Start collaborating with your team in seconds."}
                    </p>

                    {/* Google button */}
                    <button
                        style={s.googleBtn}
                        onClick={handleGoogle}
                        disabled={googleLoading}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#ccc")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e8e8e8")}
                    >
                        {googleLoading ? (
                            <span style={{ fontSize: "14px", color: "#888" }}>Opening Google...</span>
                        ) : (
                            <><GoogleIcon /> Continue with Google</>
                        )}
                    </button>

                    {/* Hidden Google button container (fallback) */}
                    <div id="g-btn-container" style={{ marginTop: "8px" }} />

                    {/* Divider */}
                    <div style={s.divider}>
                        <div style={s.divLine} />
                        <span style={s.divText}>OR</span>
                        <div style={s.divLine} />
                    </div>

                    {/* Error */}
                    {error && <div style={s.error}>{error}</div>}

                    {/* Form fields */}
                    {tab === "register" && (
                        <Field
                            label="Full name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                        />
                    )}
                    <Field
                        label="Email address"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />
                    <Field
                        label="Password"
                        type="password"
                        placeholder={tab === "register" ? "Min 8 characters" : "Your password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    />

                    {/* Forgot password (login only) */}
                    {tab === "login" && (
                        <div style={{ textAlign: "right", marginBottom: "4px", marginTop: "-4px" }}>
                            <span style={{ fontSize: "13px", color: "#888", cursor: "pointer" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "#111")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "#888")}
                            >Forgot password?</span>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        style={s.submitBtn(loading)}
                        onClick={handleSubmit}
                        disabled={loading}
                        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = "#333"; }}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
                    >
                        {loading
                            ? (tab === "login" ? "Signing in..." : "Creating account...")
                            : (tab === "login" ? "Sign in" : "Create account")}
                    </button>

                    {/* Switch tab hint */}
                    <p style={{ textAlign: "center", fontSize: "13px", color: "#aaa", marginTop: "20px" }}>
                        {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                        <span
                            style={{ color: "#111", fontWeight: 600, cursor: "pointer" }}
                            onClick={() => setTab(tab === "login" ? "register" : "login")}
                        >
                            {tab === "login" ? "Sign up" : "Log in"}
                        </span>
                    </p>

                </div>
            </div>
        </>
    );
}