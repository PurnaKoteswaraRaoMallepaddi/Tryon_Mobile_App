import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as SecureStore from "expo-secure-store";
import { api, setAuthToken, type User } from "./api";

const TOKEN_KEY = "atelier.token";

interface AuthState {
  user: User | null;
  loading: boolean;
  signup: (email: string, password: string, invite?: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          setAuthToken(token);
          const { user } = await api.me();
          setUser(user);
        }
      } catch {
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
        setAuthToken(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function persist(token: string, u: User) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setAuthToken(token);
    setUser(u);
  }

  async function signup(email: string, password: string, invite?: string) {
    const { token, user } = await api.signup(email, password, invite);
    await persist(token, user);
  }
  async function login(email: string, password: string) {
    const { token, user } = await api.login(email, password);
    await persist(token, user);
  }
  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
    setAuthToken(null);
    setUser(null);
  }
  async function refresh() {
    try {
      const { user } = await api.me();
      setUser(user);
    } catch {
      /* keep current */
    }
  }

  return (
    <Ctx.Provider value={{ user, loading, signup, login, logout, refresh }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
