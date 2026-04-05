/**
 * Decode a JWT payload without verifying signature.
 * Verification happens on the backend (gateway) — this is just for UI decisions.
 */
export function decodeJwt(token) {
    try {
        const base64Payload = token.split(".")[1];
        const decoded = atob(base64Payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

/**
 * Extract user info from access token.
 * Spring's JWT uses "sub" for email, and we store role as a claim.
 */
export function getUserFromToken(token) {
    if (!token) return null;
    const payload = decodeJwt(token);
    if (!payload) return null;
    return {
        email: payload.sub || payload.email || "",
        role: payload.role || payload.authorities?.[0] || "USER",
        exp: payload.exp,
    };
}

/** Returns true if token is expired */
export function isTokenExpired(token) {
    const payload = decodeJwt(token);
    if (!payload?.exp) return true;
    return Date.now() / 1000 > payload.exp;
}