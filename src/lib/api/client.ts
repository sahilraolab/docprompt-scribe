// src/lib/api/client.ts

const API_URL = import.meta.env.VITE_API_URL || "https://dreamtonexiv.xyz/api";
const TOKEN_KEY = "erp_auth_token";

let inMemoryToken: string | null = localStorage.getItem(TOKEN_KEY);

export function setClientToken(token: string | null) {
  inMemoryToken = token;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export const apiClient = {
  API_URL,

  async request(endpoint: string, options: RequestInit = {}) {
    const token = inMemoryToken;
    const isFormData = options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    if (!res.ok) {
      const err = new Error(data?.message || "API Error");
      (err as any).status = res.status;
      throw err;
    }

    return data;
  },

  setToken: setClientToken,
  getToken: () => inMemoryToken,
};
