"use client";

import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from "@heroui/react";
import { usePathname } from "next/navigation";

import Footer from "@/components/UI/Footer";
import Navbar from "@/components/UI/navbar";
import TabBar from "@/components/UI/app/TabBar";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const InApp = pathname.startsWith("/app");

  return (
    <SessionProvider>
      <HeroUIProvider>
        {/* Navbar fora do app */}
        {!InApp && <Navbar />}

            {children}

        {/* TabBar dentro do app */}
        {InApp && <TabBar />}

        {/* Footer fora do app */}
        {!InApp && <Footer />}
      </HeroUIProvider>
    </SessionProvider>
  );
}
