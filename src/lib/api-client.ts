const BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(typeof body === "object" && body && "detail" in body ? String((body as { detail: unknown }).detail) : `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
}

async function parseJson<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

async function refreshAccessToken(): Promise<string | null> {
  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    setAccessToken(null);
    return null;
  }

  const data = await parseJson<{ accessToken: string }>(response);
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function ensureRefreshedToken(): Promise<string | null> {
  if (accessToken) {
    return accessToken;
  }
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 401 && retry && path !== "/auth/refresh" && path !== "/auth/login" && path !== "/auth/signup" && path !== "/auth/reset-password" && path !== "/auth/reset-password/confirm") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return api<T>(path, init, false);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseJson(response));
  }

  return parseJson<T>(response);
}

export async function apiFormData<T>(path: string, formData: FormData, retry = true): Promise<T> {
  const headers = new Headers();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include",
  });

  if (
    response.status === 401 &&
    retry &&
    path !== "/auth/refresh" &&
    path !== "/auth/login" &&
    path !== "/auth/signup"
  ) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiFormData<T>(path, formData, false);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, await parseJson(response));
  }

  return parseJson<T>(response);
}

export { BASE_URL };
