/**
 * Decodes JWT payload without verifying signature.
 * Gateway does the real verification.
 *
 * Your JwtService puts:
 *   .setSubject(email)       → payload.sub
 *   .claim("role", role)     → payload.role  ("USER" or "ADMIN")
 *   .claim("type", "ACCESS") → payload.type
 */
export function decodeJwt(token) {
    try {
        const base64 = token.split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/");
        return JSON.parse(atob(base64));
    } catch {
        return null;
    }
}

/**
 * Returns { email, role } from access token.
 * role will be "USER" or "ADMIN" — exactly as stored in UserRole enum.
 */
export function getUserFromToken(token) {
    if (!token) return null;
    const payload = decodeJwt(token);
    if (!payload) return null;
    // Only trust ACCESS tokens, not REFRESH tokens
    if (payload.type !== "ACCESS") return null;
    return {
        email: payload.sub,
        role: payload.role, // "USER" or "ADMIN"
        exp: payload.exp,
    };
}

export function isTokenExpired(token) {
    const payload = decodeJwt(token);
    if (!payload?.exp) return true;
    return Date.now() / 1000 > payload.exp;
}