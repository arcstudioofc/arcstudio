import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getMessages, getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";

import "../../../public/styles/globals.css";
import { ProvidersWrapper } from "@/lib/providers"; // wrapper client
import { routing } from "@/lib/i18n/routing";
import { settings } from "@/lib";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Home");

  return {
    metadataBase: new URL("https://arcstudio.online" ),
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

interface Props {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: Props ) {
  const { locale } = await params;
  const messages = await getMessages();

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning className="h-full overflow-hidden">
      <body className="antialiased h-full w-full relative overflow-hidden">
        {/* Background Grid Adaptativo */}
        <div
          className="fixed inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 0",
            opacity: 0.1, // Ajuste a opacidade para o grid não ficar muito forte
            maskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
            `,
            WebkitMaskImage: `
              repeating-linear-gradient(
                to right,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              repeating-linear-gradient(
                to bottom,
                black 0px,
                black 3px,
                transparent 3px,
                transparent 8px
              ),
              radial-gradient(ellipse 70% 60% at 50% 0%, #000 60%, transparent 100%)
            `,
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}
        />

        <ProvidersWrapper locale={locale} messages={messages}>
          {children}
        </ProvidersWrapper>
      </body>
    </html>
  );
}
