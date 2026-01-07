"use client";

import { NextIntlClientProvider } from "next-intl";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider } from "./theme";
import { Footer } from "@/components/UI/Footer";
import { Navbar } from "@/components/UI/Navbar";
import { CommandPalette } from "@/app/_components/CommandPalette";
import { WindowHeader } from "@/components/UI/electron/WindowHeader";
import { useEffect, useState } from "react";

export function ProvidersWrapper({
  children,
  locale,
  messages
}: {
  children: React.ReactNode;
  locale: string;
  messages: Record<string, string>;
}) {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !!window.windowControls) {
      setIsElectron(true);
    }
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NextIntlClientProvider locale={locale} messages={messages} timeZone="America/Sao_Paulo">
        <HeroUIProvider>
          <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
            {/* WindowHeader fixo no topo */}
            <WindowHeader />
            
            {/* Container que contém a Navbar e o conteúdo rolável */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              <Navbar />
              
              {/* Área de conteúdo rolável - a scrollbar fica aqui, abaixo do Header e Navbar */}
              <main className="flex-1 overflow-y-auto flex flex-col relative z-10">
                <div className="flex-grow flex flex-col">
                  {children}
                </div>
                {!isElectron && <Footer />}
              </main>
            </div>
            
            <ToastProvider />
            <CommandPalette />
          </div>
        </HeroUIProvider>
      </NextIntlClientProvider>
    </ThemeProvider>
  );
}
