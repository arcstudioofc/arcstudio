"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { NextIntlClientProvider } from "next-intl";
import Icon from "@/widgets/Icon";
import LocaleSwitcher from "@/widgets/switcher/locale";
import ThemeSwitcher from "@/widgets/switcher/theme";
import { ThemeProvider } from "./theme";
// import { Footer } from "@/components/UI/Footer";
// import { Navbar } from "@/components/UI/Navbar";

export function ProvidersWrapper({
  children,
  locale,
  messages,
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, string>;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="America/Sao_Paulo"
      >
        <HeroUIProvider>
          <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
            {/* Container que contém a Navbar e o conteúdo rolável */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* <Navbar /> */}
              <ToastProvider />

              {/* Área de conteúdo rolável - a scrollbar fica aqui, abaixo do Header e Navbar */}
              <main className="flex-1 overflow-y-auto flex flex-col relative z-10">
                <div className="flex-grow flex flex-col">{children}</div>
                <footer className="border-t border-foreground/10 bg-background/80 backdrop-blur">
                  <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 px-4 py-3">
                    <Icon />
                    <div className="h-5 w-px bg-foreground/20" />
                    <LocaleSwitcher />
                    <ThemeSwitcher />
                  </div>
                </footer>
              </main>
            </div>
          </div>
        </HeroUIProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
