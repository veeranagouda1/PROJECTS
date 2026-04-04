const styles = {
    nav: {
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        zIndex: 100,
    },
    inner: {
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        height: "64px",
    },
    logoWrap: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        textDecoration: "none",
        cursor: "pointer",
    },
    logoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3px",
        width: "22px",
        height: "22px",
    },
    logoName: {
        fontWeight: 700,
        fontSize: "18px",
        color: "#111",
        letterSpacing: "-0.3px",
    },
    links: {
        display: "flex",
        gap: "28px",
        alignItems: "center",
    },
    link: {
        fontSize: "14px",
        color: "#333",
        textDecoration: "none",
        cursor: "pointer",
        transition: "color 0.15s",
    },
    actions: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },
    loginBtn: {
        background: "transparent",
        border: "none",
        fontSize: "14px",
        color: "#333",
        cursor: "pointer",
        padding: "8px 14px",
        borderRadius: "8px",
        fontFamily: "inherit",
    },
    contactBtn: {
        background: "transparent",
        border: "1px solid #ccc",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        padding: "8px 16px",
        cursor: "pointer",
        color: "#111",
        fontFamily: "inherit",
    },
    ctaBtn: {
        background: "#111",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 600,
        padding: "9px 18px",
        cursor: "pointer",
        fontFamily: "inherit",
    },
};

export default function Navbar({ onSignIn }) {
    return (
        <nav style={styles.nav}>
            <div style={styles.inner}>

                {/* Logo */}
                <div style={styles.logoWrap}>
                    <div style={styles.logoGrid}>
                        <div style={{ borderRadius: "50%", background: "#18a0fb" }} />
                        <div style={{ borderRadius: "2px", background: "#ff7262" }} />
                        <div style={{ borderRadius: "50%", background: "#a259ff" }} />
                        <div style={{ borderRadius: "2px", background: "#1bc47d" }} />
                    </div>
                    <span style={styles.logoName}>CollabX</span>
                </div>

                {/* Center nav links */}
                <div style={styles.links}>
                    {["Features", "Solutions", "Pricing", "Docs"].map((item) => (
                        <a key={item} href="#" style={styles.link}
                            onMouseEnter={(e) => (e.target.style.color = "#000")}
                            onMouseLeave={(e) => (e.target.style.color = "#333")}
                        >
                            {item}
                        </a>
                    ))}
                </div>

                {/* Right actions */}
                <div style={styles.actions}>
                    <button style={styles.loginBtn} onClick={onSignIn}>Log in</button>
                    <button style={styles.contactBtn}>Contact sales</button>
                    <button style={styles.ctaBtn} onClick={onSignIn}>Get started for free</button>
                </div>

            </div>
        </nav>
    );
}