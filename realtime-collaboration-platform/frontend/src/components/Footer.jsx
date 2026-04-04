const COLS = [
    { title: "Product", links: ["Features", "Pricing", "Docs", "Changelog"] },
    { title: "Company", links: ["About", "Careers", "Blog", "Press"] },
    { title: "Resources", links: ["Community", "Support", "API", "Status"] },
];

const styles = {
    footer: {
        borderTop: "1px solid #eee",
        padding: "72px 32px",
        background: "#fff",
    },
    inner: {
        maxWidth: "1100px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "48px",
    },
    logoGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3px",
        width: "22px",
        height: "22px",
        marginBottom: "12px",
    },
    brand: {
        fontWeight: 700,
        fontSize: "18px",
        color: "#111",
        marginBottom: "10px",
        letterSpacing: "-0.3px",
    },
    tagline: {
        fontSize: "14px",
        color: "#888",
        lineHeight: 1.6,
        maxWidth: "220px",
    },
    colTitle: {
        fontWeight: 600,
        fontSize: "14px",
        color: "#111",
        marginBottom: "18px",
    },
    colLink: {
        fontSize: "14px",
        color: "#888",
        marginBottom: "12px",
        cursor: "pointer",
        display: "block",
        textDecoration: "none",
        transition: "color 0.15s",
    },
    bottom: {
        maxWidth: "1100px",
        margin: "48px auto 0",
        paddingTop: "24px",
        borderTop: "1px solid #eee",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
    },
    copy: { fontSize: "13px", color: "#aaa" },
};

export default function Footer() {
    return (
        <footer style={styles.footer}>
            <div style={styles.inner}>

                {/* Brand */}
                <div>
                    <div style={styles.logoGrid}>
                        <div style={{ borderRadius: "50%", background: "#18a0fb" }} />
                        <div style={{ borderRadius: "2px", background: "#ff7262" }} />
                        <div style={{ borderRadius: "50%", background: "#a259ff" }} />
                        <div style={{ borderRadius: "2px", background: "#1bc47d" }} />
                    </div>
                    <div style={styles.brand}>CollabX</div>
                    <p style={styles.tagline}>
                        Real-time collaboration platform built for distributed teams.
                    </p>
                </div>

                {/* Columns */}
                {COLS.map((col) => (
                    <div key={col.title}>
                        <div style={styles.colTitle}>{col.title}</div>
                        {col.links.map((link) => (
                            <a
                                key={link}
                                href="#"
                                style={styles.colLink}
                                onMouseEnter={(e) => (e.target.style.color = "#111")}
                                onMouseLeave={(e) => (e.target.style.color = "#888")}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                ))}

            </div>

            {/* Bottom bar */}
            <div style={styles.bottom}>
                <span style={styles.copy}>© 2026 CollabX. All rights reserved.</span>
                <div style={{ display: "flex", gap: "24px" }}>
                    {["Privacy", "Terms", "Cookies"].map((l) => (
                        <a key={l} href="#" style={{ ...styles.copy, textDecoration: "none" }}>{l}</a>
                    ))}
                </div>
            </div>

        </footer>
    );
}