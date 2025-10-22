"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Avatar, Button, Card, CardBody, Divider } from "@heroui/react";
import { FaEdit, FaShareAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "@/components/config/PostCard";

export default function ProfileNameMe({ user }: { user: ILeanUser }) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<IPost[]>(user.posts || []);
  const [followers, setFollowers] = useState<string[]>(user.account?.followers || []);
  const [following, setFollowing] = useState<string[]>(user.account?.following || []);
  const [recentlyDeleted, setRecentlyDeleted] = useState<IPost | null>(null);
  const [progress, setProgress] = useState(100);
  const [restoreTimer, setRestoreTimer] = useState<NodeJS.Timeout | null>(null);

  // Atualiza os posts e contadores
  useEffect(() => {
    setPosts(user.posts || []);
    setFollowers(user.account?.followers || []);
    setFollowing(user.account?.following || []);
  }, [user]);

  // Atualiza contadores de seguidores/following em tempo real (a cada 3s)
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!session?.user?.email) return;
      const res = await fetch(`/api/user/info?email=${session.user.email}`);
      const data = await res.json();
      if (data?.user) {
        setFollowers(data.user.account.followers);
        setFollowing(data.user.account.following);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [session]);

  // Funções de deletar e restaurar posts
  const handleDelete = async (hash: string) => {
    if (!session?.user?.name) return;
    try {
      const res = await fetch("/api/projects/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: session.user.name, hash }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao deletar");

      const deletedPost = posts.find((p) => p.hash === hash);
      if (!deletedPost) return;
      setPosts((prev) => prev.filter((p) => p.hash !== hash));
      setRecentlyDeleted(deletedPost);
      setProgress(100);

      if (restoreTimer) clearTimeout(restoreTimer);
      const timer = setTimeout(() => setRecentlyDeleted(null), 5000);
      setRestoreTimer(timer);

      let timeLeft = 5000;
      const interval = setInterval(() => {
        timeLeft -= 100;
        setProgress((timeLeft / 5000) * 100);
        if (timeLeft <= 0) clearInterval(interval);
      }, 100);
    } catch (err) {
      console.error("❌ Erro ao deletar post:", err);
    }
  };

  const handleRestore = async () => {
    if (!session?.user?.name || !recentlyDeleted) return;
    try {
      const res = await fetch("/api/projects/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: session.user.name, post: recentlyDeleted }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao restaurar");
      setPosts((prev) => [recentlyDeleted, ...prev]);
      setRecentlyDeleted(null);
      if (restoreTimer) clearTimeout(restoreTimer);
    } catch (err) {
      console.error("❌ Erro ao restaurar post:", err);
    }
  };

  return (
    <section className="flex select-none justify-center px-4 sm:px-6 pt-32 md:pt-24 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl w-full">
        {/* Coluna esquerda — perfil */}
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
              <h1 className="text-2xl sm:text-3xl font-extrabold">{user.name}</h1>
              <p className="text-gray-300 text-sm mb-4">
                🪶 Nenhuma bio adicionada ainda.
              </p>

              <div className="flex justify-center gap-3 mb-4">
                <Button isDisabled color="primary" startContent={<FaEdit size={14} />}>
                  Editar perfil
                </Button>
                <Button variant="bordered" startContent={<FaShareAlt size={14} />}>
                  Compartilhar
                </Button>
              </div>

              <Divider className="my-2 w-full bg-grid-line" />

              <div className="flex justify-around w-full text-sm text-gray-400 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">{posts.length}</span>
                  <span>Posts</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">{followers.length}</span>
                  <span>Seguidores</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">{following.length}</span>
                  <span>Seguindo</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </section>

        {/* Coluna direita — feed de posts */}
        <section className="flex flex-col justify-start rounded-xl bg-background/40 backdrop-blur-sm p-4 overflow-y-auto max-h-[75vh] border border-grid-line mt-4 md:mt-0 mb-12 md:mb-0 md:gap-6 order-2 relative">
          {posts.length > 0 ? (
            <div className="space-y-4">
              {[...posts]
                .sort((a, b) => (a.hash! < b.hash! ? 1 : -1))
                .map((post) => (
                  <PostCard
                    key={post.hash!}
                    hash={post.hash!}
                    user={user}
                    bannerUrl={post.bannerUrl ?? undefined}
                    githubUrl={post.githubUrl ?? undefined}
                    content={post.content}
                    createdAt={post.createdAt}
                    sessionEmail={session?.user?.email || undefined}
                    onDelete={handleDelete}
                  />
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4">
              <p className="text-gray-300 text-lg font-medium">Publique seu primeiro projeto aqui!</p>
              <Link className="cursor-pointer" href="/app/profile/publish-project">
                <Button color="primary">Publicar projeto</Button>
              </Link>
            </div>
          )}

          {/* Popup de restauração */}
          <AnimatePresence>
            {recentlyDeleted && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0b1520]/90 border border-grid-line rounded-lg px-5 py-3 text-sm text-gray-200 shadow-lg flex flex-col gap-2 w-[250px] sm:w-[280px]"
              >
                <div className="flex items-center justify-between">
                  <span>🗑️ Projeto removido</span>
                  <button onClick={handleRestore} className="text-primary font-semibold hover:underline">
                    Desfazer
                  </button>
                </div>
                <div className="w-full bg-gray-700/40 h-[3px] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: "100%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                    className="h-full bg-primary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </section>
  );
}
