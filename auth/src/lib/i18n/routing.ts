import { getRemoteRoutingConfig } from "@arcstudio/i18n";
import { defineRouting } from "next-intl/routing";

const remoteRouting = await getRemoteRoutingConfig();
export const defaultLocale = remoteRouting.defaultLocale;

export const routing = defineRouting({
  locales: remoteRouting.locales,
  defaultLocale: defaultLocale,
});
