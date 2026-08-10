import { getCategories } from "@/shared/categories";
import { CATEGORY_MAX_LENGTH } from "@/shared/constants";
import { insertSchema, type InsertSchema } from "@/shared/schema";
import {
  type BookmarksData,
  type CollectionSettings,
  defaultCategory,
} from "@/shared/types";
import { createBookmark, fetchCollection, HttpError, NetworkError, TimeoutError } from "./lib/api";
import {
  getConfig,
  saveConfig,
  setLastUsedCategory,
  validateConfig,
  type Config,
} from "./lib/config";

type View = "save" | "settings";

const NEW_CATEGORY_VALUE = "__new__";

/** Chrome i18n: translate a message key, falling back to the key itself. */
const t = (key: string): string => chrome.i18n.getMessage(key) || key;

function el<T = Element>(selector: string): T {
  const node = document.querySelector(selector);
  if (!node) throw new Error(`Missing element ${selector}`);
  return node as T;
}

// --- Header ---
const brandName = el("#brand-name");
const headerToggle = el<HTMLButtonElement>("#header-toggle");
const gearIcon = el<SVGSVGElement>("#icon-gear");
const backIcon = el<SVGSVGElement>("#icon-back");

// --- Views ---
const viewSave = el<HTMLElement>("#view-save");
const viewSettings = el<HTMLElement>("#view-settings");

// --- Save form ---
const saveForm = el<HTMLFormElement>("#save-form");
const titleInput = el<HTMLInputElement>("#title-input");
const urlInput = el<HTMLInputElement>("#url-input");
const descriptionInput = el<HTMLTextAreaElement>("#description-input");
const categorySelect = el<HTMLSelectElement>("#category-select");
const categoryNew = el<HTMLInputElement>("#category-new");
const status = el<HTMLParagraphElement>("#status");
const saveButton = el<HTMLButtonElement>("#save-button");
const successActions = el<HTMLElement>("#success-actions");
const openCollectionLink = el<HTMLAnchorElement>("#open-collection");
const saveAnotherButton = el<HTMLButtonElement>("#save-another");

// --- Settings form ---
const settingsHint = el<HTMLElement>("#settings-hint");
const settingsForm = el<HTMLFormElement>("#settings-form");
const settingsMark = el<HTMLInputElement>("#settings-mark");
const settingsToken = el<HTMLInputElement>("#settings-token");
const settingsReveal = el<HTMLButtonElement>("#settings-reveal");
const settingsBaseUrl = el<HTMLInputElement>("#settings-base-url");
const settingsStatus = el<HTMLParagraphElement>("#settings-status");
const settingsSave = el<HTMLButtonElement>("#settings-save");

interface State {
  config: Config;
  bookmarksData: BookmarksData | null;
  collectionSettings: CollectionSettings | null;
  unsupported: boolean;
}

const state: State = {
  config: { mark: "", token: "", baseUrl: "", lastUsedCategory: "" },
  bookmarksData: null,
  collectionSettings: null,
  unsupported: false,
};

let currentView: View = "save";
let formEnabled = true;

function isConfigured(config: Config): boolean {
  return Boolean(config.mark.trim() && config.token.trim());
}

function isSupportedPage(url: string | undefined): boolean {
  if (!url) return true; // Unknown/empty — let the user type a URL.
  try {
    const protocol = new URL(url).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

// --- View switching ---

function showView(view: View): void {
  currentView = view;
  viewSave.classList.toggle("hidden", view !== "save");
  viewSettings.classList.toggle("hidden", view !== "settings");
  gearIcon.classList.toggle("hidden", view !== "save");
  backIcon.classList.toggle("hidden", view !== "settings");
  const labelKey = view === "settings" ? "settingsBack" : "settingsTitle";
  headerToggle.setAttribute("aria-label", t(labelKey));
  headerToggle.title = t(labelKey);
}

function showSettingsView(): void {
  fillSettingsForm();
  showView("settings");
}

// --- Status helpers ---

function showStatus(
  message: string,
  tone: "info" | "warning" | "error" | "success",
): void {
  status.textContent = message;
  status.className = `status status-${tone}`;
}

function clearStatus(): void {
  status.textContent = "";
  status.className = "status";
}

function setSettingsError(message: string): void {
  settingsStatus.textContent = message;
  settingsStatus.className = "status status-error";
}

/** Structural subset of Element used by setFieldError (avoids HTMLSelectElement assignability quirks). */
interface FieldElement {
  setAttribute(name: string, value: string): void;
  removeAttribute(name: string): void;
  closest(selectors: string): Element | null;
}

function setFieldError(input: FieldElement, key: string | null): void {
  const field = input.closest(".field");
  const errorEl = field?.querySelector<HTMLElement>(".field-error");
  if (key) {
    input.setAttribute("aria-invalid", "true");
    field?.classList.add("field-invalid");
    if (errorEl) errorEl.textContent = t(key);
  } else {
    input.removeAttribute("aria-invalid");
    field?.classList.remove("field-invalid");
    if (errorEl) errorEl.textContent = "";
  }
}

function fillSettingsForm(): void {
  settingsMark.value = state.config.mark;
  settingsToken.value = state.config.token;
  settingsBaseUrl.value = state.config.baseUrl;
  settingsStatus.textContent = "";
  settingsStatus.className = "status";
  setFieldError(settingsMark, null);
  setFieldError(settingsToken, null);
  setFieldError(settingsBaseUrl, null);
}

// --- Save form state ---

function setFormEnabled(enabled: boolean): void {
  formEnabled = enabled;
  saveButton.disabled = !enabled;
  titleInput.disabled = !enabled;
  urlInput.disabled = !enabled;
  descriptionInput.disabled = !enabled;
  categorySelect.disabled = !enabled;
  categoryNew.disabled = !enabled;
}

function setSaving(saving: boolean): void {
  saveButton.disabled = saving || !formEnabled;
  saveButton.textContent = t(saving ? "savingButton" : "saveButton");
  if (saving) {
    successActions.classList.add("hidden");
  }
}

// --- Categories ---

function isValidCategory(name: string): boolean {
  return name.length > 0 && name.length <= CATEGORY_MAX_LENGTH;
}

function buildCategoryOptions(): string[] {
  const categories = getCategories(state.bookmarksData);
  const set = new Set(categories);
  const settingsDefault = state.collectionSettings?.defaultCategory.trim();
  if (settingsDefault) set.add(settingsDefault);
  const lastUsed = state.config.lastUsedCategory.trim();
  if (lastUsed) set.add(lastUsed);
  return [...set];
}

function preferredCategory(options: string[]): string {
  const lastUsed = state.config.lastUsedCategory.trim();
  const settingsDefault = state.collectionSettings?.defaultCategory.trim();
  for (const candidate of [lastUsed, settingsDefault, defaultCategory]) {
    if (candidate && isValidCategory(candidate) && options.includes(candidate)) {
      return candidate;
    }
  }
  return defaultCategory;
}

function renderCategoryOptions(): void {
  const wasCreatingCategory = categorySelect.value === NEW_CATEGORY_VALUE;
  const newCategoryDraft = categoryNew.value;
  const options = buildCategoryOptions();
  const fragment = document.createDocumentFragment();
  for (const name of options) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    fragment.appendChild(option);
  }
  const newOption = document.createElement("option");
  newOption.value = NEW_CATEGORY_VALUE;
  newOption.textContent = t("categoryNewOption");
  fragment.appendChild(newOption);

  categorySelect.textContent = "";
  categorySelect.appendChild(fragment);
  categorySelect.value = wasCreatingCategory
    ? NEW_CATEGORY_VALUE
    : preferredCategory(options);

  const isNew = categorySelect.value === NEW_CATEGORY_VALUE;
  categoryNew.classList.toggle("hidden", !isNew);
  categoryNew.value = isNew ? newCategoryDraft : "";
}

function selectedCategory(): string {
  if (categorySelect.value === NEW_CATEGORY_VALUE) {
    return categoryNew.value.trim();
  }
  return categorySelect.value;
}

async function loadCategories(): Promise<void> {
  try {
    const data = await fetchCollection(
      state.config.mark.trim(),
      state.config.baseUrl,
      state.config.token.trim(),
    );
    if (data.issuedWriteToken) {
      state.config.token = data.issuedWriteToken;
      await saveConfig({ token: data.issuedWriteToken });
    }
    state.bookmarksData = data.bookmarksData;
    state.collectionSettings = data.settings ?? null;
    renderCategoryOptions();
    if (data.privateLocked) {
      showStatus(t("errorInvalidToken"), "error");
    } else if (!state.unsupported) {
      clearStatus();
    }
  } catch {
    state.bookmarksData = null;
    state.collectionSettings = null;
    renderCategoryOptions();
    if (!state.unsupported) {
      showStatus(t("categoryLoadWarning"), "warning");
    }
  }
}

// --- Validation & error mapping ---

interface IssueLike {
  path: ReadonlyArray<string | number | symbol>;
}

function firstFieldError(
  payload: InsertSchema,
  error: { issues: ReadonlyArray<IssueLike> },
): string {
  for (const issue of error.issues) {
    const field = issue.path[0];
    if (typeof field !== "string") continue;
    const value = (payload as Record<string, unknown>)[field];
    switch (field) {
      case "url":
        return t(value ? "urlInvalid" : "urlRequired");
      case "title":
        return t(value ? "titleTooLong" : "titleRequired");
      case "category":
        return t(value ? "categoryTooLong" : "categoryRequired");
      case "description":
        return t("descriptionTooLong");
      case "mark":
      case "token":
        return t("settingsInvalidFieldHint");
      default:
        break;
    }
  }
  return t("validationGeneric");
}

function errorMessage(err: unknown): string {
  if (err instanceof TimeoutError) return t("errorTimeout");
  if (err instanceof NetworkError) return t("errorNetwork");
  if (err instanceof HttpError) {
    const message = (err.serverMessage ?? "").toLowerCase();
    if (message.includes("already exists")) return t("errorDuplicate");
    if (message.includes("rate limit")) return t("errorRateLimit");
    if (message.includes("invalid write token") || message.includes("invalid token")) {
      return t("errorInvalidToken");
    }
    if (message.includes("not found") || message.includes("claim it first")) {
      return t("errorCollectionNotFound");
    }
    if (message.includes("maximum")) return t("errorLimit");
    if (err.status !== undefined && err.status >= 500) return t("errorServer");
    return t("errorGeneric");
  }
  return t("errorGeneric");
}

// --- Save flow ---

function collectionUrl(): string {
  const base = state.config.baseUrl.replace(/\/+$/, "");
  return `${base}/${encodeURIComponent(state.config.mark.trim())}`;
}

function showSuccess(): void {
  status.textContent = t("successSaved");
  status.className = "status status-success";
  successActions.classList.remove("hidden");
  openCollectionLink.href = collectionUrl();
}

async function saveBookmark(payload: InsertSchema): Promise<void> {
  setSaving(true);
  try {
    await createBookmark(payload, state.config.baseUrl);
    await setLastUsedCategory(payload.category);
    setSaving(false);
    showSuccess();
  } catch (err) {
    setSaving(false);
    showStatus(errorMessage(err), "error");
  }
}

// --- Init ---

async function init(): Promise<void> {
  state.config = await getConfig();

  if (!isConfigured(state.config)) {
    settingsHint.classList.remove("hidden");
    settingsHint.textContent = t("unconfiguredHint");
    fillSettingsForm();
    settingsStatus.textContent = "";
    settingsStatus.className = "status";
    headerToggle.classList.add("hidden");
    showView("settings");
    return;
  }

  headerToggle.classList.remove("hidden");
  settingsHint.classList.add("hidden");
  showView("save");
  successActions.classList.add("hidden");
  clearStatus();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const pageUrl = tab?.url;
  state.unsupported = !isSupportedPage(pageUrl);
  titleInput.value = tab?.title ?? "";
  urlInput.value = pageUrl ?? "";

  setFormEnabled(true);
  setSaving(false);
  renderCategoryOptions();

  if (state.unsupported) {
    showStatus(`${t("unsupportedTab")} ${t("unsupportedTabDetail")}`, "warning");
  } else {
    showStatus(t("statusLoadingCategories"), "info");
  }
  await loadCategories();
}

// --- Wiring ---

document.addEventListener("DOMContentLoaded", () => {
  document.title = t("extensionName");
  document.documentElement.lang = chrome.i18n
    .getUILanguage()
    .toLowerCase()
    .startsWith("zh")
    ? "zh-CN"
    : "en";
  brandName.textContent = t("extensionName");

  el("#label-title").textContent = t("saveTitleLabel");
  el("#label-url").textContent = t("saveUrlLabel");
  el("#label-description").textContent = t("saveDescriptionLabel");
  el("#label-category").textContent = t("saveCategoryLabel");
  el("#label-settings-mark").textContent = t("settingsMarkLabel");
  el("#label-settings-token").textContent = t("settingsTokenLabel");
  el("#label-settings-base-url").textContent = t("settingsBaseUrlLabel");

  titleInput.placeholder = t("titlePlaceholder");
  urlInput.placeholder = t("urlPlaceholder");
  descriptionInput.placeholder = t("descriptionPlaceholder");
  categoryNew.placeholder = t("categoryNewPlaceholder");
  settingsMark.placeholder = t("settingsMarkPlaceholder");
  settingsToken.placeholder = t("settingsTokenPlaceholder");

  categorySelect.setAttribute("aria-label", t("saveCategoryLabel"));
  categoryNew.setAttribute("aria-label", t("categoryNewPlaceholder"));
  settingsBaseUrl.setAttribute("aria-label", t("settingsBaseUrlLabel"));
  settingsReveal.textContent = t("settingsReveal");
  settingsReveal.setAttribute("aria-pressed", "false");
  openCollectionLink.textContent = t("openCollection");
  saveAnotherButton.textContent = t("saveAnother");
  settingsSave.textContent = t("settingsSave");

  headerToggle.addEventListener("click", () => {
    if (currentView === "save") {
      showSettingsView();
    } else {
      showView("save");
    }
  });

  categorySelect.addEventListener("change", () => {
    const isNew = categorySelect.value === NEW_CATEGORY_VALUE;
    categoryNew.classList.toggle("hidden", !isNew);
    if (isNew) categoryNew.focus();
  });

  saveAnotherButton.addEventListener("click", () => {
    successActions.classList.add("hidden");
    clearStatus();
    titleInput.focus();
  });

  settingsReveal.addEventListener("click", () => {
    const isHidden = settingsToken.type === "password";
    settingsToken.type = isHidden ? "text" : "password";
    settingsReveal.textContent = t(isHidden ? "settingsHide" : "settingsReveal");
    settingsReveal.setAttribute("aria-pressed", String(isHidden));
  });

  saveForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!formEnabled) return;

    const payload: InsertSchema = {
      url: urlInput.value.trim(),
      title: titleInput.value.trim(),
      description: descriptionInput.value.trim() || undefined,
      category: selectedCategory(),
      mark: state.config.mark.trim(),
      token: state.config.token.trim(),
    };

    const parsed = insertSchema.safeParse(payload);
    if (!parsed.success) {
      showStatus(firstFieldError(payload, parsed.error), "error");
      return;
    }

    void saveBookmark(parsed.data);
  });

  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const mark = settingsMark.value.trim();
    const token = settingsToken.value.trim();
    const baseUrl = settingsBaseUrl.value.trim();

    const errors = validateConfig({ mark, token, baseUrl });
    setFieldError(settingsMark, errors.mark ?? null);
    setFieldError(settingsToken, errors.token ?? null);
    setFieldError(settingsBaseUrl, errors.baseUrl ?? null);

    if (errors.mark || errors.token || errors.baseUrl) {
      setSettingsError(t("settingsError"));
      return;
    }

    await saveConfig({ mark, token, baseUrl });
    state.config = await getConfig();
    await init();
    if (!state.unsupported) {
      showStatus(t("settingsSaved"), "success");
    }
  });

  void init();
});
