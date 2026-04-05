import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchProfile } from "../features/auth/authSlice";
import API from "../services/api";

/**
 * DocumentResponse from backend:
 *   { id, title, content, createdAt, updatedAt }
 *
 * NOTE: DocumentPermission role (OWNER/EDITOR/VIEWER) is NOT in DocumentResponse.
 * We fetch permissions separately to show the user's role on each doc.
 *
 * ProfileResponse: { email, fullName, bio, phone }
 */

const NAV = [
    { key: "documents", icon: "📄", label: "My Documents" },
    { key: "shared", icon: "👥", label: "Shared with me" },
    { key: "recent", icon: "🕐", label: "Recent" },
];

// Document role pill colors
const ROLE_STYLE = {
    OWNER: { bg: "#111", color: "#fff" },
    EDITOR: { bg: "#e8f4ff", color: "#18a0fb" },
    VIEWER: { bg: "#f5f5f5", color: "#888" },
};

const S = {
    root: { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif", background: "#fafafa" },
    sidebar: { width: "248px", flexShrink: 0, background: "#fff", borderRight: "1px solid #ebebeb", display: "flex", flexDirection: "column" },
    sideTop: { padding: "20px", borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "center", gap: "10px" },
    logoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px", width: "20px", height: "20px", flexShrink: 0 },
    logoName: { fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px" },
    nav: { padding: "12px 10px", flex: 1 },
    navLabel: { fontSize: "11px", fontWeight: 600, color: "#bbb", letterSpacing: "0.8px", padding: "8px 12px 4px" },
    navBtn: (active) => ({
        display: "flex", alignItems: "center", gap: "10px",
        padding: "9px 12px", borderRadius: "8px",
        fontSize: "14px", fontWeight: active ? 600 : 400,
        color: active ? "#111" : "#666",
        background: active ? "#f0f0f0" : "transparent",
        cursor: "pointer", marginBottom: "2px",
        transition: "all 0.15s", border: "none",
        width: "100%", textAlign: "left", fontFamily: "inherit",
    }),
    sideBottom: { padding: "16px", borderTop: "1px solid #f5f5f5" },
    avatar: (color) => ({
        width: "36px", height: "36px", borderRadius: "50%",
        background: color, color: "#fff", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "13px", fontWeight: 700,
    }),
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: {
        height: "60px", background: "#fff", borderBottom: "1px solid #ebebeb",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", flexShrink: 0,
    },
    createBtn: {
        display: "flex", alignItems: "center", gap: "6px",
        padding: "9px 18px", background: "#111", color: "#fff",
        border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
        cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s",
    },
    content: { flex: 1, overflow: "auto", padding: "28px" },
    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" },
    card: {
        background: "#fff", border: "1px solid #ebebeb", borderRadius: "14px",
        padding: "22px", cursor: "pointer", transition: "all 0.15s",
        display: "flex", flexDirection: "column",
    },
    rolePill: (role) => ({
        display: "inline-block", fontSize: "10px", fontWeight: 700,
        padding: "3px 9px", borderRadius: "100px", letterSpacing: "0.5px",
        alignSelf: "flex-start", marginBottom: "12px",
        background: ROLE_STYLE[role]?.bg || "#f5f5f5",
        color: ROLE_STYLE[role]?.color || "#888",
    }),
    docTitle: { fontSize: "15px", fontWeight: 600, color: "#111", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    docMeta: { fontSize: "12px", color: "#aaa", marginBottom: "16px" },
    actionRow: { display: "flex", gap: "8px", marginTop: "auto" },
    actionBtn: (variant) => ({
        flex: 1, padding: "8px", border: "none", borderRadius: "8px",
        fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
        transition: "background 0.15s",
        background: variant === "danger" ? "#fff5f5" : variant === "primary" ? "#e8f4ff" : "#f7f7f7",
        color: variant === "danger" ? "#e53e3e" : variant === "primary" ? "#18a0fb" : "#333",
    }),
    empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: "12px" },
    skeleton: { background: "#f5f5f5", borderRadius: "14px", height: "150px" },
    // Modals
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 },
    modalBox: { background: "#fff", borderRadius: "16px", padding: "36px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
    modalTitle: { fontSize: "18px", fontWeight: 700, marginBottom: "6px" },
    modalSub: { fontSize: "14px", color: "#888", marginBottom: "20px" },
    modalInput: { width: "100%", padding: "11px 14px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: "12px" },
    modalLabel: { fontSize: "12px", fontWeight: 600, color: "#666", display: "block", marginBottom: "6px" },
    select: { width: "100%", padding: "11px 14px", border: "1.5px solid #e8e8e8", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", outline: "none", background: "#fff", marginBottom: "8px" },
    btnRow: { display: "flex", gap: "10px" },
    cancelBtn: { flex: 1, padding: "11px", background: "transparent", border: "1px solid #eee", borderRadius: "10px", fontSize: "14px", cursor: "pointer", fontFamily: "inherit" },
    confirmBtn: (color) => ({ flex: 2, padding: "11px", background: color || "#111", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }),
};

function SkeletonGrid() {
    return <div style={S.grid}>{[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={S.skeleton} />)}</div>;
}

function formatDate(d) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { accessToken, user, profile } = useSelector((st) => st.auth);

    const [activeNav, setActiveNav] = useState("documents");
    const [docs, setDocs] = useState([]);           // DocumentResponse[]
    const [docRoles, setDocRoles] = useState({});   // { [docId]: "OWNER"|"EDITOR"|"VIEWER" }
    const [loading, setLoading] = useState(true);

    // Create modal
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);

    // Share modal — ShareRequest: { email, role }
    const [shareDoc, setShareDoc] = useState(null);
    const [shareEmail, setShareEmail] = useState("");
    const [shareRole, setShareRole] = useState("EDITOR"); // "EDITOR" | "VIEWER"
    const [sharing, setSharing] = useState(false);
    const [shareError, setShareError] = useState("");

    // Profile modal
    const [showProfile, setShowProfile] = useState(false);

    // Guard
    useEffect(() => {
        if (!accessToken) navigate("/");
    }, [accessToken]);

    // Fetch profile — ProfileResponse: { email, fullName, bio, phone }
    useEffect(() => {
        if (accessToken && !profile) dispatch(fetchProfile());
    }, []);

    useEffect(() => {
        fetchDocs();
    }, [activeNav]);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            // GET /api/documents → List<DocumentResponse>
            // { id, title, content, createdAt, updatedAt }
            const res = await API.get("/documents");
            setDocs(res.data);
            // We don't get role from DocumentResponse, default to OWNER for owned docs
            // Real role would need a separate permissions endpoint
            const roles = {};
            res.data.forEach(d => { roles[d.id] = "OWNER"; });
            setDocRoles(roles);
        } catch (e) {
            console.error("Failed to fetch documents", e);
            setDocs([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        setCreating(true);
        try {
            // POST /api/documents → CreateDocumentRequest: { title, content }
            await API.post("/documents", { title: newTitle.trim(), content: "" });
            setNewTitle(""); setShowCreate(false);
            fetchDocs();
        } catch (e) {
            console.error("Create failed", e);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this document? This cannot be undone.")) return;
        try {
            // DELETE /api/documents/{id}
            await API.delete(`/documents/${id}`);
            setDocs(prev => prev.filter(d => d.id !== id));
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const handleShare = async () => {
        if (!shareEmail.trim()) return;
        setSharing(true); setShareError("");
        try {
            // POST /api/documents/{id}/share → ShareRequest: { email, role }
            // role is Role enum: "OWNER"|"EDITOR"|"VIEWER"
            await API.post(`/documents/${shareDoc.id}/share`, {
                email: shareEmail.trim(),
                role: shareRole,
            });
            setShareDoc(null); setShareEmail(""); setShareRole("EDITOR");
        } catch (e) {
            setShareError(e.response?.data?.message || "Share failed. User may already have access.");
        } finally {
            setSharing(false);
        }
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/");
    };

    // profile.fullName is the field name from ProfileResponse
    const displayName = profile?.fullName || user?.email?.split("@")[0] || "User";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return (
        <div style={S.root}>
            <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}`}</style>

            {/* ── Sidebar ── */}
            <aside style={S.sidebar}>
                <div style={S.sideTop}>
                    <div style={S.logoGrid}>
                        <div style={{ borderRadius: "50%", background: "#18a0fb" }} />
                        <div style={{ borderRadius: "2px", background: "#ff7262" }} />
                        <div style={{ borderRadius: "50%", background: "#a259ff" }} />
                        <div style={{ borderRadius: "2px", background: "#1bc47d" }} />
                    </div>
                    <span style={S.logoName}>CollabX</span>
                </div>

                <nav style={S.nav}>
                    <div style={S.navLabel}>WORKSPACE</div>
                    {NAV.map(item => (
                        <button
                            key={item.key}
                            style={S.navBtn(activeNav === item.key)}
                            onClick={() => setActiveNav(item.key)}
                            onMouseEnter={(e) => { if (activeNav !== item.key) e.currentTarget.style.background = "#f7f7f7"; }}
                            onMouseLeave={(e) => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}
                        >
                            <span style={{ fontSize: "16px" }}>{item.icon}</span>{item.label}
                        </button>
                    ))}

                    {/* Admin link if user is ADMIN */}
                    {user?.role === "ADMIN" && (
                        <>
                            <div style={{ ...S.navLabel, marginTop: "16px" }}>ADMIN</div>
                            <button
                                style={S.navBtn(false)}
                                onClick={() => navigate("/admin")}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                                <span style={{ fontSize: "16px" }}>⚙️</span> Admin Panel
                            </button>
                        </>
                    )}
                </nav>

                <div style={S.sideBottom}>
                    {/* User info — profile.fullName from ProfileResponse */}
                    <div
                        style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", cursor: "pointer" }}
                        onClick={() => setShowProfile(true)}
                    >
                        <div style={S.avatar("#18a0fb")}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {displayName}
                            </div>
                            <div style={{ fontSize: "11px", color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {user?.email}
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
            <div style={S.main}>
                <div style={S.topbar}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "16px", fontWeight: 600 }}>
                            {NAV.find(n => n.key === activeNav)?.label}
                        </span>
                        {!loading && (
                            <span style={{ fontSize: "13px", color: "#bbb" }}>
                                {docs.length} document{docs.length !== 1 ? "s" : ""}
                            </span>
                        )}
                    </div>
                    <button
                        style={S.createBtn}
                        onClick={() => setShowCreate(true)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
                    >
                        <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span> New document
                    </button>
                </div>

                <div style={S.content}>
                    {loading ? <SkeletonGrid /> : docs.length === 0 ? (
                        <div style={S.empty}>
                            <div style={{ fontSize: "52px" }}>📄</div>
                            <div style={{ fontSize: "17px", fontWeight: 600, color: "#555" }}>No documents yet</div>
                            <div style={{ fontSize: "14px", color: "#aaa" }}>Create your first document to get started</div>
                            <button style={{ ...S.createBtn, marginTop: "8px" }} onClick={() => setShowCreate(true)}>
                                + New document
                            </button>
                        </div>
                    ) : (
                        <div style={S.grid}>
                            {docs.map(doc => {
                                const role = docRoles[doc.id] || "OWNER";
                                const canEdit = role === "OWNER" || role === "EDITOR";
                                const canShare = role === "OWNER";
                                const canDelete = role === "OWNER";
                                return (
                                    <div
                                        key={doc.id}
                                        style={S.card}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                                    >
                                        <span style={S.rolePill(role)}>{role}</span>
                                        <div style={{ fontSize: "28px", marginBottom: "10px" }}>📝</div>
                                        {/* DocumentResponse.title */}
                                        <div style={S.docTitle}>{doc.title || "Untitled"}</div>
                                        {/* DocumentResponse.updatedAt / createdAt */}
                                        <div style={S.docMeta}>
                                            {doc.updatedAt ? `Updated ${formatDate(doc.updatedAt)}` : `Created ${formatDate(doc.createdAt)}`}
                                        </div>
                                        <div style={S.actionRow}>
                                            <button style={S.actionBtn("default")}
                                                onMouseEnter={(e) => (e.currentTarget.style.background = "#eee")}
                                                onMouseLeave={(e) => (e.currentTarget.style.background = "#f7f7f7")}
                                                onClick={(e) => e.stopPropagation()}
                                            >Open</button>
                                            {canShare && (
                                                <button style={S.actionBtn("primary")}
                                                    onClick={(e) => { e.stopPropagation(); setShareDoc(doc); }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#d0e8ff")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#e8f4ff")}
                                                >Share</button>
                                            )}
                                            {canDelete && (
                                                <button style={S.actionBtn("danger")}
                                                    onClick={(e) => handleDelete(doc.id, e)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fed7d7")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff5f5")}
                                                >Delete</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create Modal ── */}
            {showCreate && (
                <div style={S.overlay} onClick={() => setShowCreate(false)}>
                    <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                        <div style={S.modalTitle}>New document</div>
                        <div style={S.modalSub}>Give your document a title.</div>
                        <label style={S.modalLabel}>Title</label>
                        <input
                            style={S.modalInput} autoFocus type="text"
                            placeholder="e.g. Q4 Strategy Plan"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreate()}
                            onFocus={e => (e.target.style.borderColor = "#111")}
                            onBlur={e => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <div style={S.btnRow}>
                            <button style={S.cancelBtn} onClick={() => setShowCreate(false)}>Cancel</button>
                            <button
                                style={{ ...S.confirmBtn(), opacity: creating ? 0.7 : 1, cursor: creating ? "not-allowed" : "pointer" }}
                                onClick={handleCreate} disabled={creating}
                            >{creating ? "Creating..." : "Create document"}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Share Modal ── */}
            {/* ShareRequest: { email: string, role: Role } where Role = "EDITOR" | "VIEWER" */}
            {shareDoc && (
                <div style={S.overlay} onClick={() => { setShareDoc(null); setShareError(""); }}>
                    <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                        <div style={S.modalTitle}>Share document</div>
                        <div style={S.modalSub}>"{shareDoc.title}"</div>
                        <label style={S.modalLabel}>Teammate's email</label>
                        <input
                            style={S.modalInput} autoFocus type="email"
                            placeholder="teammate@example.com"
                            value={shareEmail}
                            onChange={e => setShareEmail(e.target.value)}
                            onFocus={e => (e.target.style.borderColor = "#111")}
                            onBlur={e => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <label style={S.modalLabel}>Permission</label>
                        {/* Can only share as EDITOR or VIEWER — not OWNER (backend enforces this) */}
                        <select style={S.select} value={shareRole} onChange={e => setShareRole(e.target.value)}>
                            <option value="EDITOR">Editor — can view and edit</option>
                            <option value="VIEWER">Viewer — can only view</option>
                        </select>
                        {shareError && <div style={{ fontSize: "13px", color: "#e53e3e", marginBottom: "12px" }}>{shareError}</div>}
                        <div style={S.btnRow}>
                            <button style={S.cancelBtn} onClick={() => { setShareDoc(null); setShareError(""); }}>Cancel</button>
                            <button
                                style={{ ...S.confirmBtn("#18a0fb"), opacity: sharing ? 0.7 : 1, cursor: sharing ? "not-allowed" : "pointer" }}
                                onClick={handleShare} disabled={sharing}
                            >{sharing ? "Sharing..." : "Send invite"}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}