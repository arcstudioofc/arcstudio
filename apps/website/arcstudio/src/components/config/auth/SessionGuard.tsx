"use client";

import { useSession } from "next-auth/react";
import { ReactNode } from "react";

import Loading from "./Loading";
import NotLogin from "./NotLogin";

type SessionHook = ReturnType<typeof useSession>;

interface SessionGuardProps {
  children: (sessionHook: SessionHook) => ReactNode;
}

export default function SessionGuard({ children }: SessionGuardProps) {
  const sessionHook = useSession();
  const { data: session, status } = sessionHook;

  // Loading com Framer Motion
  if (status === "loading") {
    return <Loading />
  }

  // Não logado
  if (!session) {
    return <NotLogin />;
  }

  // Logado
  return <>{children(sessionHook)}</>;
}
