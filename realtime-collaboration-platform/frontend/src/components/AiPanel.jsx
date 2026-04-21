import { useState } from "react";
import API from "../services/api";

const S = {
    panel: {
        width: "320px", flexShrink: 0,
        background: "#fafafa", borderLeft: "1px solid #ebebeb",
        display: "flex", flexDirection: "column",
        fontFamily: "'Inter', system-ui, sans-serif", overflow: "hidden",
    },
    header: {
        padding: "14px 16px", borderBottom: "1px solid #ebebeb",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#fff", flexShrink: 0,
    },
    headerTitle: { fontSize: "13px", fontWeight: 700, color: "#111", display: "flex", alignItems: "center", gap: "7px" },
    closeBtn: { background: "none", border: "none", fontSize: "18px", color: "#bbb", cursor: "pointer", padding: "2px 6px", borderRadius: "4px" },
    body: { flex: 1, overflow: "auto", padding: "14px" },
    actionGrid: { display: "flex", flexDirection: "column", gap: "7px", marginBottom: "16px" },
    actionBtn: (active, color) => ({
        padding: "10px 12px", borderRadius: "9px", fontSize: "13px", fontWeight: 600,
        border: `1.5px solid ${active ? color : "#e8e8e8"}`,
        background: active ? color : "#fff", color: active ? "#fff" : "#333",
        cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", gap: "8px",
        transition: "all 0.15s", textAlign: "left",
    }),
    actionDesc: { fontSize: "11px", fontWeight: 400, opacity: 0.75, marginTop: "1px" },
    runBtn: (loading) => ({
        width: "100%", padding: "10px", background: loading ? "#555" : "#111",
        color: "#fff", border: "none", borderRadius: "8px",
        fontSize: "13px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "inherit", marginBottom: "14px", transition: "background 0.15s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
    }),
    resultBox: {
        background: "#fff", border: "1px solid #ebebeb", borderRadius: "9px",
        padding: "12px", fontSize: "13px", color: "#333",
        lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word",
    },
    resultLabel: { fontSize: "10px", fontWeight: 700, color: "#bbb", letterSpacing: "0.6px", marginBottom: "7px", textTransform: "uppercase" },
    tagWrap: { display: "flex", flexWrap: "wrap", gap: "5px" },
    tagChip: { padding: "3px 9px", background: "#f0f0f0", borderRadius: "100px", fontSize: "12px", color: "#444", fontWeight: 500 },
    actionRow: { display: "flex", gap: "7px", marginTop: "9px", flexWrap: "wrap" },
    copyBtn: { padding: "5px 11px", background: "none", border: "1px solid #e8e8e8", borderRadius: "6px", fontSize: "12px", color: "#666", cursor: "pointer", fontFamily: "inherit" },
    applyBtn: { padding: "5px 11px", background: "#111", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    empty: { fontSize: "13px", color: "#bbb", textAlign: "center", padding: "28px 0", lineHeight: 1.65 },
    error: { fontSize: "13px", color: "#e53e3e", background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: "8px", padding: "10px 12px", lineHeight: 1.5 },
};

const ACTIONS = [
    { key: "summarize", icon: "📋", label: "Summarize", desc: "3-5 sentence summary", color: "#18a0fb", endpoint: "/ai/summarize" },
    { key: "rewrite", icon: "✍️", label: "Rewrite", desc: "Improve clarity and flow", color: "#a259ff", endpoint: "/ai/rewrite" },
    { key: "tag", icon: "🏷️", label: "Auto-tag", desc: "Generate topic tags", color: "#1bc47d", endpoint: "/ai/tag" },
];

export default function AiPanel({ content, onClose, onApplyRewrite }) {
    const [selected, setSelected] = useState("summarize");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const action = ACTIONS.find(a => a.key === selected);

    const handleRun = async () => {
        if (!content || content.trim().length < 10) {
            setError("Document is too short. Add some content first.");
            return;
        }
        setLoading(true); setResult(null); setError(null);
        try {
            const res = await API.post(action.endpoint, { content: content.trim() });
            setResult(res.data);
        } catch (e) {
            const msg = e.response?.data?.message || e.message || "Request failed.";
            setError(msg.includes("503") || msg.toLowerCase().includes("ollama")
                ? "Ollama is not running.\nStart it with: ollama serve"
                : msg);
        } finally { setLoading(false); }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result?.result || (result?.tags || []).join(", "));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={S.panel}>
            <div style={S.header}>
                <span style={S.headerTitle}><span>🤖</span> AI Assistant</span>
                <button style={S.closeBtn} onClick={onClose}
                    onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}>×</button>
            </div>

            <div style={S.body}>
                <div style={S.actionGrid}>
                    {ACTIONS.map(a => (
                        <button key={a.key}
                            style={S.actionBtn(selected === a.key, a.color)}
                            onClick={() => { setSelected(a.key); setResult(null); setError(null); }}
                            onMouseEnter={e => { if (selected !== a.key) e.currentTarget.style.borderColor = a.color; }}
                            onMouseLeave={e => { if (selected !== a.key) e.currentTarget.style.borderColor = "#e8e8e8"; }}>
                            <span style={{ fontSize: "16px" }}>{a.icon}</span>
                            <div><div>{a.label}</div><div style={S.actionDesc}>{a.desc}</div></div>
                        </button>
                    ))}
                </div>

                <button style={S.runBtn(loading)} onClick={handleRun} disabled={loading}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#333"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#111"; }}>
                    {loading
                        ? <><span style={{ display: "inline-block", animation: "aiSpin 1s linear infinite" }}>⏳</span> Running...</>
                        : <>{action.icon} Run {action.label}</>}
                </button>

                {error && <div style={S.error}>{error}</div>}

                {!error && !result && !loading && (
                    <div style={S.empty}>Choose an action and click Run to process your document with AI.</div>
                )}

                {result && (
                    <>
                        <div style={S.resultLabel}>
                            {result.type === "summary" && "Summary"}
                            {result.type === "rewrite" && "Rewritten version"}
                            {result.type === "tags" && "Suggested tags"}
                        </div>
                        <div style={S.resultBox}>
                            {result.type === "tags"
                                ? <div style={S.tagWrap}>{(result.tags || []).map(t => <span key={t} style={S.tagChip}>{t}</span>)}</div>
                                : result.result}
                        </div>
                        <div style={S.actionRow}>
                            <button style={S.copyBtn} onClick={handleCopy}>{copied ? "✓ Copied" : "Copy"}</button>
                            {result.type === "rewrite" && onApplyRewrite && (
                                <button style={S.applyBtn} onClick={() => onApplyRewrite(result.result)}>Apply to document</button>
                            )}
                        </div>
                    </>
                )}
            </div>
            <style>{`@keyframes aiSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
        </div>
    );
}