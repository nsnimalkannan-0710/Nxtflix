import { createContext, useContext, useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { getMe, parseJwt, extractToken, extractUser, signUp as apiSignUp, signIn as apiSignIn } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => Cookies.get("jwt_token") || null);
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("nxtflix_user");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
    const currentToken = Cookies.get("jwt_token");
    if (currentToken) {
      const decoded = parseJwt(currentToken);
      if (decoded) {
        return {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role || "USER",
          name: decoded.name || decoded.email?.split("@")[0] || "User",
        };
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Sync state when token changes or verify session on mount
  useEffect(() => {
    const currentToken = Cookies.get("jwt_token");
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(currentToken);

    // Fetch latest user profile from server
    getMe(currentToken)
      .then((res) => {
        if (res?.user) {
          setUser(res.user);
          localStorage.setItem("nxtflix_user", JSON.stringify(res.user));
        }
      })
      .catch((err) => {
        console.warn("Failed to refresh user profile:", err.message);
        // If token is invalid or expired, clear cookie
        if (err.message.includes("token") || err.message.includes("401") || err.message.includes("expired")) {
          Cookies.remove("jwt_token");
          localStorage.removeItem("nxtflix_user");
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    const result = await apiSignIn(email, password);
    const receivedToken = extractToken(result);
    if (!receivedToken) {
      throw new Error("No token received from server");
    }

    const userData = extractUser(result) || parseJwt(receivedToken) || {
      email,
      role: "USER",
      name: email.split("@")[0],
    };

    Cookies.set("jwt_token", receivedToken, { expires: 7 });
    localStorage.setItem("nxtflix_user", JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);
    return { token: receivedToken, user: userData };
  }, []);

  const signup = useCallback(async (name, email, password) => {
    const result = await apiSignUp(name, email, password);
    const receivedToken = extractToken(result);
    if (!receivedToken) {
      throw new Error("Registration succeeded but no session token was received");
    }

    const userData = extractUser(result) || {
      name,
      email,
      role: "USER",
    };

    Cookies.set("jwt_token", receivedToken, { expires: 7 });
    localStorage.setItem("nxtflix_user", JSON.stringify(userData));
    setToken(receivedToken);
    setUser(userData);
    return { token: receivedToken, user: userData };
  }, []);

  const logout = useCallback(() => {
    Cookies.remove("jwt_token");
    localStorage.removeItem("nxtflix_user");
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const isAuthenticated = Boolean(token);

  const value = {
    user,
    token,
    loading,
    isAdmin,
    isAuthenticated,
    login,
    signup,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
