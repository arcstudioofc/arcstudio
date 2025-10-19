"use client";

import { SessionProvider } from "next-auth/react";
import { HeroUIProvider } from "@heroui/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider><HeroUIProvider>{children}</HeroUIProvider></SessionProvider>;
}