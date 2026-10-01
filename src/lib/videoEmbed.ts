export function toEmbedUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtube.com" || host === "m.youtube.com") {
    if (url.pathname === "/watch") {
      const id = url.searchParams.get("v");
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    if (url.pathname.startsWith("/embed/")) {
      return `https://www.youtube.com${url.pathname}`;
    }
    if (url.pathname.startsWith("/shorts/")) {
      const id = url.pathname.split("/")[2];
      return id ? `https://www.youtube.com/embed/${id}` : null;
    }
    return null;
  }

  if (host === "youtu.be") {
    const id = url.pathname.slice(1);
    return id ? `https://www.youtube.com/embed/${id}` : null;
  }

  if (host === "vimeo.com") {
    const id = url.pathname.split("/").filter(Boolean)[0];
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null;
  }

  if (host === "player.vimeo.com") {
    return url.toString();
  }

  return null;
}

export function withTimestamp(embedUrl: string, seconds: number): string {
  if (seconds <= 0) return embedUrl;
  const separator = embedUrl.includes("?") ? "&" : "?";
  if (embedUrl.includes("youtube.com")) {
    return `${embedUrl}${separator}start=${Math.floor(seconds)}`;
  }
  if (embedUrl.includes("vimeo.com")) {
    return `${embedUrl}#t=${Math.floor(seconds)}s`;
  }
  return embedUrl;
}
