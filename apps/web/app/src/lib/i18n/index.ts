import { defaultLocale } from "@/lib/i18n/useLocale";

export * from "@/lib/i18n/useLocale"
export * from "@/lib/i18n/useTranslations"

export const globalLocales = [defaultLocale, "pt"] as const;
