"use client";

import { useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { Drawer, DrawerContent, DrawerHeader, DrawerBody, Input, Button, Select, SelectItem, Textarea, addToast } from "@heroui/react";

import { IconTimelineItem } from "@/app/_components/IconTimelineItem";
import { FloatingChangelogButton } from "../../FloatingChangelogButton";
import { auth } from "@/lib/auth";
import { useAltKey } from "@/lib/useAltKey";
import { ChangelogType } from "@/constants/changelogTypes";

export default function ChangelogClient({ changelogs: initialChangelogs }: { changelogs: any[] }) {
  const t = useTranslations("Changelog");
  const { data: session } = auth.useSession();
  const isAltPressed = useAltKey();
  const isAdmin = session?.user.role === "admin";

  const [changelogs, setChangelogs] = useState(initialChangelogs);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("");

  const handleEdit = (entry: any) => {
    console.log("Editing entry:", entry);
    setEditingItem(entry);
    setTitle(entry.title);
    // Prioriza entry.content que vem do banco.
    const rawContent = entry.content || "";
    setContent(rawContent);
    setType(entry.type);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja deletar este changelog?")) return;

    try {
      const res = await fetch(`/api/changelogs?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setChangelogs(changelogs.filter(c => c._id !== id));
        addToast({ title: "Sucesso", description: "Changelog deletado", color: "success" });
      }
    } catch (error) {
      addToast({ title: "Erro", description: "Erro ao deletar", color: "danger" });
    }
  };

  const handleUpdate = async () => {
    if (!editingItem?._id) {
      console.error("No editing item ID found");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/changelogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingItem._id, title, content, type }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        const updatedData = result.data;
        setChangelogs(prev => prev.map(c => c._id === updatedData._id ? updatedData : c));
        setIsEditOpen(false);
        addToast({ title: "Sucesso", description: "Changelog atualizado", color: "success" });
      } else {
        throw new Error(result.error || "Erro ao atualizar");
      }
    } catch (error: any) {
      console.error("Update error:", error);
      addToast({ title: "Erro", description: error.message || "Erro ao atualizar", color: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-6 mb-10">
            <div className="bg-primary p-4 rounded-2xl flex items-center justify-center shadow-lg text-white">
              <FaCalendarAlt size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold">{t("title")}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {t("description")}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {changelogs.map((entry) => (
              <IconTimelineItem
                key={entry._id}
                isAdmin={isAdmin}
                showActions={isAltPressed}
                onEdit={() => handleEdit(entry)}
                onDelete={handleDelete}
                entry={{
                  ...entry,
                  date: new Date(entry.date),
                  children: (
                    <p className="text-gray-700 dark:text-gray-300">
                      {entry.content}
                    </p>
                  ),
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {isAdmin ? <FloatingChangelogButton /> : null}

      <Drawer
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        placement="right"
        size="md"
        classNames={{ base: "bg-background/25 backdrop-blur-md" }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="text-xl font-bold">Editar Changelog</DrawerHeader>
              <DrawerBody className="gap-5">
                <Input label="Título" value={title} onValueChange={setTitle} variant="bordered" />
                <Select 
                  label="Tipo" 
                  selectedKeys={[type]} 
                  onSelectionChange={(keys) => setType(Array.from(keys)[0] as string)}
                  variant="bordered"
                >
                  {Object.values(ChangelogType).map((t) => (
                    <SelectItem key={t} textValue={t}>{t}</SelectItem>
                  ))}
                </Select>
                <Textarea 
                  label="Conteúdo" 
                  value={content} 
                  onValueChange={setContent} 
                  variant="bordered" 
                  minRows={5}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="light" onPress={onClose}>Cancelar</Button>
                  <Button color="primary" onPress={handleUpdate} isLoading={loading}>Salvar Alterações</Button>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
