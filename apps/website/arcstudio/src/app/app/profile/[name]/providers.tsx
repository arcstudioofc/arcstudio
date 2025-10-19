"use client";

import { useSession } from "next-auth/react";

import ProfileNameMe from "@/components/pages/app/profile/[name]/me";
import ProfileName from "@/components/pages/app/profile/[name]";
import Loading from "@/components/config/auth/Loading";

export default function ProfileProvider({ user }: { user: ILeanUser }) {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loading />;

  if (user._id === session?.user?.email) {
    return <ProfileNameMe user={user} />;
  }

  return <ProfileName user={user} />;
}
