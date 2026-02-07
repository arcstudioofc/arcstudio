"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaShieldAlt } from "react-icons/fa";

type MentionUser = {
  id: string;
  username?: string;
  name?: string;
  image?: string | null;
  role?: string;
};

const mentionUserCache = new Map<string, MentionUser | null>();

export function MentionBadge({ username }: { username: string }) {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
  const cacheKey = username.toLowerCase();
  const badgeRef = useRef<HTMLSpanElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | null>(null);
  const [user, setUser] = useState<MentionUser | null | undefined>(() =>
    mentionUserCache.get(cacheKey),
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!apiBase || user !== undefined) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch(
          `${apiBase}/users/search?q=${encodeURIComponent(cacheKey)}&limit=3`,
          { credentials: "include" },
        );
        if (!res.ok) {
          mentionUserCache.set(cacheKey, null);
          if (active) setUser(null);
          return;
        }
        const data = (await res.json()) as MentionUser[];
        const exact =
          data.find((u) => u.username?.toLowerCase() === cacheKey) ?? null;
        mentionUserCache.set(cacheKey, exact);
        if (active) setUser(exact);
      } catch {
        mentionUserCache.set(cacheKey, null);
        if (active) setUser(null);
      }
    })();

    return () => {
      active = false;
    };
  }, [apiBase, cacheKey, user]);

  if (!user) {
    return <>{`@${username}`}</>;
  }

  const displayName = user.name || user.username || username;
  const displayUsername = user.username || username;
  const initial = (displayName || displayUsername || "?")
    .trim()
    .charAt(0)
    .toUpperCase();
  const isAdmin = user.role === "admin";

  const handleOpen = () => {
    if (badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      setAnchor({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const badgeClass = isAdmin
    ? "border-[#4f46e5]/40 bg-[#4f46e5]/10 text-[#4f46e5] dark:border-[#5865F2]/70 dark:bg-[#5865F2]/20 dark:text-[#c7d2fe]"
    : "border-amber-400/60 bg-amber-400/15 text-amber-200";

  return (
    <span
      ref={badgeRef}
      className="relative inline-flex items-center"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <span
        className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-medium ${badgeClass}`}
      >
        @{username}
      </span>
      {mounted && open && anchor
        ? createPortal(
            <span
              className="fixed z-[9999] w-56 -translate-x-1/2 -translate-y-full rounded-xl border border-foreground/10 bg-background/95 p-3 text-xs text-foreground/80 shadow-lg backdrop-blur"
              style={{ left: anchor.x, top: anchor.y - 10 }}
            >
              <span className="flex items-center gap-3">
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={displayName}
                    className="h-10 w-10 rounded-full border border-foreground/10 object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10 text-sm font-semibold text-foreground/70 border border-foreground/10">
                    {initial}
                  </span>
                )}
                <span className="flex flex-col">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2 whitespace-nowrap">
                  {displayName}
                  {isAdmin && (
                    <FaShieldAlt className="text-[12px] text-[#4f46e5] dark:text-[#5865F2]" />
                  )}
                </span>
                  <span className="text-foreground/60">@{displayUsername}</span>
                </span>
              </span>
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
