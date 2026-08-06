import { api, setAccessToken } from "@/lib/api-client";
import type { AuthResponse } from "@/lib/api/types";

export async function signup(body: {
  username: string;
  email: string;
  pronouns: string;
  language: string;
  location?: string;
  password: string;
  confirmPassword: string;
}) {
  const data = await api<AuthResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify(body),
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function login(body: { username: string; password: string }) {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
  setAccessToken(data.accessToken);
  return data;
}

export async function logout() {
  try {
    await api<void>("/auth/logout", { method: "POST" });
  } finally {
    setAccessToken(null);
  }
}

export async function refreshSession() {
  const data = await api<{ accessToken: string }>("/auth/refresh", { method: "POST" });
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function resetPassword(username: string) {
  return api<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ username }),
  });
}


export async function confirmResetPassword(body: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  return api<{ message: string }>("/auth/reset-password/confirm", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
