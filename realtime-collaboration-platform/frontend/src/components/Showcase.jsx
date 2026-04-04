import { useState } from "react";

const CARDS = [
    {
        key: "teams",
        title: "Teams",
        desc: "Create teams, assign roles, and collaborate in real-time across all your projects.",
        icon: "👥",
        stat: "12 members",
    },
    {
        key: "projects",
        title: "Projects",
        desc: "Organize work into projects with full role-based access control built in.",
        icon: "📁",
        stat: "8 active projects",
    },
    {
        key: "ai",
        title: "AI Features",
        desc: "Spring AI powered document summarization, smart search, and auto-tagging.",
        icon: "🤖",
        stat: "AI ready",
    },
    {
        key: "micro",
        title: "Microservices",
        desc: "Distributed architecture that scales each service independently, built like Google.",
        icon: "⚙️",
        stat: "5 services",
    },
];

// Figma-style "team presence" mini widget
function PresenceWidget() {
    const users = [
        { color: "#ff7262", label: "A" },
        { color: "#18a0fb", label: "B" },
        { color: "#a259ff", label: "C" },
        { color: "#1bc47d", label: "D" },
    ];
    return (
        <div style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "20px 24px",
            border: "1px solid #ebebeb",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        }}>
            <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>
                    Active now
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>4 teammates online</div>
            </div>
            <div style={{ display: "flex" }}>
                {users.map((u, i) => (
                    <div key={i} style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: u.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "12px", fontWeight: 700, color: "#fff",
                        border: "2px solid #eef4e4",
                        marginLeft: i > 0 ? "-8px" : "0",
                    }}>{u.label}</div>
                ))}
            </div>
        </div>
    );
}

// Mini activity feed
function ActivityFeed() {
    const items = [
        { user: "Alex", action: "edited", doc: "Q3 Report", time: "2m ago", color: "#ff7262" },
        { user: "Beth", action: "shared", doc: "Design System", time: "5m ago", color: "#18a0fb" },
        { user: "Chris", action: "created", doc: "Sprint Plan", time: "12m ago", color: "#a259ff" },
    ];
    return (
        <div style={{
            background: "#fff",
            borderRadius: "14px",
            padding: "20px 24px",
            border: "1px solid #ebebeb",
        }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#111", marginBottom: "14px" }}>
                Recent activity
            </div>
            {items.map((item, i) => (
                <div key={i} style={{
                    display: "flex", alignItems: "center",
                    gap: "10px", paddingBottom: "12px",
                    borderBottom: i < items.length - 1 ? "1px solid #f5f5f5" : "none",
                    marginBottom: i < items.length - 1 ? "12px" : "0",
                }}>
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: item.color, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700, color: "#fff",
                    }}>{item.user[0]}</div>
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: "13px", color: "#111", fontWeight: 500 }}>{item.user}</span>
                        <span style={{ fontSize: "13px", color: "#999" }}> {item.action} </span>
                        <span style={{ fontSize: "13px", color: "#111" }}>{item.doc}</span>
                    </div>
                    <span style={{ fontSize: "11px", color: "#bbb" }}>{item.time}</span>
                </div>
            ))}
        </div>
    );
}

export default function Showcase() {
    const [hoveredCard, setHoveredCard] = useState(null);

    return (
        <section style={{ padding: "100px 32px", background: "#eef4e4" }}>
            <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

                <h2 style={{
                    fontSize: "48px", fontWeight: 700,
                    lineHeight: 1.1, letterSpacing: "-1.5px",
                    marginBottom: "60px", color: "#111", maxWidth: "700px",
                }}>
                    Bring everyone together<br />with systems that scale
                </h2>

                <div style={{ display: "flex", gap: "24px" }}>

                    {/* Left: feature cards */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "14px",
                        flex: "0 0 58%",
                    }}>
                        {CARDS.map((c) => {
                            const isHovered = hoveredCard === c.key;
                            return (
                                <div
                                    key={c.key}
                                    onMouseEnter={() => setHoveredCard(c.key)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    style={{
                                        background: isHovered ? "#111" : "#fff",
                                        borderRadius: "14px",
                                        padding: "28px",
                                        border: isHovered ? "1px solid #111" : "1px solid rgba(0,0,0,0.07)",
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                                        boxShadow: isHovered ? "0 12px 32px rgba(0,0,0,0.15)" : "none",
                                    }}
                                >
                                    <div style={{ fontSize: "24px", marginBottom: "12px" }}>{c.icon}</div>
                                    <div style={{
                                        fontSize: "16px", fontWeight: 700,
                                        color: isHovered ? "#fff" : "#111",
                                        marginBottom: "8px",
                                        transition: "color 0.2s",
                                    }}>{c.title}</div>
                                    <div style={{
                                        fontSize: "13px",
                                        color: isHovered ? "rgba(255,255,255,0.6)" : "#777",
                                        lineHeight: 1.6,
                                        transition: "color 0.2s",
                                    }}>{c.desc}</div>
                                    <div style={{
                                        marginTop: "16px",
                                        fontSize: "12px",
                                        color: isHovered ? "rgba(255,255,255,0.4)" : "#bbb",
                                        fontWeight: 500,
                                        transition: "color 0.2s",
                                    }}>{c.stat}</div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Right: live widgets */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <PresenceWidget />
                        <ActivityFeed />
                    </div>

                </div>
            </div>
        </section>
    );
}