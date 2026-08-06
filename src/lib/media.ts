import { BASE_URL } from "@/lib/api-client";

export function mediaSrc(mediaUrl?: string | null) {
  if (!mediaUrl) return "";
  if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://") || mediaUrl.startsWith("blob:")) {
    return mediaUrl;
  }
  return `${BASE_URL}${mediaUrl.startsWith("/") ? "" : "/"}${mediaUrl}`;
}

export function formatDuration(ms?: number) {
  if (!ms || ms < 0) return "0:00";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
