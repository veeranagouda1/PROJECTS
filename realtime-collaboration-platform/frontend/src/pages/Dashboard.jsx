import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchProfile } from "../features/auth/authSlice";
import API from "../services/api";

const DOCUMENT_ROLES = ["OWNER", "EDITOR", "VIEWER"];

const s = {
    root: {
        display: "flex", height: "100vh", overflow: "hidden",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#fafafa", color: "#111",
    },
    sidebar: {
        width: "248px", flexShrink: 0,
        background: "#fff", borderRight: "1px solid #ebebeb",
        display: "flex", flexDirection: "column",
    },
    sideTop: {
        padding: "20px", borderBottom: "1px solid #f5f5f5",
        display: "flex", alignItems: "center", gap: "10px",
    },
    logoGrid: {
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "3px", width: "20px", height: "20px", flexShrink: 0,
    },
    logoName: { fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px" },
    nav: { padding: "12px 10px", flex: 1, overflowY: "auto" },
    navSection: { fontSize: "11px", fontWeight: 600, color: "#bbb", letterSpacing: "0.8px", padding: "8px 12px 4px" },
    navItem: (active) => ({
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", borderRadius: "8px",
        fontSize: "14px", fontWeight: active ? 600 : 400,
        color: active ? "#111" : "#666",
        background: active ? "#f0f0f0" : "transparent",
        cursor: "pointer", marginBottom: "2px", transition: "all 0.15s",
        border: "none", width: "100%", textAlign: "left",
        fontFamily: "inherit",
    }),
    sideBottom: { padding: "16px", borderTop: "1px solid #f5f5f5" },
    userRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
    avatar: (color) => ({
        width: "36px", height: "36px", borderRadius: "50%",
        background: color || "#111", color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "13px", fontWeight: 700, flexShrink: 0,
    }),
    roleBadge: (role) => ({
        display: "inline-block",
        fontSize: "10px", fontWeight: 700,
        padding: "2px 8px", borderRadius: "100px",
        background: role === "ADMIN" ? "#111" : "#f0f0f0",
        color: role === "ADMIN" ? "#fff" : "#666",
        letterSpacing: "0.5px",
    }),
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: {
        height: "60px", flexShrink: 0,
        background: "#fff", borderBottom: "1px solid #ebebeb",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "0 28px",
    },
    topbarLeft: { display: "flex", alignItems: "center", gap: "12px" },
    topbarTitle: { fontSize: "16px", fontWeight: 600, letterSpacing: "-0.2px" },
    createBtn: {
        display: "flex", alignItems: "center", gap: "6px",
        padding: "9px 18px", background: "#111", color: "#fff",
        border: "none", borderRadius: "8px",
        fontSize: "14px", fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
    },
    content: { flex: 1, overflow: "auto", padding: "28px" },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "16px",
    },
    docCard: {
        background: "#fff", border: "1px solid #ebebeb",
        borderRadius: "14px", padding: "22px",
        cursor: "pointer", transition: "all 0.15s",
        display: "flex", flexDirection: "column",
    },
    docRolePill: (role) => ({
        display: "inline-block", fontSize: "10px", fontWeight: 700,
        padding: "3px 8px", borderRadius: "100px", letterSpacing: "0.5px",
        background: role === "OWNER" ? "#111" : role === "EDITOR" ? "#e8f4ff" : "#f5f5f5",
        color: role === "OWNER" ? "#fff" : role === "EDITOR" ? "#18a0fb" : "#999",
        marginBottom: "12px", alignSelf: "flex-start",
    }),
    empty: {
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "55vh", gap: "12px",
    },
    skeletonCard: {
        background: "#f5f5f5", borderRadius: "14px",
        height: "150px", animation: "pulse 1.5s infinite",
    },
    // Share modal
    shareOverlay: {
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 500,
    },
    shareModal: {
        background: "#fff", borderRadius: "16px",
        padding: "36px", width: "400px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    },
    select: {
        width: "100%", padding: "11px 14px",
        border: "1.5px solid #e8e8e8", borderRadius: "10px",
        fontSize: "14px", fontFamily: "inherit",
        outline: "none", background: "#fff",
        cursor: "pointer", marginBottom: "12px",
    },
    modalInput: {
        width: "100%", padding: "11px 14px",
        border: "1.5px solid #e8e8e8", borderRadius: "10px",
        fontSize: "14px", fontFamily: "inherit",
        outline: "none", boxSizing: "border-box",
        marginBottom: "12px",
    },
};

const NAV_ITEMS = [
    { key: "documents", icon: "📄", label: "My Documents" },
    { key: "shared", icon: "👥", label: "Shared with me" },
    { key: "recent", icon: "🕐", label: "Recent" },
];

function SkeletonGrid() {
    return (
        <div style={s.grid}>
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={s.skeletonCard} />)}
        </div>
    );
}

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { accessToken, user, profile } = useSelector((st) => st.auth);

    const [activeNav, setActiveNav] = useState("documents");
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create modal
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);

    // Share modal
    const [shareDoc, setShareDoc] = useState(null);
    const [shareEmail, setShareEmail] = useState("");
    const [shareRole, setShareRole] = useState("EDITOR");
    const [sharing, setSharing] = useState(false);

    // Guard
    useEffect(() => {
        if (!accessToken) navigate("/");
    }, [accessToken]);

    // Fetch profile for display name
    useEffect(() => {
        if (accessToken && !profile) dispatch(fetchProfile());
    }, []);

    // Fetch docs
    useEffect(() => {
        if (activeNav === "documents" || activeNav === "recent") fetchDocs();
    }, [activeNav]);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await API.get("/documents");
            setDocs(res.data);
        } catch (e) {
            setDocs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            await API.post("/documents", { title: newTitle.trim(), content: "" });
            setNewTitle(""); setShowCreate(false);
            fetchDocs();
        } catch (e) {
            console.error(e);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this document?")) return;
        try {
            await API.delete(`/documents/${id}`);
            setDocs((prev) => prev.filter((d) => d.id !== id));
        } catch (e) {
            console.error(e);
        }
    };

    const handleShare = async () => {
        if (!shareEmail.trim() || !shareDoc) return;
        setSharing(true);
        try {
            await API.post(`/documents/${shareDoc.id}/share`, {
                email: shareEmail.trim(),
                role: shareRole,
            });
            setShareDoc(null); setShareEmail(""); setShareRole("EDITOR");
        } catch (e) {
            console.error(e);
        } finally {
            setSharing(false);
        }
    };

    const handleLogout = () => { dispatch(logout()); navigate("/"); };

    const displayName = profile?.name || user?.email?.split("@")[0] || "User";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const avatarColor = user?.role === "ADMIN" ? "#111" : "#18a0fb";

    const formatDate = (d) => d
        ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "";

    return (
        <div style={s.root}>
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

            {/* ── Sidebar ── */}
            <aside style={s.sidebar}>
                <div style={s.sideTop}>
                    <div style={s.logoGrid}>
                        <div style={{ borderRadius: "50%", background: "#18a0fb" }} />
                        <div style={{ borderRadius: "2px", background: "#ff7262" }} />
                        <div style={{ borderRadius: "50%", background: "#a259ff" }} />
                        <div style={{ borderRadius: "2px", background: "#1bc47d" }} />
                    </div>
                    <span style={s.logoName}>CollabX</span>
                </div>

                <nav style={s.nav}>
                    <div style={s.navSection}>WORKSPACE</div>
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.key}
                            style={s.navItem(activeNav === item.key)}
                            onClick={() => setActiveNav(item.key)}
                            onMouseEnter={(e) => { if (activeNav !== item.key) e.currentTarget.style.background = "#f7f7f7"; }}
                            onMouseLeave={(e) => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}
                        >
                            <span style={{ fontSize: "16px" }}>{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div style={s.sideBottom}>
                    <div style={s.userRow}>
                        <div style={s.avatar(avatarColor)}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {displayName}
                            </div>
                            <div style={{ marginTop: "3px" }}>
                                <span style={s.roleBadge(user?.role)}>{user?.role || "USER"}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        style={{ width: "100%", padding: "9px", background: "transparent", border: "1px solid #eee", borderRadius: "8px", fontSize: "13px", color: "#666", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                        onClick={handleLogout}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#f7f7f7"; e.currentTarget.style.color = "#111"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#666"; }}
                    >Sign out</button>
                </div>
            </aside>

            {/* ── Main ── */}
            <div style={s.main}>
                <div style={s.topbar}>
                    <div style={s.topbarLeft}>
                        <span style={s.topbarTitle}>
                            {NAV_ITEMS.find(n => n.key === activeNav)?.label}
                        </span>
                        <span style={{ fontSize: "13px", color: "#bbb" }}>
                            {!loading && `${docs.length} document${docs.length !== 1 ? "s" : ""}`}
                        </span>
                    </div>
                    <button
                        style={s.createBtn}
                        onClick={() => setShowCreate(true)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
                    >
                        <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span> New document
                    </button>
                </div>

                <div style={s.content}>
                    {loading ? <SkeletonGrid /> : docs.length === 0 ? (
                        <div style={s.empty}>
                            <div style={{ fontSize: "52px" }}>📄</div>
                            <div style={{ fontSize: "17px", fontWeight: 600, color: "#555" }}>No documents yet</div>
                            <div style={{ fontSize: "14px", color: "#aaa" }}>Create your first document to get started</div>
                            <button
                                style={{ ...s.createBtn, marginTop: "8px" }}
                                onClick={() => setShowCreate(true)}
                            >+ New document</button>
                        </div>
                    ) : (
                        <div style={s.grid}>
                            {docs.map((doc) => (
                                <div
                                    key={doc.id}
                                    style={s.docCard}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    {/* Document role pill */}
                                    <span style={s.docRolePill(doc.userRole || "OWNER")}>
                                        {doc.userRole || "OWNER"}
                                    </span>

                                    <div style={{ fontSize: "28px", marginBottom: "10px" }}>📝</div>
                                    <div style={{ fontSize: "15px", fontWeight: 600, color: "#111", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {doc.title || "Untitled"}
                                    </div>
                                    <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "16px" }}>
                                        {doc.updatedAt ? `Updated ${formatDate(doc.updatedAt)}` : `Created ${formatDate(doc.createdAt)}`}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                                        <button
                                            style={{ flex: 1, padding: "8px", background: "#f7f7f7", border: "none", borderRadius: "8px", fontSize: "13px", color: "#333", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.background = "#eee")}
                                            onMouseLeave={(e) => (e.currentTarget.style.background = "#f7f7f7")}
                                            onClick={(e) => { e.stopPropagation(); }}
                                        >Open</button>

                                        {/* Share — only OWNER can share */}
                                        {(!doc.userRole || doc.userRole === "OWNER") && (
                                            <button
                                                style={{ flex: 1, padding: "8px", background: "#e8f4ff", border: "none", borderRadius: "8px", fontSize: "13px", color: "#18a0fb", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                                                onClick={(e) => { e.stopPropagation(); setShareDoc(doc); }}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "#d0e8ff")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "#e8f4ff")}
                                            >Share</button>
                                        )}

                                        {/* Delete — only OWNER can delete */}
                                        {(!doc.userRole || doc.userRole === "OWNER") && (
                                            <button
                                                style={{ flex: 1, padding: "8px", background: "#fff5f5", border: "none", borderRadius: "8px", fontSize: "13px", color: "#e53e3e", cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                                                onClick={(e) => handleDelete(doc.id, e)}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "#fed7d7")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff5f5")}
                                            >Delete</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create Document Modal ── */}
            {showCreate && (
                <div style={s.shareOverlay} onClick={() => setShowCreate(false)}>
                    <div style={s.shareModal} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>New document</div>
                        <div style={{ fontSize: "14px", color: "#888", marginBottom: "20px" }}>Give your document a title to get started.</div>
                        <input
                            style={s.modalInput}
                            type="text" placeholder="Document title..."
                            value={newTitle} autoFocus
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                            onFocus={(e) => (e.target.style.borderColor = "#111")}
                            onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button style={{ flex: 1, padding: "11px", background: "transparent", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }} onClick={() => setShowCreate(false)}>Cancel</button>
                            <button
                                style={{ flex: 2, padding: "11px", background: "#111", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: creating ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: creating ? 0.7 : 1 }}
                                onClick={handleCreate} disabled={creating}
                            >{creating ? "Creating..." : "Create document"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Share Document Modal ── */}
            {shareDoc && (
                <div style={s.shareOverlay} onClick={() => setShareDoc(null)}>
                    <div style={s.shareModal} onClick={(e) => e.stopPropagation()}>
                        <div style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Share "{shareDoc.title}"</div>
                        <div style={{ fontSize: "14px", color: "#888", marginBottom: "20px" }}>Invite a teammate to collaborate.</div>
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#666", display: "block", marginBottom: "6px" }}>Email address</label>
                        <input
                            style={s.modalInput}
                            type="email" placeholder="teammate@example.com"
                            value={shareEmail} autoFocus
                            onChange={(e) => setShareEmail(e.target.value)}
                            onFocus={(e) => (e.target.style.borderColor = "#111")}
                            onBlur={(e) => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <label style={{ fontSize: "12px", fontWeight: 600, color: "#666", display: "block", marginBottom: "6px" }}>Permission</label>
                        <select
                            style={s.select}
                            value={shareRole}
                            onChange={(e) => setShareRole(e.target.value)}
                        >
                            {DOCUMENT_ROLES.filter(r => r !== "OWNER").map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                        <div style={{ fontSize: "12px", color: "#bbb", marginBottom: "20px" }}>
                            {shareRole === "EDITOR" ? "Can view and edit the document." : "Can only view the document."}
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button style={{ flex: 1, padding: "11px", background: "transparent", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" }} onClick={() => setShareDoc(null)}>Cancel</button>
                            <button
                                style={{ flex: 2, padding: "11px", background: "#18a0fb", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: sharing ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: sharing ? 0.7 : 1 }}
                                onClick={handleShare} disabled={sharing}
                            >{sharing ? "Sharing..." : "Send invite"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}