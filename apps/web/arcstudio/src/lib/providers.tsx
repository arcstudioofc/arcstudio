"use client";

import { NextIntlClientProvider } from "next-intl";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "./theme";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import { CommandPalette } from "@/app/_components/CommandPalette";

export function ProvidersWrapper({
  children,
  locale,
  messages
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, string>;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Sao_Paulo">
        <HeroUIProvider>
          <ToastProvider />
          <Navbar />
          <main>{children}</main>
          <CommandPalette />
          <Footer />
        </HeroUIProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
