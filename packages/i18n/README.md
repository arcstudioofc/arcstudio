# @arcstudio/i18n

Lib para carregar mensagens remotas do repositório `arcstudio-i18n`.

## O que a lib expõe

- `getLocaleConfig(options?)`
- `getAvailableLocales(options?)`
- `getRemoteRoutingConfig(options?)`
- `getLocaleLabel(locale)`
- `getLocaleOptions(locales)`
- `resolveLocale(params)`
- `getScopedMessages(params)`
- `ArcI18nError`

## Variáveis de ambiente

- `ARCSTUDIO_I18N_BASE_URL` (opcional)  
  Default: `https://raw.githubusercontent.com/arcstudioofc/arcstudio-i18n/main`
- `ARCSTUDIO_I18N_CACHE_TTL_MS` (opcional)  
  Default: `300000` (5 minutos)

## Exemplo com next-intl (auth)

```ts
import { getRequestConfig } from "next-intl/server";
import { getScopedMessages, resolveLocale } from "@arcstudio/i18n";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = await resolveLocale({
    requestedLocale: requested,
    allowedLocales: routing.locales,
    fallbackLocale: routing.defaultLocale,
  });

  const messages = await getScopedMessages({
    locale,
    scope: "auth",
  });

  return {
    locale,
    timeZone: "America/Sao_Paulo",
    messages,
  };
});
```

## Exemplo para `routing.ts`

```ts
import { defineRouting } from "next-intl/routing";
import { getRemoteRoutingConfig } from "@arcstudio/i18n";

const remoteRouting = await getRemoteRoutingConfig();

export const defaultLocale = remoteRouting.defaultLocale;
export const routing = defineRouting({
  locales: remoteRouting.locales,
  defaultLocale,
});
```

## Exemplo para switcher de locale

```ts
import { getLocaleLabel, getLocaleOptions } from "@arcstudio/i18n";

const options = await getLocaleOptions(["pt-br", "es-es"]);
// [{ value: "pt-br", label: "portuguese (Brasil)" }, ...]

const currentLabel = await getLocaleLabel("pt-br");
// "portuguese (Brasil)"
```

## Política de falha

Esta lib segue estratégia de **remoto obrigatório**:

- Falha de rede, parse ou estrutura inválida gera `ArcI18nError`.
- Não há fallback local automático.

## Licença

MIT © ARC Studio, Inc.
