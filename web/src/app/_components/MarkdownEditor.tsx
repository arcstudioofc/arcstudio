"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FaBold,
  FaBolt,
  FaCheckSquare,
  FaCode,
  FaExclamationTriangle,
  FaInfoCircle,
  FaHeading,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaQuoteRight,
  FaStrikethrough,
  FaAt,
  FaUndo,
  FaRedo,
  FaRegFile,
  FaPaperclip,
  FaLightbulb,
  FaRadiation,
} from "react-icons/fa";

import { addToast } from "@heroui/react";
import { MarkdownContent } from "@/app/_components/MarkdownContent";

type Props = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
};

type Mode = "write" | "preview";

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

export function MarkdownEditor({
  label,
  value,
  onChange,
  placeholder,
  minRows = 6,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [mode, setMode] = useState<Mode>("write");
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

  const [mentionState, setMentionState] = useState<MentionState | null>(null);
  const [mentionUsers, setMentionUsers] = useState<MentionUser[]>([]);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionLoading, setMentionLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const normalizedQuery = useMemo(
    () => mentionState?.query.toLowerCase() ?? "",
    [mentionState?.query],
  );

  const setSelection = (start: number, end: number) => {
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(start, end);
    });
  };

  const insertAtRange = (start: number, end: number, snippet: string, cursorOffset = snippet.length) => {
    const nextValue = value.slice(0, start) + snippet + value.slice(end);
    onChange(nextValue);
    const cursor = start + cursorOffset;
    setSelection(cursor, cursor);
  };

  const applyWrap = (prefix: string, suffix = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end);
    const nextValue =
      value.slice(0, start) + prefix + selected + suffix + value.slice(end);
    onChange(nextValue);
    setSelection(start + prefix.length, end + prefix.length);
  };

  const applyLinePrefix = (prefix: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end);
    const lines = (selected || "").split("\n");
    const prefixed = lines.map((line) => `${prefix}${line}`).join("\n");
    const nextValue = value.slice(0, start) + prefixed + value.slice(end);
    onChange(nextValue);
    setSelection(start, start + prefixed.length);
  };

  const insertSnippet = (snippet: string, cursorOffset = snippet.length) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    insertAtRange(start, end, snippet, cursorOffset);
  };

  const insertLink = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = value.slice(start, end) || "texto";
    const snippet = `[${selected}](url)`;
    const nextValue = value.slice(0, start) + snippet + value.slice(end);
    onChange(nextValue);
    setSelection(start + 1, start + 1 + selected.length);
  };

  const insertMentionSymbol = () => {
    insertSnippet("@", 1);
  };

  const insertCalloutTemplate = (type: "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION") => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const existing = value.slice(start, end);
    const body = existing || "Hello, world!";
    const snippet = `> [!${type}]\n> ${body}`;
    insertAtRange(start, end, snippet, snippet.length);
  };

  const handleUndo = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("undo");
  };

  const handleRedo = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    document.execCommand("redo");
  };

  const readFileAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
      reader.readAsDataURL(file);
    });

  const uploadToApi = async (file: File): Promise<string | null> => {
    if (!apiBase) {
      addToast({
        title: "API não configurada",
        description: "Defina NEXT_PUBLIC_API_URL para enviar imagens.",
        color: "danger",
        timeout: 3000,
      });
      return null;
    }

    let dataUrl = "";
    try {
      dataUrl = await readFileAsDataUrl(file);
    } catch {
      addToast({
        title: "Falha ao ler imagem",
        description: "Não foi possível processar o arquivo.",
        color: "danger",
        timeout: 3000,
      });
      return null;
    }

    const res = await fetch(`${apiBase}/changelogs/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: dataUrl,
        type: file.type,
        name: file.name,
      }),
      credentials: "include",
    });

    const data = (await res.json()) as {
      success?: boolean;
      url?: string;
      error?: string;
    };

    if (!res.ok || !data?.url) {
      addToast({
        title: "Falha ao enviar imagem",
        description: data?.error ?? "Tente novamente.",
        color: "danger",
        timeout: 3000,
      });
      return null;
    }

    return data.url;
  };

  const insertImages = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (list.length === 0) return;

    const el = textareaRef.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;

    const MAX_SIZE = 10 * 1024 * 1024;
    const oversize = list.filter((file) => file.size > MAX_SIZE);
    if (oversize.length > 0) {
      addToast({
        title: "Imagem muito grande",
        description: "O limite é 10MB por imagem.",
        color: "warning",
        timeout: 3000,
      });
    }

    const valid = list.filter((file) => file.size <= MAX_SIZE);
    if (valid.length === 0) return;

    setUploading(true);
    const links: string[] = [];
    try {
      for (const file of valid) {
        const url = await uploadToApi(file);
        if (url) {
          links.push(`![${file.name || "image"}](${url})`);
        }
      }
    } finally {
      setUploading(false);
    }

    if (links.length === 0) return;
    const snippet = links.join("\n");

    insertAtRange(start, end, `${start === 0 ? "" : "\n"}${snippet}\n`);
  };

  const detectMention = (text: string, cursor: number | null) => {
    if (cursor === null) return null;
    const slice = text.slice(0, cursor);
    const match = /(^|\s|\()@([a-z0-9_.]{1,32})$/i.exec(slice);
    if (!match) return null;
    const query = match[2];
    const atIndex = slice.lastIndexOf(`@${query}`);
    if (atIndex < 0) return null;
    return { query, start: atIndex, end: cursor };
  };

  const handleChange = (nextValue: string) => {
    onChange(nextValue);
    const cursor = textareaRef.current?.selectionStart ?? null;
    const mention = detectMention(nextValue, cursor);
    if (mention && mention.query.length >= 2) {
      setMentionState(mention);
      setMentionOpen(true);
    } else {
      setMentionState(null);
      setMentionOpen(false);
    }
  };

  const handleCursorUpdate = () => {
    if (mode !== "write") return;
    const cursor = textareaRef.current?.selectionStart ?? null;
    const mention = detectMention(value, cursor);
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
    const nextValue =
      value.slice(0, mentionState.start) +
      mentionText +
      " " +
      value.slice(mentionState.end);
    onChange(nextValue);
    const nextCursor = mentionState.start + mentionText.length + 1;
    setSelection(nextCursor, nextCursor);
    setMentionOpen(false);
    setMentionState(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
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

  const handlePaste = (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (uploading) return;
    const files = event.clipboardData?.files;
    if (files && files.length > 0) {
      event.preventDefault();
      void insertImages(files);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLTextAreaElement>) => {
    if (uploading) return;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      event.preventDefault();
      void insertImages(files);
    }
  };

  useEffect(() => {
    if (!mentionState || mentionState.query.length < 2 || !apiBase || mode !== "write") {
      setMentionUsers([]);
      setMentionOpen(false);
      return;
    }

    const controller = new AbortController();
    const handle = setTimeout(async () => {
      try {
        setMentionLoading(true);
        setMentionOpen(true);
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
  }, [mentionState, apiBase, mode]);

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

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-xs text-foreground/50">Markdown</span>
      </div>

      <div className="rounded-xl border border-foreground/15 bg-background/30">
        <div className="rounded-t-xl border-b border-foreground/10 bg-foreground/5 px-2 py-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className={`px-2 py-1 text-xs ${
                  mode === "write" ? "font-semibold text-primary" : "text-foreground/60"
                }`}
                onClick={() => setMode("write")}
              >
                Write
              </button>
              <button
                type="button"
                className={`px-2 py-1 text-xs ${
                  mode === "preview" ? "font-semibold text-primary" : "text-foreground/60"
                }`}
                onClick={() => setMode("preview")}
              >
                Preview
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 mt-1">
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={() => applyLinePrefix("# ")}
              title="Título"
            >
              <FaHeading />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={() => applyWrap("**")}
              title="Negrito"
            >
              <FaBold />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={() => applyWrap("_")}
              title="Itálico"
            >
              <FaItalic />
            </button>
          <button
            type="button"
            className="p-1.5 text-foreground/70 hover:text-foreground"
            onClick={() => applyWrap("~~")}
            title="Riscado"
          >
            <FaStrikethrough />
          </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={() => applyLinePrefix("- ")}
              title="Lista"
            >
              <FaListUl />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={() => applyLinePrefix("1. ")}
              title="Lista numerada"
            >
              <FaListOl />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={() => applyLinePrefix("- [ ] ")}
              title="Checklist"
            >
              <FaCheckSquare />
            </button>
          <button
            type="button"
            className="p-1.5 text-foreground/70 hover:text-foreground"
            onClick={() => applyLinePrefix("> ")}
            title="Citação"
          >
            <FaQuoteRight />
          </button>
          <button
            type="button"
            className="p-1.5 text-sky-400 hover:text-sky-300"
            onClick={() => insertCalloutTemplate("NOTE")}
            title="Inserir [!NOTE]"
          >
            <FaInfoCircle />
          </button>
          <button
            type="button"
            className="p-1.5 text-emerald-400 hover:text-emerald-300"
            onClick={() => insertCalloutTemplate("TIP")}
            title="Inserir [!TIP]"
          >
            <FaLightbulb />
          </button>
          <button
            type="button"
            className="p-1.5 text-violet-400 hover:text-violet-300"
            onClick={() => insertCalloutTemplate("IMPORTANT")}
            title="Inserir [!IMPORTANT]"
          >
            <FaBolt />
          </button>
          <button
            type="button"
            className="p-1.5 text-amber-400 hover:text-amber-300"
            onClick={() => insertCalloutTemplate("WARNING")}
            title="Inserir [!WARNING]"
          >
            <FaExclamationTriangle />
          </button>
          <button
            type="button"
            className="p-1.5 text-rose-400 hover:text-rose-300"
            onClick={() => insertCalloutTemplate("CAUTION")}
            title="Inserir [!CAUTION]"
          >
            <FaRadiation />
          </button>
          <button
            type="button"
            className="p-1.5 text-foreground/70 hover:text-foreground"
            onClick={() => applyWrap("`")}
            title="Inline code"
            >
              <FaCode />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={() => insertSnippet("\\n```\\n\\n```\\n", 5)}
              title="Bloco de código"
            >
              <FaCode />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={insertLink}
              title="Link"
            >
              <FaLink />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={insertMentionSymbol}
              title="Mencionar usuário"
            >
              <FaAt />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={() => fileInputRef.current?.click()}
              title="Anexar imagem"
            >
              <FaPaperclip />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={handleUndo}
              title="Undo"
            >
              <FaUndo />
            </button>
            <button
              type="button"
              className="p-1.5 text-foreground/70 hover:text-foreground"
              onClick={handleRedo}
              title="Redo"
            >
              <FaRedo />
            </button>
          </div>
        </div>

        {mode === "write" ? (
          <div className="relative">
            <textarea
              ref={textareaRef}
              className="w-full min-h-[180px] bg-background p-4 text-sm outline-none resize-vertical"
              rows={minRows}
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              onDrop={handleDrop}
              onDragOver={(event) => {
                event.preventDefault();
              }}
              onClick={handleCursorUpdate}
              onKeyUp={handleCursorUpdate}
              placeholder={placeholder ?? "Describe this release"}
              disabled={uploading}
            />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={(event) => {
                const files = event.target.files;
                if (files?.length) {
                  void insertImages(files);
                }
                if (event.target) event.target.value = "";
              }}
            />

            {mentionOpen && (
              <div className="absolute left-3 right-3 top-full mt-2 z-[999] rounded-xl border border-amber-400/30 bg-background/95 shadow-lg backdrop-blur">
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
        ) : (
          <div className="relative z-[999] p-4 text-sm">
            <MarkdownContent content={value} />
          </div>
        )}

        <div className="rounded-b-xl flex items-center justify-between border-t border-foreground/10 bg-foreground/5 px-3 py-2 text-xs text-foreground/60">
          <div className="flex items-center gap-2">
            <FaRegFile />
            <span>Markdown suportado</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="hover:text-foreground"
              disabled={uploading}
            >
              {uploading ? "Enviando imagens..." : "Colar, soltar ou clicar para anexar (local)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
