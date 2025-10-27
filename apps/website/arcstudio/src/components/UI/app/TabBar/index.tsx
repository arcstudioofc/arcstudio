"use client";

import {
  FaHome,
  FaSearch,
  FaPlusSquare,
  FaHeart,
  FaUser,
} from "react-icons/fa";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { IUser } from "@/lib/database/mongoose/models/User";

export default function TabBar() {
  const { data: session } = useSession();

  const [user, setDbUser] = useState<IUser | null>(null);

  // Buscar usuário no banco
  useEffect(() => {
    if (!session?.user?.email) return;

    (async () => {
      try {
        const res = await fetch(`/api/user?email=${session.user.email}`);
        const data = await res.json();
        setDbUser(data.user);
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      }
    })();
  }, [session]);
  const icons = [
    { icon: <FaHome size={24} />, href: "/app" },
    { icon: <FaSearch size={24} />, href: "/app/profile" },
    { icon: <FaPlusSquare size={24} />, href: "/app/profile/publish-project" },
    // {
    //   icon: <FaHeart size={24} />,
    //   href: `/app/profile/${user?.name}/notifications`,
    // },
    { icon: <FaUser size={24} />, href: `${session?.user ? `/app/profile/${user?.name}` : "/app/profile"}` },
  ];

  return (
<nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-background/70 backdrop-blur-md border border-grid-line rounded-xl px-6 py-2 flex justify-between w-[90%] max-w-md z-50">
  {icons.map((item, index) => (
    <Link
      key={index}
      href={item.href}
      className="flex justify-center items-center"
    >
      <div className="p-2 rounded-full hover:text-blue-300 transition-colors cursor-pointer">
        {item.icon}
      </div>
    </Link>
  ))}
</nav>

  );
}
