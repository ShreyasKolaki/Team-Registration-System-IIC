// API client for FastAPI backend

const BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000";

const TOKEN_KEY = "trs_token";
const USER_KEY = "trs_user";

// ===== TYPES =====
export type UserRole = "participant" | "admin";

export interface AppUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  college?: string;
  role: UserRole;
}

export interface Team {
  id: string;
  name: string;
  code: string;
  event: string;
  leader_id: string;
  members: AppUser[];
  max_size: number;
  min_size: number;
  whatsapp_link?: string;
  pending_requests?: string[];
}

// ===== STORAGE =====
export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string | null) {
  if (typeof window === "undefined") return;
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): AppUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(u: AppUser | null) {
  if (typeof window === "undefined") return;
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

// ===== ERROR =====
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

// ===== REQUEST WRAPPER =====
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, `Cannot reach API at ${BASE}. Make sure backend is running.`);
  }

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const msg = (data && (data.detail || data.message)) || res.statusText || "Request failed";
    throw new ApiError(res.status, msg);
  }

  return data as T;
}

function safeJson(t: string) {
  try {
    return JSON.parse(t);
  } catch {
    return t;
  }
}

// ===== NORMALIZERS =====
function normalizeUser(u: Record<string, unknown>): AppUser {
  return {
    id: (u._id || u.id) as string,
    email: u.email as string,
    name: u.name as string | undefined,
    phone: u.phone as string | undefined,
    college: u.college as string | undefined,
    role: u.role === "admin" ? "admin" : "participant",
  };
}

function normalizeTeam(t: Record<string, unknown>): Team {
  return {
    id: (t._id || t.id) as string,
    name: t.name as string,
    code: t.code as string,
    event: t.event as string,
    leader_id: t.leader_id as string,
    members: ((t.members as Record<string, unknown>[]) || []).map(
      (m: Record<string, unknown> | string) =>
        typeof m === "string"
          ? { id: m, email: "", role: "participant" }
          : normalizeUser(m as Record<string, unknown>),
    ),
    min_size: t.min_size as number,
    max_size: t.max_size as number,
    whatsapp_link: t.whatsapp_link as string | undefined,
    pending_requests: (t.pending_requests as string[]) || [],
  };
}

// ===== API =====
export const api = {
  // AUTH
  async register(payload: {
    email: string;
    password: string;
    name: string;
    phone: string;
    college: string;
  }) {
    const res = await request<Record<string, unknown>>("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      token: res.token as string,
      user: normalizeUser(res.user as Record<string, unknown>),
    };
  },

  async login(payload: { email: string; password: string }) {
    const res = await request<Record<string, unknown>>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      token: res.token as string,
      user: normalizeUser(res.user as Record<string, unknown>),
    };
  },

  async adminLogin(payload: { email: string; password: string }) {
    const res = await request<Record<string, unknown>>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return {
      token: res.token as string,
      user: normalizeUser(res.user as Record<string, unknown>),
    };
  },

  async me() {
    const res = await request<Record<string, unknown>>("/auth/me");
    return normalizeUser(res);
  },

  // TEAMS
  async myTeams() {
    const res = await request<Record<string, unknown>[]>("/teams/me");
    return res.map(normalizeTeam);
  },

  async createTeam(payload: { name: string; event: string; transaction_id?: string }) {
    const res = await request<Record<string, unknown>>("/teams", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeTeam(res);
  },

  async joinTeam(payload: { code: string }) {
    const res = await request<Record<string, unknown>>("/teams/join", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeTeam(res);
  },

  async leaveTeam(teamId: string) {
    return request<{ ok: true }>(`/teams/${teamId}/leave`, {
      method: "POST",
    });
  },

  async resolveLeave(teamId: string, userId: string, action: "approve" | "reject") {
    return request<{ ok: true }>(`/teams/${teamId}/resolve-leave`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId, action }),
    });
  },

  async transferLeadership(teamId: string, newLeaderId: string) {
    return request<{ ok: true }>(`/teams/${teamId}/transfer-leadership`, {
      method: "POST",
      body: JSON.stringify({ new_leader_id: newLeaderId }),
    });
  },

  async getTeam(teamId: string) {
    const res = await request<Record<string, unknown>>(`/teams/${teamId}`);
    return normalizeTeam(res);
  },

  // ADMIN
  async adminListTeams() {
    const res = await request<Record<string, unknown>[]>("/admin/teams");
    return res.map(normalizeTeam);
  },

  async adminListUsers() {
    const res = await request<Record<string, unknown>[]>("/admin/users");
    return res.map(normalizeUser);
  },
};

export const API_BASE = BASE;
