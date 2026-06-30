import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

// 🔥 helper za dekodiranje JWT
function parseJwt(token) {
  try {
    const base64 = token.split(".")[1];
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // 🔥 kada se app učita
  useEffect(() => {
    if (token) {
      const decoded = parseJwt(token);
      setUser(decoded); // ✅ sad ima role_id
    }
  }, [token]);

  const login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);

    const decoded = parseJwt(token);
    setUser(decoded); // ✅ ovdje isto
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}