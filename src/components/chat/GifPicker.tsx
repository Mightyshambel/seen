import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { toast } from "sonner";

type GifItem = {
  id: string;
  title: string;
  tags: string[];
  previewUrl: string;
  url: string;
};

const GIPHY_KEY = import.meta.env.VITE_GIPHY_API_KEY as string | undefined;

/** Local G-rated pack — always available, no API key required. */
const LOCAL_GIFS: GifItem[] = [
  {
    id: "local-heart",
    title: "Care",
    tags: ["heart", "love", "care", "kind"],
    previewUrl: "/images/gifs/heart.gif",
    url: "/images/gifs/heart.gif",
  },
  {
    id: "local-hug",
    title: "Hug",
    tags: ["hug", "support", "comfort"],
    previewUrl: "/images/gifs/hug.gif",
    url: "/images/gifs/hug.gif",
  },
  {
    id: "local-calm",
    title: "Calm",
    tags: ["calm", "breathe", "peace", "ok"],
    previewUrl: "/images/gifs/calm.gif",
    url: "/images/gifs/calm.gif",
  },
  {
    id: "local-thanks",
    title: "Thanks",
    tags: ["thanks", "thank", "grateful"],
    previewUrl: "/images/gifs/thanks.gif",
    url: "/images/gifs/thanks.gif",
  },
  {
    id: "local-wave",
    title: "Hello",
    tags: ["hello", "hi", "wave", "hey"],
    previewUrl: "/images/gifs/wave.gif",
    url: "/images/gifs/wave.gif",
  },
];

async function fetchGiphy(query: string): Promise<GifItem[]> {
  if (!GIPHY_KEY) return [];
  const params = new URLSearchParams({
    api_key: GIPHY_KEY,
    limit: "24",
    rating: "g",
    lang: "en",
  });
  const endpoint = query.trim()
    ? `https://api.giphy.com/v1/gifs/search?${params}&q=${encodeURIComponent(query.trim())}`
    : `https://api.giphy.com/v1/gifs/trending?${params}`;

  const response = await fetch(endpoint);
  if (!response.ok) throw new Error("GIF search failed");
  const data = (await response.json()) as {
    data?: Array<{
      id: string;
      title?: string;
      images?: {
        fixed_width?: { url?: string };
        downsized?: { url?: string };
        original?: { url?: string };
      };
    }>;
  };

  return (data.data ?? [])
    .map((item) => {
      const previewUrl = item.images?.fixed_width?.url || item.images?.downsized?.url;
      const url = item.images?.downsized?.url || item.images?.original?.url || previewUrl;
      if (!previewUrl || !url) return null;
      return {
        id: item.id,
        title: item.title || "GIF",
        tags: [],
        previewUrl,
        url,
      };
    })
    .filter((item): item is GifItem => item !== null);
}

export function GifPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (file: File) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [remote, setRemote] = useState<GifItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pickingId, setPickingId] = useState<string | null>(null);

  const localFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LOCAL_GIFS;
    return LOCAL_GIFS.filter(
      (gif) =>
        gif.title.toLowerCase().includes(q) ||
        gif.tags.some((tag) => tag.includes(q)),
    );
  }, [query]);

  const gifs = remote.length > 0 ? remote : localFiltered;

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !GIPHY_KEY) {
      setRemote([]);
      return;
    }
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void fetchGiphy(query)
        .then((items) => {
          if (!cancelled) setRemote(items);
        })
        .catch(() => {
          if (!cancelled) setRemote([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, query ? 280 : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  if (!open) return null;

  const pick = async (gif: GifItem) => {
    setPickingId(gif.id);
    try {
      const response = await fetch(gif.url);
      if (!response.ok) throw new Error("download failed");
      const blob = await response.blob();
      const type = blob.type.startsWith("image/") ? blob.type : "image/gif";
      const file = new File([blob], `${gif.id}.gif`, { type });
      if (file.size > 5 * 1024 * 1024) {
        toast.error("That GIF is too large (max 5MB). Try another.");
        return;
      }
      onPick(file);
      onClose();
    } catch {
      toast.error("Couldn't load that GIF. Try another.");
    } finally {
      setPickingId(null);
    }
  };

  return (
    <div
      ref={ref}
      className="absolute bottom-[calc(100%+0.5rem)] left-0 z-40 w-[min(100%,22rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]"
      role="listbox"
      aria-label="GIF picker"
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search GIFs"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Search GIFs"
          autoFocus
        />
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {gifs.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">No GIFs match that search.</p>
      ) : (
        <div className="grid max-h-64 grid-cols-2 gap-1.5 overflow-y-auto p-2">
          {gifs.map((gif) => (
            <button
              key={gif.id}
              type="button"
              disabled={pickingId !== null}
              onClick={() => void pick(gif)}
              className="relative aspect-square overflow-hidden rounded-xl bg-surface-muted disabled:opacity-50"
              title={gif.title}
            >
              <img src={gif.previewUrl} alt={gif.title} className="h-full w-full object-cover" loading="lazy" />
              {pickingId === gif.id && (
                <span className="absolute inset-0 grid place-items-center bg-foreground/30">
                  <Loader2 className="h-5 w-5 animate-spin text-background" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <p className="border-t border-border/60 px-3 py-1.5 text-center text-[10px] text-muted-foreground">
        {GIPHY_KEY ? "GIFs via GIPHY · G-rated" : "Supportive GIF pack · G-rated"}
      </p>
    </div>
  );
}
