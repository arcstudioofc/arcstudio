"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Divider,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/react";
import { FaShareAlt, FaUserPlus, FaUserCheck } from "react-icons/fa";
import { FiCopy } from "react-icons/fi";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import PostCard from "@/components/config/PostCard";
import { VscVerifiedFilled } from "react-icons/vsc";
import { TbCodeCircle2Filled } from "react-icons/tb";
import { usePathname } from "next/navigation";

export default function ProfileNameView({ user }: { user: ILeanUser }) {
  const { data: session } = useSession();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<string[]>(user.account?.followers || []);
  const [following, setFollowing] = useState<string[]>(user.account?.following || []);
  const [loading, setLoading] = useState(false);

  const pathname = usePathname();
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const fullUrl =
    typeof window !== "undefined"
      ? window.location.origin + pathname
      : `https://arcstudio.online${pathname}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("❌ Erro ao copiar link:", err);
    }
  };

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

  useEffect(() => {
    if (!session?.user?.name || !user.account) return;
    const follows = user.account.followers?.includes(session.user.name);
    setIsFollowing(follows);
  }, [session?.user?.name, user.account]);

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
    <section className="flex select-none justify-center px-4 sm:px-6 pt-10 md:pt-19 min-h-screen">
      <div className="flex flex-col w-full max-w-6xl gap-6">
        {/* Perfil */}
        <Card className="w-full bg-background border border-grid-line rounded-xl overflow-visible shadow-lg relative">
          {/* Banner */}
          <div className="relative w-full h-48 rounded-t-xl overflow-hidden">
            <Image
              src={
                user.account?.bannerUrl ||
                "http://www.arcstudio.online/opengraph-image.png"
              }
              alt="Banner do usuário"
              fill
              className="object-cover rounded-t-xl"
              priority
            />
          </div>

          {/* Avatar e Nome */}
          <div className="absolute left-6 -translate-y-1/2 top-50 flex items-center">
            <div className="relative rounded-full border-4 border-background">
              <Avatar
                src={user.image!}
                size="lg"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>

            <h1 className="ml-[-0.7rem] bg-background rounded-r-xl px-3 py-2 text-2xl sm:text-3xl font-extrabold inline-flex items-center gap-2 overflow-visible">
              {user.name}
              <div className="flex gap-1">
                {user.account?.isVerified && (
                  <Tooltip
                    showArrow={true}
                    content="Conta verificada"
                    className="bg-background border border-grid-line text-sm text-gray-200 rounded p-1"
                  >
                    <VscVerifiedFilled className="text-primary hover:opacity-80 transition-opacity" />
                  </Tooltip>
                )}
                {user.isAdmin && (
                  <Tooltip
                    showArrow={true}
                    content="Administrador"
                    className="bg-background border border-grid-line text-sm text-gray-200 rounded p-1"
                  >
                    <TbCodeCircle2Filled className="text-white hover:opacity-80 transition-opacity" />
                  </Tooltip>
                )}
              </div>
            </h1>
          </div>

          {/* Card Body */}
          <CardBody className="pt-8 px-6 pb-6">
            <p className="text-gray-300 text-1xl mb-10 pt-15 whitespace-pre-wrap">
              {user.account?.description ||
                "🪶 Nenhuma bio adicionada ainda."}
            </p>

            {/* Botões */}
            <div className="flex justify-center gap-3 mb-4">
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
                onClick={() => setIsShareOpen(true)}
              >
                Compartilhar
              </Button>
            </div>

            <Divider className="my-2 w-full bg-grid-line" />

            {/* Estatísticas */}
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

        {/* Feed */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-25">
          {user.posts && user.posts.length > 0 ? (
            [...user.posts]
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
                />
              ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-4 col-span-3">
              <p className="text-gray-300 text-lg font-medium">
                Nenhum projeto publicado ainda.
              </p>
            </div>
          )}
        </section>

        {/* Modal de compartilhamento */}
        <Modal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)}>
          <ModalContent className="bg-background border border-grid-line text-gray-200">
            <ModalHeader className="text-lg font-semibold">
              Compartilhar perfil
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-gray-400">
                  Copie o link abaixo para compartilhar este perfil:
                </p>
                <div className="flex items-center justify-between border border-grid-line rounded-md p-2 bg-[#0b1520]/40">
                  <span className="truncate text-sm">{fullUrl}</span>
                  <Button
                    isIconOnly
                    variant="light"
                    onClick={handleCopy}
                    className="ml-2 text-primary"
                  >
                    <FiCopy size={18} />
                  </Button>
                </div>
                {copied && (
                  <p className="text-primary text-sm mt-1 text-center">
                    Link copiado!
                  </p>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={() => setIsShareOpen(false)}>
                Fechar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </section>
  );
}
