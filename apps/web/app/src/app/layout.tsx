import type { Metadata } from "next";
// import { getMessages } from "next-intl/server";


import "../../public/styles/globals.css";
import { Providers } from "@/lib/providers";
import { settings } from "@/lib";

export const metadata: Metadata = {
  metadataBase: new URL(settings.links.app),
  title: {
    default: settings.name,
    template: `${settings.name} — %s`,
  },
  authors: [{ name: settings.author, url: "https://github.com/yeytaken" }],
  creator: settings.author,
  icons: { icon: "/favicon.ico" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // const { locale } = await params;
  // const messages = await getMessages();

  return (
    <html lang={"pt"} suppressHydrationWarning>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
