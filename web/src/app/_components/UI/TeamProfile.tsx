import Image from "next/image";
import NextLink from "next/link";
import { FaGithub, FaLink } from "react-icons/fa";

import { Link } from "@/lib/i18n/navigation";

// Agora totalmente responsivo e preparado para 1 ou 100 membros.
// Basta usar este componente dentro de um grid.

export default function TeamProfile({ member }: TeamProfileProps) {
    return (
        <div className="w-full max-w-sm mx-auto shadow-lg dark:shadow-black/40 rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
            <Link href={`/team?username=${member.username}`} className="block">
                {/* IMAGE */}
                <div className="relative w-full h-64">
                    <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                    />
                </div>

                <div className="p-6 pb-4">
                    {/* NAME */}
                    <h2 className="text-center text-xl font-bold">{member.name}</h2>

                    {/* ROLES */}
                    <p className="text-center text-sm mt-1 text-gray-600 dark:text-gray-300">
                        {member.info.role.join(", ")}
                    </p>
                </div>
            </Link>

            {/* LINKS */}
            <div className="flex justify-center text-center pb-6 space-x-6">
                {member.links?.github && (
                    <NextLink
                        href={member.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaGithub className="text-xl hover:text-blue-600 transition-colors duration-150" />
                    </NextLink>
                )}
                {member.links?.portfolio && (
                    <NextLink
                        href={member.links.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <FaLink className="text-xl hover:text-blue-600 transition-colors duration-150" />
                    </NextLink>
                )}
            </div>
        </div>
    );
}
