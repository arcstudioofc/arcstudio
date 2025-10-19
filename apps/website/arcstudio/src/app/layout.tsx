import type { Metadata } from "next";

import "@/styles/globals.css";
import { settings } from "@/lib/settings";
import { Providers } from "./providers";

// UI/**/*.tsx components
import Footer from "@/components/UI/Footer";
import Navbar from "@/components/UI/navbar";
// import Background from "@/components/UI/style/background";

export const metadata: Metadata = {
  metadataBase: new URL("https://arcstudio.online"),
  title:{
    default: settings.name,
    template: `${settings.name} — %s`,
  },
  description: settings.description,
  authors: [{ name: settings.author, url: "https://github.com/yeytaken" }],
  creator: settings.author,
  icons: {
    icon: "/favicon.ico",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className='dark'>
      <body>
        <Providers>
          <Navbar />
          {/* <Background /> */}

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
