"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { FiGlobe } from "react-icons/fi";
import { FaGithub, FaPlus, FaUpload, FaTrash, FaPencilAlt } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardBody, CardFooter, Button, Drawer, DrawerContent, DrawerHeader, DrawerBody, Input, addToast } from "@heroui/react";

import { auth } from "@/lib/auth";
import { useAltKey } from "@/lib/useAltKey";

type ProjectType = {
    _id?: string;
    key: string;
    name: string;
    authors: string[];
    infos: {
        images: { banner: string };
        links: { website?: string; github?: string };
    };
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
    const { website, github } = infos.links;

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
                    {t("author")}: {authors.join(", ")}
                </p>

                <CardFooter className="flex gap-2 p-0 pt-2">
                    {website && (
                        <Button
                            as={Link}
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="sm"
                            variant="flat"
                            isIconOnly
                        >
                            <FiGlobe className="h-4 w-4" />
                        </Button>
                    )}

                    {github && (
                        <Button
                            as={Link}
                            href={github}
                            target="_blank"
                            rel="noopener noreferrer"
                            size="sm"
                            variant="flat"
                            isIconOnly
                        >
                            <FaGithub className="h-4 w-4" />
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

    const [projects, setProjects] = useState(initialProjects);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const [name, setName] = useState("");
    const [key, setKey] = useState("");
    const [authors, setAuthors] = useState("");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [existingBanner, setExistingBanner] = useState("");
    const [website, setWebsite] = useState("");
    const [github, setGithub] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerPreview = bannerFile ? URL.createObjectURL(bannerFile) : existingBanner;

    const resetForm = () => {
        setName(""); setKey(""); setAuthors(""); setBannerFile(null); setExistingBanner(""); setWebsite(""); setGithub("");
        setEditingId(null);
    };

    const handleEdit = (project: ProjectType) => {
        setEditingId(project._id || null);
        setName(project.name);
        setKey(project.key);
        setAuthors(project.authors.join(", "));
        setExistingBanner(project.infos.images.banner);
        setWebsite(project.infos.links.website || "");
        setGithub(project.infos.links.github || "");
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja deletar este projeto?")) return;
        try {
            const res = await fetch(`/api/official-projects?id=${id}`, { method: "DELETE" });
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
            const res = await fetch("/api/official-projects", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    _id: editingId,
                    key,
                    name,
                    authors: authors.split(",").map(a => a.trim()),
                    infos: { images: { banner: bannerBase64 }, links: { website, github } },
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
                                        <Input label="Autores (vírgula separados)" value={authors} onValueChange={setAuthors} variant="bordered" />

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

                                        <Input label="Website" value={website} onValueChange={setWebsite} variant="bordered" />
                                        <Input label="GitHub" value={github} onValueChange={setGithub} variant="bordered" />

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
