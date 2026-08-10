import {
  MARK_MAX_LENGTH,
  MARK_MIN_LENGTH,
  RESERVED_MARKS,
  TOKEN_MAX_LENGTH,
  TOKEN_MIN_LENGTH,
} from "@/shared/constants";

const STORAGE_KEY = "cloudmark:config";

export const DEFAULT_BASE_URL = "https://cloudmark.site";

const MARK_PATTERN = /^[a-zA-Z0-9_-]+$/;
const TOKEN_PATTERN = /^[a-zA-Z0-9_-]+$/;

export interface Config {
  mark: string;
  token: string;
  baseUrl: string;
  lastUsedCategory: string;
}

export const DEFAULT_CONFIG: Config = {
  mark: "",
  token: "",
  baseUrl: DEFAULT_BASE_URL,
  lastUsedCategory: "",
};

/** i18n keys for config field errors (translated by the popup). */
export type ConfigErrorKey =
  | "markRequired"
  | "markInvalid"
  | "markReserved"
  | "tokenRequired"
  | "tokenInvalid"
  | "baseUrlInvalid";

export interface ConfigErrors {
  mark?: ConfigErrorKey;
  token?: ConfigErrorKey;
  baseUrl?: ConfigErrorKey;
}

/** Normalize any http(s) Cloudmark server URL to its origin. */
export function normalizeBaseUrl(value?: string): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return DEFAULT_BASE_URL;
  try {
    const url = new URL(trimmed);
    if (
      (url.protocol === "http:" || url.protocol === "https:") &&
      !url.username &&
      !url.password
    ) {
      return url.origin;
    }
  } catch {
    // Invalid values fall back to the hosted Cloudmark instance.
  }
  return DEFAULT_BASE_URL;
}

function isValidBaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

/** Validate a config draft. Error values are i18n message keys. */
export function validateConfig(input: {
  mark: string;
  token: string;
  baseUrl: string;
}): ConfigErrors {
  const errors: ConfigErrors = {};
  const mark = input.mark.trim();
  const token = input.token.trim();
  const baseUrl = input.baseUrl.trim().replace(/\/+$/, "");

  if (!mark) {
    errors.mark = "markRequired";
  } else if (
    mark.length < MARK_MIN_LENGTH ||
    mark.length > MARK_MAX_LENGTH ||
    !MARK_PATTERN.test(mark)
  ) {
    errors.mark = "markInvalid";
  } else if (RESERVED_MARKS.has(mark.toLowerCase())) {
    errors.mark = "markReserved";
  }

  if (!token) {
    errors.token = "tokenRequired";
  } else if (
    token.length < TOKEN_MIN_LENGTH ||
    token.length > TOKEN_MAX_LENGTH ||
    !TOKEN_PATTERN.test(token)
  ) {
    errors.token = "tokenInvalid";
  }

  if (!isValidBaseUrl(baseUrl)) {
    errors.baseUrl = "baseUrlInvalid";
  }

  return errors;
}

/** Read persisted config, normalizing the server URL. */
export async function getConfig(): Promise<Config> {
  const data = await chrome.storage.local.get(STORAGE_KEY);
  const stored = data[STORAGE_KEY] as Partial<Config> | undefined;
  return {
    ...DEFAULT_CONFIG,
    ...(stored ?? {}),
    baseUrl: normalizeBaseUrl(stored?.baseUrl),
  };
}

export async function saveConfig(patch: Partial<Config>): Promise<void> {
  const current = await getConfig();
  const next: Config = {
    ...current,
    ...patch,
    baseUrl: normalizeBaseUrl(patch.baseUrl ?? current.baseUrl),
  };
  await chrome.storage.local.set({ [STORAGE_KEY]: next });
}

/** Persist the last-used category — call only after a successful save. */
export async function setLastUsedCategory(category: string): Promise<void> {
  await saveConfig({ lastUsedCategory: category });
}
