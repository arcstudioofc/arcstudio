"use client";

import { useState } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Input,
  Textarea,
  Select,
  SelectItem,
} from "@heroui/react";
import { FaPlus } from "react-icons/fa";
import { addToast } from "@heroui/react";
import { ChangelogType } from "@/constants/changelogTypes";

export function FloatingChangelogButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<ChangelogType>(ChangelogType.Feature);

  async function handleSave() {
    if (!title.trim() || !content.trim()) return;

    try {
      setLoading(true);

      const res = await fetch("/api/changelogs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          type,
        }),
      });

      if (!res.ok) {
        throw new Error("Erro ao salvar changelog");
      }

      // feedback decente
      addToast({
        title: "Changelog publicado",
        description: "Changelog criado com sucesso.",
        color: "primary",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });

      // limpa estado
      setTitle("");
      setContent("");
      setType(ChangelogType.Feature);
      setOpen(false);

      // delay curto pra UX não parecer bug
      setTimeout(() => {
        window.location.reload();
      }, 3200);
    } catch (err) {
      console.error(err);

      addToast({
        title: "Erro ao publicar",
        description: "Não foi possível criar o changelog.",
        timeout: 3000,
        shouldShowTimeoutProgress: true,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating Action Button */}
      <Button
        isIconOnly
        onPress={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl"
      >
        <FaPlus size={20} />
      </Button>

      {/* Drawer */}
      <Drawer
        isOpen={open}
        backdrop="opaque"
        placement="right"
        classNames={{
          base: "bg-background/25 backdrop-blur-md",
        }}
        onOpenChange={setOpen}
        size="md"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="text-xl font-bold">
                New Changelog
              </DrawerHeader>

              <DrawerBody className="gap-5">
                <Input
                  label="Title"
                  placeholder="Ex: Fix login bug"
                  value={title}
                  variant="bordered"
                  onValueChange={setTitle}
                />

                <Select
                  label="Type"
                  selectedKeys={[type]}
                  variant="bordered"
                  // classNames={{
                  //   base: ""
                  // }}
                  onSelectionChange={(keys) =>
                    setType(Array.from(keys)[0] as ChangelogType)
                  }
                >
                  {Object.values(ChangelogType).map((t) => (
                    <SelectItem key={t}>{t}</SelectItem>
                  ))}
                </Select>

                <Textarea
                  label="Content"
                  placeholder="Describe the change..."
                  minRows={6}
                  value={content}
                  variant="bordered"
                  onValueChange={setContent}
                />

                {/* Callout */}
                <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning-700">
                  <strong>Importante:</strong> Para deletar um changelog após a
                  postagem, pressione{" "}
                  <kbd className="mx-1 rounded bg-black/10 px-1">Alt</kbd>.
                  Uma lixeira aparecerá ao lado para removê-lo.
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="light"
                    onPress={onClose}
                    isDisabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSave}
                    isLoading={loading}
                  >
                    Enviar
                  </Button>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
