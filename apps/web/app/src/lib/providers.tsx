"use client";

// import { useRouter } from "next/navigation";
import { HeroUIProvider } from "@heroui/react";
import { useState } from "react";

import { ThemeProvider } from "./theme";
import { useLocale } from "@/lib/i18n";
import { Loading } from "@/components/Loading";
// import { useSession } from "./auth";

export function Providers({ children }: { children: React.ReactNode }) {
  // const { data: session, isPending } = useSession();

  const { locale } = useLocale();
  const [messages, setMessages] = useState<Record<string, string> | null>(null);
  const [loadingComplete, setLoadingComplete] = useState(false);
  // const router = useRouter();

  // useEffect(() => {
  //   if (isPending) return;

  //   if (session && !session.user.emailVerified) {
  //     router.replace("/auth/check-email");
  //   }
  // }, [isPending, session, router]);


  const steps = [
    {
      name: "i18n",
      loader: async () => {
        const data = await import(`@/lib/i18n/messages/${locale}.json`);
        setMessages(data.default);
      },
    }
    // Futuramente você pode adicionar mais:
    // { name: "Auth", loader: async () =>console.log("aaaaa") },
    // { name: "API", loader: async () => console.log("oi") },
  ];

  // Enquanto não carregar tudo, mostra o Loading
  if (!loadingComplete || !messages) {
    return <Loading steps={steps} onFinish={() => setLoadingComplete(true)} />;
  }

  // Quando tudo estiver pronto, renderiza o layout
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <HeroUIProvider>
        <main>{children}</main>
      </HeroUIProvider>
    </ThemeProvider>
  );
}
