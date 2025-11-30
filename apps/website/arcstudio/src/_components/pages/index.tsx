"use client";

import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { TfiNewWindow } from "react-icons/tfi";
import { useTranslations } from "next-intl";

export default function Home() {
  const { theme, systemTheme } = useTheme();
  const t = useTranslations("Home");

  const currentTheme = theme === "system" ? systemTheme : theme;

  const iconSrc =
    currentTheme === "dark"
      ? "/images/dark/arcstudioofc.png"
      : "/images/arcstudioofc.png";

  return (
    <>
      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl w-full">
          {/* Ícone */}
          <div className="flex items-center justify-center order-1 md:order-2">
            <Image
              src={iconSrc}
              alt={"arcstudioofc"}
              width={400}
              height={400}
              className="
                select-none
                w-[260px] h-[260px]
                sm:w-[330px] sm:h-[330px]
                md:w-[400px] md:h-[400px]
                object-contain
              "
              priority
            />
          </div>

          {/* Texto */}
          <div className="flex flex-col justify-center text-center md:text-left order-2 md:order-1 w-full max-w-sm mx-auto md:max-w-none">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              {t("title")}
            </h1>
            <p className="text-base sm:text-lg text-gray-500 mb-2">
              {t("description")}
            </p>
            <p className="text-base sm:text-lg text-gray-500 mb-5">
              {t("meetOur")}{" "}
              <Link href="/team" className="text-blue-600 underline">
                {t("team")}
              </Link>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href={"/app"}
                className="select-none px-6 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-grid-line hover:bg-blue-600/50 hover:text-foreground transition cursor-pointer inline-flex items-center gap-2 justify-center"
              >
                {t("yourProfile")} <TfiNewWindow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}