"use client";

import { useMemo, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { useTranslations } from "next-intl";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  Input,
  Select,
  SelectItem,
  addToast,
} from "@heroui/react";

import { IconTimelineItem } from "@/app/_components/IconTimelineItem";
import { FloatingChangelogButton } from "../../FloatingChangelogButton";
import { MarkdownEditor } from "@/app/_components/MarkdownEditor";
import { auth } from "@/lib/auth";
import { toChangelogSummary } from "@/lib/changelog";
import { useAltKey } from "@/lib/useAltKey";
import { ChangelogType } from "@/constants/changelogTypes";
import type { ApiChangelog } from "@/types/changelog";

type SortMode = "newest" | "oldest";

function readSelectionValue(keys: "all" | Set<unknown>): string | null {
  if (keys === "all") return null;

  const [selected] = Array.from(keys);
  if (typeof selected === "string") return selected;
  if (typeof selected === "number") return String(selected);

  return null;
}

export default function ChangelogClient({
  changelogs: initialChangelogs,
}: { changelogs: ApiChangelog[] }) {
  const t = useTranslations("Changelog");
  const { data: session } = auth.useSession();
  const isAltPressed = useAltKey();
  const isAdmin = session?.user.role === "admin";
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  const [changelogs, setChangelogs] = useState<ApiChangelog[]>(initialChangelogs);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ApiChangelog | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortMode, setSortMode] = useState<SortMode>("newest");

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState<string>("");

  const changelogRows = useMemo(
    () =>
      changelogs.map((entry) => ({
        entry,
        summary: toChangelogSummary(entry),
      })),
    [changelogs],
  );

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let rows = changelogRows;

    if (typeFilter !== "all") {
      rows = rows.filter(({ summary }) => summary.type === typeFilter);
    }

    if (query) {
      rows = rows.filter(({ summary }) =>
        `${summary.title} ${summary.type} ${summary.author}`
          .toLowerCase()
          .includes(query),
      );
    }

    const sorted = [...rows].sort((a, b) => {
      const left = a.summary.date.getTime();
      const right = b.summary.date.getTime();

      return sortMode === "newest" ? right - left : left - right;
    });

    return sorted;
  }, [changelogRows, searchQuery, sortMode, typeFilter]);

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setSortMode("newest");
  };

  const handleEdit = (entry: ApiChangelog) => {
    setEditingItem(entry);
    setTitle(entry.title);
    const rawContent = entry.content || "";
    setContent(rawContent);
    setType(entry.type);
    setIsEditOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    if (!apiBase) {
      addToast({
        title: t("toast.errorTitle"),
        description: t("toast.apiNotConfigured"),
        color: "danger",
      });
      return;
    }

    try {
      const res = await fetch(`${apiBase}/changelogs?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setChangelogs((prev) => prev.filter((changelog) => changelog._id !== id));
        addToast({
          title: t("toast.successTitle"),
          description: t("toast.deleted"),
          color: "success",
        });
      }
    } catch {
      addToast({
        title: t("toast.errorTitle"),
        description: t("toast.deleteError"),
        color: "danger",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingItem?._id) {
      console.error("No editing item ID found");
      return;
    }
    if (!apiBase) {
      addToast({
        title: t("toast.errorTitle"),
        description: t("toast.apiNotConfigured"),
        color: "danger",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/changelogs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editingItem._id, title, content, type }),
      });

      const result = (await res.json()) as
        | { success: true; data: ApiChangelog }
        | { success?: false; error?: string };

      if (res.ok && result.success) {
        const updatedData = result.data;
        setChangelogs((prev) =>
          prev.map((changelog) =>
            changelog._id === updatedData._id ? updatedData : changelog,
          ),
        );
        setIsEditOpen(false);
        addToast({
          title: t("toast.successTitle"),
          description: t("toast.updated"),
          color: "success",
        });
      } else {
        throw new Error(t("toast.updateError"));
      }
    } catch (error) {
      console.error("Update error:", error);
      const fallbackMessage = t("toast.updateError");
      const message =
        error instanceof Error && error.message ? error.message : fallbackMessage;

      addToast({
        title: t("toast.errorTitle"),
        description: message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen p-6 md:p-10">
        <div className="max-w-5xl mx-auto">
          <Card
            shadow="sm"
            isBlurred
            className="relative mb-8 overflow-hidden border border-foreground/10 bg-background/70"
          >
            <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-12 -bottom-16 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />

            <CardHeader className="relative flex items-start gap-6 px-6 py-6 md:px-8 md:pt-8 md:pb-5">
              <div className="bg-primary p-4 rounded-2xl flex items-center justify-center shadow-lg text-white">
                <FaCalendarAlt size={30} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl md:text-4xl font-extrabold">{t("title")}</h1>
                  <Chip size="sm" variant="flat" color="primary">
                    {t("badgeTimeline")}
                  </Chip>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg mt-1">
                  {t("description")}
                </p>
              </div>
            </CardHeader>
          </Card>

          <div className="flex flex-col gap-4 md:gap-5">
            {filteredRows.length === 0 ? (
              <Card shadow="none" className="border border-dashed border-foreground/20 bg-background/50">
                <CardBody className="px-6 py-10 text-center">
                  <h2 className="text-xl font-semibold text-foreground">{t("empty.title")}</h2>
                  <p className="text-sm text-foreground/60 mt-2">
                    {t("empty.description")}
                  </p>
                  <div className="mt-4">
                    <Button variant="flat" color="primary" onPress={clearFilters}>
                      {t("actions.resetView")}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ) : (
              filteredRows.map(({ entry, summary }) => (
                <IconTimelineItem
                  key={entry._id}
                  isAdmin={isAdmin}
                  showActions={isAltPressed}
                  onEdit={() => handleEdit(entry)}
                  onDelete={handleDelete}
                  entry={{
                    ...summary,
                    href: `/changelog/${entry._id}`,
                  }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {isAdmin ? <FloatingChangelogButton /> : null}

      <Drawer
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        placement="right"
        size="md"
        backdrop="blur"
        classNames={{
          base: "bg-background/70 backdrop-blur-xl border-l border-foreground/10",
          header: "border-b border-foreground/10",
          body: "pt-4",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="text-xl font-bold">{t("editor.title")}</DrawerHeader>
              <DrawerBody className="gap-5">
                <Input label={t("editor.titleLabel")} value={title} onValueChange={setTitle} variant="bordered" />
                <Select
                  label={t("editor.typeLabel")}
                  selectedKeys={type ? [type] : []}
                  onSelectionChange={(keys) => {
                    const selected = readSelectionValue(keys);
                    if (selected) setType(selected);
                  }}
                  variant="bordered"
                >
                  {Object.values(ChangelogType).map((value) => (
                    <SelectItem key={value} textValue={value}>{value}</SelectItem>
                  ))}
                </Select>
                <MarkdownEditor
                  label={t("editor.contentLabel")}
                  value={content}
                  onChange={setContent}
                  minRows={8}
                />
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="light" onPress={onClose}>{t("actions.cancel")}</Button>
                  <Button color="primary" onPress={handleUpdate} isLoading={loading}>{t("actions.saveChanges")}</Button>
                </div>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
