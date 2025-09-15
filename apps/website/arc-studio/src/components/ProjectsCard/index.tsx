"use client";

import Image from "next/image";
import Link from "next/link";
import { FaThumbtack, FaUser, FaGithub } from "react-icons/fa";
import { projects } from "@/config";

export default function ProjectsCard() {
  const entries = Object.entries(projects);

  return (
    <div className="select-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {entries.map(([key, { name, uri, thumbnail, creators, github }]) => (
        <div
          key={key}
          className="relative bg-[#0f172a]/50 backdrop-blur-md border border-grid-line rounded-xl overflow-hidden shadow-md transition-shadow duration-300"
        >
          {/* Somente a imagem é clicável */}
          <Link
            href={uri}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <div className="relative w-full aspect-video overflow-hidden">
              <Image
                src={thumbnail}
                alt={name}
                width={800}
                height={450}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-101"
                unoptimized
              />
            </div>
          </Link>

          {/* Conteúdo textual (sem link, sem hover) */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{name}</h2>

              {github && (
                <Link
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ver no GitHub"
                >
                  <FaGithub className="w-6 h-6" />
                </Link>
              )}
            </div>

            <div className="flex flex-wrap mt-3 gap-2">
              <h2 className="w-full">Desenvolvido por:</h2>

              {/* Tag fixa do estúdio */}
              <span className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-900/50 text-blue-200/80 font-bold">
                <FaThumbtack className="text-blue-300/80" />
                ARC Studio
              </span>

              {/* Criadores */}
              {creators.map((creator) => (
                <span
                  key={creator}
                  className="flex items-center gap-1 px-3 py-1 text-sm rounded-full bg-blue-500/50 text-blue-100/80 font-bold"
                >
                  <FaUser className="text-blue-200/80" />
                  {creator}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
