"use client";

import SessionGuard from "@/components/config/auth/SessionGuard";

export default function App() {
  return (
    <SessionGuard>
      {({ data: session }) => (
        <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
          <h1>Logado</h1>
        </div>
      )}
    </SessionGuard>
  );
}
