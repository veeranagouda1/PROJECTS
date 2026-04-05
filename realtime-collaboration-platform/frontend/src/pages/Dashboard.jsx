import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchProfile } from "../features/auth/authSlice";
import API from "../services/api";

const NAV = [
    { key: "documents", icon: "📄", label: "My Documents" },
    { key: "shared", icon: "👥", label: "Shared with me" },
    { key: "recent", icon: "🕐", label: "Recent" },
    { key: "teams", icon: "🏠", label: "My Teams" },
];

const ROLE_STYLE = {
    OWNER: { bg: "#111", color: "#fff" },
    EDITOR: { bg: "#e8f4ff", color: "#18a0fb" },
    VIEWER: { bg: "#f5f5f5", color: "#888" },
};

const TEAM_ROLE_STYLE = {
    OWNER: { bg: "#111", color: "#fff" },
    ADMIN: { bg: "#f0e8ff", color: "#a259ff" },
    MEMBER: { bg: "#f5f5f5", color: "#888" },
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
    rolePill: (role, styleMap) => ({
        display: "inline-block", fontSize: "10px", fontWeight: 700,
        padding: "3px 9px", borderRadius: "100px", letterSpacing: "0.5px",
        alignSelf: "flex-start", marginBottom: "12px",
        background: (styleMap || ROLE_STYLE)[role]?.bg || "#f5f5f5",
        color: (styleMap || ROLE_STYLE)[role]?.color || "#888",
    }),
    docTitle: { fontSize: "15px", fontWeight: 600, color: "#111", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    docMeta: { fontSize: "12px", color: "#aaa", marginBottom: "16px" },
    actionRow: { display: "flex", gap: "8px", marginTop: "auto" },
    actionBtn: (variant) => ({
        flex: 1, padding: "8px", border: "none", borderRadius: "8px",
        fontSize: "13px", cursor: "pointer", fontFamily: "inherit",
        transition: "background 0.15s",
        background: variant === "danger" ? "#fff5f5" : variant === "primary" ? "#e8f4ff" : variant === "purple" ? "#f0e8ff" : "#f7f7f7",
        color: variant === "danger" ? "#e53e3e" : variant === "primary" ? "#18a0fb" : variant === "purple" ? "#a259ff" : "#333",
    }),
    empty: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "55vh", gap: "12px" },
    skeleton: { background: "#f5f5f5", borderRadius: "14px", height: "150px" },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500 },
    modalBox: { background: "#fff", borderRadius: "16px", padding: "36px", width: "400px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
    modalBoxWide: { background: "#fff", borderRadius: "16px", padding: "36px", width: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", maxHeight: "80vh", overflow: "auto" },
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
    const [loading, setLoading] = useState(true);

    // ── Documents state ──
    const [docs, setDocs] = useState([]);
    const [docRoles, setDocRoles] = useState({});
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [creating, setCreating] = useState(false);
    const [shareDoc, setShareDoc] = useState(null);
    const [shareEmail, setShareEmail] = useState("");
    const [shareRole, setShareRole] = useState("EDITOR");
    const [sharing, setSharing] = useState(false);
    const [shareError, setShareError] = useState("");

    // ── Teams state ──
    const [teams, setTeams] = useState([]);
    const [showCreateTeam, setShowCreateTeam] = useState(false);
    const [newTeamName, setNewTeamName] = useState("");
    const [newTeamDesc, setNewTeamDesc] = useState("");
    const [creatingTeam, setCreatingTeam] = useState(false);
    const [viewTeam, setViewTeam] = useState(null);       // team whose members we're viewing
    const [teamMembers, setTeamMembers] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [inviteTeam, setInviteTeam] = useState(null);   // team we're inviting to
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("MEMBER");
    const [inviting, setInviting] = useState(false);
    const [inviteError, setInviteError] = useState("");

    // Guard
    useEffect(() => {
        if (!accessToken) navigate("/");
    }, [accessToken]);

    useEffect(() => {
        if (accessToken && !profile) dispatch(fetchProfile());
    }, []);

    useEffect(() => {
        if (activeNav === "teams") {
            fetchTeams();
        } else {
            fetchDocs();
        }
    }, [activeNav]);

    // ── Document API ──
    const fetchDocs = async () => {
        setLoading(true);
        try {
            const res = await API.get("/documents");
            setDocs(res.data);
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
            await API.post(`/documents/${shareDoc.id}/share`, {
                email: shareEmail.trim(), role: shareRole,
            });
            setShareDoc(null); setShareEmail(""); setShareRole("EDITOR");
        } catch (e) {
            setShareError(e.response?.data?.message || "Share failed.");
        } finally {
            setSharing(false);
        }
    };

    // ── Team API ──
    const fetchTeams = async () => {
        setLoading(true);
        try {
            const res = await API.get("/teams");
            setTeams(res.data);
        } catch (e) {
            console.error("Failed to fetch teams", e);
            setTeams([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTeam = async () => {
        if (!newTeamName.trim()) return;
        setCreatingTeam(true);
        try {
            await API.post("/teams", {
                name: newTeamName.trim(),
                description: newTeamDesc.trim() || null,
            });
            setNewTeamName(""); setNewTeamDesc("");
            setShowCreateTeam(false);
            fetchTeams();
        } catch (e) {
            console.error("Create team failed", e);
        } finally {
            setCreatingTeam(false);
        }
    };

    const handleViewMembers = async (team) => {
        setViewTeam(team);
        setLoadingMembers(true);
        try {
            const res = await API.get(`/teams/${team.id}/members`);
            setTeamMembers(res.data);
        } catch (e) {
            console.error("Failed to fetch members", e);
            setTeamMembers([]);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setInviting(true); setInviteError("");
        try {
            await API.post(`/teams/${inviteTeam.id}/members`, {
                email: inviteEmail.trim(),
                role: inviteRole,
            });
            setInviteTeam(null); setInviteEmail(""); setInviteRole("MEMBER");
        } catch (e) {
            setInviteError(e.response?.data?.message || "Invite failed. User may already be a member.");
        } finally {
            setInviting(false);
        }
    };

    const handleDeleteTeam = async (teamId, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this team? This cannot be undone.")) return;
        try {
            await API.delete(`/teams/${teamId}`);
            setTeams(prev => prev.filter(t => t.id !== teamId));
        } catch (e) {
            console.error("Delete team failed", e);
        }
    };

    const handleRemoveMember = async (teamId, email) => {
        if (!window.confirm(`Remove ${email} from team?`)) return;
        try {
            await API.delete(`/teams/${teamId}/members/${email}`);
            setTeamMembers(prev => prev.filter(m => m.userEmail !== email));
        } catch (e) {
            console.error("Remove member failed", e);
        }
    };

    const handleLogout = () => { dispatch(logout()); navigate("/"); };

    const displayName = profile?.fullName || user?.email?.split("@")[0] || "User";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

    // ── Topbar button label ──
    const topbarBtn = activeNav === "teams"
        ? { label: "+ New team", action: () => setShowCreateTeam(true) }
        : { label: "+ New document", action: () => setShowCreate(true) };

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
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                        <div style={S.avatar("#18a0fb")}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
                            <div style={{ fontSize: "11px", color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
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
                                {activeNav === "teams"
                                    ? `${teams.length} team${teams.length !== 1 ? "s" : ""}`
                                    : `${docs.length} document${docs.length !== 1 ? "s" : ""}`
                                }
                            </span>
                        )}
                    </div>
                    <button
                        style={S.createBtn}
                        onClick={topbarBtn.action}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#333")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#111")}
                    >
                        {topbarBtn.label}
                    </button>
                </div>

                <div style={S.content}>

                    {/* ── Documents view ── */}
                    {activeNav !== "teams" && (
                        loading ? <SkeletonGrid /> : docs.length === 0 ? (
                            <div style={S.empty}>
                                <div style={{ fontSize: "52px" }}>📄</div>
                                <div style={{ fontSize: "17px", fontWeight: 600, color: "#555" }}>No documents yet</div>
                                <div style={{ fontSize: "14px", color: "#aaa" }}>Create your first document to get started</div>
                                <button style={{ ...S.createBtn, marginTop: "8px" }} onClick={() => setShowCreate(true)}>+ New document</button>
                            </div>
                        ) : (
                            <div style={S.grid}>
                                {docs.map(doc => {
                                    const role = docRoles[doc.id] || "OWNER";
                                    const canShare = role === "OWNER";
                                    const canDelete = role === "OWNER";
                                    return (
                                        <div key={doc.id} style={S.card}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                                        >
                                            <span style={S.rolePill(role, ROLE_STYLE)}>{role}</span>
                                            <div style={{ fontSize: "28px", marginBottom: "10px" }}>📝</div>
                                            <div style={S.docTitle}>{doc.title || "Untitled"}</div>
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
                        )
                    )}

                    {/* ── Teams view ── */}
                    {activeNav === "teams" && (
                        loading ? <SkeletonGrid /> : teams.length === 0 ? (
                            <div style={S.empty}>
                                <div style={{ fontSize: "52px" }}>🏠</div>
                                <div style={{ fontSize: "17px", fontWeight: 600, color: "#555" }}>No teams yet</div>
                                <div style={{ fontSize: "14px", color: "#aaa" }}>Create a team to collaborate with others</div>
                                <button style={{ ...S.createBtn, marginTop: "8px" }} onClick={() => setShowCreateTeam(true)}>+ New team</button>
                            </div>
                        ) : (
                            <div style={S.grid}>
                                {teams.map(team => {
                                    const isOwner = team.ownerEmail === user?.email;
                                    return (
                                        <div key={team.id} style={S.card}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#ccc"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#ebebeb"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
                                        >
                                            <span style={S.rolePill(isOwner ? "OWNER" : "MEMBER", TEAM_ROLE_STYLE)}>
                                                {isOwner ? "OWNER" : "MEMBER"}
                                            </span>
                                            <div style={{ fontSize: "28px", marginBottom: "10px" }}>🏠</div>
                                            <div style={S.docTitle}>{team.name}</div>
                                            <div style={S.docMeta}>
                                                {team.description || "No description"} · Created {formatDate(team.createdAt)}
                                            </div>
                                            <div style={S.actionRow}>
                                                <button style={S.actionBtn("default")}
                                                    onClick={(e) => { e.stopPropagation(); handleViewMembers(team); }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#eee")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f7f7f7")}
                                                >Members</button>
                                                {isOwner && (
                                                    <button style={S.actionBtn("purple")}
                                                        onClick={(e) => { e.stopPropagation(); setInviteTeam(team); }}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#e0d0ff")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = "#f0e8ff")}
                                                    >Invite</button>
                                                )}
                                                {isOwner && (
                                                    <button style={S.actionBtn("danger")}
                                                        onClick={(e) => handleDeleteTeam(team.id, e)}
                                                        onMouseEnter={(e) => (e.currentTarget.style.background = "#fed7d7")}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = "#fff5f5")}
                                                    >Delete</button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* ── Create Document Modal ── */}
            {showCreate && (
                <div style={S.overlay} onClick={() => setShowCreate(false)}>
                    <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                        <div style={S.modalTitle}>New document</div>
                        <div style={S.modalSub}>Give your document a title.</div>
                        <label style={S.modalLabel}>Title</label>
                        <input style={S.modalInput} autoFocus type="text"
                            placeholder="e.g. Q4 Strategy Plan"
                            value={newTitle} onChange={e => setNewTitle(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreate()}
                            onFocus={e => (e.target.style.borderColor = "#111")}
                            onBlur={e => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <div style={S.btnRow}>
                            <button style={S.cancelBtn} onClick={() => setShowCreate(false)}>Cancel</button>
                            <button style={{ ...S.confirmBtn(), opacity: creating ? 0.7 : 1 }}
                                onClick={handleCreate} disabled={creating}>
                                {creating ? "Creating..." : "Create document"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Share Document Modal ── */}
            {shareDoc && (
                <div style={S.overlay} onClick={() => { setShareDoc(null); setShareError(""); }}>
                    <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                        <div style={S.modalTitle}>Share document</div>
                        <div style={S.modalSub}>"{shareDoc.title}"</div>
                        <label style={S.modalLabel}>Teammate's email</label>
                        <input style={S.modalInput} autoFocus type="email"
                            placeholder="teammate@example.com"
                            value={shareEmail} onChange={e => setShareEmail(e.target.value)}
                            onFocus={e => (e.target.style.borderColor = "#111")}
                            onBlur={e => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <label style={S.modalLabel}>Permission</label>
                        <select style={S.select} value={shareRole} onChange={e => setShareRole(e.target.value)}>
                            <option value="EDITOR">Editor — can view and edit</option>
                            <option value="VIEWER">Viewer — can only view</option>
                        </select>
                        {shareError && <div style={{ fontSize: "13px", color: "#e53e3e", marginBottom: "12px" }}>{shareError}</div>}
                        <div style={S.btnRow}>
                            <button style={S.cancelBtn} onClick={() => { setShareDoc(null); setShareError(""); }}>Cancel</button>
                            <button style={{ ...S.confirmBtn("#18a0fb"), opacity: sharing ? 0.7 : 1 }}
                                onClick={handleShare} disabled={sharing}>
                                {sharing ? "Sharing..." : "Send invite"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create Team Modal ── */}
            {showCreateTeam && (
                <div style={S.overlay} onClick={() => setShowCreateTeam(false)}>
                    <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                        <div style={S.modalTitle}>New team</div>
                        <div style={S.modalSub}>Create a team to collaborate with others.</div>
                        <label style={S.modalLabel}>Team name</label>
                        <input style={S.modalInput} autoFocus type="text"
                            placeholder="e.g. Design Team"
                            value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreateTeam()}
                            onFocus={e => (e.target.style.borderColor = "#111")}
                            onBlur={e => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <label style={S.modalLabel}>Description (optional)</label>
                        <input style={S.modalInput} type="text"
                            placeholder="What does this team work on?"
                            value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)}
                            onFocus={e => (e.target.style.borderColor = "#111")}
                            onBlur={e => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <div style={S.btnRow}>
                            <button style={S.cancelBtn} onClick={() => setShowCreateTeam(false)}>Cancel</button>
                            <button style={{ ...S.confirmBtn(), opacity: creatingTeam ? 0.7 : 1 }}
                                onClick={handleCreateTeam} disabled={creatingTeam}>
                                {creatingTeam ? "Creating..." : "Create team"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── View Members Modal ── */}
            {viewTeam && (
                <div style={S.overlay} onClick={() => setViewTeam(null)}>
                    <div style={S.modalBoxWide} onClick={e => e.stopPropagation()}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                            <div style={S.modalTitle}>{viewTeam.name}</div>
                            <button
                                style={{ background: "none", border: "none", fontSize: "18px", color: "#bbb", cursor: "pointer" }}
                                onClick={() => setViewTeam(null)}
                            >×</button>
                        </div>
                        <div style={S.modalSub}>Team members</div>
                        {loadingMembers ? (
                            <div style={{ color: "#aaa", fontSize: "14px" }}>Loading members...</div>
                        ) : teamMembers.length === 0 ? (
                            <div style={{ color: "#aaa", fontSize: "14px" }}>No members found.</div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {teamMembers.map(m => (
                                    <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", background: "#fafafa", borderRadius: "10px", border: "1px solid #f0f0f0" }}>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 500, color: "#111" }}>{m.userEmail}</div>
                                            <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px" }}>
                                                Joined {formatDate(m.joinedAt)}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                            <span style={S.rolePill(m.role, TEAM_ROLE_STYLE)}>{m.role}</span>
                                            {viewTeam.ownerEmail === user?.email && m.role !== "OWNER" && (
                                                <button
                                                    style={{ padding: "4px 10px", background: "#fff5f5", border: "none", borderRadius: "6px", fontSize: "12px", color: "#e53e3e", cursor: "pointer" }}
                                                    onClick={() => handleRemoveMember(viewTeam.id, m.userEmail)}
                                                    onMouseEnter={(e) => (e.currentTarget.style.background = "#fed7d7")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.background = "#fff5f5")}
                                                >Remove</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div style={{ marginTop: "20px" }}>
                            <button style={{ ...S.confirmBtn("#a259ff"), width: "100%" }}
                                onClick={() => { setViewTeam(null); setInviteTeam(viewTeam); }}>
                                + Invite member
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Invite Member Modal ── */}
            {inviteTeam && (
                <div style={S.overlay} onClick={() => { setInviteTeam(null); setInviteError(""); }}>
                    <div style={S.modalBox} onClick={e => e.stopPropagation()}>
                        <div style={S.modalTitle}>Invite to {inviteTeam.name}</div>
                        <div style={S.modalSub}>Add a teammate by their email address.</div>
                        <label style={S.modalLabel}>Email address</label>
                        <input style={S.modalInput} autoFocus type="email"
                            placeholder="teammate@example.com"
                            value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleInvite()}
                            onFocus={e => (e.target.style.borderColor = "#111")}
                            onBlur={e => (e.target.style.borderColor = "#e8e8e8")}
                        />
                        <label style={S.modalLabel}>Role</label>
                        <select style={S.select} value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                            <option value="MEMBER">Member — standard access</option>
                            <option value="ADMIN">Admin — can invite others</option>
                        </select>
                        {inviteError && <div style={{ fontSize: "13px", color: "#e53e3e", marginBottom: "12px" }}>{inviteError}</div>}
                        <div style={S.btnRow}>
                            <button style={S.cancelBtn} onClick={() => { setInviteTeam(null); setInviteError(""); }}>Cancel</button>
                            <button style={{ ...S.confirmBtn("#a259ff"), opacity: inviting ? 0.7 : 1 }}
                                onClick={handleInvite} disabled={inviting}>
                                {inviting ? "Inviting..." : "Send invite"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}