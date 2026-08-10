import type { InsertSchema } from "@/shared/schema";
import type { BookmarkInstance, CollectionPageData } from "@/shared/types";

const DEFAULT_TIMEOUT_MS = 10_000;

export class ApiError extends Error {
  readonly status?: number;
  readonly serverMessage?: string;

  constructor(message: string, status?: number, serverMessage?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}

export class TimeoutError extends ApiError {
  constructor() {
    super("Request timed out");
    this.name = "TimeoutError";
  }
}

export class NetworkError extends ApiError {
  constructor() {
    super("Network error");
    this.name = "NetworkError";
  }
}

export class HttpError extends ApiError {
  constructor(status: number, serverMessage: string) {
    super(serverMessage, status, serverMessage);
    this.name = "HttpError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", headers = {}, body, timeoutMs = DEFAULT_TIMEOUT_MS } =
    options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  let text: string;
  try {
    response = await fetch(url, {
      method,
      headers,
      body,
      signal: controller.signal,
    });
    text = await response.text();
  } catch (err) {
    throw err instanceof Error && err.name === "AbortError"
      ? new TimeoutError()
      : new NetworkError();
  } finally {
    clearTimeout(timer);
  }

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Non-JSON body — handled by the error branch below.
    }
  }

  if (!response.ok) {
    const serverMessage =
      data !== null &&
      typeof data === "object" &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : text.trim() || `HTTP ${response.status}`;
    throw new HttpError(response.status, serverMessage);
  }

  return data as T;
}

function ensureTrailingSlash(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
}

/** GET /api/collections/:mark — X-Cloudmark-Token sent for private collections. */
export async function fetchCollection(
  mark: string,
  baseUrl: string,
  token?: string,
): Promise<CollectionPageData> {
  const url = new URL(
    `/api/collections/${encodeURIComponent(mark)}`,
    ensureTrailingSlash(baseUrl),
  ).toString();
  const headers: Record<string, string> = {};
  if (token) headers["X-Cloudmark-Token"] = token;
  return request<CollectionPageData>(url, { headers });
}

/** POST /api/bookmarks — the write token travels in the request body. */
export async function createBookmark(
  payload: InsertSchema,
  baseUrl: string,
): Promise<BookmarkInstance> {
  const url = new URL(
    "/api/bookmarks",
    ensureTrailingSlash(baseUrl),
  ).toString();
  return request<BookmarkInstance>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
