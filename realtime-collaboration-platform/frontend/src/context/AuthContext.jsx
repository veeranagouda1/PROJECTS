import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    // Restore auth on refresh
    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedRole = localStorage.getItem("role");

        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
        }

        setLoading(false);
    }, []);

    // Login using API response
    const login = (jwt, roleFromApi) => {
        localStorage.setItem("token", jwt);
        localStorage.setItem("role", roleFromApi);

        setToken(jwt);
        setRole(roleFromApi);
    };


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        setToken(null);
        setRole(null);
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                role,
                isAuthenticated: !!token,
                hasRole: (allowedRoles) => allowedRoles.includes(role),
                login,
                logout,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
