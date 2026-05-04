import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getStoredUser, getToken, setStoredUser, setToken, type AppUser } from "./api";

interface AuthCtx {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  adminLogin: (email: string, password: string) => Promise<AppUser>;
  register: (p: {
    email: string;
    password: string;
    name: string;
    phone: string;
    college: string;
  }) => Promise<AppUser>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getToken()) return;

    setLoading(true);

    api
      .me()
      .then((u) => {
        setUser(u);
        setStoredUser(u);
      })
      .catch(() => {
        setToken(null);
        setStoredUser(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const persist = (token: string, u: AppUser) => {
    setToken(token);
    setStoredUser(u);
    setUser(u);
  };

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const r = await api.login({ email, password });
      persist(r.token, r.user);
      return r.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const r = await api.adminLogin({ email, password });
      persist(r.token, r.user);
      return r.user;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (p: {
      email: string;
      password: string;
      name: string;
      phone: string;
      college: string;
    }) => {
      setLoading(true);
      try {
        const r = await api.register(p);
        persist(r.token, r.user);
        return r.user;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(() => {
    setToken(null);
    setStoredUser(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const u = await api.me();
      setUser(u);
      setStoredUser(u);
    } catch {
      // 🔥 token invalid → logout automatically
      setToken(null);
      setStoredUser(null);
      setUser(null);
    }
  }, []);

  return (
    <Ctx.Provider value={{ user, loading, login, adminLogin, register, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
