import { signIn } from "next-auth/react";

export default function NotLogin() {
  return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-gray-700">Você precisa estar logado.</p>
        <button
          onClick={() => signIn("discord")}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition"
        >
          Entrar com Discord
        </button>
      </div>
  );
}
