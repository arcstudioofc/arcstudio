"use client";

import Image from "next/image";
import Link from "next/link";
import { TfiNewWindow } from "react-icons/tfi";
import { useSession } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <>
      <div className="flex min-h-screen items-center justify-center px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl w-full">
          {/* Ícone */}
          <div className="flex items-center justify-center order-1 md:order-2">
            <Image
              src="/images/icone.png"
              alt="Ícone do site"
              width={300}
              height={300}
              className="select-none w-[220px] h-[220px] sm:w-[300px] sm:h-[300px] md:w-[360px] md:h-[360px] object-contain"
              priority
            />
          </div>

          {/* Texto */}
          <div className="flex flex-col justify-center text-center md:text-left order-2 md:order-1 w-full max-w-sm mx-auto md:max-w-none">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
              Quer tirar sua ideia do papel?
            </h1>
            <p className="text-base sm:text-lg text-gray-500 mb-2">
              Seu projeto merece o melhor — vamos torná-lo realidade com
              inovação e dedicação.
            </p>
            <p className="text-base sm:text-lg text-gray-500 mb-5">
              Conheça nossa{" "}
              <Link href="/team" className="text-blue-600 underline">
                Equipe
              </Link>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                href={session?.user?.name ? `/app/profile/${session.user.name}` : '/app'}
                className="select-none px-6 py-2 rounded-xl border border-blue-600 text-blue-600 hover:bg-grid-line transition cursor-pointer inline-flex items-center gap-2 justify-center"
              >
                Seu perfil <TfiNewWindow />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
