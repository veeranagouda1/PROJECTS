import { useState } from "react";

const TABS = [
    {
        key: "prompt",
        label: "Prompt",
        heading: "Prompt to build anything you can imagine",
        desc: "Describe what you want and AI builds it instantly.",
        left: ["Summarize this document", "Improve the introduction", "Generate action items"],
        session: { title: "AI is writing...", users: ["A", "B"], extra: "+1", color: ["#ff7262", "#18a0fb"] },
    },
    {
        key: "design",
        label: "Design",
        heading: "Design with precision and speed",
        desc: "Pixel-perfect layouts with real-time collaboration.",
        left: ["Add volume controls", "Improve layout", "Generate summary"],
        session: { title: "Editing: Q3 Strategy Doc", users: ["A", "B", "C"], extra: "+3", color: ["#ff7262", "#18a0fb", "#a259ff"] },
    },
    {
        key: "draw",
        label: "Draw",
        heading: "Sketch ideas and bring them to life",
        desc: "Freehand drawing meets structured collaboration.",
        left: ["Sketch wireframe", "Add annotations", "Export as SVG"],
        session: { title: "Drawing: User Flow v2", users: ["C", "D"], extra: "+2", color: ["#a259ff", "#1bc47d"] },
    },
    {
        key: "build",
        label: "Build",
        heading: "Build production-ready features fast",
        desc: "From prototype to production in one platform.",
        left: ["Create component", "Write tests", "Deploy to staging"],
        session: { title: "Building: Auth Module", users: ["A", "C"], extra: "+4", color: ["#ff7262", "#a259ff"] },
    },
    {
        key: "publish",
        label: "Publish",
        heading: "Publish and share with one click",
        desc: "Share your work with the world instantly.",
        left: ["Publish to web", "Generate share link", "Export PDF"],
        session: { title: "Published: Design System v3", users: ["B"], extra: "+1", color: ["#18a0fb"] },
    },
    {
        key: "jam",
        label: "Jam",
        heading: "Jam with your team in real-time",
        desc: "Brainstorm together with live cursors and reactions.",
        left: ["Start jam session", "Invite teammates", "Add sticky notes"],
        session: { title: "Jam: Sprint Planning", users: ["A", "B", "C"], extra: "+5", color: ["#ff7262", "#18a0fb", "#a259ff"] },
    },
    {
        key: "present",
        label: "Present",
        heading: "Present beautifully anywhere",
        desc: "Turn your work into stunning presentations.",
        left: ["Create slides", "Add transitions", "Present live"],
        session: { title: "Presenting: Q4 Roadmap", users: ["A", "D"], extra: "+2", color: ["#ff7262", "#1bc47d"] },
    },
];

export default function Features() {
    const [active, setActive] = useState("design");
    const current = TABS.find((t) => t.key === active);

    return (
        <section style={{ padding: "100px 32px", background: "#f5f5f0" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

                <h2 style={{
                    fontSize: "48px", fontWeight: 700,
                    lineHeight: 1.1, letterSpacing: "-1.5px",
                    marginBottom: "48px", color: "#111",
                }}>
                    {current.heading}
                </h2>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "36px", flexWrap: "wrap" }}>
                    {TABS.map((tab) => {
                        const isActive = active === tab.key;
                        return (
                            <button
                                key={tab.key}
                                onClick={() => setActive(tab.key)}
                                style={{
                                    padding: "8px 22px",
                                    borderRadius: "100px",
                                    fontSize: "14px", fontWeight: 500,
                                    border: "none",
                                    background: isActive ? "#18a0fb" : "transparent",
                                    color: isActive ? "#fff" : "#555",
                                    cursor: "pointer", fontFamily: "inherit",
                                    transition: "all 0.18s ease",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = "#e8f4ff";
                                        e.currentTarget.style.color = "#18a0fb";
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = "transparent";
                                        e.currentTarget.style.color = "#555";
                                    }
                                }}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Feature card */}
                <div style={{
                    display: "flex", gap: "20px",
                    background: "#fff", borderRadius: "16px",
                    padding: "32px", border: "1px solid rgba(0,0,0,0.07)",
                    minHeight: "260px",
                    transition: "all 0.2s ease",
                }}>

                    {/* Left mockup */}
                    <div style={{
                        flex: 1, background: "#fafafa",
                        borderRadius: "12px", padding: "24px",
                        border: "1px solid #eee",
                    }}>
                        <p style={{ fontSize: "13px", color: "#bbb", marginBottom: "16px" }}>
                            {current.desc}
                        </p>
                        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
                            {current.left.map((s) => (
                                <span key={s} style={{
                                    fontSize: "12px", background: "#f0f0f0",
                                    padding: "6px 12px", borderRadius: "100px", color: "#444",
                                    cursor: "pointer", transition: "all 0.15s",
                                }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "#e8f4ff";
                                        e.currentTarget.style.color = "#18a0fb";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "#f0f0f0";
                                        e.currentTarget.style.color = "#444";
                                    }}
                                >{s}</span>
                            ))}
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{
                                padding: "12px 14px", background: "#fff",
                                borderRadius: "10px", border: "1px solid #eee",
                                fontSize: "13px", color: "#333",
                                display: "flex", alignItems: "center", gap: "8px",
                            }}>
                                <span>📄</span> Real-time Document Editor
                            </div>
                            <div style={{
                                padding: "12px 14px", background: "#fff",
                                borderRadius: "10px", border: "1px solid #eee",
                                fontSize: "13px", color: "#333",
                                display: "flex", alignItems: "center", gap: "8px",
                            }}>
                                <span>👥</span> {current.session.users.length + 3} users currently editing
                            </div>
                        </div>
                    </div>

                    {/* Right session card */}
                    <div style={{
                        flex: 1, background: "#1a1a2e",
                        borderRadius: "12px", padding: "28px", color: "#fff",
                    }}>
                        <p style={{
                            fontSize: "11px", color: "rgba(255,255,255,0.35)",
                            letterSpacing: "1.5px", marginBottom: "20px",
                        }}>LIVE SESSION</p>

                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                            {current.session.users.map((l, i) => (
                                <div key={i} style={{
                                    width: "32px", height: "32px", borderRadius: "50%",
                                    background: current.session.color[i] || "#555",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "12px", fontWeight: 700, color: "#fff",
                                    border: "2px solid #1a1a2e",
                                    marginLeft: i > 0 ? "-8px" : "0",
                                }}>{l}</div>
                            ))}
                            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", marginLeft: "8px" }}>
                                {current.session.extra} online
                            </span>
                        </div>

                        <p style={{ fontSize: "15px", color: "#fff", marginBottom: "6px", fontWeight: 500 }}>
                            {current.session.title}
                        </p>
                        <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                            Last updated 2 minutes ago
                        </p>

                        {/* Fake activity bars */}
                        <div style={{ marginTop: "24px", display: "flex", gap: "4px", alignItems: "flex-end", height: "40px" }}>
                            {[60, 80, 45, 90, 55, 70, 40, 85, 60, 75].map((h, i) => (
                                <div key={i} style={{
                                    flex: 1, height: `${h}%`,
                                    background: `rgba(24,160,251,${0.3 + i * 0.05})`,
                                    borderRadius: "3px 3px 0 0",
                                    transition: "height 0.3s ease",
                                }} />
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}