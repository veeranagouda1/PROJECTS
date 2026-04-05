import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import API from "../services/api";

const s = {
    root: {
        display: "flex", height: "100vh", overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#fafafa",
    },
    sidebar: {
        width: "248px", flexShrink: 0,
        background: "#111", color: "#fff",
        display: "flex", flexDirection: "column",
    },
    sideTop: {
        padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", gap: "10px",
    },
    logoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px", width: "20px", height: "20px", flexShrink: 0 },
    adminBadge: {
        fontSize: "10px", fontWeight: 700,
        background: "#fff", color: "#111",
        padding: "2px 8px", borderRadius: "100px",
        letterSpacing: "0.5px", marginLeft: "6px",
    },
    nav: { padding: "12px 10px", flex: 1 },
    navSection: { fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.8px", padding: "8px 12px 4px" },
    navItem: (active) => ({
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", borderRadius: "8px",
        fontSize: "14px", fontWeight: active ? 600 : 400,
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        cursor: "pointer", marginBottom: "2px", transition: "all 0.15s",
        border: "none", width: "100%", textAlign: "left", fontFamily: "inherit",
    }),
    sideBottom: { padding: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: {
        height: "60px", background: "#fff",
        borderBottom: "1px solid #ebebeb",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 28px", flexShrink: 0,
    },
    content: { flex: 1, overflow: "auto", padding: "28px" },
    statsGrid: {
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: "16px", marginBottom: "32px",
    },
    statCard: {
        background: "#fff", borderRadius: "14px",
        padding: "24px", border: "1px solid #ebebeb",
    },
    statLabel: { fontSize: "12px", color: "#999", fontWeight: 600, letterSpacing: "0.3px", marginBottom: "8px" },
    statValue: { fontSize: "32px", fontWeight: 700, color: "#111", letterSpacing: "-1px" },
    table: {
        width: "100%", background: "#fff",
        borderRadius: "14px", border: "1px solid #ebebeb",
        overflow: "hidden", borderCollapse: "collapse",
    },
    th: {
        padding: "14px 20px", textAlign: "left",
        fontSize: "12px", fontWeight: 600,
        color: "#999", background: "#fafafa",
        borderBottom: "1px solid #f0f0f0",
    },
    td: {
        padding: "14px 20px",
        fontSize: "14px", color: "#333",
        borderBottom: "1px solid #f8f8f8",
    },
};

const ADMIN_NAV = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "documents", icon: "📄", label: "All Documents" },
    { key: "users", icon: "👤", label: "Users" },
];

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { accessToken, user } = useSelector((st) => st.auth);

    const [activeNav, setActiveNav] = useState("overview");
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ docs: 0, users: 0 });

    // Guard: only ADMIN
    useEffect(() => {
        if (!accessToken) { navigate("/"); return; }
        if (user?.role !== "ADMIN") { navigate("/dashboard"); }
    }, [accessToken, user]);

    useEffect(() => {
        fetchAllDocs();
    }, []);

    const fetchAllDocs = async () => {
        setLoading(true);
        try {
            const res = await API.get("/documents");
            setDocs(res.data);
            setStats({ docs: res.data.length, users: new Set(res.data.map(d => d.ownerEmail)).size });
        } catch {
            setDocs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Force delete this document?")) return;
        try {
            await API.delete(`/documents/${id}`);
            setDocs((prev) => prev.filter(d => d.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleLogout = () => { dispatch(logout()); navigate("/"); };

    const initials = user?.email?.substring(0, 2).toUpperCase() || "AD";

    return (
        <div style={s.root}>
            <aside style={s.sidebar}>
                <div style={s.sideTop}>
                    <div style={s.logoGrid}>
                        <div style={{ borderRadius: "50%", background: "#18a0fb" }} />
                        <div style={{ borderRadius: "2px", background: "#ff7262" }} />
                        <div style={{ borderRadius: "50%", background: "#a259ff" }} />
                        <div style={{ borderRadius: "2px", background: "#1bc47d" }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "16px" }}>CollabX</span>
                    <span style={s.adminBadge}>ADMIN</span>
                </div>

                <nav style={s.nav}>
                    <div style={s.navSection}>ADMIN PANEL</div>
                    {ADMIN_NAV.map((item) => (
                        <button
                            key={item.key}
                            style={s.navItem(activeNav === item.key)}
                            onClick={() => setActiveNav(item.key)}
                            onMouseEnter={(e) => { if (activeNav !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                            onMouseLeave={(e) => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}
                        >
                            <span>{item.icon}</span>{item.label}
                        </button>
                    ))}

                    <div style={{ ...s.navSection, marginTop: "16px" }}>QUICK SWITCH</div>
                    <button
                        style={s.navItem(false)}
                        onClick={() => navigate("/dashboard")}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <span>👤</span> My Documents
                    </button>
                </nav>

                <div style={s.sideBottom}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700 }}>{initials}</div>
                        <div>
                            <div style={{ fontSize: "13px", fontWeight: 600 }}>{user?.email || "Admin"}</div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Administrator</div>
                        </div>
                    </div>
                    <button
                        style={{ width: "100%", padding: "9px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", fontSize: "13px", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                        onClick={handleLogout}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                    >Sign out</button>
                </div>
            </aside>

            <div style={s.main}>
                <div style={s.topbar}>
                    <span style={{ fontSize: "16px", fontWeight: 600 }}>
                        {ADMIN_NAV.find(n => n.key === activeNav)?.label}
                    </span>
                    <span style={{ fontSize: "13px", color: "#bbb" }}>Admin view</span>
                </div>

                <div style={s.content}>
                    {/* Stats */}
                    <div style={s.statsGrid}>
                        {[
                            { label: "TOTAL DOCUMENTS", value: loading ? "—" : stats.docs },
                            { label: "UNIQUE OWNERS", value: loading ? "—" : stats.users },
                            { label: "YOUR ROLE", value: "ADMIN" },
                        ].map((s2) => (
                            <div key={s2.label} style={s.statCard}>
                                <div style={s.statLabel}>{s2.label}</div>
                                <div style={s.statValue}>{s2.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Documents table */}
                    {(activeNav === "overview" || activeNav === "documents") && (
                        <>
                            <div style={{ fontSize: "15px", fontWeight: 600, marginBottom: "16px", color: "#111" }}>
                                {activeNav === "overview" ? "Recent documents" : "All documents"}
                            </div>
                            {loading ? (
                                <div style={{ color: "#aaa", fontSize: "14px" }}>Loading...</div>
                            ) : (
                                <table style={s.table}>
                                    <thead>
                                        <tr>
                                            {["Title", "Owner", "Created", "Actions"].map(h => (
                                                <th key={h} style={s.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {docs.slice(0, activeNav === "overview" ? 8 : undefined).map((doc) => (
                                            <tr key={doc.id}>
                                                <td style={s.td}>
                                                    <span style={{ fontWeight: 500 }}>{doc.title || "Untitled"}</span>
                                                </td>
                                                <td style={s.td}>
                                                    <span style={{ color: "#888" }}>{doc.ownerEmail || doc.owner || "—"}</span>
                                                </td>
                                                <td style={s.td}>
                                                    <span style={{ color: "#aaa" }}>
                                                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "—"}
                                                    </span>
                                                </td>
                                                <td style={s.td}>
                                                    <button
                                                        style={{ padding: "5px 12px", background: "#fff5f5", border: "none", borderRadius: "6px", fontSize: "12px", color: "#e53e3e", cursor: "pointer", fontFamily: "inherit" }}
                                                        onClick={() => handleDelete(doc.id)}
                                                    >Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}