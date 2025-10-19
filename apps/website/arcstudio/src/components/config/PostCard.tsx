"use client";

import Image from "next/image";
import Link from "next/link";
import { Avatar, Card, CardBody } from "@heroui/react";

interface PostCardProps {
  user: ILeanUser;
  postId: number;
  bannerUrl?: string;
  content?: string;
}

export default function PostCard({
  user,
  postId,
  bannerUrl,
  content = "Este é um post fictício para testar o layout do perfil. 💫",
}: PostCardProps) {

  return (
    <Card className="bg-background/80 border border-grid-line hover:bg-blue-950 transition-colors duration-200">
      {/* Banner do post */}
      {bannerUrl && (
        <div className="relative w-full h-32 rounded-t-xl overflow-hidden mb-2">
          <Image
            src={bannerUrl}
            alt={`Banner do post ${postId}`}
            fill
            className="object-cover rounded-t-xl"
          />
        </div>
      )}

      <CardBody>
        {/* Cabeçalho do post */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={user.image!} size="md" isBordered color="primary" />
          <div>
            <p className="text-white font-semibold">{user.name}</p>
            <Link
              href={"/app/profile/" + user.name}
              className="text-gray-400 text-sm cursor-pointer hover:underline"
            >
              @{user.name}
            </Link>
          </div>
        </div>

        {/* Conteúdo */}
        <p className="text-gray-300 leading-relaxed mb-4">{content}</p>
      </CardBody>
    </Card>
  );
}
