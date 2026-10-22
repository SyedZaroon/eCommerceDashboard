
import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { logoutUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionVersion = useRef(0);

  const updateUser = (nextUser) => {
    sessionVersion.current += 1;
    setUser(nextUser);
    setLoading(false);
  };

  useEffect(() => {
    const requestVersion = sessionVersion.current;
    let active = true;

    const getCurrentUser = async () => {
      try {
        const response = await api.get("/me");
        if (active && requestVersion === sessionVersion.current) {
          setUser(response.data.user);
        }
      } catch (error) {
        if (active && requestVersion === sessionVersion.current) {
          setUser(null);
        }
      } finally {
        if (active && requestVersion === sessionVersion.current) {
          setLoading(false);
        }
      }
    };

    getCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const logout = async () => {
    await logoutUser();
    updateUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
