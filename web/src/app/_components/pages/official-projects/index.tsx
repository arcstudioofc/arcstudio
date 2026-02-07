"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { FiGlobe } from "react-icons/fi";
import {
    FaBehance,
    FaBitbucket,
    FaDiscord,
    FaDribbble,
    FaFacebook,
    FaGithub,
    FaGitlab,
    FaInstagram,
    FaLink,
    FaLinkedin,
    FaMedium,
    FaPlus,
    FaTwitter,
    FaUpload,
    FaTrash,
    FaPencilAlt,
    FaYoutube,
} from "react-icons/fa";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardBody, CardFooter, Button, Drawer, DrawerContent, DrawerHeader, DrawerBody, Input, addToast } from "@heroui/react";

import { auth } from "@/lib/auth";
import { useAltKey } from "@/lib/useAltKey";
import { MentionBadge } from "@/app/_components/MentionBadge";

type ProjectType = {
    _id?: string;
    key: string;
    name: string;
    authors: string[];
    infos: {
        images: { banner: string };
        links: { url: string; label?: string }[];
    };
};

type MentionUser = {
    id: string;
    username?: string;
    name?: string;
    image?: string | null;
    role?: string;
};

type MentionState = {
    query: string;
    start: number;
    end: number;
};

const normalizeLinkUrl = (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
};

const getLinkIconForUrl = (url: string) => {
    try {
        const hostname = new URL(normalizeLinkUrl(url)).hostname.replace(/^www\./, "");
        if (hostname.includes("github.com")) return FaGithub;
        if (hostname.includes("gitlab.com")) return FaGitlab;
        if (hostname.includes("bitbucket.org")) return FaBitbucket;
        if (hostname.includes("discord.gg") || hostname.includes("discord.com")) return FaDiscord;
        if (hostname.includes("x.com") || hostname.includes("twitter.com")) return FaTwitter;
        if (hostname.includes("youtube.com") || hostname.includes("youtu.be")) return FaYoutube;
        if (hostname.includes("instagram.com")) return FaInstagram;
        if (hostname.includes("linkedin.com")) return FaLinkedin;
        if (hostname.includes("facebook.com")) return FaFacebook;
        if (hostname.includes("behance.net")) return FaBehance;
        if (hostname.includes("dribbble.com")) return FaDribbble;
        if (hostname.includes("medium.com")) return FaMedium;
        return FiGlobe;
    } catch {
        return FaLink;
    }
};

interface Props {
    projects: ProjectType[];
}

export function OfficialProjectCard({ 
    project, 
    isAdmin, 
    showActions, 
    onEdit, 
    onDelete 
}: { 
    project: ProjectType; 
    isAdmin?: boolean; 
    showActions?: boolean; 
    onEdit?: (p: ProjectType) => void; 
    onDelete?: (id: string) => void; 
}) {
    const t = useTranslations("OfficialProjects.OfficialProjectsCard");
    const { name, authors, infos } = project;
    const { banner } = infos.images;
    const links = Array.isArray(infos.links) ? infos.links : [];
    const [showAllLinks, setShowAllLinks] = useState(false);

    const visibleLinks = showAllLinks ? links : links.slice(0, 1);

    return (
        <Card className="overflow-hidden rounded-xl border border-foreground/10 bg-background transition hover:shadow-md group relative">
            {banner && (
                <img
                    src={banner}
                    alt={name}
                    className="h-44 w-full object-cover"
                />
            )}

            <CardBody className="space-y-3 p-5">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold leading-tight">{name}</h3>
                    {isAdmin && showActions && (
                        <div className="flex gap-1 animate-in fade-in zoom-in duration-200">
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light" 
                                className="text-blue-500 min-w-8 w-8 h-8"
                                onPress={() => onEdit?.(project)}
                            >
                                <FaPencilAlt size={12} />
                            </Button>
                            <Button 
                                isIconOnly 
                                size="sm" 
                                variant="light" 
                                className="text-red-500 min-w-8 w-8 h-8"
                                onPress={() => project._id && onDelete?.(project._id)}
                            >
                                <FaTrash size={12} />
                            </Button>
                        </div>
                    )}
                </div>

                <p className="text-sm text-foreground/70">
                    {t("author")}:{" "}
                    {authors.map((author, index) => {
                        const trimmed = author.trim();
                        const isMention = trimmed.startsWith("@") && trimmed.length > 1;
                        const content = isMention ? (
                            <MentionBadge username={trimmed.slice(1)} />
                        ) : (
                            <span>{trimmed}</span>
                        );
                        return (
                            <span key={`${trimmed}-${index}`} className="inline-flex items-center">
                                {content}
                                {index < authors.length - 1 ? (
                                    <span className="text-foreground/50">, </span>
                                ) : null}
                            </span>
                        );
                    })}
                </p>

                <CardFooter className="flex gap-2 p-0 pt-2 items-center">
                    {visibleLinks.map((link, index) => {
                        const href = normalizeLinkUrl(link.url);
                        if (!href) return null;
                        const Icon = getLinkIconForUrl(href);
                        return (
                            <Button
                                key={`${href}-${index}`}
                                as={Link}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="sm"
                                variant="flat"
                                isIconOnly
                            >
                                <Icon className="h-4 w-4" />
                            </Button>
                        );
                    })}
                    {links.length > 1 && (
                        <Button
                            size="sm"
                            variant="flat"
                            isIconOnly
                            aria-label={showAllLinks ? "Ocultar links" : "Ver mais links"}
                            onPress={() => setShowAllLinks((prev) => !prev)}
                        >
                            <FaPlus className={showAllLinks ? "rotate-45 transition-transform" : "transition-transform"} />
                        </Button>
                    )}
                </CardFooter>
            </CardBody>
        </Card>
    );
}



export default function OfficialProjectsClient({ projects: initialProjects }: Props) {
    const t = useTranslations("OfficialProjects");
    const { data: session } = auth.useSession();
    const isAltPressed = useAltKey();
    const isAdmin = session?.user.role === "admin";
    const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

    const [projects, setProjects] = useState(initialProjects);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [key, setKey] = useState("");
    const [authors, setAuthors] = useState("");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [existingBanner, setExistingBanner] = useState("");
    const [links, setLinks] = useState<string[]>([""]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const authorsInputRef = useRef<HTMLInputElement>(null);
    const bannerPreview = bannerFile ? URL.createObjectURL(bannerFile) : existingBanner;

    const [mentionState, setMentionState] = useState<MentionState | null>(null);
    const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
    const [mentionOpen, setMentionOpen] = useState(false);
    const [mentionIndex, setMentionIndex] = useState(0);
    const [mentionLoading, setMentionLoading] = useState(false);

    const normalizedQuery = useMemo(
        () => mentionState?.query.toLowerCase() ?? "",
        [mentionState?.query],
    );

    const resetForm = () => {
        setName(""); setKey(""); setAuthors(""); setBannerFile(null); setExistingBanner(""); setLinks([""]);
        setEditingId(null);
    };

    const handleEdit = (project: ProjectType) => {
        setEditingId(project._id || null);
        setName(project.name);
        setKey(project.key);
        setAuthors(project.authors.join(", "));
        setExistingBanner(project.infos.images.banner);
        const nextLinks = (project.infos.links || []).map((link) => link.url).filter(Boolean);
        setLinks(nextLinks.length > 0 ? nextLinks : [""]);
        setOpen(true);
    };

    const setSelection = (start: number, end: number) => {
        requestAnimationFrame(() => {
            authorsInputRef.current?.focus();
            authorsInputRef.current?.setSelectionRange(start, end);
        });
    };

    const detectMention = (text: string, cursor: number | null) => {
        if (cursor === null) return null;
        const slice = text.slice(0, cursor);
        const match = /(^|\s|,|\()@([a-z0-9_.]{1,32})$/i.exec(slice);
        if (!match) return null;
        const query = match[2];
        const atIndex = slice.lastIndexOf(`@${query}`);
        if (atIndex < 0) return null;
        return { query, start: atIndex, end: cursor };
    };

    const handleAuthorsChange = (nextValue: string) => {
        setAuthors(nextValue);
        const cursor = authorsInputRef.current?.selectionStart ?? null;
        const mention = detectMention(nextValue, cursor);
        if (mention && mention.query.length >= 2) {
            setMentionState(mention);
            setMentionOpen(true);
        } else {
            setMentionState(null);
            setMentionOpen(false);
        }
    };

    const handleAuthorsCursorUpdate = () => {
        const cursor = authorsInputRef.current?.selectionStart ?? null;
        const mention = detectMention(authors, cursor);
        if (mention && mention.query.length >= 2) {
            setMentionState(mention);
            setMentionOpen(true);
        } else {
            setMentionState(null);
            setMentionOpen(false);
        }
    };

    const selectMention = (user: MentionUser) => {
        if (!mentionState || !user.username) return;
        const mentionText = `@${user.username}`;
        const before = authors.slice(0, mentionState.start);
        const after = authors.slice(mentionState.end);
        const afterTrim = after.trimStart();
        const spacer = afterTrim.startsWith(",") ? "" : ", ";
        const nextValue = `${before}${mentionText}${spacer}${afterTrim}`;
        setAuthors(nextValue);
        const cursor = before.length + mentionText.length + spacer.length;
        setSelection(cursor, cursor);
        setMentionOpen(false);
        setMentionState(null);
    };

    const handleAuthorsKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!mentionOpen || mentionUsers.length === 0) return;
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setMentionIndex((prev) => (prev + 1) % mentionUsers.length);
        }
        if (event.key === "ArrowUp") {
            event.preventDefault();
            setMentionIndex((prev) =>
                prev === 0 ? mentionUsers.length - 1 : prev - 1,
            );
        }
        if (event.key === "Enter") {
            event.preventDefault();
            const user = mentionUsers[mentionIndex];
            if (user) selectMention(user);
        }
        if (event.key === "Escape") {
            event.preventDefault();
            setMentionOpen(false);
        }
    };

    const renderInitial = (user: MentionUser) => {
        const base = (user.name || user.username || "?").trim();
        return base ? base.charAt(0).toUpperCase() : "?";
    };

    const renderHighlight = (text: string) => {
        if (!normalizedQuery) return text;
        const lower = text.toLowerCase();
        const index = lower.indexOf(normalizedQuery);
        if (index < 0) return text;
        return (
            <>
                {text.slice(0, index)}
                <span className="text-primary font-semibold">
                    {text.slice(index, index + normalizedQuery.length)}
                </span>
                {text.slice(index + normalizedQuery.length)}
            </>
        );
    };

    const updateLink = (index: number, value: string) => {
        setLinks((prev) => prev.map((item, i) => (i === index ? value : item)));
    };

    const addLink = () => {
        setLinks((prev) => (prev.length >= 4 ? prev : [...prev, ""]));
    };

    const removeLink = (index: number) => {
        setLinks((prev) => {
            const next = prev.filter((_, i) => i !== index);
            return next.length > 0 ? next : [""];
        });
    };

    useEffect(() => {
        if (!mentionState || mentionState.query.length < 2 || !apiBase) {
            setMentionUsers([]);
            setMentionOpen(false);
            return;
        }

        const controller = new AbortController();
        const handle = setTimeout(async () => {
            try {
                setMentionLoading(true);
                const res = await fetch(
                    `${apiBase}/users/search?q=${encodeURIComponent(mentionState.query)}`,
                    { credentials: "include", signal: controller.signal },
                );
                if (!res.ok) {
                    setMentionUsers([]);
                    return;
                }
                const data = (await res.json()) as MentionUser[];
                const filtered = (data || []).filter(
                    (u) => !!u.username && u.username.toLowerCase().includes(normalizedQuery),
                );
                setMentionUsers(filtered);
                setMentionIndex(0);
                setMentionOpen(true);
            } catch (err) {
                if ((err as Error).name !== "AbortError") {
                    setMentionUsers([]);
                }
            } finally {
                setMentionLoading(false);
            }
        }, 200);

        return () => {
            clearTimeout(handle);
            controller.abort();
        };
    }, [mentionState, apiBase, normalizedQuery]);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja deletar este projeto?")) return;
        if (!apiBase) {
            addToast({ title: "Erro", description: "API não configurada", color: "danger" });
            return;
        }
        try {
            const res = await fetch(`${apiBase}/official-projects?id=${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (res.ok) {
                setProjects(projects.filter(p => p._id !== id));
                addToast({ title: "Sucesso", description: "Projeto removido", color: "success" });
            }
        } catch (err) {
            addToast({ title: "Erro", description: "Erro ao deletar", color: "danger" });
        }
    };

    async function handleSave() {
        if (!name.trim() || !key.trim() || !authors.trim() || (!bannerFile && !existingBanner)) return;
        if (!apiBase) {
            addToast({ title: "Erro", description: "API não configurada", color: "danger" });
            return;
        }

        const linksPayload = links
            .map((link) => normalizeLinkUrl(link))
            .filter(Boolean)
            .slice(0, 4)
            .map((url) => ({ url }));

        let bannerBase64 = existingBanner;
        if (bannerFile) {
            bannerBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(bannerFile);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (err) => reject(err);
            });
        }

        try {
            setLoading(true);
            const method = editingId ? "PUT" : "POST";
            const res = await fetch(`${apiBase}/official-projects`, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    _id: editingId,
                    key,
                    name,
                    authors: authors.split(",").map(a => a.trim()).filter(Boolean),
                    infos: { images: { banner: bannerBase64 }, links: linksPayload },
                }),
            });

            if (!res.ok) throw new Error("Erro ao salvar projeto");

            const result = await res.json();
            if (editingId) {
                setProjects(projects.map(p => p._id === editingId ? result.project : p));
            } else {
                setProjects([result.project, ...projects]);
            }

            addToast({
                title: editingId ? "Projeto atualizado" : "Projeto criado",
                description: "Operação realizada com sucesso.",
                color: "primary",
                timeout: 3000,
            });

            resetForm();
            setOpen(false);
        } catch (err) {
            console.error(err);
            addToast({ title: "Erro", description: "Não foi possível salvar o projeto", color: "danger" });
        } finally {
            setLoading(false);
        }
    }

    function handleRemoveBanner() {
        setBannerFile(null);
        setExistingBanner("");
    }

    return (
        <>
            <div className="min-h-screen max-w-6xl mx-auto py-20 px-6 sm:px-8 lg:px-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {projects.map(project => (
                        <OfficialProjectCard 
                            key={project.key} 
                            project={project} 
                            isAdmin={isAdmin}
                            showActions={isAltPressed}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            </div>

            {isAdmin && (
                <>
                    <Button
                        isIconOnly
                        onPress={() => { resetForm(); setOpen(true); }}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl"
                    >
                        <FaPlus size={20} />
                    </Button>

                    <Drawer
                        isOpen={open}
                        backdrop="opaque"
                        placement="right"
                        classNames={{
                            base: "bg-background/25 backdrop-blur-md",
                        }}
                        onOpenChange={(isOpen) => {
                            setOpen(isOpen);
                            if (!isOpen) resetForm();
                        }}
                        size="md"
                    >
                        <DrawerContent>
                            {(onClose) => (
                                <>
                                    <DrawerHeader className="text-xl font-bold">
                                        {editingId ? "Editar Projeto" : "Novo Projeto"}
                                    </DrawerHeader>
                                    <DrawerBody className="gap-5">
                                        <Input label="Key" value={key} onValueChange={setKey} variant="bordered" />
                                        <Input label="Nome" value={name} onValueChange={setName} variant="bordered" />
                                        <div className="relative">
                                            <Input
                                                ref={authorsInputRef}
                                                label="Autores (vírgula separados)"
                                                value={authors}
                                                variant="bordered"
                                                onChange={(event) => handleAuthorsChange(event.target.value)}
                                                onKeyDown={handleAuthorsKeyDown}
                                                onKeyUp={handleAuthorsCursorUpdate}
                                                onClick={handleAuthorsCursorUpdate}
                                            />
                                            {mentionOpen && (
                                                <div className="absolute left-0 right-0 top-full mt-2 z-[999] rounded-xl border border-amber-400/30 bg-background/95 shadow-lg backdrop-blur">
                                                    <div className="px-3 py-2 text-xs text-foreground/60 border-b border-foreground/10">
                                                        {mentionLoading ? "Buscando usuários..." : "Mencione um usuário"}
                                                    </div>
                                                    <ul className="max-h-56 overflow-y-auto">
                                                        {mentionUsers.map((user, index) => (
                                                            <li key={user.id}>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => selectMention(user)}
                                                                    onMouseEnter={() => setMentionIndex(index)}
                                                                    className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                                                                        index === mentionIndex
                                                                            ? "bg-amber-500/15 text-foreground"
                                                                            : "hover:bg-foreground/5"
                                                                    }`}
                                                                >
                                                                    {user.image ? (
                                                                        // eslint-disable-next-line @next/next/no-img-element
                                                                        <img
                                                                            src={user.image}
                                                                            alt={user.name ?? user.username ?? "avatar"}
                                                                            className="h-7 w-7 rounded-full object-cover border border-foreground/10"
                                                                        />
                                                                    ) : (
                                                                        <div className="h-7 w-7 rounded-full bg-foreground/10 text-xs flex items-center justify-center text-foreground/70 border border-foreground/10">
                                                                            {renderInitial(user)}
                                                                        </div>
                                                                    )}
                                                                <div className="flex flex-col">
                                                                        <span className="font-medium">
                                                                            @{renderHighlight(user.username ?? "")}
                                                                        </span>
                                                                        {user.name && (
                                                                            <span className="text-xs text-foreground/60">
                                                                                {renderHighlight(user.name)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </button>
                                                            </li>
                                                        ))}
                                                        {!mentionLoading && mentionUsers.length === 0 && (
                                                            <li className="px-3 py-2 text-sm text-foreground/60">
                                                                Nenhum usuário encontrado.
                                                            </li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Dropzone de banner */}
                                        <div
                                            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition relative"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {bannerPreview ? (
                                                <>
                                                    <img src={bannerPreview} alt="Preview Banner" className="w-full h-48 object-cover rounded" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleRemoveBanner(); }}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                                        title="Remover imagem"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <FaUpload size={32} className="mb-2 text-gray-500" />
                                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                                        Arraste ou clique para enviar a imagem do banner
                                                    </p>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={fileInputRef}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) setBannerFile(file);
                                                }}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">Links</span>
                                                <Button
                                                    isIconOnly
                                                    size="sm"
                                                    variant="light"
                                                    onPress={addLink}
                                                    isDisabled={links.length >= 4}
                                                >
                                                    <FaPlus size={12} />
                                                </Button>
                                            </div>
                                            {links.map((link, index) => {
                                                const Icon = getLinkIconForUrl(link);
                                                return (
                                                    <div key={`${index}-${link}`} className="flex items-center gap-2">
                                                        <Input
                                                            value={link}
                                                            variant="bordered"
                                                            placeholder="https://..."
                                                            startContent={
                                                                <Icon className="h-4 w-4 text-foreground/50" />
                                                            }
                                                            onChange={(event) => updateLink(index, event.target.value)}
                                                        />
                                                        {links.length > 1 && (
                                                            <Button
                                                                isIconOnly
                                                                size="sm"
                                                                variant="light"
                                                                onPress={() => removeLink(index)}
                                                            >
                                                                <FaTrash size={12} />
                                                            </Button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            <p className="text-xs text-foreground/50">
                                                Até 4 links. Se não começar com http(s), usaremos https://
                                            </p>
                                        </div>

                                        <div className="flex justify-end gap-2 pt-4">
                                            <Button variant="light" onPress={onClose} isDisabled={loading}>Cancelar</Button>
                                            <Button color="primary" onPress={handleSave} isLoading={loading}>
                                                {editingId ? "Salvar Alterações" : "Enviar"}
                                            </Button>
                                        </div>
                                    </DrawerBody>
                                </>
                            )}
                        </DrawerContent>
                    </Drawer>
                </>
            )}
        </>
    );
}
