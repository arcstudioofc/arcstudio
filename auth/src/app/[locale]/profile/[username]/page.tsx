"use client";

import { useTranslations } from "next-intl";

import { UserSession } from "@/app/_components/auth/session";

import { auth } from "@/lib/auth";

const guestUser = {
  id: "guest",
  email: "",
  name: "",
  image: "/images/avatar-placeholder.png",
  username: "",
  role: "guest",
} as typeof auth.$Infer.Session["user"];

export default function ProfilePage() {
  const t = useTranslations("Home");
  const { data: session, isPending } = auth.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-500">{t("loading")}</p>
      </div>
    );
  }

  return <UserSession user={session?.user ?? guestUser} />;
}
