import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchProfile } from "../features/auth/authSlice";
import API from "../services/api";

/**
 * Gateway: /api/admin/** → hasRole("ADMIN")
 * This dashboard is only reachable if user.role === "ADMIN"
 */

const S = {
    root: { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif", background: "#fafafa" },
    sidebar: { width: "248px", flexShrink: 0, background: "#111", color: "#fff", display: "flex", flexDirection: "column" },
    sideTop: { padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" },
    logoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px", width: "20px", height: "20px", flexShrink: 0 },
    adminBadge: { fontSize: "10px", fontWeight: 700, background: "#fff", color: "#111", padding: "2px 8px", borderRadius: "100px", letterSpacing: "0.5px" },
    nav: { padding: "12px 10px", flex: 1 },
    navLabel: { fontSize: "11px", fontWeight: 600, color: "rgba(255,255,255,0.3)", letterSpacing: "0.8px", padding: "8px 12px 4px" },
    navBtn: (active) => ({
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", borderRadius: "8px",
        fontSize: "14px", fontWeight: active ? 600 : 400,
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        cursor: "pointer", marginBottom: "2px",
        transition: "all 0.15s", border: "none",
        width: "100%", textAlign: "left", fontFamily: "inherit",
    }),
    sideBottom: { padding: "16px", borderTop: "1px solid rgba(255,255,255,0.08)" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: { height: "60px", background: "#fff", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", flexShrink: 0 },
    content: { flex: 1, overflow: "auto", padding: "28px" },
    statsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" },
    statCard: { background: "#fff", borderRadius: "14px", padding: "24px", border: "1px solid #ebebeb" },
    statLabel: { fontSize: "11px", color: "#bbb", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "8px" },
    statValue: { fontSize: "36px", fontWeight: 700, color: "#111", letterSpacing: "-1.5px" },
    sectionTitle: { fontSize: "15px", fontWeight: 600, color: "#111", marginBottom: "16px" },
    table: { width: "100%", background: "#fff", borderRadius: "14px", border: "1px solid #ebebeb", overflow: "hidden", borderCollapse: "collapse" },
    th: { padding: "14px 20px", textAlign: "left", fontSize: "11px", fontWeight: 600, color: "#bbb", background: "#fafafa", borderBottom: "1px solid #f0f0f0", letterSpacing: "0.3px" },
    td: { padding: "14px 20px", fontSize: "14px", color: "#333", borderBottom: "1px solid #f8f8f8" },
};

const ADMIN_NAV = [
    { key: "overview", icon: "📊", label: "Overview" },
    { key: "documents", icon: "📄", label: "All Documents" },
];

export default function AdminDashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { accessToken, user, profile } = useSelector((st) => st.auth);

    const [activeNav, setActiveNav] = useState("overview");
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Guard: must be ADMIN
    useEffect(() => {
        if (!accessToken) { navigate("/"); return; }
        if (user?.role !== "ADMIN") { navigate("/dashboard"); }
    }, [accessToken, user]);

    useEffect(() => {
        if (accessToken && !profile) dispatch(fetchProfile());
    }, []);

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        setLoading(true);
        try {
            // GET /api/documents — gateway allows ADMIN through /api/user/** + /api/documents/**
            const res = await API.get("/documents");
            setDocs(res.data);
        } catch (e) {
            console.error("Admin: failed to fetch docs", e);
        } finally {
            setLoading(false);
        }
    };

    const handleForceDelete = async (id) => {
        if (!window.confirm("Force delete this document?")) return;
        try {
            await API.delete(`/documents/${id}`);
            setDocs(prev => prev.filter(d => d.id !== id));
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const handleLogout = () => { dispatch(logout()); navigate("/"); };

    // ProfileResponse.fullName
    const displayName = profile?.fullName || user?.email?.split("@")[0] || "Admin";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    const shownDocs = activeNav === "overview" ? docs.slice(0, 10) : docs;

    return (
        <div style={S.root}>
            <aside style={S.sidebar}>
                <div style={S.sideTop}>
                    <div style={S.logoGrid}>
                        <div style={{ borderRadius: "50%", background: "#18a0fb" }} />
                        <div style={{ borderRadius: "2px", background: "#ff7262" }} />
                        <div style={{ borderRadius: "50%", background: "#a259ff" }} />
                        <div style={{ borderRadius: "2px", background: "#1bc47d" }} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "16px" }}>CollabX</span>
                    <span style={S.adminBadge}>ADMIN</span>
                </div>

                <nav style={S.nav}>
                    <div style={S.navLabel}>ADMIN PANEL</div>
                    {ADMIN_NAV.map(item => (
                        <button
                            key={item.key}
                            style={S.navBtn(activeNav === item.key)}
                            onClick={() => setActiveNav(item.key)}
                            onMouseEnter={(e) => { if (activeNav !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                            onMouseLeave={(e) => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}
                        >
                            <span>{item.icon}</span>{item.label}
                        </button>
                    ))}

                    <div style={{ ...S.navLabel, marginTop: "16px" }}>SWITCH TO</div>
                    <button
                        style={S.navBtn(false)}
                        onClick={() => navigate("/dashboard")}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        <span>👤</span> My Documents
                    </button>
                </nav>

                <div style={S.sideBottom}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                        </div>
                    </div>
                    <button
                        style={{ width: "100%", padding: "9px", background: "rgba(255,255,255,0.08)", border: "none", borderRadius: "8px", fontSize: "13px", color: "rgba(255,255,255,0.6)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                        onClick={handleLogout}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.15)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
                    >Sign out</button>
                </div>
            </aside>

            <div style={S.main}>
                <div style={S.topbar}>
                    <span style={{ fontSize: "16px", fontWeight: 600 }}>{ADMIN_NAV.find(n => n.key === activeNav)?.label || "Admin"}</span>
                    <span style={{ fontSize: "13px", color: "#bbb" }}>Admin view · {user?.email}</span>
                </div>

                <div style={S.content}>
                    {/* Stats */}
                    <div style={S.statsGrid}>
                        {[
                            { label: "TOTAL DOCUMENTS", value: loading ? "—" : docs.length },
                            { label: "YOUR ROLE", value: "ADMIN" },
                            { label: "STATUS", value: "Live" },
                        ].map(s => (
                            <div key={s.label} style={S.statCard}>
                                <div style={S.statLabel}>{s.label}</div>
                                <div style={S.statValue}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Documents table */}
                    <div style={S.sectionTitle}>
                        {activeNav === "overview" ? "Recent documents" : "All documents"}
                        {!loading && <span style={{ fontWeight: 400, color: "#bbb", marginLeft: "8px", fontSize: "14px" }}>({docs.length} total)</span>}
                    </div>

                    {loading ? (
                        <div style={{ color: "#aaa", fontSize: "14px" }}>Loading...</div>
                    ) : docs.length === 0 ? (
                        <div style={{ color: "#aaa", fontSize: "14px" }}>No documents found.</div>
                    ) : (
                        <table style={S.table}>
                            <thead>
                                <tr>
                                    {["TITLE", "CREATED", "LAST UPDATED", "ACTIONS"].map(h => (
                                        <th key={h} style={S.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {shownDocs.map(doc => (
                                    <tr key={doc.id}>
                                        {/* DocumentResponse.title */}
                                        <td style={S.td}>
                                            <span style={{ fontWeight: 500 }}>{doc.title || "Untitled"}</span>
                                        </td>
                                        {/* DocumentResponse.createdAt */}
                                        <td style={S.td}>
                                            <span style={{ color: "#aaa" }}>
                                                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : "—"}
                                            </span>
                                        </td>
                                        {/* DocumentResponse.updatedAt */}
                                        <td style={S.td}>
                                            <span style={{ color: "#aaa" }}>
                                                {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : "—"}
                                            </span>
                                        </td>
                                        <td style={S.td}>
                                            <button
                                                style={{ padding: "5px 14px", background: "#fff5f5", border: "none", borderRadius: "6px", fontSize: "12px", color: "#e53e3e", cursor: "pointer", fontFamily: "inherit" }}
                                                onClick={() => handleForceDelete(doc.id)}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "#fed7d7")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff5f5")}
                                            >Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}