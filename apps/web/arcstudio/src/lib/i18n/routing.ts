import {defineRouting} from 'next-intl/routing';

export const defaultLocale = 'en-us';

export const routing = defineRouting({
  locales: [defaultLocale, 'pt-br'],

  // rotas customizadas (opcional)
  // pathnames: {
  //   "/team": {
  //     "en-us": "/team",
  //     "pt-br": "/equipe"
  //   }
  // },
 
  defaultLocale: defaultLocale
});