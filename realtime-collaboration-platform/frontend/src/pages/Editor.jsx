import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../services/api";
import AiPanel from "../components/AiPanel";

const S = {
    root: { display: "flex", flexDirection: "column", height: "100vh", fontFamily: "'Inter', system-ui, sans-serif", background: "#fff" },
    topbar: { height: "52px", background: "#fff", borderBottom: "1px solid #ebebeb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", flexShrink: 0, zIndex: 10 },
    topLeft: { display: "flex", alignItems: "center", gap: "12px" },
    backBtn: { padding: "5px 10px", background: "none", border: "1px solid #e8e8e8", borderRadius: "7px", fontSize: "13px", color: "#555", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" },
    titleInput: { fontSize: "15px", fontWeight: 600, color: "#111", border: "none", outline: "none", background: "transparent", fontFamily: "inherit", minWidth: "120px", maxWidth: "300px" },
    dot: (c) => ({ width: "7px", height: "7px", borderRadius: "50%", background: c ? "#1bc47d" : "#bbb", transition: "background 0.3s" }),
    liveText: (c) => ({ fontSize: "11px", color: c ? "#1bc47d" : "#bbb", fontWeight: 500 }),
    topRight: { display: "flex", alignItems: "center", gap: "12px" },
    savingText: { fontSize: "11px", color: "#bbb" },
    presence: { display: "flex", alignItems: "center" },
    avatar: (color) => ({ width: "26px", height: "26px", borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "#fff", border: "2px solid #fff", marginLeft: "-5px", flexShrink: 0 }),
    aiBtn: (on) => ({ padding: "5px 12px", borderRadius: "7px", fontSize: "13px", fontWeight: 600, border: "1.5px solid", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", background: on ? "#111" : "none", borderColor: on ? "#111" : "#e8e8e8", color: on ? "#fff" : "#555" }),
    body: { flex: 1, display: "flex", overflow: "hidden" },
    editorWrap: { flex: 1, overflow: "auto", display: "flex", justifyContent: "center", padding: "48px 24px", background: "#f8f8f8" },
    page: { width: "100%", maxWidth: "720px", minHeight: "calc(100vh - 160px)", background: "#fff", borderRadius: "4px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "60px 72px" },
    textarea: { width: "100%", minHeight: "560px", fontSize: "15px", lineHeight: 1.75, color: "#111", border: "none", outline: "none", resize: "none", fontFamily: "'Georgia', serif", background: "transparent" },
};

const COLORS = ["#ff7262", "#18a0fb", "#a259ff", "#1bc47d", "#f6ad55", "#fc8181"];
function colorFor(email) {
    let h = 0;
    for (let i = 0; i < email.length; i++) h = email.charCodeAt(i) + ((h << 5) - h);
    return COLORS[Math.abs(h) % COLORS.length];
}

export default function Editor() {
    const { documentId } = useParams();
    const navigate = useNavigate();
    const { accessToken, user } = useSelector(st => st.auth);

    const [content, setContent] = useState("");
    const [title, setTitle] = useState("");
    const [connected, setConn] = useState(false);
    const [presence, setPresence] = useState([]);
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState(null);
    const [showAi, setShowAi] = useState(false);

    const wsRef = useRef(null);
    const saveTimer = useRef(null);
    const contentRef = useRef("");

    // Load document
    useEffect(() => {
        if (!accessToken) { navigate("/"); return; }
        API.get(`/documents/${documentId}`)
            .then(res => {
                setTitle(res.data.title || "Untitled");
                setContent(res.data.content || "");
                contentRef.current = res.data.content || "";
            })
            .catch(() => navigate("/dashboard"));
    }, [documentId]);

    // WebSocket
    useEffect(() => {
        if (!user?.email || !documentId || !accessToken) return;
        const ws = new WebSocket(`ws://localhost:8080/ws/collab/${documentId}?email=${encodeURIComponent(user.email)}`);
        wsRef.current = ws;
        ws.onopen = () => setConn(true);
        ws.onclose = () => { setConn(false); setPresence([]); };
        ws.onerror = () => setConn(false);
        ws.onmessage = ({ data }) => {
            try {
                const msg = JSON.parse(data);
                if (msg.type === "PRESENCE") setPresence(msg.content ? msg.content.split(",").filter(Boolean) : []);
                else if (msg.type === "JOIN") setPresence(p => p.includes(msg.userEmail) ? p : [...p, msg.userEmail]);
                else if (msg.type === "LEAVE") setPresence(p => p.filter(x => x !== msg.userEmail));
                else if (msg.type === "EDIT" && msg.userEmail !== user.email) {
                    setContent(msg.content);
                    contentRef.current = msg.content;
                }
            } catch { }
        };
        return () => ws.close();
    }, [user?.email, documentId, accessToken]);

    // Auto-save helper
    const save = useCallback((val) => {
        setSaving(true);
        API.put(`/documents/${documentId}`, { content: val })
            .then(() => setSavedAt(new Date()))
            .catch(() => { })
            .finally(() => setSaving(false));
    }, [documentId]);

    const handleChange = useCallback((e) => {
        const val = e.target.value;
        setContent(val);
        contentRef.current = val;
        if (wsRef.current?.readyState === WebSocket.OPEN)
            wsRef.current.send(JSON.stringify({ type: "EDIT", content: val }));
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => save(val), 1500);
    }, [save]);

    // Apply AI rewrite directly into document
    const handleApplyRewrite = useCallback((rewritten) => {
        setContent(rewritten);
        contentRef.current = rewritten;
        if (wsRef.current?.readyState === WebSocket.OPEN)
            wsRef.current.send(JSON.stringify({ type: "EDIT", content: rewritten }));
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => save(rewritten), 1500);
    }, [save]);

    // Final save on unmount
    useEffect(() => () => {
        clearTimeout(saveTimer.current);
        API.put(`/documents/${documentId}`, { content: contentRef.current }).catch(() => { });
    }, [documentId]);

    const others = presence.filter(e => e !== user?.email);

    return (
        <div style={S.root}>
            {/* Topbar */}
            <div style={S.topbar}>
                <div style={S.topLeft}>
                    <button style={S.backBtn} onClick={() => navigate("/dashboard")}
                        onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                        onMouseLeave={e => e.currentTarget.style.background = "none"}>← Back</button>
                    <input style={S.titleInput} value={title}
                        onChange={e => setTitle(e.target.value)} placeholder="Untitled" />
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <div style={S.dot(connected)} />
                        <span style={S.liveText(connected)}>{connected ? "Live" : "Offline"}</span>
                    </div>
                </div>

                <div style={S.topRight}>
                    {/* Saving indicator */}
                    <span style={S.savingText}>
                        {saving ? "⏳ Saving..." : savedAt ? `✓ Saved ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}
                    </span>

                    {/* Presence avatars */}
                    {others.length > 0 && (
                        <div style={S.presence}>
                            <span style={{ fontSize: "11px", color: "#bbb", marginRight: "6px" }}>{others.length} editing</span>
                            {others.slice(0, 4).map((email, i) => (
                                <div key={email} style={{ ...S.avatar(colorFor(email)), zIndex: 4 - i }} title={email}>
                                    {email[0].toUpperCase()}
                                </div>
                            ))}
                            {others.length > 4 && <div style={{ ...S.avatar("#888"), zIndex: 0 }}>+{others.length - 4}</div>}
                        </div>
                    )}

                    {/* AI toggle */}
                    <button style={S.aiBtn(showAi)} onClick={() => setShowAi(v => !v)}
                        onMouseEnter={e => { if (!showAi) e.currentTarget.style.borderColor = "#111"; }}
                        onMouseLeave={e => { if (!showAi) e.currentTarget.style.borderColor = "#e8e8e8"; }}>
                        🤖 AI
                    </button>
                </div>
            </div>

            {/* Body */}
            <div style={S.body}>
                <div style={S.editorWrap}>
                    <div style={S.page}>
                        <textarea style={S.textarea} value={content}
                            onChange={handleChange} placeholder="Start writing..." spellCheck />
                    </div>
                </div>

                {/* AI panel slides in from the right */}
                {showAi && (
                    <AiPanel
                        content={content}
                        onClose={() => setShowAi(false)}
                        onApplyRewrite={handleApplyRewrite}
                    />
                )}
            </div>
        </div>
    );
}