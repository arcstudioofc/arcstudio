"use client";

import Link from "next/link";
import { FaGithub, FaDiscord } from "react-icons/fa";
// import { useSession } from "next-auth/react";

import ARCStudioTitle from "@/components/config/title";
import { settings } from "@/lib/settings";
import { FaInstagram, FaXTwitter } from "react-icons/fa6";

export default function Footer() {
  // const { data: session } = useSession();

  return (
    <footer className="select-none w-full py-14 bg-[#0a121d6b] border-t border-grid-line backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="flex justify-center ">
            <ARCStudioTitle />
          </Link>
          {/* {!session ? (
            <div className="flex justify-center mt-4">
              <a
                href="/auth/login"
                className="inline-flex items-center gap-2 px-6 py-2 rounded-md bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-white transition text-sm font-medium"
              >
                <FaDiscord size={18} />
                Entrar com Discord
              </a>
            </div>
          ) : (
            ""
          )} */}
          <div className="mt-10 mb-10 border-b border-grid-line"></div>
          <div className="flex space-x-10 justify-center items-center mb-14">
            <Link
              href={settings.links.github}
              className="block transition-all duration-500 hover:text-blue-800"
              aria-label="GitHub"
            >
              <FaGithub className="w-[1.688rem] h-[1.688rem]" />
            </Link>

            <Link
              href={settings.links.discord}
              className="block transition-all duration-500 hover:text-blue-800"
              aria-label="Discord"
            >
              <FaDiscord className="w-[1.688rem] h-[1.688rem]" />
            </Link>

            <Link
              href={settings.links.instagram}
              className="block transition-all duration-500 hover:text-blue-800"
              aria-label="Instagram"
            >
              <FaInstagram className="w-[1.688rem] h-[1.688rem]" />
            </Link>

            <Link
              href={settings.links.twitter}
              className="block transition-all duration-500 hover:text-blue-800"
              aria-label="Twitter (X)"
            >
              <FaXTwitter className="w-[1.688rem] h-[1.688rem]" />
            </Link>
          </div>
          <span className="text-lg text-gray-500 text-center block">
            ©{" "}
            <Link href="/">
              <ARCStudioTitle />, Inc.
            </Link>{" "}
            2025, Todos os direitos reservados.
          </span>
          <span className="text-sm text-gray-500 text-center block mt-2">
            Desenvolvido com ❤️ por{" "}
            <Link
              className="hover:underline"
              href="https://github.com/yeytaken/"
            >
              {settings.author}
            </Link>
            .
          </span>
          {/* Versão no canto inferior direito */}
          <Link
            href={"https://github.com/yeyTaken/arc-studio/tree/main/apps/website/arcstudio"}
            className="hover:underline absolute bottom-2 right-4 text-sm text-gray-500"
          >
            v{settings.version}
          </Link>{" "}
        </div>
      </div>
    </footer>
  );
}
