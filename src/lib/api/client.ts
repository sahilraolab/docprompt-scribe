// src/lib/api/client.ts
const API_URL = import.meta.env.VITE_API_URL || "https://dreamtonexiv.xyz/api";
const TOKEN_KEY = "erp_auth_token";
let inMemoryToken: string | null = localStorage.getItem(TOKEN_KEY) || null;

export function setClientToken(token: string | null) {
  inMemoryToken = token;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json();
    // Handle both { token } and { accessToken } formats
    const newToken = data?.token || data?.accessToken || data?.data?.token || data?.data?.accessToken;
    if (newToken) {
      setClientToken(newToken);
      return newToken;
    }
  } catch {}
  setClientToken(null);
  return null;
}

export const apiClient = {
  API_URL,
  async request(endpoint: string, options: RequestInit = {}, retry = true) {
    const token = inMemoryToken ?? localStorage.getItem(TOKEN_KEY);
    const isFormData = (options as any)?.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers,
    });

    // 🔁 Handle token refresh once if expired
    if (res.status === 401 && retry) {
      const newToken = await refreshAccessToken();
      if (newToken) return this.request(endpoint, options, false);
      const err = new Error("Session expired");
      (err as any).code = "SESSION_EXPIRED";
      window.dispatchEvent(
        new CustomEvent("api-error", { detail: { error: err } })
      );
      throw err;
    }

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    // Handle error responses - check both HTTP status and explicit error fields
    if (!res.ok) {
      const message = data?.message || data?.error || res.statusText;
      const err = new Error(message);
      (err as any).status = res.status;
      (err as any).data = data;
      throw err;
    }

    // For successful responses, just return the data as-is
    // Don't require a `success` field - let the caller handle the structure
    return data;
  },
  setToken: setClientToken,
  getToken: () => inMemoryToken ?? localStorage.getItem(TOKEN_KEY),
};
