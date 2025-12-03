import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaLink } from "react-icons/fa";

// Agora totalmente responsivo e preparado para 1 ou 100 membros.
// Basta usar este componente dentro de um grid.

export default function TeamProfile({ member }: TeamProfileProps) {
    return (
        <Link href={`/team?username=${member.username}`} className="w-full max-w-sm mx-auto shadow-lg dark:shadow-black/40 rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.02]">

            {/* IMAGE */}
            <div className="relative w-full h-64">
                <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="p-6">

                {/* NAME */}
                <h2 className="text-center text-xl font-bold">{member.name}</h2>

                {/* ROLES */}
                <p className="text-center text-sm mt-1 text-gray-600 dark:text-gray-300">
                    {member.info.role.join(", ")}
                </p>

                {/* LINKS */}
                <div className="flex justify-center text-center mt-4 space-x-6">
                    {member.links?.github && (
                        <Link
                            href={member.links.github}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaGithub className="text-xl hover:text-blue-600 transition-colors duration-150" />
                        </Link>
                    )}
                    {member.links?.portfolio && (
                        <Link
                            href={member.links.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <FaLink className="text-xl hover:text-blue-600 transition-colors duration-150" />
                        </Link>
                    )}
                </div>

            </div>
        </Link>
    );
}