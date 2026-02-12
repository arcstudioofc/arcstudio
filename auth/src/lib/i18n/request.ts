import { getScopedMessages, resolveLocale } from "@arcstudio/i18n";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = await resolveLocale({
    requestedLocale: requested,
    allowedLocales: routing.locales,
    fallbackLocale: routing.defaultLocale,
  });
  const messages = await getScopedMessages({ locale, scope: "auth" });

  return {
    locale,
    timeZone: "America/Sao_Paulo",
    messages,
  };
});
