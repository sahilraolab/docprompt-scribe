const API_URL = import.meta.env.VITE_API_URL || "http://88.222.244.251:5005/api";
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
    if (data?.success && data.accessToken) {
      setClientToken(data.accessToken);
      return data.accessToken;
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

    if (!res.ok || (data && !data.success)) {
      const message = data?.message || res.statusText;
      const err = new Error(message);
      (err as any).status = res.status;
      throw err;
    }

    return data;
  },
  setToken: setClientToken,
  getToken: () => inMemoryToken ?? localStorage.getItem(TOKEN_KEY),
};
