"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Avatar,
  Card,
  CardBody,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
} from "@heroui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeHighlight from "rehype-highlight";
import { useState, useEffect, useMemo } from "react";
import { FiMoreVertical, FiCopy, FiCheck, FiCode } from "react-icons/fi";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";

import "highlight.js/styles/night-owl.css";
import { AnimatePresence, motion } from "framer-motion";

export interface PostCardProps {
  hash: string;
  user: ILeanUser;
  bannerUrl?: string;
  githubUrl?: string;
  content: string;
  createdAt?: Date;
  sessionEmail?: string;
  onDelete?: (hash: string) => void;
  isPreview?: boolean;
}

export const EditDocumentIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M15.48 3H7.52C4.07 3 2 5.06 2 8.52v7.95C2 19.94 4.07 22 7.52 22h7.95c3.46 0 5.52-2.06 5.52-5.52V8.52C21 5.06 18.93 3 15.48 3Z"
        fill="currentColor"
        opacity={0.4}
      />
      <path
        d="M21.02 2.98c-1.79-1.8-3.54-1.84-5.38 0L14.51 4.1c-.1.1-.13.24-.09.37.7 2.45 2.66 4.41 5.11 5.11.03.01.08.01.11.01.1 0 .2-.04.27-.11l1.11-1.12c.91-.91 1.36-1.78 1.36-2.67 0-.9-.45-1.79-1.36-2.71ZM17.86 10.42c-.27-.13-.53-.26-.77-.41-.2-.12-.4-.25-.59-.39-.16-.1-.34-.25-.52-.4-.02-.01-.08-.06-.16-.14-.31-.25-.64-.59-.95-.96-.02-.02-.08-.08-.13-.17-.1-.11-.25-.3-.38-.51-.11-.14-.24-.34-.36-.55-.15-.25-.28-.5-.4-.76-.13-.28-.23-.54-.32-.79L7.9 10.72c-.35.35-.69 1.01-.76 1.5l-.43 2.98c-.09.63.08 1.22.47 1.61.33.33.78.5 1.28.5.11 0 .22-.01.33-.02l2.97-.42c.49-.07 1.15-.4 1.5-.76l5.38-5.38c-.25-.08-.5-.19-.78-.31Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const DeleteDocumentIcon = (props: any) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M21.07 5.23c-1.61-.16-3.22-.28-4.84-.37v-.01l-.22-1.3c-.15-.92-.37-2.3-2.71-2.3h-2.62c-2.33 0-2.55 1.32-2.71 2.29l-.21 1.28c-.93.06-1.86.12-2.79.21l-2.04.2c-.42.04-.72.41-.68.82.04.41.4.71.82.67l2.04-.2c5.24-.52 10.52-.32 15.82.21h.08c.38 0 .71-.29.75-.68a.766.766 0 0 0-.69-.82Z"
      fill="currentColor"
    />
    <path
      d="M19.23 8.14c-.24-.25-.57-.39-.91-.39H5.68c-.34 0-.68.14-.91.39-.23.25-.36.59-.34.94l.62 10.26c.11 1.52.25 3.42 3.74 3.42h6.42c3.49 0 3.63-1.89 3.74-3.42l.62-10.25c.02-.36-.11-.7-.34-.95Z"
      fill="currentColor"
      opacity={0.399}
    />
    <path
      clipRule="evenodd"
      d="M9.58 17a.75.75 0 0 1 .75-.75h3.33a.75.75 0 0 1 0 1.5h-3.33a.75.75 0 0 1-.75-.75ZM8.75 13a.75.75 0 0 1 .75-.75h5a.75.75 0 0 1 0 1.5h-5a.75.75 0 0 1-.75-.75Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

// === utilitário de tempo relativo ===
const formatRelativeTime = (date: Date, now: Date) => {
  let diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 0) diff = 0;
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
};

export default function PostCard({
  user,
  hash,
  bannerUrl,
  content = "Este é um post fictício para testar o layout do perfil. 💫",
  createdAt,
  sessionEmail,
  onDelete,
  githubUrl,
  isPreview = false,
}: PostCardProps) {
  const [now, setNow] = useState(new Date());
  const [isImageOpen, setIsImageOpen] = useState(false);

  let createdDate: Date | null = null;
  if (createdAt) {
    if (typeof createdAt === "string") createdDate = new Date(createdAt);
    else if ("$date" in createdAt)
      createdDate = new Date((createdAt as any).$date);
    else createdDate = new Date(createdAt as Date);
  }

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsImageOpen(false);
    if (isImageOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
    } else {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isImageOpen]);

  const isOwner = sessionEmail && sessionEmail === user._id;

  const handleDelete = () => {
    if (!isPreview && hash && onDelete) onDelete(hash);
  };

  // === Footer GitHub ===
  let owner: string | null = null;
  let repo: string | null = null;
  if (githubUrl) {
    const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
      owner = match[1];
      repo = match[2];
    }
  }

  const dropdownPositionClass = bannerUrl
    ? "absolute top-2 right-2"
    : "absolute top-2 right-2 z-10";

  // === normalização markdown ===
  const normalizedContent = useMemo(() => {
    if (!content) return "";
    let s = String(content);
    s = s.replace(/\r\n/g, "\n");
    s = s.replace(/\n{3,}/g, "\n\n");
    s = s.replace(/(^|\n)(#+)([^\s#\n])/g, "$1$2 $3");
    s = s.replace(/(^|\n)([ \t]*)([-+*])([^\s\n])/g, "$1$2$3 $4");
    s = s.replace(/__([^_\n][^_\n]*?)__/g, "<u>$1</u>");
    return s;
  }, [content]);

  return (
    <>
      <Card className="bg-background/80 border border-grid-line hover:bg-[#0f152adb] transition-all duration-300 relative shadow-lg rounded-2xl overflow-hidden">
        {/* banner */}
        {bannerUrl && (
          <div
            className="relative w-full h-36 cursor-zoom-in"
            role="button"
            aria-label={`Abrir banner do post ${hash}`}
            onClick={() => setIsImageOpen(true)}
            tabIndex={0}
          >
            <Image
              src={bannerUrl}
              alt={`Banner do post ${hash}`}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* dropdown */}
        {!isPreview && isOwner && (
          <div className={dropdownPositionClass}>
            <Dropdown
              showArrow
              classNames={{
                base: "before:bg-[#141e2e75]",
                content:
                  "p-0 border border-grid-line bg-background rounded-lg text-gray-100",
              }}
            >
              <DropdownTrigger>
                <Button variant="light" size="sm" isIconOnly>
                  <FiMoreVertical className="text-white text-lg" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Delete menu"
                variant="faded"
                className="p-3"
              >
                <DropdownSection showDivider title="Geral">
                  <DropdownItem
                    key="edit"
                    description="Altere informações em seu projeto."
                    startContent={<EditDocumentIcon className="text-xl" />}
                  >
                    Editar projeto
                  </DropdownItem>
                </DropdownSection>

                <DropdownSection title="Área perigosa">
                  <DropdownItem
                    key="delete"
                    className="text-danger"
                    color="danger"
                    description="Deletar permanentemente este projeto."
                    startContent={
                      <DeleteDocumentIcon className="text-xl text-danger" />
                    }
                    onClick={handleDelete}
                  >
                    Deletar
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </div>
        )}

        {/* corpo */}
        <CardBody className="relative p-5">
          <div className="flex items-center gap-3 mb-4">
            <Avatar src={user.image!} size="md" isBordered color="primary" />
            <div>
              <p className="text-white font-semibold">{user.name}</p>
              <Link
                href={`/app/profile/${user.name}`}
                className="text-gray-400 text-sm hover:text-white transition"
              >
                @{user.name}
              </Link>
            </div>
          </div>

          <article className="prose prose-invert prose-headings:text-white prose-a:text-blue-400 prose-strong:text-white max-w-none mb-4">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
              components={{
                ul: ({ children }: any) => (
                  <ul className="list-disc pl-6 ml-0">{children}</ul>
                ),
                ol: ({ children }: any) => (
                  <ol className="list-decimal pl-6 ml-0">{children}</ol>
                ),
                h1: ({ children }: any) => (
                  <h1 className="text-2xl font-bold text-white">{children}</h1>
                ),
                h2: ({ children }: any) => (
                  <h2 className="text-xl font-semibold text-white">
                    {children}
                  </h2>
                ),
                h3: ({ children }: any) => (
                  <h3 className="text-lg font-medium text-white">{children}</h3>
                ),
                code: ({ inline, className, children, ...props }: any) => {
                  const codeText = Array.isArray(children)
                    ? children
                        .map((c: any) =>
                          typeof c === "string" ? c : c.props?.children || ""
                        )
                        .join("")
                    : String(children);
                  const [copied, setCopied] = useState(false);
                  if (inline) {
                    return (
                      <code className="bg-blue-900/40 px-1.5 py-0.5 rounded-md text-blue-300 font-mono text-sm">
                        {children}
                      </code>
                    );
                  }
                  const match = (className || "").match(
                    /language-([a-zA-Z0-9]+)/
                  );
                  const lang = match ? match[1].toLowerCase() : null;
                  const handleCopyClick = async () => {
                    try {
                      await navigator.clipboard.writeText(codeText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    } catch (err) {
                      console.error("Falha ao copiar código:", err);
                    }
                  };
                  return (
                    <div className="my-4 rounded-xl overflow-hidden border border-grid-line bg-[#011627]">
                      <div className="flex justify-between items-center bg-[#0b1520] px-3 py-1.5 border-b border-grid-line">
                        <div className="inline-flex items-center gap-1 px-2 py-1">
                          <FiCode className="text-gray-300 text-sm" />
                          <span className="text-[10px] text-gray-300 uppercase font-medium">
                            {lang ?? "code"}
                          </span>
                        </div>
                        <Button
                          onClick={handleCopyClick}
                          className="flex items-center gap-1 px-2 py-1 rounded text-gray-200 transition-all"
                          title="Copiar código"
                          size="sm"
                          variant="light"
                          color="primary"
                          isIconOnly
                        >
                          {copied ? (
                            <FiCheck className="text-green-600" />
                          ) : (
                            <FiCopy className="text-white" />
                          )}
                        </Button>
                      </div>
                      <pre className="p-4 overflow-x-auto text-sm text-gray-100 whitespace-pre-wrap break-words">
                        <code className={className} {...props}>
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
                a: ({ href, children, ...props }: any) => (
                  <Link
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 hover:text-[#6d94d3de] text-[#a7bccbf0] underline"
                    {...props}
                  >
                    {children}
                    <FaExternalLinkAlt className="text-xs" />
                  </Link>
                ),
              }}
            >
              {normalizedContent}
            </ReactMarkdown>
          </article>

          {/* footer */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-gray-400 text-sm border-t border-grid-line pt-3 gap-2">
            {githubUrl && owner && repo && (
              <div className="flex items-center gap-2">
                <Link
                  href={`https://github.com/${owner}/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaGithub className="text-lg" />
                </Link>
                <Link
                  href={`https://github.com/${owner}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-extrabold hover:text-white transition-colors"
                >
                  {owner}
                </Link>
                <span>—</span>
                <Link
                  href={`https://github.com/${owner}/${repo}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold hover:text-white transition-colors"
                >
                  {repo}
                </Link>
              </div>
            )}
            <span className="sm:ml-auto text-gray-500">
              {createdDate ? formatRelativeTime(createdDate, now) : "agora"}
            </span>
          </div>
        </CardBody>
      </Card>

      {/* modal imagem */}
      <AnimatePresence>
        {isImageOpen && bannerUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
            role="dialog"
            aria-modal="true"
            onClick={() => setIsImageOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity" />

            {/* Mini perfil no topo esquerdo */}
            <motion.div
              className="absolute top-4 left-4 flex items-center gap-3 z-20 p-2 cursor-pointer"
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Avatar src={user.image!} size="sm" isBordered color="primary" />
              <div className="text-white text-sm flex flex-col">
                <p className="font-semibold">{user.name}</p>
                <Link
                  href={`/app/profile/${user.name}`}
                  className="text-gray-300 text-xs hover:text-white transition-colors"
                >
                  @{user.name}
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="relative z-10 max-w-[95%] max-h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={bannerUrl}
                alt={`Banner do post ${hash}`}
                className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
                draggable={false}
              />
              <button
                onClick={() => setIsImageOpen(false)}
                aria-label="Fechar visualização"
                className="absolute -top-3 -right-3 z-20 inline-flex items-center justify-center h-8 w-8 rounded-full bg-background/50 border border-grid-line text-gray-200 hover:bg-background/70 transition"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
