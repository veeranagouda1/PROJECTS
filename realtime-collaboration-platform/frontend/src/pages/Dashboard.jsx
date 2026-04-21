import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout, fetchProfile, updateProfile } from "../features/auth/authSlice";
import API from "../services/api";
import AiPanel from "../components/AiPanel";

const S = {
    root: { display: "flex", height: "100vh", overflow: "hidden", fontFamily: "'Inter', system-ui, sans-serif", background: "#fafafa" },
    sidebar: { width: "240px", flexShrink: 0, background: "#111", color: "#fff", display: "flex", flexDirection: "column" },
    sideTop: { padding: "18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "10px" },
    logoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px", width: "20px", height: "20px", flexShrink: 0 },
    nav: { padding: "12px 8px", flex: 1, overflowY: "auto" },
    navLabel: { fontSize: "10px", fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "1px", padding: "10px 12px 4px", textTransform: "uppercase" },
    navBtn: (active) => ({
        display: "flex", alignItems: "center", gap: "9px", padding: "8px 12px", borderRadius: "8px",
        fontSize: "13.5px", fontWeight: active ? 600 : 400,
        color: active ? "#fff" : "rgba(255,255,255,0.5)",
        background: active ? "rgba(255,255,255,0.12)" : "transparent",
        cursor: "pointer", marginBottom: "1px", transition: "all 0.15s",
        border: "none", width: "100%", textAlign: "left", fontFamily: "inherit",
    }),
    sideBottom: { padding: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" },
    main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" },
    topbar: { height: "58px", background: "#fff", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", flexShrink: 0 },
    content: { flex: 1, overflow: "auto", padding: "28px 32px" },
    pageTitle: { fontSize: "20px", fontWeight: 700, color: "#111", marginBottom: "6px", letterSpacing: "-0.4px" },
    pageSubtitle: { fontSize: "13px", color: "#aaa", marginBottom: "28px" },
    docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px" },
    docCard: { background: "#fff", borderRadius: "12px", border: "1px solid #ebebeb", padding: "20px", cursor: "pointer", transition: "all 0.15s", position: "relative" },
    docTitle: { fontSize: "14px", fontWeight: 600, color: "#111", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
    docMeta: { fontSize: "11px", color: "#bbb" },
    createBtn: { padding: "9px 18px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200, backdropFilter: "blur(4px)" },
    modal: { background: "#fff", borderRadius: "16px", padding: "32px 36px", width: "420px", boxShadow: "0 24px 64px rgba(0,0,0,0.15)", position: "relative" },
    modalTitle: { fontSize: "18px", fontWeight: 700, color: "#111", marginBottom: "20px", letterSpacing: "-0.3px" },
    label: { display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "5px" },
    input: { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", color: "#111", fontFamily: "inherit", marginBottom: "14px", transition: "border-color 0.15s" },
    textarea: { width: "100%", padding: "10px 14px", border: "1.5px solid #e8e8e8", borderRadius: "8px", fontSize: "14px", outline: "none", boxSizing: "border-box", color: "#111", fontFamily: "inherit", marginBottom: "14px", resize: "vertical", minHeight: "80px", transition: "border-color 0.15s" },
    teamCard: { background: "#fff", borderRadius: "12px", border: "1px solid #ebebeb", padding: "20px 24px", marginBottom: "12px" },
    teamName: { fontSize: "15px", fontWeight: 700, color: "#111", marginBottom: "4px" },
    teamDesc: { fontSize: "13px", color: "#aaa", marginBottom: "14px" },
    memberBadge: { display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "100px", background: "#f5f5f5", fontSize: "12px", color: "#444", marginRight: "6px", marginBottom: "6px" },
    rolePill: (role) => ({
        fontSize: "10px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px",
        background: role === "OWNER" ? "#111" : role === "ADMIN" ? "#18a0fb22" : "#f0f0f0",
        color: role === "OWNER" ? "#fff" : role === "ADMIN" ? "#18a0fb" : "#888",
    }),
    profileCard: { background: "#fff", borderRadius: "14px", border: "1px solid #ebebeb", padding: "28px 32px", maxWidth: "480px" },
    saveBtn: { padding: "10px 24px", background: "#111", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    teamDocSection: { marginTop: "20px" },
    teamDocTitle: { fontSize: "12px", fontWeight: 700, color: "#bbb", letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: "10px" },
    teamPill: { display: "inline-block", padding: "2px 8px", borderRadius: "100px", background: "#f0f4ff", color: "#18a0fb", fontSize: "10px", fontWeight: 600, marginBottom: "6px" },
};

function Modal({ onClose, children }) {
    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={S.modal} onClick={e => e.stopPropagation()}>
                <button onClick={onClose} style={{ position: "absolute", top: 14, right: 18, background: "none", border: "none", fontSize: "18px", color: "#bbb", cursor: "pointer" }}>×</button>
                {children}
            </div>
        </div>
    );
}

// ─── Documents Tab ─────────────────────────────────────────────────────────────
function DocumentsTab() {
    const navigate = useNavigate();
    const [docs, setDocs] = useState([]);
    const [teams, setTeams] = useState([]); // for team selector in create modal
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showShare, setShowShare] = useState(null);
    const [title, setTitle] = useState("");
    const [selectedTeam, setSelectedTeam] = useState(""); // ✅ team selector
    const [shareEmail, setShareEmail] = useState("");
    const [shareRole, setShareRole] = useState("EDITOR");
    const [creating, setCreating] = useState(false);
    const [sharing, setSharing] = useState(false);
    const [aiDoc, setAiDoc] = useState(null);

    useEffect(() => { loadDocs(); loadTeams(); }, []);

    const loadDocs = async () => {
        setLoading(true);
        try {
            const res = await API.get("/documents");
            setDocs(res.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const loadTeams = async () => {
        try {
            const res = await API.get("/teams");
            setTeams(res.data);
        } catch (e) { console.error(e); }
    };

    const handleCreate = async () => {
        if (!title.trim()) return;
        setCreating(true);
        try {
            const res = await API.post("/documents", {
                title: title.trim(),
                content: "",
                teamId: selectedTeam || null, // ✅ attach to team if selected
            });
            setDocs(prev => [res.data, ...prev]);
            setShowCreate(false);
            setTitle(""); setSelectedTeam("");
        } catch (e) { console.error(e); }
        finally { setCreating(false); }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this document?")) return;
        try {
            await API.delete(`/documents/${id}`);
            setDocs(prev => prev.filter(d => d.id !== id));
        } catch (e) { console.error(e); }
    };

    const handleShare = async () => {
        if (!shareEmail.trim()) return;
        setSharing(true);
        try {
            await API.post(`/documents/${showShare}/share`, { email: shareEmail.trim(), role: shareRole });
            setShowShare(null); setShareEmail("");
        } catch (e) { alert(e.response?.data?.message || "Share failed"); }
        finally { setSharing(false); }
    };

    // Group docs: personal vs team
    const personalDocs = docs.filter(d => !d.teamId);
    const teamDocs = docs.filter(d => d.teamId);
    const teamMap = Object.fromEntries(teams.map(t => [t.id, t.name]));

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div>
                    <div style={S.pageTitle}>My Documents</div>
                    <div style={S.pageSubtitle}>{docs.length} document{docs.length !== 1 ? "s" : ""}</div>
                </div>
                <button style={S.createBtn} onClick={() => setShowCreate(true)}
                    onMouseEnter={e => e.currentTarget.style.background = "#333"}
                    onMouseLeave={e => e.currentTarget.style.background = "#111"}>
                    + New Document
                </button>
            </div>

            {loading ? (
                <div style={{ color: "#aaa", fontSize: "14px" }}>Loading...</div>
            ) : docs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                    <div style={{ fontSize: "40px", marginBottom: "12px" }}>📄</div>
                    <div style={{ fontSize: "15px", fontWeight: 500, marginBottom: "6px", color: "#555" }}>No documents yet</div>
                    <div style={{ fontSize: "13px" }}>Create your first document to get started</div>
                </div>
            ) : (
                <>
                    {/* Personal documents */}
                    {personalDocs.length > 0 && (
                        <>
                            {teamDocs.length > 0 && <div style={S.teamDocTitle}>Personal</div>}
                            <div style={{ ...S.docGrid, marginBottom: "28px" }}>
                                {personalDocs.map(doc => <DocCard key={doc.id} doc={doc} teamMap={teamMap} onNavigate={() => navigate(`/editor/${doc.id}`)} onShare={() => setShowShare(doc.id)} onDelete={handleDelete} onAi={() => setAiDoc(doc)} />)}
                            </div>
                        </>
                    )}

                    {/* Team documents grouped by team */}
                    {teamDocs.length > 0 && (
                        <>
                            {[...new Set(teamDocs.map(d => d.teamId))].map(tid => (
                                <div key={tid} style={S.teamDocSection}>
                                    <div style={S.teamDocTitle}>📁 {teamMap[tid] || "Team"}</div>
                                    <div style={{ ...S.docGrid, marginBottom: "24px" }}>
                                        {teamDocs.filter(d => d.teamId === tid).map(doc => (
                                            <DocCard key={doc.id} doc={doc} teamMap={teamMap} onNavigate={() => navigate(`/editor/${doc.id}`)} onShare={() => setShowShare(doc.id)} onDelete={handleDelete} onAi={() => setAiDoc(doc)} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </>
            )}

            {/* Create modal */}
            {showCreate && (
                <Modal onClose={() => { setShowCreate(false); setTitle(""); setSelectedTeam(""); }}>
                    <div style={S.modalTitle}>New Document</div>
                    <label style={S.label}>Title</label>
                    <input style={S.input} placeholder="e.g. Q3 Strategy" value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCreate()}
                        onFocus={e => e.target.style.borderColor = "#111"}
                        onBlur={e => e.target.style.borderColor = "#e8e8e8"} autoFocus />

                    {/* ✅ Team selector */}
                    <label style={S.label}>Add to team (optional)</label>
                    <select value={selectedTeam} onChange={e => setSelectedTeam(e.target.value)}
                        style={{ ...S.input, marginBottom: "20px" }}>
                        <option value="">Personal document</option>
                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>

                    <button style={{ ...S.createBtn, width: "100%", padding: "11px", opacity: creating ? 0.7 : 1 }}
                        onClick={handleCreate} disabled={creating}>
                        {creating ? "Creating..." : "Create Document"}
                    </button>
                </Modal>
            )}

            {/* Share modal */}
            {showShare && (
                <Modal onClose={() => { setShowShare(null); setShareEmail(""); }}>
                    <div style={S.modalTitle}>Share Document</div>
                    <label style={S.label}>Email address</label>
                    <input style={S.input} placeholder="collaborator@example.com" value={shareEmail}
                        onChange={e => setShareEmail(e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#111"}
                        onBlur={e => e.target.style.borderColor = "#e8e8e8"} autoFocus />
                    <label style={S.label}>Role</label>
                    <select value={shareRole} onChange={e => setShareRole(e.target.value)}
                        style={{ ...S.input, marginBottom: "20px" }}>
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                    </select>
                    <button style={{ ...S.createBtn, width: "100%", padding: "11px", opacity: sharing ? 0.7 : 1 }}
                        onClick={handleShare} disabled={sharing}>
                        {sharing ? "Sharing..." : "Share"}
                    </button>
                </Modal>
            )}

            {aiDoc && (
                <div style={{ position: "fixed", top: 0, right: 0, height: "100vh", zIndex: 300, boxShadow: "-4px 0 20px rgba(0,0,0,0.08)" }}>
                    <AiPanel content={aiDoc.content || ""} onClose={() => setAiDoc(null)} onApplyRewrite={null} />
                </div>
            )}
        </>
    );
}

// ─── Doc Card ──────────────────────────────────────────────────────────────────
function DocCard({ doc, teamMap, onNavigate, onShare, onDelete, onAi }) {
    return (
        <div style={S.docCard} onClick={onNavigate}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#d0d0d0"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#ebebeb"; }}>
            <div style={{ fontSize: "28px", marginBottom: "12px" }}>📄</div>
            <div style={S.docTitle}>{doc.title || "Untitled"}</div>
            {doc.teamId && <div style={S.teamPill}>{teamMap[doc.teamId] || "Team"}</div>}
            <div style={S.docMeta}>
                {doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "12px" }} onClick={e => e.stopPropagation()}>
                <button style={{ padding: "4px 10px", background: "#f5f5f5", border: "none", borderRadius: "6px", fontSize: "11px", color: "#555", cursor: "pointer", fontFamily: "inherit" }}
                    onClick={e => { e.stopPropagation(); onShare(); }}>Share</button>
                <button style={{ padding: "4px 10px", background: "#fff5f5", border: "none", borderRadius: "6px", fontSize: "11px", color: "#e53e3e", cursor: "pointer", fontFamily: "inherit" }}
                    onClick={e => { e.stopPropagation(); onDelete(doc.id, e); }}>Delete</button>
                <button style={{ padding: "4px 10px", background: "#f0f4ff", border: "none", borderRadius: "6px", fontSize: "11px", color: "#18a0fb", cursor: "pointer", fontFamily: "inherit" }}
                    onClick={e => { e.stopPropagation(); onAi(); }}>🤖 AI</button>
            </div>
        </div>
    );
}

// ─── Teams Tab ─────────────────────────────────────────────────────────────────
function TeamsTab() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState([]);
    const [members, setMembers] = useState({});
    const [teamDocs, setTeamDocs] = useState({}); // ✅ teamId → docs[]
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [showInvite, setShowInvite] = useState(null);
    const [teamName, setTeamName] = useState("");
    const [teamDesc, setTeamDesc] = useState("");
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("MEMBER");
    const [creating, setCreating] = useState(false);
    const [inviting, setInviting] = useState(false);

    useEffect(() => { loadTeams(); }, []);

    const loadTeams = async () => {
        setLoading(true);
        try {
            const res = await API.get("/teams");
            setTeams(res.data);
            const memberMap = {};
            await Promise.all(res.data.map(async t => {
                try { const m = await API.get(`/teams/${t.id}/members`); memberMap[t.id] = m.data; }
                catch { memberMap[t.id] = []; }
            }));
            setMembers(memberMap);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    // ✅ Load team documents on expand
    const handleExpand = async (teamId) => {
        if (expandedTeam === teamId) { setExpandedTeam(null); return; }
        setExpandedTeam(teamId);
        if (!teamDocs[teamId]) {
            try {
                const res = await API.get(`/documents/team/${teamId}`);
                setTeamDocs(prev => ({ ...prev, [teamId]: res.data }));
            } catch { setTeamDocs(prev => ({ ...prev, [teamId]: [] })); }
        }
    };

    const handleCreate = async () => {
        if (!teamName.trim()) return;
        setCreating(true);
        try {
            const res = await API.post("/teams", { name: teamName.trim(), description: teamDesc.trim() });
            setTeams(prev => [res.data, ...prev]);
            setMembers(prev => ({ ...prev, [res.data.id]: [] }));
            setShowCreate(false); setTeamName(""); setTeamDesc("");
        } catch (e) { alert(e.response?.data?.message || "Failed to create team"); }
        finally { setCreating(false); }
    };

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        setInviting(true);
        try {
            await API.post(`/teams/${showInvite}/members`, { email: inviteEmail.trim(), role: inviteRole });
            const m = await API.get(`/teams/${showInvite}/members`);
            setMembers(prev => ({ ...prev, [showInvite]: m.data }));
            setShowInvite(null); setInviteEmail("");
        } catch (e) { alert(e.response?.data?.message || "Failed to invite member"); }
        finally { setInviting(false); }
    };

    const handleRemove = async (teamId, email) => {
        if (!window.confirm(`Remove ${email} from team?`)) return;
        try {
            await API.delete(`/teams/${teamId}/members/${encodeURIComponent(email)}`);
            setMembers(prev => ({ ...prev, [teamId]: prev[teamId].filter(m => m.userEmail !== email) }));
        } catch (e) { alert(e.response?.data?.message || "Failed to remove member"); }
    };

    return (
        <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <div>
                    <div style={S.pageTitle}>My Teams</div>
                    <div style={S.pageSubtitle}>{teams.length} team{teams.length !== 1 ? "s" : ""}</div>
                </div>
                <button style={S.createBtn} onClick={() => setShowCreate(true)}
                    onMouseEnter={e => e.currentTarget.style.background = "#333"}
                    onMouseLeave={e => e.currentTarget.style.background = "#111"}>
                    + New Team
                </button>
            </div>

            {loading ? <div style={{ color: "#aaa", fontSize: "14px" }}>Loading...</div>
                : teams.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#aaa" }}>
                        <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
                        <div style={{ fontSize: "15px", fontWeight: 500, marginBottom: "6px", color: "#555" }}>No teams yet</div>
                        <div style={{ fontSize: "13px" }}>Create a team and invite your collaborators</div>
                    </div>
                ) : teams.map(team => (
                    <div key={team.id} style={S.teamCard}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                            <div style={{ cursor: "pointer" }} onClick={() => handleExpand(team.id)}>
                                <div style={{ ...S.teamName, display: "flex", alignItems: "center", gap: "6px" }}>
                                    <span>{expandedTeam === team.id ? "▾" : "▸"}</span>
                                    {team.name}
                                </div>
                                {team.description && <div style={S.teamDesc}>{team.description}</div>}
                            </div>
                            <button style={{ padding: "5px 12px", background: "#f5f5f5", border: "none", borderRadius: "6px", fontSize: "12px", color: "#555", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}
                                onClick={() => setShowInvite(team.id)}>+ Invite</button>
                        </div>

                        {/* Members */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "10px" }}>
                            {(members[team.id] || []).map(m => (
                                <div key={m.id} style={S.memberBadge}>
                                    <span>{m.userEmail}</span>
                                    <span style={S.rolePill(m.role)}>{m.role}</span>
                                    {m.role !== "OWNER" && (
                                        <span style={{ marginLeft: "2px", color: "#ccc", cursor: "pointer", fontSize: "13px" }}
                                            onClick={() => handleRemove(team.id, m.userEmail)}>×</span>
                                    )}
                                </div>
                            ))}
                            {(members[team.id] || []).length === 0 && <span style={{ fontSize: "12px", color: "#ccc" }}>No members yet</span>}
                        </div>

                        {/* ✅ Team documents (expandable) */}
                        {expandedTeam === team.id && (
                            <div style={{ borderTop: "1px solid #f5f5f5", paddingTop: "12px", marginTop: "4px" }}>
                                <div style={S.teamDocTitle}>Documents</div>
                                {!teamDocs[team.id] ? (
                                    <div style={{ fontSize: "12px", color: "#bbb" }}>Loading...</div>
                                ) : teamDocs[team.id].length === 0 ? (
                                    <div style={{ fontSize: "12px", color: "#bbb" }}>No documents in this team yet. Create one from the Documents tab.</div>
                                ) : (
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                        {teamDocs[team.id].map(doc => (
                                            <div key={doc.id}
                                                style={{ padding: "7px 12px", background: "#fafafa", border: "1px solid #ebebeb", borderRadius: "8px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                                                onClick={() => navigate(`/editor/${doc.id}`)}
                                                onMouseEnter={e => e.currentTarget.style.borderColor = "#111"}
                                                onMouseLeave={e => e.currentTarget.style.borderColor = "#ebebeb"}>
                                                📄 <span style={{ fontWeight: 500 }}>{doc.title || "Untitled"}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}

            {showCreate && (
                <Modal onClose={() => { setShowCreate(false); setTeamName(""); setTeamDesc(""); }}>
                    <div style={S.modalTitle}>Create Team</div>
                    <label style={S.label}>Team name</label>
                    <input style={S.input} placeholder="e.g. Design Team" value={teamName}
                        onChange={e => setTeamName(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleCreate()}
                        onFocus={e => e.target.style.borderColor = "#111"}
                        onBlur={e => e.target.style.borderColor = "#e8e8e8"} autoFocus />
                    <label style={S.label}>Description (optional)</label>
                    <input style={S.input} placeholder="What does this team work on?" value={teamDesc}
                        onChange={e => setTeamDesc(e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#111"}
                        onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
                    <button style={{ ...S.createBtn, width: "100%", padding: "11px", opacity: creating ? 0.7 : 1 }}
                        onClick={handleCreate} disabled={creating}>
                        {creating ? "Creating..." : "Create Team"}
                    </button>
                </Modal>
            )}

            {showInvite && (
                <Modal onClose={() => { setShowInvite(null); setInviteEmail(""); }}>
                    <div style={S.modalTitle}>Invite Member</div>
                    <label style={S.label}>Email address</label>
                    <input style={S.input} placeholder="member@example.com" value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        onFocus={e => e.target.style.borderColor = "#111"}
                        onBlur={e => e.target.style.borderColor = "#e8e8e8"} autoFocus />
                    <label style={S.label}>Role</label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                        style={{ ...S.input, marginBottom: "20px" }}>
                        <option value="ADMIN">Admin</option>
                        <option value="MEMBER">Member</option>
                    </select>
                    <button style={{ ...S.createBtn, width: "100%", padding: "11px", opacity: inviting ? 0.7 : 1 }}
                        onClick={handleInvite} disabled={inviting}>
                        {inviting ? "Inviting..." : "Send Invite"}
                    </button>
                </Modal>
            )}
        </>
    );
}

// ─── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab() {
    const dispatch = useDispatch();
    const { profile, user, loading } = useSelector(st => st.auth);
    const [fullName, setFullName] = useState("");
    const [bio, setBio] = useState("");
    const [phone, setPhone] = useState("");
    const [saved, setSaved] = useState(false);

    useEffect(() => { if (!profile) dispatch(fetchProfile()); }, []);
    useEffect(() => {
        if (profile) { setFullName(profile.fullName || ""); setBio(profile.bio || ""); setPhone(profile.phone || ""); }
    }, [profile]);

    const handleSave = async () => {
        try {
            await dispatch(updateProfile({ fullName, bio, phone })).unwrap();
            setSaved(true); setTimeout(() => setSaved(false), 2000);
        } catch { alert("Failed to save profile"); }
    };

    return (
        <>
            <div style={S.pageTitle}>Profile</div>
            <div style={{ ...S.pageSubtitle, marginBottom: "28px" }}>Manage your personal information</div>
            <div style={S.profileCard}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                        {(fullName || user?.email || "?")[0].toUpperCase()}
                    </div>
                    <div>
                        <div style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>{fullName || user?.email}</div>
                        <div style={{ fontSize: "12px", color: "#aaa" }}>{user?.email}</div>
                    </div>
                </div>
                <label style={S.label}>Full name</label>
                <input style={S.input} value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name"
                    onFocus={e => e.target.style.borderColor = "#111"} onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
                <label style={S.label}>Bio</label>
                <textarea style={S.textarea} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself"
                    onFocus={e => e.target.style.borderColor = "#111"} onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
                <label style={S.label}>Phone</label>
                <input style={S.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="10-digit phone number"
                    onFocus={e => e.target.style.borderColor = "#111"} onBlur={e => e.target.style.borderColor = "#e8e8e8"} />
                <button style={{ ...S.saveBtn, background: saved ? "#1bc47d" : "#111", transition: "background 0.3s" }}
                    onClick={handleSave} disabled={loading}>
                    {saved ? "✓ Saved" : loading ? "Saving..." : "Save Changes"}
                </button>
            </div>
        </>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
const NAV = [
    { key: "documents", icon: "📄", label: "Documents" },
    { key: "teams", icon: "👥", label: "Teams" },
    { key: "profile", icon: "👤", label: "Profile" },
];

export default function Dashboard() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { accessToken, user, profile } = useSelector(st => st.auth);
    const [activeNav, setActiveNav] = useState("documents");

    useEffect(() => { if (!accessToken) navigate("/"); }, [accessToken]);

    const handleLogout = () => { dispatch(logout()); navigate("/"); };
    const displayName = profile?.fullName || user?.email?.split("@")[0] || "User";
    const initials = displayName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

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
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>CollabX</span>
                </div>
                <nav style={S.nav}>
                    <div style={S.navLabel}>Workspace</div>
                    {NAV.map(item => (
                        <button key={item.key} style={S.navBtn(activeNav === item.key)}
                            onClick={() => setActiveNav(item.key)}
                            onMouseEnter={e => { if (activeNav !== item.key) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                            onMouseLeave={e => { if (activeNav !== item.key) e.currentTarget.style.background = "transparent"; }}>
                            <span>{item.icon}</span>{item.label}
                        </button>
                    ))}
                    {user?.role === "ADMIN" && (
                        <>
                            <div style={{ ...S.navLabel, marginTop: "16px" }}>Admin</div>
                            <button style={S.navBtn(false)} onClick={() => navigate("/admin")}
                                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <span>⚙️</span> Admin Panel
                            </button>
                        </>
                    )}
                </nav>
                <div style={S.sideBottom}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>{initials}</div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{displayName}</div>
                            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</div>
                        </div>
                    </div>
                    <button style={{ width: "100%", padding: "8px", background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "7px", fontSize: "13px", color: "rgba(255,255,255,0.5)", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                        onClick={handleLogout}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.07)"}>
                        Sign out
                    </button>
                </div>
            </aside>
            <div style={S.main}>
                <div style={S.topbar}>
                    <span style={{ fontSize: "15px", fontWeight: 600, color: "#111" }}>{NAV.find(n => n.key === activeNav)?.label}</span>
                    <span style={{ fontSize: "12px", color: "#bbb" }}>{user?.email}</span>
                </div>
                <div style={S.content}>
                    {activeNav === "documents" && <DocumentsTab />}
                    {activeNav === "teams" && <TeamsTab />}
                    {activeNav === "profile" && <ProfileTab />}
                </div>
            </div>
        </div>
    );
}