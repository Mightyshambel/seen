import { api } from "@/lib/api-client";

export async function sendContactMessage(payload: { email: string; message: string }) {
  return api<{ ok: true }>("/contact", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
