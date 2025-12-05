"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { FaGhost } from "react-icons/fa";
import { useTranslations } from "next-intl";

export default function NotFound() {
    const pathName = usePathname();
    const t = useTranslations("NotFound");

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center gap-6 p-8"
            >
                <FaGhost className="text-8xl text-indigo-400 animate-bounce" />

                <h1 className="text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">
                    404
                </h1>

                <h2 className="text-3xl font-semibold">
                    {t("title")}
                </h2>

                <div className="flex flex-wrap justify-center items-center gap-2 text-xl opacity-80 mt-2">
                    <p>{t("prefix")}</p>
                    <span
                        className="text-base font-mono bg-indigo-500/20 text-primary px-3 py-1 rounded-full border border-indigo-500/50 break-all"
                    >
                        {pathName}
                    </span>
                    <p>{t("suffix")}</p>
                </div>

                <Link
                    href="/"
                    className="mt-6 px-6 py-3 text-lg font-medium text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition duration-300 ease-in-out transform hover:scale-105"
                >
                    {t("backHome")}
                </Link>
            </motion.div>
        </div>
    );
}
