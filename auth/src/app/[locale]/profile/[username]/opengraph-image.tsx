import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type SearchUser = {
  id: string;
  name?: string;
  username?: string;
  image?: string | null;
  email?: string;
  emailVerified?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  role?: string;
};

type Organization = {
  id: string;
  name?: string;
  slug?: string;
  logo?: string | null;
};

const MAX_NAME = 80;
const MAX_ROLE = 32;
const FALLBACK_NAME = "ARC Studio";
const FALLBACK_USERNAME = "arc-user";
const FALLBACK_ROLE = "ARC";

function normalizeUsername(value?: string | null) {
  return (value ?? "").trim().toLowerCase().replace(/^@/, "");
}

function absolutizeImage(src?: string | null) {
  const base =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, "") ||
    "https://arcstudio.online";
  if (!src) return `${base}/images/avatar-placeholder.png`;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  if (src.startsWith("http")) return src;
  return `${base}${src.startsWith("/") ? "" : "/"}${src}`;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64");
  }

  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }

  // btoa is available on edge runtime
  return btoa(binary);
}

function isIconLike(src: string, contentType?: string | null) {
  const lower = src.toLowerCase();
  return (
    lower.endsWith(".ico") ||
    lower.includes("image/x-icon") ||
    lower.includes("image/vnd.microsoft.icon") ||
    (contentType ? contentType.includes("image/x-icon") || contentType.includes("image/vnd.microsoft.icon") : false)
  );
}

async function inlineImage(src?: string | null): Promise<string | null> {
  if (!src) return null;
  if (src.startsWith("data:")) return src;

  if (isIconLike(src)) return null;

  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "image/png";
    if (isIconLike(src, contentType)) return null;
    const buffer = await res.arrayBuffer();
    const base64 = arrayBufferToBase64(buffer);
    return `data:${contentType};base64,${base64}`;
  } catch {
    return null;
  }
}

async function getUser(username: string): Promise<SearchUser | null> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api) return null;

  try {
    const res = await fetch(
      `${api.replace(/\/+$/, "")}/users/search?q=${encodeURIComponent(username)}&limit=1`,
      { cache: "no-store" },
    );

    if (!res.ok) return null;
    const data = await res.json();
    const user = Array.isArray(data) ? (data[0] as SearchUser | undefined) : null;
    if (!user) return null;

    return {
      ...user,
      username: normalizeUsername(user.username || username),
    };
  } catch {
    return null;
  }
}

async function getOrganizations(userId?: string): Promise<Organization[]> {
  const api = process.env.NEXT_PUBLIC_API_URL;
  if (!api || !userId) return [];

  try {
    const res = await fetch(
      `${api.replace(/\/+$/, "")}/users/${userId}/organizations`,
      { cache: "no-store" },
    );

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as Organization[]) : [];
  } catch {
    return [];
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username: rawUsername } = await params;
  const username = normalizeUsername(rawUsername);

  const user = username ? await getUser(username) : null;
  const organizations = user?.id ? await getOrganizations(user.id) : [];

  const displayName = user?.name?.slice(0, MAX_NAME) || FALLBACK_NAME;
  const displayUsername =
    username || normalizeUsername(user?.username || "") || FALLBACK_USERNAME;
  const displayRole = (user?.role || FALLBACK_ROLE).toUpperCase().slice(0, MAX_ROLE);
  const avatar = absolutizeImage(user?.image);
  const avatarSrc =
    (await inlineImage(avatar)) ||
    (isIconLike(avatar) ? absolutizeImage("/images/avatar-placeholder.png") : avatar);
  const orgItems = organizations.slice(0, 5);
  const orgThumbnails = await Promise.all(
    orgItems.map(async (org) => {
      const logoSrc = org.logo ? absolutizeImage(org.logo) : null;
      if (logoSrc && isIconLike(logoSrc)) {
        return { org, logo: null };
      }
      const inlined = logoSrc ? await inlineImage(logoSrc) : null;
      return { org, logo: inlined || logoSrc };
    }),
  );

  const baseCard = (
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        background: "#080808",
        color: "#e5e7eb",
        position: "relative",
        overflow: "hidden",
        fontFamily: '"Poppins"',
        letterSpacing: 0.1,
      }}
    >
      {/* Atmosphere */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(80% 90% at 50% -15%, rgba(255,255,255,0.08), transparent 60%)",
          opacity: 0.9,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 560,
          height: 560,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 32% 32%, rgba(99,102,241,0.25), transparent 60%)",
          filter: "blur(42px)",
          top: -120,
          left: -140,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 680,
          height: 680,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 78% 68%, rgba(56,189,248,0.22), transparent 65%)",
          filter: "blur(50px)",
          bottom: -180,
          right: -150,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "-2px",
          background:
            "linear-gradient(120deg, rgba(99,102,241,0.25), transparent 18%, transparent 82%, rgba(56,189,248,0.2))",
          maskImage: "linear-gradient(black 0%, black 78%, transparent 100%)",
          opacity: 0.95,
        }}
      />

      {/* Grid overlay (match site dark background) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
          opacity: 0.2,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,8,8,0.6) 0%, rgba(8,8,8,0.92) 48%, rgba(8,8,8,1) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "22px",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.05)",
        }}
      />

      {/* Content */}
      <div
        style={{
          position: "relative",
          display: "flex",
          flex: 1,
          padding: "72px 72px 64px",
          gap: 32,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Profile block */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            flex: 1,
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: 186,
              height: 186,
              borderRadius: "30px",
              background: "#0f172a",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            }}
          >
            <img
              src={avatarSrc}
              alt={displayName}
              width={186}
              height={186}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <span
              style={{
                padding: "6px 14px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                fontSize: 20,
                letterSpacing: 1.6,
              }}
            >
              {displayRole}
            </span>

            <div
              style={{
                fontSize: 54,
                fontWeight: 700,
                color: "#f8fafc",
                lineHeight: 1.05,
                maxWidth: 520,
              }}
            >
              {displayName}
            </div>

            <div
              style={{
                fontSize: 26,
                color: "#94a3b8",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "999px",
                  background: "#34d399",
                  boxShadow: "0 0 16px rgba(52, 211, 153, 0.75)",
                }}
              />
              @{displayUsername}
            </div>
          </div>
        </div>

        {orgThumbnails.length > 0 ? (
          <div
            style={{
              width: 320,
              minWidth: 300,
              height: "100%",
              padding: "26px 22px",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "linear-gradient(180deg, rgba(22,24,29,0.85) 0%, rgba(10,10,10,0.95) 100%)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
              display: "flex",
              flexDirection: "column",
              gap: 18,
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "#e5e7eb",
                letterSpacing: 3,
                fontSize: 12,
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              <span>Orgs</span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  fontSize: 11,
                  letterSpacing: 1,
                }}
              >
                {orgThumbnails.length}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {orgThumbnails.map(({ org, logo }, index) => {
                const initials =
                  (org.name || org.slug || "O").slice(0, 2).toUpperCase();
                return (
                  <div
                    key={org.id || index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "12px 12px",
                      borderRadius: 14,
                      background:
                        "linear-gradient(120deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {logo ? (
                        <img
                          src={logo}
                          alt={org.name || org.slug || "Org"}
                          width={42}
                          height={42}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span
                          style={{
                            color: "#e5e7eb",
                            fontWeight: 700,
                            fontSize: 14,
                          }}
                        >
                          {initials}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      <span
                        style={{
                          color: "#f8fafc",
                          fontSize: 16,
                          fontWeight: 600,
                          letterSpacing: 0.2,
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {org.name || "Org"}
                      </span>
                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: 13,
                          letterSpacing: 0.4,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 999,
                            background: "rgba(94,234,212,0.8)",
                            boxShadow: "0 0 10px rgba(94,234,212,0.8)",
                          }}
                        />
                        @{org.slug || "org"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );

  return new ImageResponse(baseCard, { ...size });
}
