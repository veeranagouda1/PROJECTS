import { useRef, useEffect, useState } from "react";

const CARDS = [
    { bg: "#1a1a2e", label: "CollabX", sub: "Platform", dark: true, w: 155, h: 140 },
    { bg: "#e8f4e8", label: "Design", sub: "System", dark: false, w: 195, h: 175 },
    { bg: "#2d1b69", label: "Teams", sub: "Workspace", dark: true, w: 160, h: 155 },
    { bg: "#fff3e0", label: "Projects", sub: "Organized", dark: false, w: 175, h: 135 },
    { bg: "#fce4ec", label: "AI", sub: "Powered", dark: false, w: 145, h: 165 },
    { bg: "#e3f2fd", label: "Docs", sub: "Live Edit", dark: false, w: 165, h: 145 },
    { bg: "#f3e5f5", label: "Share", sub: "Instantly", dark: false, w: 155, h: 150 },
    { bg: "#e8eaf6", label: "Build", sub: "Together", dark: false, w: 170, h: 130 },
    { bg: "#e0f7fa", label: "Chat", sub: "Real-time", dark: false, w: 150, h: 155 },
    { bg: "#fbe9e7", label: "Export", sub: "Anywhere", dark: false, w: 165, h: 140 },
];

// Duplicate for seamless infinite scroll
const ALL_CARDS = [...CARDS, ...CARDS, ...CARDS];

export default function Hero({ onGetStarted }) {
    const trackRef = useRef(null);
    const animRef = useRef(null);
    const posRef = useRef(0);
    const isDragging = useRef(false);
    const dragStart = useRef(0);
    const dragPos = useRef(0);
    const speed = 0.6; // px per frame

    // Auto scroll
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const totalWidth = track.scrollWidth / 3; // one set width

        const animate = () => {
            if (!isDragging.current) {
                posRef.current += speed;
                if (posRef.current >= totalWidth) {
                    posRef.current -= totalWidth;
                }
                track.style.transform = `translateX(-${posRef.current}px)`;
            }
            animRef.current = requestAnimationFrame(animate);
        };

        animRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animRef.current);
    }, []);

    // Mouse drag
    const onMouseDown = (e) => {
        isDragging.current = true;
        dragStart.current = e.clientX;
        dragPos.current = posRef.current;
        document.body.style.cursor = "grabbing";
        document.body.style.userSelect = "none";
    };

    const onMouseMove = (e) => {
        if (!isDragging.current) return;
        const delta = dragStart.current - e.clientX;
        posRef.current = dragPos.current + delta;
        // clamp
        const track = trackRef.current;
        if (track) {
            const totalWidth = track.scrollWidth / 3;
            if (posRef.current < 0) posRef.current = 0;
            if (posRef.current > totalWidth * 2) posRef.current = totalWidth * 2;
            track.style.transform = `translateX(-${posRef.current}px)`;
        }
    };

    const onMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    };

    return (
        <section
            style={{
                position: "relative",
                height: "620px",
                overflow: "hidden",
                background: "#f7f7f7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "grab",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
        >
            {/* Scrolling card track */}
            <div
                ref={trackRef}
                style={{
                    position: "absolute",
                    top: 0, left: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "40px 20px",
                    height: "100%",
                    willChange: "transform",
                    flexWrap: "nowrap",
                }}
            >
                {ALL_CARDS.map((c, i) => (
                    <div
                        key={i}
                        style={{
                            width: c.w,
                            height: c.h,
                            background: c.bg,
                            borderRadius: "14px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid rgba(0,0,0,0.05)",
                            flexShrink: 0,
                            transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    >
                        <span style={{
                            fontSize: "13px", fontWeight: 700,
                            color: c.dark ? "#fff" : "#111",
                            pointerEvents: "none",
                        }}>{c.label}</span>
                        <span style={{
                            fontSize: "11px", marginTop: "5px",
                            color: c.dark ? "rgba(255,255,255,0.5)" : "#888",
                            pointerEvents: "none",
                        }}>{c.sub}</span>
                    </div>
                ))}
            </div>

            {/* Left fade */}
            <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: "120px",
                background: "linear-gradient(to right, #f7f7f7, transparent)",
                zIndex: 5, pointerEvents: "none",
            }} />

            {/* Right fade */}
            <div style={{
                position: "absolute", right: 0, top: 0, bottom: 0, width: "120px",
                background: "linear-gradient(to left, #f7f7f7, transparent)",
                zIndex: 5, pointerEvents: "none",
            }} />

            {/* Floating CTA card */}
            <div
                style={{
                    position: "relative", zIndex: 10,
                    background: "#fff",
                    borderRadius: "20px",
                    padding: "52px 60px",
                    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                    maxWidth: "520px", width: "90%",
                    cursor: "default",
                }}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <h1 style={{
                    fontSize: "42px", fontWeight: 700,
                    lineHeight: 1.15, color: "#111",
                    marginBottom: "32px", letterSpacing: "-1.5px",
                }}>
                    Make anything possible,<br />all in CollabX
                </h1>
                <button
                    onClick={onGetStarted}
                    style={{
                        background: "#111", color: "#fff",
                        border: "none", borderRadius: "10px",
                        fontSize: "17px", fontWeight: 600,
                        padding: "15px 30px", cursor: "pointer",
                        fontFamily: "inherit", letterSpacing: "-0.2px",
                        transition: "transform 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#333";
                        e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#111";
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    Get started
                </button>
            </div>
        </section>
    );
}