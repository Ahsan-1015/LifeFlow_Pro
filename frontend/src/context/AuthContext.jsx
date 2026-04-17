import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import api from "../api/client";
import { getSocket } from "../api/socket";
import { getFirebaseAuth, hasFirebaseClientConfig } from "../lib/firebase";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncSocket = (nextUser) => {
    const socket = getSocket();
    try {
      if (nextUser) {
        socket.connect();
        socket.emit("auth:join", nextUser._id);
      } else if (socket.connected) {
        socket.disconnect();
      }
    } catch (error) {
      console.error("Socket sync failed", error);
    }
  };

  const normalizeAuthPayload = (payload) => ({
    ...payload,
    email: payload.email?.trim().toLowerCase(),
    password: payload.password?.trim(),
  });

  const mapFirebaseAuthError = (error) => {
    if (error?.code === "auth/configuration-not-found") {
      return new Error(
        "Firebase Authentication is not enabled for this project yet. In Firebase Console, enable Authentication and turn on Google sign-in."
      );
    }

    if (error?.code === "auth/popup-closed-by-user") {
      return new Error("Google sign-in popup was closed before completion.");
    }

    if (error?.code === "auth/popup-blocked") {
      return new Error("Google sign-in popup was blocked by the browser.");
    }

    return error;
  };

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem("flowpilot_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        syncSocket(data.user);
      } catch (error) {
        localStorage.removeItem("flowpilot_token");
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (payload) => {
    const { data } = await api.post("/auth/login", normalizeAuthPayload(payload));
    if (!data?.token || !data?.user) {
      throw new Error("Login response was incomplete.");
    }
    localStorage.setItem("flowpilot_token", data.token);
    setUser(data.user);
    syncSocket(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", normalizeAuthPayload(payload));
    if (!data?.token || !data?.user) {
      throw new Error("Registration response was incomplete.");
    }
    localStorage.setItem("flowpilot_token", data.token);
    setUser(data.user);
    syncSocket(data.user);
    return data.user;
  };

  const loginWithGoogle = async () => {
    if (!hasFirebaseClientConfig()) {
      throw new Error("Firebase client configuration is missing.");
    }

    try {
      const { auth, provider } = getFirebaseAuth();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      const { data } = await api.post("/auth/google", { idToken });

      if (!data?.token || !data?.user) {
        throw new Error("Google login response was incomplete.");
      }

      localStorage.setItem("flowpilot_token", data.token);
      setUser(data.user);
      syncSocket(data.user);
      return data.user;
    } catch (error) {
      throw mapFirebaseAuthError(error);
    }
  };

  const logout = () => {
    localStorage.removeItem("flowpilot_token");
    setUser(null);
    syncSocket(null);
  };

  const updateUser = (nextUser) => setUser(nextUser);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      loginWithGoogle,
      logout,
      updateUser,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
