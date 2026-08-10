import { CATEGORY_MAX_LENGTH, TITLE_MAX_LENGTH } from "@/shared/constants";
import { insertSchema, type InsertSchema } from "@/shared/schema";
import { defaultCategory } from "@/shared/types";
import {
  createBookmark,
  fetchCollection,
  HttpError,
  NetworkError,
  TimeoutError,
} from "./lib/api";
import {
  getConfig,
  saveConfig,
  setLastUsedCategory,
  type Config,
} from "./lib/config";

/** Stable context menu ids, recreated on every refresh. */
const MENU_ID_PAGE = "cloudmark-save-page";
const MENU_ID_LINK = "cloudmark-save-link";

/** How long the action badge/title feedback stays visible (ms). */
const BADGE_CLEAR_MS = 1_800;

const BADGE_SUCCESS = { text: "✓", color: "#15803d" };
const BADGE_FAILURE = { text: "!", color: "#b91c1c" };

let badgeTimer: ReturnType<typeof setTimeout> | undefined;

/** Chrome i18n: translate a message key, falling back to the key itself. */
const t = (key: string): string => chrome.i18n.getMessage(key) || key;

function isConfigured(config: Config): boolean {
  return Boolean(config.mark.trim() && config.token.trim());
}

/** Only http/https URLs are savable. */
function isSupportedUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidCategoryName(name: string): boolean {
  return name.length > 0 && name.length <= CATEGORY_MAX_LENGTH;
}

/** Trim to the schema title max, guaranteeing a non-empty result. */
function truncateTitle(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return t("contextMenuDefaultTitle");
  return trimmed.length > TITLE_MAX_LENGTH
    ? trimmed.slice(0, TITLE_MAX_LENGTH).trim() || t("contextMenuDefaultTitle")
    : trimmed;
}

/**
 * Derive a sensible title from a URL without any content-script access:
 * prefer the last path segment, then the hostname.
 */
function deriveTitleFromUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return truncateTitle(url);
  }
  const segments = parsed.pathname.split("/").filter(Boolean);
  const last = segments[segments.length - 1];
  if (last) {
    let decoded = last;
    try {
      decoded = decodeURIComponent(last);
    } catch {
      // Keep the raw segment when it isn't valid percent-encoding.
    }
    const cleaned = decoded
      .replace(/[_-]+/g, " ")
      .replace(/\.[a-z0-9]{1,5}$/i, "")
      .trim();
    if (cleaned) return truncateTitle(cleaned);
  }
  if (parsed.hostname) return truncateTitle(parsed.hostname);
  return truncateTitle(url);
}

/**
 * Resolve the save category: last-used first, then the collection's
 * defaultCategory (via fetchCollection), then the shared default. A failed
 * collection fetch falls through to the shared default.
 */
async function resolveCategory(config: Config): Promise<string> {
  const lastUsed = config.lastUsedCategory.trim();
  if (isValidCategoryName(lastUsed)) return lastUsed;
  try {
    const data = await fetchCollection(
      config.mark.trim(),
      config.baseUrl,
      config.token.trim(),
    );
    if (data.issuedWriteToken) {
      config.token = data.issuedWriteToken;
      await saveConfig({ token: data.issuedWriteToken });
    }
    const settingsDefault = data.settings?.defaultCategory?.trim();
    if (settingsDefault !== undefined && isValidCategoryName(settingsDefault)) {
      return settingsDefault;
    }
  } catch {
    // Collection unreachable — fall through to the shared default.
  }
  return defaultCategory;
}

// --- Context menu lifecycle -------------------------------------------------

/** Rebuild the context menu; items stay absent while unconfigured. */
async function refreshContextMenus(): Promise<void> {
  const config = await getConfig();
  await chrome.contextMenus.removeAll();
  if (!isConfigured(config)) return;
  chrome.contextMenus.create({
    id: MENU_ID_PAGE,
    title: t("contextMenuSavePage"),
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: MENU_ID_LINK,
    title: t("contextMenuSaveLink"),
    contexts: ["link"],
  });
}

// --- Action badge / title feedback ------------------------------------------

async function setBadge(text: string, color: string, titleKey: string): Promise<void> {
  await chrome.action.setBadgeText({ text });
  await chrome.action.setBadgeBackgroundColor({ color });
  await chrome.action.setTitle({ title: t(titleKey) });
}

async function clearBadge(): Promise<void> {
  await chrome.action.setBadgeText({ text: "" });
  await chrome.action.setTitle({ title: t("extensionName") });
}

/** Show transient badge feedback, then clear it after a short delay. */
function flashBadge(text: string, color: string, titleKey: string): void {
  if (badgeTimer) clearTimeout(badgeTimer);
  void setBadge(text, color, titleKey);
  badgeTimer = setTimeout(() => {
    badgeTimer = undefined;
    void clearBadge();
  }, BADGE_CLEAR_MS);
}

// --- Save flow --------------------------------------------------------------

/** Map API failures to a localized i18n message key. */
function errorMessageKey(err: unknown): string {
  if (err instanceof TimeoutError) return "errorTimeout";
  if (err instanceof NetworkError) return "errorNetwork";
  if (err instanceof HttpError) {
    const message = (err.serverMessage ?? "").toLowerCase();
    if (message.includes("already exists")) return "errorDuplicate";
    if (message.includes("rate limit")) return "errorRateLimit";
    if (message.includes("invalid write token") || message.includes("invalid token")) {
      return "errorInvalidToken";
    }
    if (message.includes("not found") || message.includes("claim it first")) {
      return "errorCollectionNotFound";
    }
    if (message.includes("maximum")) return "errorLimit";
    if (err.status !== undefined && err.status >= 500) return "errorServer";
  }
  return "errorGeneric";
}

interface SaveTarget {
  url: string | undefined;
  title: string;
}

/** Validate the payload with the insert schema, then POST to the configured server. */
async function createBookmarkFor(config: Config, target: SaveTarget, category: string): Promise<void> {
  const payload: InsertSchema = {
    url: target.url ?? "",
    title: target.title,
    category,
    mark: config.mark.trim(),
    token: config.token.trim(),
  };
  const parsed = insertSchema.safeParse(payload);
  if (!parsed.success) {
    throw new Error("Validation failed");
  }
  await createBookmark(parsed.data, config.baseUrl);
  await setLastUsedCategory(category);
}

async function handleSave(target: SaveTarget): Promise<void> {
  if (!isSupportedUrl(target.url)) {
    flashBadge(BADGE_FAILURE.text, BADGE_FAILURE.color, "contextMenuUnsupported");
    return;
  }

  const config = await getConfig();
  if (!isConfigured(config)) {
    flashBadge(BADGE_FAILURE.text, BADGE_FAILURE.color, "errorGeneric");
    return;
  }

  if (badgeTimer) clearTimeout(badgeTimer);
  void chrome.action.setBadgeText({ text: "" });
  void chrome.action.setTitle({ title: t("contextMenuSaving") });

  try {
    const category = await resolveCategory(config);
    await createBookmarkFor(config, target, category);
    flashBadge(BADGE_SUCCESS.text, BADGE_SUCCESS.color, "contextMenuSaved");
  } catch (err) {
    flashBadge(BADGE_FAILURE.text, BADGE_FAILURE.color, errorMessageKey(err));
  }
}

// --- Menu click targets -----------------------------------------------------

interface SaveContext {
  url: string | undefined;
  title: string;
}

function pageTarget(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): SaveContext {
  const url = info.pageUrl;
  const tabTitle = tab?.title?.trim();
  return {
    url,
    title: tabTitle ? truncateTitle(tabTitle) : deriveTitleFromUrl(url ?? ""),
  };
}

function linkTarget(info: chrome.contextMenus.OnClickData): SaveContext {
  const url = info.linkUrl;
  return { url, title: deriveTitleFromUrl(url ?? "") };
}

// --- Event wiring -----------------------------------------------------------

chrome.runtime.onInstalled.addListener(() => {
  void refreshContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  void refreshContextMenus();
});

chrome.storage.onChanged.addListener((_changes, areaName) => {
  if (areaName === "local") {
    void refreshContextMenus();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === MENU_ID_PAGE) {
    void handleSave(pageTarget(info, tab));
  } else if (info.menuItemId === MENU_ID_LINK) {
    void handleSave(linkTarget(info));
  }
});

// Refresh on service-worker boot (covers cold starts before onStartup fires).
void refreshContextMenus();
