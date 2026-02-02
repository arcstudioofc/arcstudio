"use client";

import {
  FaSignOutAlt,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";

import { auth } from "@/lib/auth";
import type { User } from "better-auth/types";

import { Card } from "@heroui/react";
import ThemeSwitcher from "@/widgets/switcher/theme";
import LocaleSwitcher from "@/widgets/switcher/locale";
import Icon from "@/widgets/Icon";

export function UserSession({ user }: { user: User }) {
  const router = useRouter();
  const t = useTranslations("_components.auth.session");
  const locale = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 md:p-12">
      <Card className="max-w-3xl w-full p-6 md:p-8 shadow-lg bg-background/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <img
            src={user.image || "/images/avatar-placeholder.png"}
            alt={t("avatarAlt")}
            className="w-32 h-32 rounded-full border-4 border-primary/30"
          />

          <div className="space-y-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold">
              {user.name || user.email}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FaEnvelope /> {t("emailVerified")}
            </label>

            {user.emailVerified ? (
              <span className="flex items-center gap-1 text-success">
                <FaCheckCircle /> {t("yes")}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-danger">
                <FaTimesCircle /> {t("no")}
              </span>
            )}
          </div>

          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FaCalendarAlt /> {t("memberSince")}
            </label>
            <p>
              {new Date(user.createdAt).toLocaleDateString(locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold flex items-center gap-2">
              <FaCalendarAlt /> {t("lastUpdate")}
            </label>
            <p>
              {new Date(user.updatedAt).toLocaleDateString(locale, {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
          <button
            onClick={async () => {
              await auth.signOut();
              router.replace("/");
            }}
            className="px-6 py-3 border border-danger text-danger rounded-lg font-semibold hover:text-foreground hover:bg-danger/90 transition flex items-center"
          >
            <FaSignOutAlt className="mr-2" /> {t("signOut")}
          </button>

          <div className="flex items-center gap-4">
            <Icon />
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <LocaleSwitcher />
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <ThemeSwitcher />
          </div>
        </div>
      </Card>
    </div>
  );
}
