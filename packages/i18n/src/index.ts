import stripJsonComments from "strip-json-comments";

export type I18nScope = "web" | "auth";

export type I18nMessagePrimitive = string | number | boolean | null;
export type I18nMessageValue =
  | I18nMessagePrimitive
  | I18nMessageValue[]
  | I18nMessageObject;
export interface I18nMessageObject {
  [key: string]: I18nMessageValue;
}

export interface RemoteMessageMeta {
  name: string;
  author: {
    name: string;
    url: string;
  };
}

export interface RemoteMessagesByScope {
  web: I18nMessageObject;
  auth: I18nMessageObject;
}

export type ArcI18nErrorCode =
  | "FETCH_FAILED"
  | "INVALID_CONFIG"
  | "INVALID_LOCALE"
  | "SCOPE_NOT_FOUND"
  | "PARSE_FAILED";

export interface RemoteLocaleConfig {
  meta: {
    type: string;
    defaultLang: string;
    version: string;
  };
  locales: string;
}

export type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

export interface RemoteI18nOptions {
  baseUrl?: string;
  cacheTtlMs?: number;
  fetcher?: FetchLike;
}

export interface RemoteRoutingConfig {
  locales: string[];
  defaultLocale: string;
}

export interface LocaleOption {
  value: string;
  label: string;
}

export interface ResolveLocaleParams extends RemoteI18nOptions {
  requestedLocale?: string | null;
  allowedLocales: readonly string[];
  fallbackLocale: string;
}

export interface GetScopedMessagesParams extends RemoteI18nOptions {
  locale: string;
  scope: I18nScope;
}

export class ArcI18nError extends Error {
  public readonly code: ArcI18nErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(
    code: ArcI18nErrorCode,
    message: string,
    options?: { cause?: unknown; details?: Record<string, unknown> },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "ArcI18nError";
    this.code = code;
    this.details = options?.details;
  }
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

interface RemoteMessagesFile {
  meta: RemoteMessageMeta;
  messages: RemoteMessagesByScope;
}

const DEFAULT_BASE_URL =
  "https://raw.githubusercontent.com/arcstudioofc/arcstudio-i18n/main";
const DEFAULT_CACHE_TTL_MS = 300_000;
const LOCALE_PATTERN = /^[a-z0-9-]+$/;

const localeConfigCache = new Map<string, CacheEntry<RemoteLocaleConfig>>();
const scopedMessagesCache = new Map<string, CacheEntry<I18nMessageObject>>();
const remoteLocalesCache = new Map<string, CacheEntry<string[]>>();
const remoteMessagesFileCache = new Map<string, CacheEntry<RemoteMessagesFile>>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isI18nMessageValue(value: unknown): value is I18nMessageValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return true;
  }

  if (Array.isArray(value)) {
    return value.every(isI18nMessageValue);
  }

  if (!isRecord(value)) {
    return false;
  }

  return Object.values(value).every(isI18nMessageValue);
}

function isI18nMessageObject(value: unknown): value is I18nMessageObject {
  return isRecord(value) && Object.values(value).every(isI18nMessageValue);
}

function isLocaleCode(value: string): boolean {
  return LOCALE_PATTERN.test(value);
}

function normalizeLocaleCode(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, "-");
}

async function getRemoteMessagesFile(
  locale: string,
  options?: RemoteI18nOptions,
): Promise<RemoteMessagesFile> {
  const normalized = normalizeLocaleCode(locale);
  if (!isLocaleCode(normalized)) {
    throw new ArcI18nError("INVALID_LOCALE", `Invalid locale "${locale}".`, {
      details: { locale },
    });
  }

  const baseUrl = resolveBaseUrl(options);
  const cacheTtlMs = resolveCacheTtlMs(options);
  const cacheKey = `${baseUrl}:${normalized}`;

  const cached = remoteMessagesFileCache.get(cacheKey);
  if (isCacheValid(cached)) return cached.value;

  const config = await getLocaleConfig(options);
  const path = resolveMessagePath(config, normalized);
  const sourceUrl = `${baseUrl}/${path}`;
  const payload = await fetchJson<unknown>(sourceUrl, options);
  const messageFile = toRemoteMessagesFile(payload, sourceUrl);

  remoteMessagesFileCache.set(cacheKey, {
    value: messageFile,
    expiresAt: Date.now() + cacheTtlMs,
  });

  return messageFile;
}

export async function getLocaleLabel(
  locale: string,
  options?: RemoteI18nOptions,
): Promise<string> {
  const normalized = normalizeLocaleCode(locale);
  const messageFile = await getRemoteMessagesFile(normalized, options);
  const metaName = messageFile.meta.name.trim();
  return metaName === "" ? normalized : metaName;
}

export async function getLocaleOptions(
  locales: readonly string[],
  options?: RemoteI18nOptions,
): Promise<LocaleOption[]> {
  const seen = new Set<string>();
  const normalizedLocales: string[] = [];

  for (const locale of locales) {
    const value = normalizeLocaleCode(locale);
    if (value === "" || seen.has(value)) continue;
    if (!isLocaleCode(value)) {
      throw new ArcI18nError("INVALID_LOCALE", `Invalid locale "${locale}".`, {
        details: { locale },
      });
    }

    seen.add(value);
    normalizedLocales.push(value);
  }

  const labels = await Promise.all(
    normalizedLocales.map((value) => getLocaleLabel(value, options)),
  );

  return normalizedLocales.map((value, index) => ({
    value,
    label: labels[index],
  }));
}

function toNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function resolveBaseUrl(options?: RemoteI18nOptions): string {
  const envBaseUrl = process.env.ARCSTUDIO_I18N_BASE_URL;
  const resolved = options?.baseUrl ?? envBaseUrl ?? DEFAULT_BASE_URL;

  if (typeof resolved !== "string" || resolved.trim() === "") {
    throw new ArcI18nError("INVALID_CONFIG", "Invalid i18n base URL.", {
      details: { value: resolved },
    });
  }

  return resolved.trim().replace(/\/+$/, "");
}

function resolveCacheTtlMs(options?: RemoteI18nOptions): number {
  const envTtl = toNumber(process.env.ARCSTUDIO_I18N_CACHE_TTL_MS);
  const ttl = options?.cacheTtlMs ?? envTtl ?? DEFAULT_CACHE_TTL_MS;

  if (!Number.isFinite(ttl) || ttl < 0) {
    throw new ArcI18nError("INVALID_CONFIG", "Invalid i18n cache TTL.", {
      details: { ttl },
    });
  }

  return ttl;
}

function resolveFetcher(options?: RemoteI18nOptions): FetchLike {
  if (options?.fetcher) return options.fetcher;

  const globalFetch = globalThis.fetch as unknown;
  if (typeof globalFetch !== "function") {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      "No fetch implementation available for @arcstudio/i18n.",
    );
  }

  return globalFetch as FetchLike;
}

function isCacheValid<T>(entry?: CacheEntry<T>): entry is CacheEntry<T> {
  return Boolean(entry && entry.expiresAt > Date.now());
}

function parseJsonWithComments<T>(raw: string, url: string): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    try {
      const stripped = stripJsonComments(raw);
      return JSON.parse(stripped) as T;
    } catch (error) {
      throw new ArcI18nError("PARSE_FAILED", `Failed to parse JSON from ${url}`, {
        cause: error,
        details: { url },
      });
    }
  }
}

async function fetchJson<T>(
  url: string,
  options?: RemoteI18nOptions,
): Promise<T> {
  const fetcher = resolveFetcher(options);

  let response: Response;
  try {
    response = await fetcher(url, { cache: "no-store" });
  } catch (error) {
    throw new ArcI18nError("FETCH_FAILED", `Failed to fetch ${url}`, {
      cause: error,
      details: { url },
    });
  }

  if (!response.ok) {
    throw new ArcI18nError(
      "FETCH_FAILED",
      `Request failed for ${url} (${response.status} ${response.statusText})`,
      {
        details: {
          url,
          status: response.status,
          statusText: response.statusText,
        },
      },
    );
  }

  const raw = await response.text();
  return parseJsonWithComments<T>(raw, url);
}

function toRemoteLocaleConfig(
  value: unknown,
  sourceUrl: string,
): RemoteLocaleConfig {
  if (!isRecord(value)) {
    throw new ArcI18nError("INVALID_CONFIG", "Invalid locale.json payload.", {
      details: { sourceUrl },
    });
  }

  const meta = value.meta;
  const locales = value.locales;

  if (!isRecord(meta) || typeof locales !== "string") {
    throw new ArcI18nError("INVALID_CONFIG", "Invalid locale.json structure.", {
      details: { sourceUrl },
    });
  }

  const type = meta.type;
  const defaultLang = meta.defaultLang;
  const version = meta.version;

  if (
    typeof type !== "string" ||
    typeof defaultLang !== "string" ||
    typeof version !== "string"
  ) {
    throw new ArcI18nError("INVALID_CONFIG", "Invalid locale.json meta values.", {
      details: { sourceUrl },
    });
  }

  if (!isLocaleCode(defaultLang)) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      `Invalid default locale "${defaultLang}" in locale.json.`,
      {
        details: { sourceUrl, defaultLang },
      },
    );
  }

  if (!locales.includes("{locale}")) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      'locale.json "locales" must include "{locale}" placeholder.',
      {
        details: { sourceUrl, locales },
      },
    );
  }

  return {
    meta: { type, defaultLang, version },
    locales,
  };
}

function toRemoteMessagesFile(value: unknown, sourceUrl: string): RemoteMessagesFile {
  if (!isRecord(value)) {
    throw new ArcI18nError("INVALID_CONFIG", "Invalid messages payload.", {
      details: { sourceUrl },
    });
  }

  const meta = value.meta;
  const messages = value.messages;

  if (!isRecord(meta) || !isRecord(messages)) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      "Invalid messages file structure. Expected {meta, messages}.",
      {
        details: { sourceUrl },
      },
    );
  }

  const name = meta.name;
  const author = meta.author;
  if (
    typeof name !== "string" ||
    !isRecord(author) ||
    typeof author.name !== "string" ||
    typeof author.url !== "string"
  ) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      "Invalid messages.meta structure. Expected {name, author{name,url}}.",
      { details: { sourceUrl } },
    );
  }

  const webMessages = messages.web;
  const authMessages = messages.auth;

  if (!isI18nMessageObject(webMessages) || !isI18nMessageObject(authMessages)) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      'Invalid messages scopes. Expected "messages.web" and "messages.auth" as objects.',
      { details: { sourceUrl } },
    );
  }

  return {
    meta: {
      name,
      author: {
        name: author.name,
        url: author.url,
      },
    },
    messages: {
      web: webMessages,
      auth: authMessages,
    },
  };
}

function resolveMessagePath(config: RemoteLocaleConfig, locale: string): string {
  if (!isLocaleCode(locale)) {
    throw new ArcI18nError("INVALID_LOCALE", `Invalid locale "${locale}".`, {
      details: { locale },
    });
  }

  const resolved = config.locales.replace("{locale}", locale).replace(/^\/+/, "");
  if (resolved === config.locales || resolved.includes("..")) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      "Invalid message path resolved from locale.json.",
      {
        details: { template: config.locales, locale, resolved },
      },
    );
  }

  return resolved;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function splitTemplateByLocale(template: string): { before: string; after: string } {
  const marker = "{locale}";
  const markerIndex = template.indexOf(marker);
  if (markerIndex === -1) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      'locale.json "locales" must include "{locale}" placeholder.',
      { details: { template } },
    );
  }

  return {
    before: template.slice(0, markerIndex),
    after: template.slice(markerIndex + marker.length),
  };
}

interface GitHubRawInfo {
  owner: string;
  repo: string;
  ref: string;
  rootPath: string;
}

function parseRawGitHubBase(baseUrl: string): GitHubRawInfo {
  const match = baseUrl.match(
    /^https:\/\/raw\.githubusercontent\.com\/([^/]+)\/([^/]+)\/([^/]+)(?:\/(.*))?$/,
  );

  if (!match) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      "Unsupported ARCSTUDIO_I18N_BASE_URL. Expected raw.githubusercontent.com format.",
      { details: { baseUrl } },
    );
  }

  return {
    owner: match[1],
    repo: match[2],
    ref: match[3],
    rootPath: (match[4] ?? "").replace(/^\/+|\/+$/g, ""),
  };
}

function buildLocaleFilenameMatcher(template: string): RegExp {
  const { before, after } = splitTemplateByLocale(template);
  const placeholder = "__ARCSTUDIO_LOCALE__";
  const normalizedTemplate = template
    .replace("{locale}", placeholder)
    .replace(/^\/+/, "");
  const escapedPlaceholder = escapeRegExp(placeholder);
  const escapedPathTemplate = escapeRegExp(normalizedTemplate);
  const filePathMatcher = new RegExp(
    `^/?${escapedPathTemplate.replace(escapedPlaceholder, "([a-z0-9-]+)")}$`,
  );

  // Keep before/after parsed/validated to guarantee predictable matching behavior.
  if (before === "" && after === "") {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      'Invalid "locales" template. "{locale}" cannot be the entire filename without extension/path.',
      { details: { template } },
    );
  }

  return filePathMatcher;
}

function collectMatchedLocales(
  values: readonly string[],
  matcher: RegExp,
): string[] {
  return [...new Set(
    values
      .map((value) => value.match(matcher)?.[1] ?? "")
      .filter((locale) => locale !== "" && isLocaleCode(locale)),
  )].sort();
}

interface JsDelivrFlatFileEntry {
  name: string;
}

function toJsDelivrFlatFileNames(value: unknown, sourceUrl: string): string[] {
  if (!isRecord(value) || !Array.isArray(value.files)) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      "Invalid jsDelivr flat payload. Expected {files: []}.",
      { details: { sourceUrl } },
    );
  }

  const entries: JsDelivrFlatFileEntry[] = [];
  for (const item of value.files) {
    if (!isRecord(item)) continue;
    if (typeof item.name !== "string") continue;
    entries.push({ name: item.name });
  }

  return entries.map((entry) => entry.name);
}

function relativizePathByRootPath(path: string, rootPath: string): string | null {
  const normalizedRootPath = rootPath.replace(/^\/+|\/+$/g, "");
  if (normalizedRootPath === "") return path;

  const rootPrefix = `/${normalizedRootPath}`;
  if (path === rootPrefix) return "/";
  if (!path.startsWith(`${rootPrefix}/`)) return null;

  return path.slice(rootPrefix.length);
}

async function getAvailableLocalesFromJsDelivr(
  info: GitHubRawInfo,
  filePathMatcher: RegExp,
  options?: RemoteI18nOptions,
): Promise<string[]> {
  const packageId = `${info.owner}/${info.repo}@${encodeURIComponent(info.ref)}`;
  const sourceUrl = `https://data.jsdelivr.com/v1/package/gh/${packageId}/flat`;
  const payload = await fetchJson<unknown>(sourceUrl, options);
  const names = toJsDelivrFlatFileNames(payload, sourceUrl);
  const relativeNames = names
    .map((name) => relativizePathByRootPath(name, info.rootPath))
    .filter((name): name is string => name !== null);

  return collectMatchedLocales(relativeNames, filePathMatcher);
}

function resolveEffectiveDefaultLocale(
  configuredDefault: string,
  locales: readonly string[],
): string {
  if (locales.includes(configuredDefault)) {
    return configuredDefault;
  }

  const firstAvailable = locales[0];
  if (!firstAvailable) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      "No locales available to resolve default locale.",
      { details: { configuredDefault, locales } },
    );
  }

  return firstAvailable;
}

export async function getAvailableLocales(
  options?: RemoteI18nOptions,
): Promise<string[]> {
  const baseUrl = resolveBaseUrl(options);
  const cacheTtlMs = resolveCacheTtlMs(options);

  const cached = remoteLocalesCache.get(baseUrl);
  if (isCacheValid(cached)) return cached.value;

  const config = await getLocaleConfig(options);
  const githubInfo = parseRawGitHubBase(baseUrl);
  const filePathMatcher = buildLocaleFilenameMatcher(config.locales);

  const locales = await getAvailableLocalesFromJsDelivr(
    githubInfo,
    filePathMatcher,
    options,
  );

  if (locales.length === 0) {
    throw new ArcI18nError("INVALID_CONFIG", "No locales found from remote messages directory.", {
      details: {
        baseUrl,
        template: config.locales,
      },
    });
  }

  remoteLocalesCache.set(baseUrl, {
    value: locales,
    expiresAt: Date.now() + cacheTtlMs,
  });

  return locales;
}

export async function getRemoteRoutingConfig(
  options?: RemoteI18nOptions,
): Promise<RemoteRoutingConfig> {
  const [localeConfig, locales] = await Promise.all([
    getLocaleConfig(options),
    getAvailableLocales(options),
  ]);

  return {
    locales,
    defaultLocale: resolveEffectiveDefaultLocale(
      localeConfig.meta.defaultLang,
      locales,
    ),
  };
}

export async function getLocaleConfig(
  options?: RemoteI18nOptions,
): Promise<RemoteLocaleConfig> {
  const baseUrl = resolveBaseUrl(options);
  const cacheTtlMs = resolveCacheTtlMs(options);

  const cached = localeConfigCache.get(baseUrl);
  if (isCacheValid(cached)) return cached.value;

  const sourceUrl = `${baseUrl}/locale.json`;
  const payload = await fetchJson<unknown>(sourceUrl, options);
  const config = toRemoteLocaleConfig(payload, sourceUrl);

  localeConfigCache.set(baseUrl, {
    value: config,
    expiresAt: Date.now() + cacheTtlMs,
  });

  return config;
}

export async function resolveLocale(params: ResolveLocaleParams): Promise<string> {
  const { requestedLocale, allowedLocales, fallbackLocale, ...options } = params;

  if (!Array.isArray(allowedLocales) || allowedLocales.length === 0) {
    throw new ArcI18nError(
      "INVALID_CONFIG",
      "allowedLocales must contain at least one locale.",
    );
  }

  const normalizedAllowedLocales = allowedLocales.filter(isLocaleCode);
  if (requestedLocale && normalizedAllowedLocales.includes(requestedLocale)) {
    return requestedLocale;
  }

  const config = await getLocaleConfig(options);
  if (normalizedAllowedLocales.includes(config.meta.defaultLang)) {
    return config.meta.defaultLang;
  }

  return fallbackLocale;
}

export async function getScopedMessages<TScope extends I18nScope>(
  params: GetScopedMessagesParams & { scope: TScope },
): Promise<RemoteMessagesByScope[TScope]> {
  const { locale, scope, ...options } = params;
  const normalizedLocale = normalizeLocaleCode(locale);
  if (!isLocaleCode(normalizedLocale)) {
    throw new ArcI18nError("INVALID_LOCALE", `Invalid locale "${locale}".`, {
      details: { locale },
    });
  }

  const baseUrl = resolveBaseUrl(options);
  const cacheTtlMs = resolveCacheTtlMs(options);
  const cacheKey = `${baseUrl}:${normalizedLocale}:${scope}`;

  const cached = scopedMessagesCache.get(cacheKey);
  if (isCacheValid(cached)) return cached.value;

  const messageFile = await getRemoteMessagesFile(normalizedLocale, options);
  const scopedMessages = messageFile.messages[scope];
  if (!isI18nMessageObject(scopedMessages)) {
    throw new ArcI18nError(
      "SCOPE_NOT_FOUND",
      `Scope "${scope}" not found for locale "${normalizedLocale}".`,
      { details: { scope, locale: normalizedLocale } },
    );
  }

  scopedMessagesCache.set(cacheKey, {
    value: scopedMessages,
    expiresAt: Date.now() + cacheTtlMs,
  });

  return scopedMessages;
}
