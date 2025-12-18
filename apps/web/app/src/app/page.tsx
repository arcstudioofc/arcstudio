"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"

import { useSession, signOut } from "@/lib/auth";

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/auth/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4">
      <Image src={session?.user.image ?? "/images/avatar-placeholder.png"} alt={session?.user.name ?? "user"} height={50} width={50} />
      <p>Olá <span className="font-bold">{session?.user.name ?? "user"}</span>. {" "} {session?.user.emailVerified ? "" : "Por favor verifique seu email!"}</p>

      <button
        onClick={async () => {
          await signOut();
          router.replace("/auth/signin");
        }}
        className="rounded px-4 py-2 bg-black text-white"
      >
        Logout
      </button>
    </main>
  );
}
