import "./styles/globals.css";

import type { Metadata } from "next";

import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { siteConfig } from "@/config/site";
import { fontMono, fontSans } from "@/config/fonts";
import { Providers } from "./providers";
import Background from "@/components/ui/style/background";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `${siteConfig.name} — %s`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.links.site),
  icons: {
    icon: "./favicon.ico",
  },
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-br">
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <Providers>
          <Navbar />
          <Background />

          {/* Main content area */}
          <main className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
            {children}
          </main>

          {/* Footer normal */}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
