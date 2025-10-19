"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Divider
} from "@heroui/react";
import { FaEdit, FaShareAlt } from "react-icons/fa";
import PostCard from "@/components/config/PostCard";

export default function ProfileNameMe({ user }: { user: ILeanUser }) {
  const { data: session } = useSession();

  return (
    <section className="flex justify-center px-4 sm:px-6 pt-32 md:pt-24 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl w-full">

        {/* Coluna esquerda — perfil */}
        <section className="flex flex-col items-center w-full max-w-sm mx-auto md:max-w-none order-1 relative">
          {/* Card do perfil com banner */}
          <Card className="w-full bg-background border border-grid-line rounded-xl overflow-visible shadow-lg relative">
            <div className="relative w-full h-40 md:h-48 rounded-t-xl overflow-hidden">
              <Image
                src={
                  "https://wallpapers-clan.com/wp-content/uploads/2025/02/luffy-red-glow-eyes-dark-pc-wallpaper-preview.jpg"
                }
                alt="Banner do usuário"
                fill
                className="object-cover rounded-t-xl"
                priority
              />
            </div>

            {/* Avatar */}
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-40 md:top-48">
              <Avatar
                src={user.image!}
                size="lg"
                color="primary"
                className="border-4 border-background shadow-lg"
              />
            </div>

            <CardBody className="pt-24 px-6 pb-6 text-center">
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                {user.name}
              </h1>
              <p className="text-gray-300 text-sm mb-4">
                🪶 Nenhuma bio adicionada ainda.
              </p>

              <div className="flex justify-center gap-3 mb-4">
                <Button color="primary" startContent={<FaEdit size={14} />}>
                  Editar perfil
                </Button>
                <Button
                  variant="bordered"
                  startContent={<FaShareAlt size={14} />}
                >
                  Compartilhar
                </Button>
              </div>

              <Divider className="my-2 w-full bg-grid-line" />

              <div className="flex justify-around w-full text-sm text-gray-400 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">128</span>
                  <span>Seguidores</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">96</span>
                  <span>Seguindo</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">
                    {user.posts?.length ?? 0}
                  </span>
                  <span>Posts</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>


        {/* Coluna direita — feed de posts */}
        <section className="flex flex-col justify-start rounded-xl bg-background/40 backdrop-blur-sm p-4 overflow-y-auto max-h-[75vh] border border-grid-line mt-4 md:mt-0 mb-12 md:mb-0 md:gap-6 order-2">
          {user.posts && user.posts.length > 0 ? (
            <div className="space-y-4">
              {user.posts.map((post, i) => (
                <PostCard
                  key={post._id!.toString()}
                  postId={i + 1}
                  user={user}
                  bannerUrl={post.bannerUrl ?? undefined}
                  content={post.content}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-gray-300 text-lg font-medium">
                Envie seu primeiro projeto aqui!
              </p>
              <Button color="primary" href={"/app/profile/create-project"} >
                Enviar projeto
              </Button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
