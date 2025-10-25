"use client";

import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Button,
  Card,
  CardBody,
  Divider,
  Tooltip,
} from "@heroui/react";
import { FaEdit, FaShareAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "@/components/config/PostCard";
import { VscVerifiedFilled } from "react-icons/vsc";
import { TbCodeCircle2Filled } from "react-icons/tb";
import { FiTrash2 } from "react-icons/fi";

export default function ProfileNameMe({ user }: { user: ILeanUser }) {
  const { data: session } = useSession();
  const [posts, setPosts] = useState<IPost[]>(user.posts || []);
  const [followers, setFollowers] = useState<string[]>(
    user.account?.followers || []
  );
  const [following, setFollowing] = useState<string[]>(
    user.account?.following || []
  );
  const [recentlyDeleted, setRecentlyDeleted] = useState<IPost | null>(null);
  const [progress, setProgress] = useState(100);
  const [restoreTimer, setRestoreTimer] = useState<NodeJS.Timeout | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState<string | null>(
    user.account?.description || ""
  );
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(
    user.image || null
  );
  const [editBannerPreview, setEditBannerPreview] = useState<string | null>(
    user.account?.bannerUrl || null
  );

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPosts(user.posts || []);
    setFollowers(user.account?.followers || []);
    setFollowing(user.account?.following || []);
    setEditDesc(user.account?.description || "");
    setEditAvatarPreview(user.image || null);
    setEditBannerPreview(user.account?.bannerUrl || null);
  }, [user]);

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
        body: JSON.stringify({
          name: session.user.name,
          post: recentlyDeleted,
        }),
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

  const onSelectAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditAvatarPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const onSelectBanner = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEditBannerPreview(String(reader.result));
    reader.readAsDataURL(file);
  };

  const triggerAvatarInput = () => avatarInputRef.current?.click();
  const triggerBannerInput = () => bannerInputRef.current?.click();

  const handleSave = async () => {
    if (!session?.user?.email) return;
    setSaving(true);
    try {
      const payload: any = {
        email: session.user.email,
        name: user.name,
        description: editDesc,
        imageBase64: editAvatarPreview,
        bannerBase64: editBannerPreview,
      };

      const res = await fetch("/api/user/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar");

      setIsEditing(false);
      setSaving(false);
    } catch (err) {
      console.error("❌ Erro ao salvar perfil:", err);
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditDesc(user.account?.description || "");
    setEditAvatarPreview(user.image || null);
    setEditBannerPreview(user.account?.bannerUrl || null);
  };

  return (
    <section className="flex select-none justify-center px-4 sm:px-6 pt-32 md:pt-24 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-6xl w-full">
        {/* Coluna esquerda — perfil */}
        <section className="flex flex-col items-center w-full max-w-sm mx-auto md:max-w-none order-1 relative">
          <Card className="w-full bg-background border border-grid-line rounded-xl overflow-visible shadow-lg relative">
            {/* Banner */}
            <div
              className={`relative w-full h-40 md:h-48 rounded-t-xl overflow-hidden ${
                isEditing ? "group cursor-pointer" : ""
              }`}
              onClick={isEditing ? triggerBannerInput : undefined}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (!isEditing) return;
                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith("image/"))
                  onSelectBanner(file);
              }}
            >
              <Image
                src={
                  editBannerPreview ||
                  user.account?.bannerUrl ||
                  "http://www.arcstudio.online/opengraph-image.png"
                }
                alt="Banner do usuário"
                fill
                className={`object-cover rounded-t-xl transition-all duration-300 ${
                  isEditing ? "group-hover:scale-105" : ""
                }`}
              />
              {isEditing && (
                <>
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                    <FaEdit className="text-white text-2xl" />
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onSelectBanner(e.target.files?.[0])}
                  />
                </>
              )}
            </div>

            {/* Avatar */}
            <div className="absolute left-6 -translate-y-1/2 top-40 md:top-48 flex items-center">
              <div
                className={`relative rounded-full border-7 border-background group ${
                  isEditing ? "cursor-pointer" : ""
                }`}
                onClick={isEditing ? triggerAvatarInput : undefined}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!isEditing) return;
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("image/"))
                    onSelectAvatar(file);
                }}
              >
                <Avatar
                  src={editAvatarPreview || user.image!}
                  size="lg"
                  className="w-20 h-20 rounded-full object-cover"
                />
                {isEditing && (
                  <>
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                      <FaEdit className="text-white text-lg" />
                    </div>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onSelectAvatar(e.target.files?.[0])}
                    />
                  </>
                )}
              </div>

              <h1 className="ml-[-0.7rem] bg-background rounded-r-xl px-3 py-1.5 text-2xl sm:text-3xl font-extrabold inline-flex items-center gap-2">
                {user.name}
                <div className="flex gap-1">
                  {user.account?.isVerified && (
                    <Tooltip
                      content="Conta verificada"
                      className="bg-background border border-grid-line text-sm text-gray-200"
                    >
                      <VscVerifiedFilled className="text-primary cursor-help" />
                    </Tooltip>
                  )}

                  {user.isAdmin && (
                    <Tooltip
                      content="Administrador"
                      className="bg-background border border-grid-line text-sm text-gray-200"
                    >
                      {/* Aqui podemos usar um ícone de admin, por exemplo TbCodeCircle2Filled branco */}
                      <TbCodeCircle2Filled className="text-white cursor-help" />
                    </Tooltip>
                  )}
                </div>
              </h1>
            </div>

            <CardBody className="pt-24 px-6 pb-6">
              {isEditing ? (
                <div className="flex flex-col gap-3 mb-4">
                  <textarea
                    className="w-full rounded-md p-3 bg-background border border-grid-line text-gray-200 min-h-[80px] whitespace-pre-wrap resize-none"
                    value={editDesc || ""}
                    onChange={(e) => {
                      if (e.target.value.length <= 60)
                        setEditDesc(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      // permite Enter pular linha normalmente
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        return;
                      }
                    }}
                    placeholder="Escreva algo sobre você..."
                  />
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{editDesc?.length || 0}/60</span>
                    <div className="flex gap-2">
                      <Button variant="ghost" onClick={handleCancelEdit}>
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleSave}
                        color="primary"
                        isDisabled={saving}
                      >
                        {saving ? "Salvando..." : "Salvar"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300 text-1xl mb-10 whitespace-pre-wrap">
                  {user.account?.description ||
                    "🪶 Nenhuma bio adicionada ainda."}
                </p>
              )}

              {/* Botões principais */}
              {!isEditing && (
                <div className="flex justify-center gap-3 mb-4">
                  <Button
                    onClick={() => setIsEditing(true)}
                    color="primary"
                    isIconOnly
                    startContent={<FaEdit size={14} />}
                  />
                  <Button
                    variant="bordered"
                    startContent={<FaShareAlt size={14} />}
                  >
                    Compartilhar
                  </Button>
                </div>
              )}

              <Divider className="my-2 w-full bg-grid-line" />

              {/* Estatísticas */}
              <div className="flex justify-around w-full text-sm text-gray-400 mt-2">
                <div className="flex flex-col items-center">
                  <span className="text-lg font-semibold text-white">
                    {posts.length}
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

        {/* Coluna direita — feed */}
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
              <p className="text-gray-300 text-lg font-medium">
                Publique seu primeiro projeto aqui!
              </p>
              <Link
                className="cursor-pointer"
                href="/app/profile/publish-project"
              >
                <Button color="primary">Publicar projeto</Button>
              </Link>
            </div>
          )}

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
                  <span className="inline-flex items-center gap-1 text-gray-300">
                    <FiTrash2 className="text-red-500" />
                    Projeto removido
                  </span>
                  <Button
                    onClick={handleRestore}
                    className="text-primary font-semibold hover:underline"
                  >
                    Desfazer
                  </Button>
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
