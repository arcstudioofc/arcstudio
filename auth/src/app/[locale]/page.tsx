"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCircle } from "react-icons/fa";
import { useTranslations } from "next-intl";

import { UserSession } from "../_components/auth/session";
import { SigninSection } from "../_components/auth/signin";
import { SignupSection } from "../_components/auth/signup";

import { auth } from "@/lib/auth";

type ApiStatus = "loading" | "online" | "error";

export default function HomePage() {
  const t = useTranslations("Home");

  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const authParam = searchParams.get("auth");
  const callback = searchParams.get("callback");

  const [apiVersion, setApiVersion] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<ApiStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      setApiStatus("error");
      controller.abort();
    }, 10000);

    fetch(process.env.NEXT_PUBLIC_API_URL + "/about", {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setApiVersion(data.version);
        setApiStatus("online");
      })
      .catch(() => {
        setApiStatus("error");
      })
      .finally(() => clearTimeout(timeout));
  }, []);

  const { data: session, isPending } = auth.useSession();

  useEffect(() => setMounted(true), []);

  const currentTheme = theme === "system" ? systemTheme : theme;
  const iconSrc =
    mounted && currentTheme === "dark"
      ? "/images/dark/arcstudioofc.png"
      : "/images/arcstudioofc.png";

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  if (session?.user) {
    return <UserSession user={session.user} />;
  }

  const statusStyles = {
    online: {
      bg: "bg-green-500/15 border-green-500/30",
      text: "text-green-700 dark:text-green-400",
      pulse: ["#166534", "#22c55e", "#166534"],
      label: `v${apiVersion}`,
    },
    loading: {
      bg: "bg-yellow-500/15 border-yellow-500/30",
      text: "text-yellow-600 dark:text-yellow-400",
      pulse: ["#854d0e", "#eab308", "#854d0e"],
      label: t("checkingConnection"),
    },
    error: {
      bg: "bg-red-500/15 border-red-500/30",
      text: "text-red-600 dark:text-red-400",
      pulse: ["#7f1d1d", "#ef4444", "#7f1d1d"],
      label: t("error"),
    },
  }[apiStatus];

  return (
    <section className="min-h-screen grid grid-cols-1 md:grid-cols-2 relative">
      <div className="flex items-center justify-center px-6">
        {authParam === "signup" ? (
          <SignupSection callback={callback!} />
        ) : (
          <SigninSection callback={callback!} />
        )}
      </div>

      <div className="hidden md:flex items-center justify-center">
        <Image
          src={iconSrc}
          alt="ARC Studio"
          width={510}
          height={600}
          priority
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 font-mono">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`flex items-center gap-2 px-3 py-1 rounded-full backdrop-blur border ${statusStyles.bg}`}
        >
          <motion.span
            animate={{
              opacity: [0.4, 1, 0.4],
              color: statusStyles.pulse,
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <FaCircle size={8} />
          </motion.span>

          <span className={`text-xs ${statusStyles.text}`}>
            {statusStyles.label}
          </span>
        </motion.div>

        <span className="text-[11px] text-muted-foreground text-center">
          &copy; ARC Studio · {t("authSystem")} ·{" "}
          <a
            href="https://arcstudio.online"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary/80 transition-colors"
          >
            arcstudio.online
          </a>
        </span>
      </div>
    </section>
  );
}
