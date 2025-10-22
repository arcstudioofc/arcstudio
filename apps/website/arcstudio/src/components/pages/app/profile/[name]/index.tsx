"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import { Avatar, Button, Card, CardBody, Divider } from "@heroui/react";
import { FaShareAlt, FaUserPlus, FaUserCheck } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import PostCard from "@/components/config/PostCard";

export default function ProfileNameView({ user }: { user: ILeanUser }) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<string[]>(
    user.account?.followers || []
  );
  const [following, setFollowing] = useState<string[]>(
    user.account?.following || []
  );
  const [loading, setLoading] = useState(false);

  const currentName = session?.user?.name;
  const targetName = user.name;

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/user/info?name=${user.name}`);
      const data = await res.json();
      if (data?.user) {
        setFollowers(data.user.account.followers);
        setFollowing(data.user.account.following);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user.name]);

  // Detecta se já segue o usuário
  useEffect(() => {
    if (!session?.user?.name || !user.account) return;
    const follows = user.account.followers?.includes(session.user.name);
    setIsFollowing(follows);
  }, [session?.user?.name, user.account]);

  // Função de seguir/deixar de seguir
  const handleFollow = async () => {
    if (!currentName || !targetName) return;
    setLoading(true);

    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followerName: currentName, targetName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao seguir");

      setIsFollowing(data.isFollowing);
    } catch (err) {
      console.error("❌ Erro ao seguir:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex select-none justify-center px-4 sm:px-6 pt-32 md:pt-24 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl w-full">
        {/* Coluna esquerda — informações do perfil */}
        <section className="flex flex-col items-center w-full max-w-sm mx-auto md:max-w-none order-1 relative">
          <Card className="w-full bg-background border border-grid-line rounded-xl overflow-visible shadow-lg relative">
            <div className="relative w-full h-40 md:h-48 rounded-t-xl overflow-hidden">
              <Image
                src="https://wallpapers-clan.com/wp-content/uploads/2025/02/luffy-red-glow-eyes-dark-pc-wallpaper-preview.jpg"
                alt="Banner do usuário"
                fill
                className="object-cover rounded-t-xl"
                priority
              />
            </div>

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
                {/* Botão de seguir/deixar de seguir */}
                {currentName && currentName !== user.name && (
                  <motion.div
                    key={isFollowing ? "unfollow" : "follow"}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                  >
                    <Button
                      color={isFollowing ? "success" : "primary"}
                      isLoading={loading}
                      startContent={
                        isFollowing ? (
                          <FaUserCheck size={14} />
                        ) : (
                          <FaUserPlus size={14} />
                        )
                      }
                      onClick={handleFollow}
                    >
                      {isFollowing ? "Seguindo" : "Seguir"}
                    </Button>
                  </motion.div>
                )}

                <Button
                  variant="bordered"
                  startContent={<FaShareAlt size={14} />}
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/app/profile/${user.name}`
                    )
                  }
                >
                  Compartilhar perfil
                </Button>
              </div>

              <Divider className="my-2 w-full bg-grid-line" />

              <div className="flex justify-around w-full text-sm text-gray-400 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">
                    {user.posts?.length || 0}
                  </span>
                  <span>Posts</span>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">
                    {followers.length}
                  </span>
                  <span>Seguidores</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">
                    {following.length}
                  </span>
                  <span>Seguindo</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Coluna direita — posts */}
        <section className="flex flex-col justify-start rounded-xl bg-background/40 backdrop-blur-sm p-4 overflow-y-auto max-h-[75vh] border border-grid-line mt-4 md:mt-0 mb-12 md:mb-0 md:gap-6 order-2 relative">
          {user.posts && user.posts.length > 0 ? (
            <motion.div
              className="space-y-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.08 },
                },
              }}
            >
              {[...user.posts]
                .sort((a, b) => (a.hash! < b.hash! ? 1 : -1))
                .map((post) => (
                  <motion.div
                    key={post.hash!}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <PostCard
                      hash={post.hash!}
                      user={user}
                      bannerUrl={post.bannerUrl ?? undefined}
                      githubUrl={post.githubUrl ?? undefined}
                      content={post.content}
                      createdAt={post.createdAt}
                      sessionEmail={session?.user?.email || undefined}
                    />
                  </motion.div>
                ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-gray-300 text-lg font-medium">
                Nenhum projeto publicado ainda.
              </p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
