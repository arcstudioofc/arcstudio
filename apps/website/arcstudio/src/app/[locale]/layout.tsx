import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server"; 
import { hasLocale } from "next-intl";

import "../../../public/styles/globals.css";
import { Providers } from "@/lib/providers";
import { routing } from "@/lib/i18n/routing";
import { settings } from "@/lib";

export async function generateMetadata({
  // params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  
  const t = await getTranslations("Home"); 

  return {
    metadataBase: new URL("https://arcstudio.online"),
    title: {
      default: settings.name,
      template: `${settings.name} — %s`, 
    },
    description: t("metaDescription"), 
    authors: [{ name: settings.author, url: "https://github.com/yeytaken" }],
    creator: settings.author,
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased">
        <Providers locale={locale} messages={messages}>
          {children}
        </Providers>
      </body>
    </html>
  );
}