"use client";

import { Children, ReactElement, ReactNode, cloneElement, isValidElement } from "react";
import type { IconType } from "react-icons";
import {
  FaBolt,
  FaExclamationTriangle,
  FaInfoCircle,
  FaLightbulb,
  FaRadiation,
} from "react-icons/fa";
import hljs from "highlight.js";
import "@/styles/highlight-arc.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { MentionBadge } from "@/app/_components/MentionBadge";

type Props = {
  content: string;
  className?: string;
};

const mentionRegex = /(^|[^a-z0-9_])@([a-z0-9_.]{1,32})/gi;
const calloutTokenRegex = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|WARN|CAUTION)\]\s*/i;

const CALLOUTS: Record<
  string,
  {
    label: string;
    Icon: IconType;
    bar: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  NOTE: {
    label: "NOTE",
    Icon: FaInfoCircle,
    bar: "bg-gradient-to-b from-sky-400 via-sky-500 to-sky-400",
    iconBg: "bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/40",
    iconColor: "text-sky-200",
  },
  TIP: {
    label: "TIP",
    Icon: FaLightbulb,
    bar: "bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-400",
    iconBg: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40",
    iconColor: "text-emerald-200",
  },
  IMPORTANT: {
    label: "IMPORTANT",
    Icon: FaBolt,
    bar: "bg-gradient-to-b from-violet-400 via-violet-500 to-violet-400",
    iconBg: "bg-violet-500/15 text-violet-200 ring-1 ring-violet-400/40",
    iconColor: "text-violet-200",
  },
  WARNING: {
    label: "WARNING",
    Icon: FaExclamationTriangle,
    bar: "bg-gradient-to-b from-amber-400 via-amber-500 to-amber-400",
    iconBg: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/40",
    iconColor: "text-amber-200",
  },
  CAUTION: {
    label: "CAUTION",
    Icon: FaRadiation,
    bar: "bg-gradient-to-b from-rose-400 via-rose-500 to-rose-400",
    iconBg: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/40",
    iconColor: "text-rose-200",
  },
};

const splitMentions = (text: string) => {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;
  mentionRegex.lastIndex = 0;

  while ((match = mentionRegex.exec(text)) !== null) {
    const matchIndex = match.index ?? 0;
    const prefix = match[1] ?? "";
    const username = match[2] ?? "";
    const matchText = match[0] ?? "";

    if (matchIndex > lastIndex) {
      parts.push(text.slice(lastIndex, matchIndex));
    }
    if (prefix) parts.push(prefix);
    if (username) {
      parts.push(
        <MentionBadge key={`${matchIndex}-${username}`} username={username} />,
      );
    }
    lastIndex = matchIndex + matchText.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length ? parts : text;
};

export function MarkdownContent({ content, className }: Props) {
  const renderMentions = (node: ReactNode): ReactNode => {
    if (typeof node === "string") return splitMentions(node);
    if (Array.isArray(node)) return node.map((child) => renderMentions(child));
    if (isValidElement(node)) {
      const element = node as ReactElement<{ children?: ReactNode }>;
      const type = typeof element.type === "string" ? element.type : "";
      if (["code", "pre", "a"].includes(type)) return node;
      return cloneElement(element, {
        children: renderMentions(element.props.children),
      });
    }
    return node;
  };

  const getChildren = (node: ReactNode): ReactNode => {
    if (isValidElement(node)) {
      return (node as ReactElement<{ children?: ReactNode }>).props.children;
    }
    return "";
  };

  const extractText = (node: ReactNode): string => {
    if (typeof node === "string") return node;
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (isValidElement(node)) return extractText(getChildren(node));
    return "";
  };

  const stripTokenFromChildren = (node: ReactNode, tokenRegex: RegExp, stripped: { done: boolean }): ReactNode => {
    if (stripped.done) return node;
    if (typeof node === "string") {
      const next = node.replace(tokenRegex, "");
      if (next !== node) stripped.done = true;
      return next;
    }
    if (Array.isArray(node)) {
      return node.map((child) => stripTokenFromChildren(child, tokenRegex, stripped));
    }
    if (isValidElement(node)) {
      const element = node as ReactElement<{ children?: ReactNode }>;
      return cloneElement(element, {
        children: stripTokenFromChildren(element.props.children, tokenRegex, stripped),
      });
    }
    return node;
  };

  const renderCallout = (rawType: string, body: ReactNode) => {
    const normalized = rawType === "WARN" ? "WARNING" : rawType;
    const config = CALLOUTS[normalized] ?? CALLOUTS.NOTE;
    const { Icon, label, bar, iconBg, iconColor } = config;

    return (
      <div className="relative my-4 overflow-hidden rounded-xl border border-foreground/10 bg-background/70 backdrop-blur-sm shadow-[0_12px_42px_-20px_rgba(0,0,0,0.45)]">
        <span className={`absolute inset-y-0 left-0 w-1.5 ${bar}`} aria-hidden="true" />
        <div className="flex gap-3 px-4 py-3 pl-6">
          <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={iconColor} size={16} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground/70">
              {label}
            </div>
            <div className="text-sm leading-6 text-foreground/90">{body}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderVideo = (src: string, title?: string) => (
    <div className="my-4 w-full aspect-video">
      <iframe
        className="h-full w-full rounded-xl border border-foreground/10 bg-foreground/5"
        src={src}
        title={title ?? "Video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-4 mb-2">
              {renderMentions(children)}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-semibold mt-4 mb-2">
              {renderMentions(children)}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-semibold mt-3 mb-2">
              {renderMentions(children)}
            </h3>
          ),
          p: ({ children }) => {
            const text = extractText(children).trim();
            const match = /^@video\s+(\S+)(?:\s*\|\s*(.+))?$/i.exec(text);
            if (match) {
              const src = match[1];
              if (src?.startsWith("http")) {
                return renderVideo(src, match[2]);
              }
            }
            return (
              <p className="text-sm leading-6 text-foreground/80 mb-2 last:mb-0">
                {renderMentions(children)}
              </p>
            );
          },
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1 text-sm text-foreground/80 my-2">
              {renderMentions(children)}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1 text-sm text-foreground/80 my-2">
              {renderMentions(children)}
            </ol>
          ),
          li: ({ children }) => <li className="leading-6">{renderMentions(children)}</li>,
          blockquote: ({ children }) => {
            const allText = extractText(children).trimStart();
            const match = calloutTokenRegex.exec(allText);

            if (match) {
              const token = match[1].toUpperCase();
              const stripped = { done: false };
              const cleanedChildren = stripTokenFromChildren(children, calloutTokenRegex, stripped);
              const body = <div className="space-y-2">{renderMentions(cleanedChildren)}</div>;
              return renderCallout(token, body);
            }

            return (
              <blockquote className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-2 text-sm text-foreground/80 italic shadow-[0_10px_32px_-24px_rgba(0,0,0,0.45)]">
                {renderMentions(children)}
              </blockquote>
            );
          },
          code: ({ children, className }) => {
            const isInline = !className;
            const code = String(children ?? "").replace(/\n$/, "");
            if (isInline) {
              return (
                <code className="px-1 py-0.5 rounded bg-foreground/10 font-mono text-xs">
                  {children}
                </code>
              );
            }

            const language =
              className?.replace("language-", "").trim() || "";
            const highlighted = language && hljs.getLanguage(language)
              ? hljs.highlight(code, { language }).value
              : hljs.highlightAuto(code).value;

            return (
              <pre className="rounded-lg overflow-x-auto text-xs hljs">
                <code
                  className={`hljs ${language ? `language-${language}` : ""}`}
                  dangerouslySetInnerHTML={{ __html: highlighted }}
                />
              </pre>
            );
          },
          img: ({ src, alt }) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src ?? ""}
              alt={alt ?? ""}
              className="my-3 max-h-[420px] w-auto rounded-lg border border-foreground/10"
            />
          ),
          hr: () => <hr className="my-4 border-foreground/10" />,
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-foreground/20 p-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-foreground/10 p-2">{children}</td>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}
