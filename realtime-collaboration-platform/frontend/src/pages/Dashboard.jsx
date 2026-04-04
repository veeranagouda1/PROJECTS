import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchProfile } from "../features/auth/authSlice";
import API from "../services/api";

// ─── Sidebar nav items ────────────────────────────────────
const NAV = [
    { key: "documents", label: "My Documents", icon: "📄" },
    { key: "shared", label: "Shared with me", icon: "👥" },
    { key: "recent", label: "Recent", icon: "🕐" },
];

// ─── Styles ───────────────────────────────────────────────
const s = {
    root: {
        display: "flex", height: "100vh", overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#fafafa", color: "#111",
    },

    // Sidebar
    sidebar: {
        width: "240px", flexShrink: 0,
        background: "#fff",
        borderRight: "1px solid #ebebeb",
        display: "flex", flexDirection: "column",
        padding: "0",
    },
    sidebarTop: {
        padding: "20px 20px 16px",
        borderBottom: "1px solid #f0f0f0",
        display: "flex", alignItems: "center", gap: "10px",
    },
    logoGrid: {
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "3px", width: "20px", height: "20px",
    },
    logoName: { fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px" },
    sidebarNav: { padding: "12px 10px", flex: 1 },
    navItem: (active) => ({
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", borderRadius: "8px",
        fontSize: "14px", fontWeight: active ? 600 : 400,
        color: active ? "#111" : "#555",
        background: active ? "#f0f0f0" : "transparent",
        cursor: "pointer", marginBottom: "2px",
        transition: "all 0.15s",
    }),
    sidebarBottom: {
        padding: "16px",
        borderTop: "1px solid #f0f0f0",
    },
    userRow: {
        display: "flex", alignItems: "center", gap: "10px",
        marginBottom: "12px",
    },
    avatar: {
        width: "34px", height: "34px", borderRadius: "50%",
        background: "#111", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "13px", fontWeight: 700, flexShrink: 0,
    },
    userName: { fontSize: "13px", fontWeight: 600, color: "#111" },
    userEmail: { fontSize: "11px", color: "#999" },
    logoutBtn: {
        width: "100%", padding: "9px",
        background: "transparent", border: "1px solid #eee",
        borderRadius: "8px", fontSize: "13px",
        color: "#666", cursor: "pointer", fontFamily: "inherit",
        transition: "all 0.15s",
    },

    // Main content
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: {
        height: "60px", flexShrink: 0,
        borderBottom: "1px solid #ebebeb",
        background: "#fff",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
    },
    topbarTitle: { fontSize: "16px", fontWeight: 600, letterSpacing: "-0.2px" },
    createBtn: {
        display: "flex", alignItems: "center", gap: "6px",
        padding: "9px 18px",
        background: "#111", color: "#fff",
        border: "none", borderRadius: "8px",
        fontSize: "14px", fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
    },
    content: { flex: 1, overflow: "auto", padding: "28px" },

    // Document grid
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "16px",
    },
    docCard: {
        background: "#fff",
        border: "1px solid #ebebeb",
        borderRadius: "12px",
        padding: "20px",
        cursor: "pointer",
        transition: "all 0.15s",
    },
    docIcon: { fontSize: "28px", marginBottom: "12px" },
    docTitle: { fontSize: "14px", fontWeight: 600, color: "#111", marginBottom: "6px" },
    docMeta: { fontSize: "12px", color: "#999" },
    docActions: {
        display: "flex", gap: "8px", marginTop: "14px",
        paddingTop: "12px", borderTop: "1px solid #f5f5f5",
    },
    actionBtn: (danger) => ({
        flex: 1, padding: "6px",
        background: "transparent",
        border: `1px solid ${danger ? "#fed7d7" : "#eee"}`,
        borderRadius: "6px",
        fontSize: "12px", color: danger ? "#e53e3e" : "#555",
        cursor: "pointer", fontFamily: "inherit",
    }),

    // Empty state
    empty: {
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "50vh", color: "#999", gap: "12px",
    },
    emptyIcon: { fontSize: "48px" },
    emptyText: { fontSize: "16px", fontWeight: 500, color: "#555" },
    emptySubtext: { fontSize: "14px", color: "#aaa" },

    // Loading skeleton
    skeleton: {
        background: "linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)",
        borderRadius: "8px", animation: "pulse 1.5s infinite",
    },

    // Create modal
    createOverlay: {
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.3)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 500, backdropFilter: "blur(4px)",
    },
    createModal: {
        background: "#fff", borderRadius: "14px",
        padding: "36px", width: "380px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    },
    createTitle: { fontSize: "18px", fontWeight: 700, marginBottom: "20px" },
    createInput: {
        width: "100%", padding: "12px 14px",
        border: "1px solid #e0e0e0", borderRadius: "8px",
        fontSize: "14px", outline: "none",
        boxSizing: "border-box", fontFamily: "inherit",
        marginBottom: "16px",
    },
    createBtnRow: { display: "flex", gap: "10px" },
    cancelBtn: {
        flex: 1, padding: "11px",
        background: "transparent", border: "1px solid #ddd",
        borderRadius: "8px", fontSize: "14px",
        cursor: "pointer", fontFamily: "inherit",
    },
    confirmBtn: {
        flex: 1, padding: "11px",
        background: "#111", color: "#fff",
        border: "none", borderRadius: "8px",
        fontSize: "14px", fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit",
    },
};

// ─── Component ────────────────────────────────────────────
export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { accessToken, user } = useSelector((st) => st.auth);

    const [activeNav, setActiveNav] = useState("documents");
    const [documents, setDocuments] = useState([]);
    const [docsLoading, setDocsLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!accessToken) navigate("/");
    }, [accessToken]);

    // Fetch profile if not loaded
    useEffect(() => {
        if (!user && accessToken) dispatch(fetchProfile());
    }, []);

    // Fetch documents
    useEffect(() => {
        if (activeNav === "documents") fetchDocs();
    }, [activeNav]);

    const fetchDocs = async () => {
        setDocsLoading(true);
        try {
            const res = await API.get("/documents");
            setDocuments(res.data);
        } catch (err) {
            console.error("Failed to fetch documents:", err);
            setDocuments([]);
        } finally {
            setDocsLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            await API.post("/documents", { title: newTitle.trim(), content: "" });
            setNewTitle("");
            setShowCreate(false);
            fetchDocs();
        } catch (err) {
            console.error("Failed to create document:", err);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this document?")) return;
        try {
            await API.delete(`/documents/${id}`);
            setDocuments((prev) => prev.filter((d) => d.id !== id));
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    const initials = user?.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U";

    const formatDate = (dateStr) => {
        if (!dateStr) return "";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
        });
    };

    return (
        <div style={s.root}>

            {/* ── Sidebar ── */}
            <aside style={s.sidebar}>
                <div style={s.sidebarTop}>
                    <div style={s.logoGrid}>
                        <div style={{ borderRadius: "50%", background: "#18a0fb" }} />
                        <div style={{ borderRadius: "2px", background: "#ff7262" }} />
                        <div style={{ borderRadius: "50%", background: "#a259ff" }} />
                        <div style={{ borderRadius: "2px", background: "#1bc47d" }} />
                    </div>
                    <span style={s.logoName}>CollabX</span>
                </div>

                <nav style={s.sidebarNav}>
                    {NAV.map((item) => (
                        <div
                            key={item.key}
                            style={s.navItem(activeNav === item.key)}
                            onClick={() => setActiveNav(item.key)}
                            onMouseEnter={(e) => {
                                if (activeNav !== item.key)
                                    e.currentTarget.style.background = "#f7f7f7";
                            }}
                            onMouseLeave={(e) => {
                                if (activeNav !== item.key)
                                    e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <span style={{ fontSize: "16px" }}>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div style={s.sidebarBottom}>
                    {user && (
                        <div style={s.userRow}>
                            <div style={s.avatar}>{initials}</div>
                            <div>
                                <div style={s.userName}>{user.name || "User"}</div>
                                <div style={s.userEmail}>{user.email || ""}</div>
                            </div>
                        </div>
                    )}
                    <button
                        style={s.logoutBtn}
                        onClick={handleLogout}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                        Sign out
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div style={s.main}>

                {/* Topbar */}
                <div style={s.topbar}>
                    <span style={s.topbarTitle}>
                        {NAV.find((n) => n.key === activeNav)?.label}
                    </span>
                    {activeNav === "documents" && (
                        <button style={s.createBtn} onClick={() => setShowCreate(true)}>
                            <span>+</span> New document
                        </button>
                    )}
                </div>

                {/* Content */}
                <div style={s.content}>
                    {docsLoading ? (
                        <div style={s.grid}>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} style={{
                                    ...s.docCard,
                                    height: "140px",
                                    background: "#f5f5f5",
                                    animation: "none",
                                }} />
                            ))}
                        </div>
                    ) : documents.length === 0 ? (
                        <div style={s.empty}>
                            <div style={s.emptyIcon}>📄</div>
                            <div style={s.emptyText}>No documents yet</div>
                            <div style={s.emptySubtext}>
                                Click "New document" to create your first one
                            </div>
                        </div>
                    ) : (
                        <div style={s.grid}>
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    style={s.docCard}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "#ccc";
                                        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#ebebeb";
                                        e.currentTarget.style.boxShadow = "none";
                                    }}
                                >
                                    <div style={s.docIcon}>📝</div>
                                    <div style={s.docTitle}>{doc.title || "Untitled"}</div>
                                    <div style={s.docMeta}>
                                        {doc.updatedAt
                                            ? `Updated ${formatDate(doc.updatedAt)}`
                                            : `Created ${formatDate(doc.createdAt)}`}
                                    </div>
                                    <div style={s.docActions}>
                                        <button style={s.actionBtn(false)}>Open</button>
                                        <button
                                            style={s.actionBtn(true)}
                                            onClick={(e) => handleDelete(doc.id, e)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create Document Modal ── */}
            {showCreate && (
                <div style={s.createOverlay} onClick={() => setShowCreate(false)}>
                    <div style={s.createModal} onClick={(e) => e.stopPropagation()}>
                        <div style={s.createTitle}>New document</div>
                        <input
                            style={s.createInput}
                            type="text"
                            placeholder="Document title..."
                            value={newTitle}
                            autoFocus
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                        />
                        <div style={s.createBtnRow}>
                            <button style={s.cancelBtn} onClick={() => setShowCreate(false)}>
                                Cancel
                            </button>
                            <button
                                style={{ ...s.confirmBtn, opacity: creating ? 0.7 : 1 }}
                                onClick={handleCreate}
                                disabled={creating}
                            >
                                {creating ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}