import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { AuthService } from "../services/AuthServices";
import type { Role } from "../types/auth";

type Ctx = {
  token: string | null;
  userEmail: string | null;
  role: Role | null;
  user: any | null;
  messageResponse: string | null;
  login: (p: { email: string; password: string }) => Promise<void>;
  register: (p: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthCtx = createContext<Ctx>({} as Ctx);

function getDashboardPathByRole(r?: Role | null) {
  switch (r) {
    case "ADMIN":
      return "/dashboard/admin";
    case "FOURNISSEUR":
      return "/dashboard/fournisseur";
    case "CLIENT":
      return "/dashboard/client";
    default:
      return "/dashboard";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [userEmail, setUserEmail] = useState<string | null>(localStorage.getItem("email"));
  const [role, setRole] = useState<Role | null>(
    (localStorage.getItem("role") as Role) || null
  );
  const [user, setUser] = useState<any | null>(
    localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null
  );
  const [messageResponse, setMessageResponse] = useState<string | null>(
    localStorage.getItem("messageResponse")
  );

  const nav = useNavigate();
  const loc = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // persist core auth data
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");

    if (userEmail) localStorage.setItem("email", userEmail);
    else localStorage.removeItem("email");

    if (role) localStorage.setItem("role", role);
    else localStorage.removeItem("role");

    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");

    if (messageResponse) localStorage.setItem("messageResponse", messageResponse);
    else localStorage.removeItem("messageResponse");
  }, [token, userEmail, role, user, messageResponse]);

  const login = async ({ email, password }: { email: string; password: string }) => {
    const res = await AuthService.login({ email, password });

    const t = (res as any).token || (res as any).accessToken;
    if (!t) throw new Error("No token returned");

    const r = (res as any).role as Role | undefined;
    const e = (res as any).email as string | undefined;
    const u = (res as any).user ?? null;
    const m = (res as any).messageResponse ?? null;

    setToken(t);
    setUserEmail(e || email);
    setRole(r ?? null);
    setUser(u);
    setMessageResponse(m);

    // go to intended page or role-based dashboard
    const from = (loc.state as any)?.from?.pathname as string | undefined;
    const fallback = getDashboardPathByRole(r ?? null);
    nav(from || fallback, { replace: true });
  };

  const register = async (p: {
    firstName?: string;
    lastName?: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    await AuthService.register(p);
    // after successful account creation, go to login tab
    setSearchParams({ mode: "login" });
    nav("/auth?mode=login", { replace: true });
  };

  const logout = () => {
    setToken(null);
    setUserEmail(null);
    setRole(null);
    setUser(null);
    setMessageResponse(null);
    nav("/auth");
  };

  const value = useMemo(
    () => ({ token, userEmail, role, user, messageResponse, login, register, logout }),
    [token, userEmail, role, user, messageResponse]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
