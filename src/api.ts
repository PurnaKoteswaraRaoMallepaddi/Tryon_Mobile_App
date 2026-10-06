import { API_BASE } from "./config";

/* ---- types (mirror the backend) ---- */
export interface StyleProfile {
  skinUndertone: string | null;
  dressSize: string | null;
  measurements: Record<string, unknown>;
  heightCm: number | null;
  fitPrefs: string[];
  occasions: string[];
}
export interface User {
  id: string;
  email: string;
  createdAt: string;
  profile: StyleProfile;
}
export interface Photo {
  id: string;
  url: string;
  isDefault: boolean;
  uploadedAt: string;
}
export interface CatalogItem {
  id: string;
  title: string;
  garmentType: string | null;
  garmentImageUrl: string;
  sourceImageUrl: string | null;
  provider: string | null;
  isMock: boolean;
  createdAt: string;
}
export interface Applied {
  id: string;
  productTitle: string;
  productUrl: string | null;
  sourceSite: string | null;
  price: string | null;
  currency: string | null;
  color: string | null;
  productImageUrl: string | null;
  tryonImageUrl: string;
  provider: string | null;
  isMock: boolean;
  appliedAt: string;
  purchased: boolean;
  garmentType: string | null;
}
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

/* ---- auth token (held in memory; persisted by the auth context) ---- */
let authToken: string | null = null;
export function setAuthToken(t: string | null) {
  authToken = t;
}

/** Absolute URL for an owner-checked image, with the token appended (for <Image>). */
export function imageUrl(path: string): string {
  const base = path.startsWith("http") ? path : API_BASE + path;
  if (!authToken) return base;
  return base + (base.includes("?") ? "&" : "?") + "token=" + encodeURIComponent(authToken);
}

async function req<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  if (opts.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(API_BASE + path, { ...opts, headers });
  const text = await res.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { error: text.slice(0, 200) };
  }
  if (!res.ok) throw new Error(data.error || data.detail || `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  authConfig: () => req<{ inviteRequired: boolean }>("/api/auth/config"),
  signup: (email: string, password: string, invite?: string) =>
    req<{ token: string; user: User }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, invite }),
    }),
  login: (email: string, password: string) =>
    req<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  me: () => req<{ user: User }>("/api/auth/me"),

  listPhotos: () => req<{ photos: Photo[] }>("/api/photos"),
  uploadPhoto: (image: string, makeDefault = true) =>
    req<{ photo: Photo }>("/api/photos", {
      method: "POST",
      body: JSON.stringify({ image, makeDefault }),
    }),

  // Catalog / try-off
  addCatalogItem: (image: string, opts: { title?: string; garmentType?: string } = {}) =>
    req<{ item: CatalogItem }>("/api/catalog-items", {
      method: "POST",
      body: JSON.stringify({ image, ...opts }),
    }),
  listCatalog: () => req<{ items: CatalogItem[] }>("/api/catalog-items"),
  deleteCatalogItem: (id: string) =>
    req<{ ok: true }>(`/api/catalog-items/${id}`, { method: "DELETE" }),
  tryOnCatalogItem: (id: string, photoId?: string) =>
    req<{ applied: Applied }>(`/api/catalog-items/${id}/tryon`, {
      method: "POST",
      body: JSON.stringify({ photoId }),
    }),

  // Wardrobe / fittings
  listApplied: () => req<{ applied: Applied[] }>("/api/applied"),
  deleteApplied: (id: string) => req<{ ok: true }>(`/api/applied/${id}`, { method: "DELETE" }),
  updateApplied: (id: string, patch: { purchased?: boolean; garmentType?: string | null }) =>
    req<{ applied: Applied }>(`/api/applied/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),
};

/**
 * Stylist chat. The backend streams Server-Sent Events; React Native's fetch
 * doesn't expose a readable stream, so we read the full response once the stream
 * closes and parse the accumulated `delta` events into the final reply.
 */
export async function chatStylist(
  messages: ChatMessage[],
  product?: Record<string, unknown>
): Promise<string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(API_BASE + "/api/stylist/chat", {
    method: "POST",
    headers,
    body: JSON.stringify({ messages, product }),
  });
  const text = await res.text();
  if (!res.ok) {
    try {
      throw new Error(JSON.parse(text).error || `Stylist failed (${res.status})`);
    } catch {
      throw new Error(`Stylist failed (${res.status})`);
    }
  }
  // Parse SSE: blocks separated by blank lines, each with `event:` + `data:`.
  let reply = "";
  for (const block of text.split("\n\n")) {
    const evLine = block.split("\n").find((l) => l.startsWith("event:"));
    const dataLine = block.split("\n").find((l) => l.startsWith("data:"));
    if (!dataLine) continue;
    const ev = evLine ? evLine.slice(6).trim() : "delta";
    try {
      const payload = JSON.parse(dataLine.slice(5).trim());
      if (ev === "delta" && typeof payload.text === "string") reply += payload.text;
      if (ev === "error") throw new Error(payload.message || "Stylist failed");
    } catch {
      /* ignore malformed block */
    }
  }
  return reply.trim() || "(no reply)";
}
