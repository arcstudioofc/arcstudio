"use client";

import TeamProfile from "@/app/_components/UI/TeamProfile";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaLink } from "react-icons/fa";

export const teams: TeamProps[] = [
  {
    image: "/images/team/rabbi.png",
    banner: "/images/team/rabbi.png",
    name: "Israel R. Jatobá",
    username: "rabbi",
    info: {
      role: ["CEO", "CTO", "Fullstack Developer"],
    },
    links: {
      github: "https://github.com/yeytaken",
      portfolio: "https://rabbi.js.org",
    },
  },
];

export default function Team() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const username = searchParams.get("username");
  const member = teams.find((m) => m.username === username);

  if (member) {
    return (
      <div className="relative w-full min-h-screen">
        {/* Background Banner */}
        {/* <div className="absolute inset-0 -z-10 overflow-hidden h-full">
          <Image
            src={member.banner}
            alt={member.name}
            fill
            className="object-cover blur-sm"
            priority
          />
        </div> */}


        {/* Close Button */}
        <button
          onClick={() => router.push("/team")}
          className="absolute top-6 right-6 bg-black/20 text-white px-4 py-2 rounded-xl backdrop-blur-md hover:bg-black/70 transition z-20"
        >
          X
        </button>

        {/* Member Content */}
        <div className="flex flex-col items-center text-center gap-6 pt-28 pb-20 px-6 max-w-2xl mx-auto">
          <Image
            src={member.image}
            width={200}
            height={200}
            alt={member.name}
            className="rounded-4xl shadow-xl border-3 border-primary object-cover"
          />

          <h1 className="text-4xl font-bold drop-shadow-lg">{member.name}</h1>

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
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl min-h-screen py-10 px-10 mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((member) => (
          <TeamProfile key={member.username} member={member} />
        ))}
      </div>
    </div>
  );
}