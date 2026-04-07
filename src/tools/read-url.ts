const BLOCKED_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function validateUrl(input: string): URL {
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(input);
  } catch {
    throw new Error("Invalid URL format.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only http and https URLs are allowed.");
  }

  if (BLOCKED_HOSTS.has(parsedUrl.hostname)) {
    throw new Error("Requests to local addresses are not allowed.");
  }

  return parsedUrl;
}

export async function readUrl(url: string) {
  const parsedUrl = validateUrl(url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Content-Intelligence-Agent/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch URL: ${response.status} ${response.statusText}`,
      );
    }

    const contentType = response.headers.get("content-type") || "";

    if (
      !contentType.includes("text/html") &&
      !contentType.includes("text/plain")
    ) {
      throw new Error("Unsupported content type for URL reading.");
    }

    const rawContent = await response.text();

    const cleanedText = rawContent
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12000);

    return {
      url: parsedUrl.toString(),
      content: cleanedText,
    };
  } finally {
    clearTimeout(timeout);
  }
}
