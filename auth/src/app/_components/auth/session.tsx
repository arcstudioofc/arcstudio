"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FaSignOutAlt,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaCamera,
  FaCrown,
  FaSearch,
  FaRegCopy,
  FaCheck,
  FaInfoCircle,
  FaBuilding,
  FaPlus,
  FaBell,
  FaUserPlus,
  FaPen,
  FaTimes,
  FaTrash,
  FaDoorOpen,
  FaGhost,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Cropper from "react-easy-crop";
import { motion } from "framer-motion";

import { auth } from "@/lib/auth";

import { Button, Input, addToast } from "@heroui/react";
import ThemeSwitcher from "@/widgets/switcher/theme";
import LocaleSwitcher from "@/widgets/switcher/locale";
import Icon from "@/widgets/Icon";

type Area = { x: number; y: number; width: number; height: number };

type FieldErrors = {
  displayName?: string;
  nickname?: string;
};

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

type OrgMember = {
  id: string;
  userId: string;
  role?: string;
  createdAt?: Date | string;
  user?: {
    id?: string;
    name?: string;
    username?: string;
    image?: string | null;
  };
};

type Organization = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  members?: OrgMember[];
  currentRole?: string;
};

type Invitation = {
  id: string;
  email: string;
  role?: string;
  organizationId: string;
  organizationName?: string;
  inviterId?: string;
  status?: string;
  expiresAt?: Date | string;
  createdAt?: Date | string;
};

const ARCSTUDIO_USERNAME_REGEX = /^[a-z0-9_.]+$/;

const normalizeArcstudioUsername = (value: string) =>
  value.trim().toLowerCase();

const isDiscordUsername = (value: string) => {
  const username = normalizeArcstudioUsername(value);

  if (username.length < 2 || username.length > 32) return false;
  if (!ARCSTUDIO_USERNAME_REGEX.test(username)) return false;
  if (username.includes("..")) return false;

  return true;
};

const sanitizeForSuggestion = (value: string) => {
  const cleaned = normalizeArcstudioUsername(value).replace(/[^a-z0-9_.]/g, "");
  const collapsed = cleaned.replace(/\.{2,}/g, ".");
  return collapsed.replace(/^\.+/, "").replace(/\.+$/, "");
};

const suggestDiscordUsername = (value: string, fallbackSeed: string) => {
  const base = sanitizeForSuggestion(value);
  if (base.length >= 2) return base.slice(0, 32);

  const seed = fallbackSeed.replace(/\D/g, "");
  const fallback = `user${seed || "01"}`;
  const normalizedFallback = sanitizeForSuggestion(fallback);
  if (normalizedFallback.length >= 2) return normalizedFallback.slice(0, 32);

  return "user01";
};

const buildSuffixCandidate = (base: string, suffix: string) => {
  const maxLen = 32;
  const trimmedBase = base.slice(0, Math.max(2, maxLen - suffix.length));
  return `${trimmedBase}${suffix}`;
};

const resolveApiRoot = (value?: string) => {
  if (!value) return "";
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, "");
    let trimmed = path;
    if (trimmed.endsWith("/api/auth")) trimmed = trimmed.slice(0, -9);
    else if (trimmed.endsWith("/auth")) trimmed = trimmed.slice(0, -5);
    url.pathname = trimmed === "/" ? "" : trimmed;
    return url.toString().replace(/\/+$/, "");
  } catch {
    return value
      .replace(/\/+$/, "")
      .replace(/\/api\/auth$/, "")
      .replace(/\/auth$/, "");
  }
};

const slugifyOrganization = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
};

export function UserSession({
  user,
}: {
  user: typeof auth.$Infer.Session["user"];
}) {
  const router = useRouter();
  const t = useTranslations("_components.auth.session");
  const locale = useLocale();
  const { data: sessionData, refetch } = auth.useSession();

  const currentUsername = ((user as Record<string, unknown>).username ||
    "") as string;
  const fallbackSeed = (user.id || "01").toString().slice(-4);
  const organizationApi = useMemo(
    () =>
      (
        auth as typeof auth & {
          organization?: {
            list?: () => Promise<any>;
            create?: (input: any) => Promise<any>;
            update?: (input: any) => Promise<any>;
            delete?: (input: any) => Promise<any>;
            leave?: (input: any) => Promise<any>;
            setActive?: (input: any) => Promise<any>;
            inviteMember?: (input: any) => Promise<any>;
            listUserInvitations?: (input?: any) => Promise<any>;
            acceptInvitation?: (input: any) => Promise<any>;
            rejectInvitation?: (input: any) => Promise<any>;
          };
        }
      ).organization,
    [],
  );
  const activeOrganizationId = (
    sessionData?.session as { activeOrganizationId?: string | null } | undefined
  )?.activeOrganizationId;
  const apiRoot = useMemo(
    () => resolveApiRoot(process.env.NEXT_PUBLIC_API_URL),
    [],
  );
  const { data: activeMemberRoleData } = (
    auth as typeof auth & {
      useActiveMemberRole: () => { data?: { role?: string } | null };
    }
  ).useActiveMemberRole();
  const activeMemberRole =
    activeMemberRoleData && typeof activeMemberRoleData === "object"
      ? activeMemberRoleData.role
      : undefined;

  const [displayName, setDisplayName] = useState(user.name || "");
  const [nickname, setNickname] = useState(currentUsername);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState(
    user.image || "/images/avatar-placeholder.png",
  );
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [hasEditedNickname, setHasEditedNickname] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<SearchUser | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [orgLogoFile, setOrgLogoFile] = useState<File | null>(null);
  const [orgLogoPreview, setOrgLogoPreview] = useState<string>("");
  const [orgSlugTouched, setOrgSlugTouched] = useState(false);
  const [orgFormErrors, setOrgFormErrors] = useState<{
    name?: string;
    slug?: string;
  }>({});
  const [editOrgErrors, setEditOrgErrors] = useState<{
    name?: string;
    slug?: string;
  }>({});
  const [orgCreating, setOrgCreating] = useState(false);
  const [editingOrgId, setEditingOrgId] = useState<string | null>(null);
  const [editOrgName, setEditOrgName] = useState("");
  const [editOrgSlug, setEditOrgSlug] = useState("");
  const [editOrgLogoFile, setEditOrgLogoFile] = useState<File | null>(null);
  const [editOrgLogoPreview, setEditOrgLogoPreview] = useState<string>("");
  const [editSlugTouched, setEditSlugTouched] = useState(false);
  const [orgUpdating, setOrgUpdating] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteErrors, setInviteErrors] = useState<{
    email?: string;
    role?: string;
  }>({});
  const [inviteLoading, setInviteLoading] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [invites, setInvites] = useState<Invitation[]>([]);
  const [invitesLoading, setInvitesLoading] = useState(false);
  const [invitesError, setInvitesError] = useState<string | null>(null);
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const ghostPrevX = useRef(0);
  const ghostFacingRef = useRef(1);
  const [ghostFacing, setGhostFacing] = useState(1);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const [baselineName, setBaselineName] = useState(user.name || "");
  const [baselineUsername, setBaselineUsername] = useState(currentUsername);

  const activeUser = selectedUser ?? user;
  const activeUsername = ((activeUser as Record<string, unknown>).username ||
    "") as string;
  const activeEmail = activeUser.email || user.email;
  const activeRole = (activeUser as Record<string, unknown>).role;
  const isAdmin =
    typeof activeRole === "string" && activeRole.toLowerCase() === "admin";
  const isViewingSelf = activeUser.id === user.id;
  const canEdit = isViewingSelf;
  const canManageOrganizations = isViewingSelf;
  const headerDisplayName = canEdit
    ? displayName || user.email
    : activeUser.name || activeEmail;
  const headerAvatar = canEdit
    ? avatarPreview
    : activeUser.image || "/images/avatar-placeholder.png";
  const invitesCount = invites.length;

  const selectedOrg = useMemo(
    () => organizations.find((org) => org.id === selectedOrgId) ?? null,
    [organizations, selectedOrgId],
  );

  const selectedOrgRole = useMemo(() => {
    if (selectedOrg?.members?.length) {
      const role = selectedOrg.members.find(
        (member) => member.userId === user.id,
      )?.role;
      if (typeof role === "string") return role.toLowerCase();
    }

    if (
      selectedOrgId &&
      activeOrganizationId &&
      selectedOrgId === activeOrganizationId &&
      typeof activeMemberRole === "string"
    ) {
      return activeMemberRole.toLowerCase();
    }

    return "";
  }, [
    selectedOrg,
    selectedOrgId,
    activeOrganizationId,
    activeMemberRole,
    user.id,
  ]);

  const canInviteMembers = isViewingSelf && selectedOrgRole === "owner";

  const isOwnerForOrg = useCallback(
    (orgId: string) => {
      const org = organizations.find((item) => item.id === orgId);
      if (!org) return false;
      let role =
        org.currentRole ||
        org.members?.find((member) => member.userId === user.id)?.role;
      if (
        !role &&
        activeOrganizationId &&
        orgId === activeOrganizationId &&
        typeof activeMemberRole === "string"
      ) {
        role = activeMemberRole;
      }
      return typeof role === "string" && role.toLowerCase() === "owner";
    },
    [organizations, user.id, activeOrganizationId, activeMemberRole],
  );

  const getCreatorId = useCallback((metadata?: Organization["metadata"]) => {
    if (!metadata || typeof metadata !== "object") return null;
    const record = metadata as Record<string, unknown>;
    const candidate =
      record.createdBy ?? record.creatorId ?? record.ownerId ?? record.userId;
    return typeof candidate === "string" ? candidate : null;
  }, []);

  const isDirty = useMemo(() => {
    const normalizedNickname = normalizeArcstudioUsername(nickname);
    const baselineNickname = normalizeArcstudioUsername(baselineUsername || "");

    return (
      displayName.trim() !== baselineName.trim() ||
      normalizedNickname !== baselineNickname ||
      avatarFile !== null
    );
  }, [displayName, nickname, baselineName, baselineUsername, avatarFile]);

  useEffect(() => {
    if (baselineUsername || hasEditedNickname) return;

    let cancelled = false;

    const baseFromEmail = user.email?.split("@")[0] || "";
    const candidate = suggestDiscordUsername(
      user.name || baseFromEmail || "user",
      fallbackSeed,
    );

    const resolveAvailableNickname = async () => {
      let nextCandidate = candidate;

      try {
        const availability = await auth.isUsernameAvailable({
          username: nextCandidate,
        });
        const isAvailable = availability.data?.available ?? true;

        if (!isAvailable) {
          for (let i = 1; i <= 99; i += 1) {
            const suffix = String(i);
            const suffixed = buildSuffixCandidate(candidate, suffix);
            const check = await auth.isUsernameAvailable({
              username: suffixed,
            });
            if (check.data?.available) {
              nextCandidate = suffixed;
              break;
            }
          }
        }
      } catch {
        // If availability check fails, keep the suggestion.
      }

      if (!cancelled) {
        setNickname(nextCandidate);
      }
    };

    resolveAvailableNickname();

    return () => {
      cancelled = true;
    };
  }, [
    baselineUsername,
    fallbackSeed,
    hasEditedNickname,
    user.email,
    user.name,
  ]);

  useEffect(() => {
    if (isDirty) return;

    setDisplayName(user.name || "");
    setNickname(currentUsername);
    setAvatarPreview(user.image || "/images/avatar-placeholder.png");
    setAvatarFile(null);
    setBaselineName(user.name || "");
    setBaselineUsername(currentUsername);
    setHasEditedNickname(false);
  }, [isDirty, currentUsername, user.image, user.name]);

  useEffect(() => {
    if (orgSlugTouched) return;
    setOrgSlug(slugifyOrganization(orgName));
  }, [orgName, orgSlugTouched]);

  useEffect(() => {
    if (!editingOrgId) return;
    if (editSlugTouched) return;
    setEditOrgSlug(slugifyOrganization(editOrgName));
  }, [editOrgName, editSlugTouched, editingOrgId]);

  const formatDate = useCallback(
    (value?: Date | string) => {
      if (!value) return "-";
      return new Date(value).toLocaleDateString(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    },
    [locale],
  );

  const loadOrganizations = useCallback(
    async (targetUserId: string) => {
      if (!targetUserId) {
        setOrganizations([]);
        return;
      }

      setOrgLoading(true);
      setOrgError(null);
      const isSelf = targetUserId === user.id;
      const applyOrganizations = (data: unknown) => {
        setOrganizations(Array.isArray(data) ? (data as Organization[]) : []);
      };

      const loadFromEndpoint = async () => {
        const root = apiRoot || "";
        const res = await fetch(
          `${root}/users/${targetUserId}/organizations`,
          { credentials: "include" },
        );

        if (!res.ok) {
          let message = t("orgLoadError");
          try {
            const body = await res.json();
            if (body?.message) message = body.message;
          } catch {
            // ignore parsing errors
          }
          throw new Error(message);
        }

        return res.json();
      };

      const loadFromClient = async () => {
        if (!organizationApi?.list) {
          throw new Error(t("orgLoadError"));
        }
        const response = await organizationApi.list();
        if (response?.error) {
          throw new Error(response.error.message || t("orgLoadError"));
        }
        return response?.data ?? [];
      };

      try {
        const data = await loadFromEndpoint();
        applyOrganizations(data);
        return;
      } catch (err) {
        if (isSelf) {
          try {
            const data = await loadFromClient();
            applyOrganizations(data);
            setOrgError(null);
            return;
          } catch (fallbackError) {
            const message =
              fallbackError instanceof Error && fallbackError.message
                ? fallbackError.message
                : t("orgLoadError");
            setOrgError(message);
            setOrganizations([]);
            return;
          }
        }

        const message =
          err instanceof Error && err.message ? err.message : t("orgLoadError");
        setOrgError(message);
        setOrganizations([]);
      } finally {
        setOrgLoading(false);
      }
    },
    [apiRoot, organizationApi, t, user.id],
  );

  const loadInvitations = useCallback(async () => {
    if (!organizationApi?.listUserInvitations) {
      setInvites([]);
      setInvitesError(t("orgNotificationsError"));
      return;
    }

    setInvitesLoading(true);
    setInvitesError(null);
    try {
      const response = await organizationApi.listUserInvitations();
      if (response?.error) {
        setInvitesError(
          response.error.message || t("orgNotificationsError"),
        );
        setInvites([]);
        return;
      }
      const data = response?.data ?? [];
      setInvites(Array.isArray(data) ? data : []);
    } catch {
      setInvitesError(t("orgNotificationsError"));
      setInvites([]);
    } finally {
      setInvitesLoading(false);
    }
  }, [organizationApi, t]);

  useEffect(() => {
    if (!activeUser?.id) return;

    loadOrganizations(activeUser.id);

    if (!isViewingSelf) {
      setInvites([]);
      setInvitesError(null);
      setNotificationsOpen(false);
      return;
    }

    loadInvitations();
  }, [activeUser?.id, isViewingSelf, loadOrganizations, loadInvitations]);

  useEffect(() => {
    if (!notificationsOpen || !isViewingSelf) return;
    loadInvitations();
  }, [notificationsOpen, isViewingSelf, loadInvitations]);

  useEffect(() => {
    if (!organizations.length) {
      setSelectedOrgId(null);
      return;
    }

    if (selectedOrgId && organizations.some((org) => org.id === selectedOrgId))
      return;

    const next =
      activeOrganizationId &&
      organizations.some((org) => org.id === activeOrganizationId)
        ? activeOrganizationId
        : organizations[0].id;

    setSelectedOrgId(next);
  }, [organizations, selectedOrgId, activeOrganizationId]);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (!displayName.trim()) nextErrors.displayName = t("displayNameRequired");

    if (!nickname.trim()) nextErrors.nickname = t("nicknameRequired");
    else if (!isDiscordUsername(nickname))
      nextErrors.nickname = t("nicknameInvalid");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleAvatarChange(file: File) {
    if (!canEdit) return;
    if (!file) return;
    setCropImage(URL.createObjectURL(file));
    setCropModalOpen(true);
  }

  function handleOrgLogoFileChange(file: File | null) {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setOrgLogoFile(file);
    setOrgLogoPreview(preview);
  }

  function handleEditOrgLogoFileChange(file: File | null) {
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setEditOrgLogoFile(file);
    setEditOrgLogoPreview(preview);
  }

  const onCropComplete = useCallback(
    (_: Area, cropped: Area) => setCroppedAreaPixels(cropped),
    [],
  );

  const getCroppedImage = useCallback(async () => {
    if (!cropImage || !croppedAreaPixels) return;

    const image = new Image();
    image.src = cropImage;
    await new Promise((res) => (image.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
    const ctx = canvas.getContext("2d");

    ctx?.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "avatar.png", { type: "image/png" });
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setCropModalOpen(false);
    });
  }, [cropImage, croppedAreaPixels]);

  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleSave() {
    if (!canEdit) return;
    if (!validate()) {
      addToast({
        title: t("updateError"),
        description: t("checkFields"),
        color: "danger",
      });
      return;
    }

    const normalizedNickname = normalizeArcstudioUsername(nickname);
    const baselineNickname = normalizeArcstudioUsername(baselineUsername || "");
    const nicknameChanged = normalizedNickname !== baselineNickname;

    if (nicknameChanged) {
      try {
        const availability = await auth.isUsernameAvailable({
          username: normalizedNickname,
        });

        if (!availability.data?.available) {
          setErrors((prev) => ({
            ...prev,
            nickname: t("nicknameTaken"),
          }));
          addToast({
            title: t("updateError"),
            description: t("nicknameTaken"),
            color: "danger",
          });
          return;
        }
      } catch {
        // If availability check fails, continue to update.
      }
    }

    setLoading(true);
    try {
      const payload: {
        name: string;
        image?: string;
        username?: string;
      } = {
        name: displayName.trim(),
      };

      if (nicknameChanged) payload.username = normalizedNickname;

      if (avatarFile) {
        payload.image = await fileToBase64(avatarFile);
      }

      const result = await auth.updateUser(payload);

      if (result.error) {
        addToast({
          title: t("updateError"),
          description: result.error.message || t("updateError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("updateSuccess"),
        color: "success",
      });

      setBaselineName(displayName.trim());
      setBaselineUsername(nicknameChanged ? normalizedNickname : baselineUsername);
      if (avatarFile) {
        setAvatarFile(null);
      }

      await refetch();
    } catch (err: any) {
      addToast({
        title: t("updateError"),
        description: err?.message || t("updateError"),
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!searchContainerRef.current) return;
      if (!searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      setSearchLoading(false);
      setIsSearchOpen(false);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setIsSearchOpen(true);

    const timeout = setTimeout(async () => {

      try {
        const root = apiRoot || "";
        const response = await fetch(
          `${root}/users/search?q=${encodeURIComponent(query)}`,
          { credentials: "include" },
        );

        if (!response.ok) {
          setSearchError(t("searchError"));
          setSearchResults([]);
          return;
        }

        const data = await response.json();
        setSearchResults(Array.isArray(data) ? data : []);
      } catch {
        setSearchError(t("searchError"));
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [apiRoot, searchQuery, t]);

  async function handleCopyId() {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(activeUser.id);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = activeUser.id;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      addToast({
        title: t("copyIdSuccess"),
        color: "success",
      });
      setCopiedId(true);
      window.setTimeout(() => setCopiedId(false), 1200);
    } catch {
      addToast({
        title: t("copyIdError"),
        color: "danger",
      });
    }
  }

  const handleGhostUpdate = useCallback((latest: { x?: number }) => {
    const currentX = typeof latest.x === "number" ? latest.x : 0;
    const previousX = ghostPrevX.current;

    if (currentX > previousX + 0.2 && ghostFacingRef.current !== 1) {
      ghostFacingRef.current = 1;
      setGhostFacing(1);
    } else if (currentX < previousX - 0.2 && ghostFacingRef.current !== -1) {
      ghostFacingRef.current = -1;
      setGhostFacing(-1);
    }

    ghostPrevX.current = currentX;
  }, []);

  function startEditOrganization(org: Organization) {
    if (!isOwnerForOrg(org.id)) return;
    setEditingOrgId(org.id);
    setEditOrgName(org.name);
    setEditOrgSlug(org.slug);
    setEditOrgLogoPreview(org.logo || "");
    setEditOrgLogoFile(null);
    setEditSlugTouched(false);
    setEditOrgErrors({});
  }

  function resetEditOrganization() {
    setEditingOrgId(null);
    setEditOrgName("");
    setEditOrgSlug("");
    setEditOrgLogoPreview("");
    setEditOrgLogoFile(null);
    setEditSlugTouched(false);
    setEditOrgErrors({});
  }

  async function handleCreateOrganization() {
    if (!canManageOrganizations) return;

    const nextErrors: { name?: string; slug?: string } = {};

    if (!orgName.trim()) nextErrors.name = t("orgNameRequired");
    if (!orgSlug.trim()) nextErrors.slug = t("orgSlugRequired");

    setOrgFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      addToast({
        title: t("orgCreateError"),
        description: t("checkFields"),
        color: "danger",
      });
      return;
    }

    if (!organizationApi?.create) {
      addToast({
        title: t("orgCreateError"),
        color: "danger",
      });
      return;
    }

    setOrgCreating(true);
    try {
      const payload: {
        name: string;
        slug: string;
        logo?: string;
      } = {
        name: orgName.trim(),
        slug: orgSlug.trim(),
      };

      if (orgLogoFile) {
        payload.logo = await fileToBase64(orgLogoFile);
      }

      const response = await organizationApi.create(payload);

      if (response?.error) {
        addToast({
          title: t("orgCreateError"),
          description: response.error.message || t("orgCreateError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("orgCreateSuccess"),
        color: "success",
      });

      setOrgName("");
      setOrgSlug("");
      setOrgLogoFile(null);
      setOrgLogoPreview("");
      setOrgSlugTouched(false);
      setOrgFormErrors({});

      await loadOrganizations(user.id);
      await refetch();
    } catch (err: any) {
      addToast({
        title: t("orgCreateError"),
        description: err?.message || t("orgCreateError"),
        color: "danger",
      });
    } finally {
      setOrgCreating(false);
    }
  }

  async function handleUpdateOrganization() {
    if (!canManageOrganizations || !editingOrgId) return;
    if (!isOwnerForOrg(editingOrgId)) return;

    const nextErrors: { name?: string; slug?: string } = {};

    if (!editOrgName.trim()) nextErrors.name = t("orgNameRequired");
    if (!editOrgSlug.trim()) nextErrors.slug = t("orgSlugRequired");

    setEditOrgErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      addToast({
        title: t("orgUpdateError"),
        description: t("checkFields"),
        color: "danger",
      });
      return;
    }

    if (!organizationApi?.update) {
      addToast({
        title: t("orgUpdateError"),
        color: "danger",
      });
      return;
    }

    setOrgUpdating(true);
    try {
      const payload: {
        organizationId: string;
        data: {
          name?: string;
          slug?: string;
          logo?: string;
        };
      } = {
        organizationId: editingOrgId,
        data: {
          name: editOrgName.trim(),
          slug: editOrgSlug.trim(),
        },
      };

      if (editOrgLogoFile) {
        payload.data.logo = await fileToBase64(editOrgLogoFile);
      }

      const response = await organizationApi.update(payload);

      if (response?.error) {
        addToast({
          title: t("orgUpdateError"),
          description: response.error.message || t("orgUpdateError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("orgUpdateSuccess"),
        color: "success",
      });

      resetEditOrganization();
      await loadOrganizations(user.id);
    } catch (err: any) {
      addToast({
        title: t("orgUpdateError"),
        description: err?.message || t("orgUpdateError"),
        color: "danger",
      });
    } finally {
      setOrgUpdating(false);
    }
  }

  async function handleSetActiveOrganization(orgId: string) {
    if (!canManageOrganizations) return;
    if (!organizationApi?.setActive) return;

    try {
      const response = await organizationApi.setActive({
        organizationId: orgId,
      });

      if (response?.error) {
        addToast({
          title: t("orgSetActiveError"),
          description: response.error.message || t("orgSetActiveError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("orgSetActiveSuccess"),
        color: "success",
      });

      setSelectedOrgId(orgId);
      await refetch();
      await loadOrganizations(user.id);
    } catch (err: any) {
      addToast({
        title: t("orgSetActiveError"),
        description: err?.message || t("orgSetActiveError"),
        color: "danger",
      });
    }
  }

  async function handleDeleteOrganization(orgId: string, name?: string) {
    if (!canManageOrganizations) return;
    if (!organizationApi?.delete) {
      addToast({
        title: t("orgDeleteError"),
        color: "danger",
      });
      return;
    }

    const shouldDelete = window.confirm(t("orgDeleteConfirm"));
    if (!shouldDelete) return;

    try {
      const response = await organizationApi.delete({ organizationId: orgId });

      if (response?.error) {
        addToast({
          title: t("orgDeleteError"),
          description: response.error.message || t("orgDeleteError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("orgDeleteSuccess"),
        description: name || undefined,
        color: "success",
      });

      await loadOrganizations(user.id);
      await refetch();
    } catch (err: any) {
      addToast({
        title: t("orgDeleteError"),
        description: err?.message || t("orgDeleteError"),
        color: "danger",
      });
    }
  }

  async function handleLeaveOrganization(orgId: string) {
    if (!canManageOrganizations) return;
    if (!organizationApi?.leave) {
      addToast({
        title: t("orgLeaveError"),
        color: "danger",
      });
      return;
    }

    const shouldLeave = window.confirm(t("orgLeaveConfirm"));
    if (!shouldLeave) return;

    try {
      const response = await organizationApi.leave({ organizationId: orgId });

      if (response?.error) {
        addToast({
          title: t("orgLeaveError"),
          description: response.error.message || t("orgLeaveError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("orgLeaveSuccess"),
        color: "success",
      });

      await loadOrganizations(user.id);
      await refetch();
    } catch (err: any) {
      addToast({
        title: t("orgLeaveError"),
        description: err?.message || t("orgLeaveError"),
        color: "danger",
      });
    }
  }

  async function handleInviteMember() {
    if (!canInviteMembers) return;

    const nextErrors: { email?: string; role?: string } = {};

    if (!inviteEmail.trim()) nextErrors.email = t("orgInviteEmailRequired");
    if (!inviteRole.trim()) nextErrors.role = t("orgInviteRoleRequired");

    setInviteErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      addToast({
        title: t("orgInviteError"),
        description: t("checkFields"),
        color: "danger",
      });
      return;
    }

    if (!selectedOrgId) {
      addToast({
        title: t("orgInviteError"),
        description: t("orgSelectRequired"),
        color: "danger",
      });
      return;
    }

    if (!organizationApi?.inviteMember) {
      addToast({
        title: t("orgInviteError"),
        color: "danger",
      });
      return;
    }

    setInviteLoading(true);
    try {
      const response = await organizationApi.inviteMember({
        email: inviteEmail.trim(),
        role: inviteRole.trim(),
        organizationId: selectedOrgId,
      });

      if (response?.error) {
        addToast({
          title: t("orgInviteError"),
          description: response.error.message || t("orgInviteError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("orgInviteSuccess"),
        color: "success",
      });

      setInviteEmail("");
      setInviteRole("member");
      setInviteErrors({});
    } catch (err: any) {
      addToast({
        title: t("orgInviteError"),
        description: err?.message || t("orgInviteError"),
        color: "danger",
      });
    } finally {
      setInviteLoading(false);
    }
  }

  async function handleAcceptInvitation(invitationId: string) {
    if (!organizationApi?.acceptInvitation) return;

    setInviteActionId(invitationId);
    try {
      const response = await organizationApi.acceptInvitation({ invitationId });

      if (response?.error) {
        addToast({
          title: t("orgInviteActionError"),
          description: response.error.message || t("orgInviteActionError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("orgInviteAcceptSuccess"),
        color: "success",
      });

      await loadInvitations();
      await loadOrganizations(user.id);
      await refetch();
    } catch (err: any) {
      addToast({
        title: t("orgInviteActionError"),
        description: err?.message || t("orgInviteActionError"),
        color: "danger",
      });
    } finally {
      setInviteActionId(null);
    }
  }

  async function handleRejectInvitation(invitationId: string) {
    if (!organizationApi?.rejectInvitation) return;

    setInviteActionId(invitationId);
    try {
      const response = await organizationApi.rejectInvitation({ invitationId });

      if (response?.error) {
        addToast({
          title: t("orgInviteActionError"),
          description: response.error.message || t("orgInviteActionError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("orgInviteRejectSuccess"),
        color: "success",
      });

      await loadInvitations();
    } catch (err: any) {
      addToast({
        title: t("orgInviteActionError"),
        description: err?.message || t("orgInviteActionError"),
        color: "danger",
      });
    } finally {
      setInviteActionId(null);
    }
  }

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-40 border-b border-gray-200/70 bg-background/90 backdrop-blur dark:border-gray-800/70">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4 shrink-0">
            <Icon />
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            <span className="text-lg font-extrabold font-mono text-foreground">
              @{normalizeArcstudioUsername(nickname) || "user"}
            </span>
          </div>

          <div className="flex-1">
            <div
              className="relative mx-auto w-full max-w-xl"
              ref={searchContainerRef}
            >
              <Input
                value={searchQuery}
                variant="bordered"
                radius="full"
                placeholder={t("searchPlaceholder")}
                startContent={<FaSearch className="text-gray-500" />}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setIsSearchOpen(true);
                }}
              />

              {isSearchOpen && searchQuery.trim().length >= 2 && (
                <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-background/95 shadow-lg backdrop-blur">
                  <div className="max-h-72 overflow-y-auto">
                    {searchLoading && (
                      <p className="px-4 py-3 text-xs text-gray-500">
                        {t("searchLoading")}
                      </p>
                    )}

                    {!searchLoading && searchError && (
                      <p className="px-4 py-3 text-xs text-danger">
                        {searchError}
                      </p>
                    )}

                    {!searchLoading &&
                      !searchError &&
                      searchResults.length === 0 && (
                        <p className="px-4 py-3 text-xs text-gray-500">
                          {t("searchNoResults")}
                        </p>
                      )}

                    {!searchLoading &&
                      !searchError &&
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => {
                            setSelectedUser(result);
                            setIsSearchOpen(false);
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-foreground/5"
                        >
                          <img
                            src={
                              result.image || "/images/avatar-placeholder.png"
                            }
                            alt={result.name || "User"}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {result.name || result.username || result.id}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{normalizeArcstudioUsername(
                                result.username || "",
                              ) || "user"}
                            </p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {!isViewingSelf && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>{t("viewOnlyHint")}</span>
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    setSelectedUser(null);
                    setSearchQuery("");
                  }}
                >
                  {t("backToMe")}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 rounded-full border border-gray-200 dark:border-gray-700 px-4 py-2 shrink-0">
            <LocaleSwitcher />
            <div className="h-5 w-px bg-gray-300 dark:bg-gray-600" />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl space-y-10 px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[2fr,1fr]">
          <section className="relative space-y-8 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8">
            <Button
              isIconOnly
              radius="full"
              variant="light"
              onPress={handleCopyId}
              className="absolute right-4 top-4 h-10 w-10 min-w-0 text-primary hover:bg-primary/10"
              aria-label={t("copyId")}
            >
              <motion.span
                key={copiedId ? "copied" : "copy"}
                initial={{ scale: 0.9, rotate: 0, opacity: 0.7 }}
                animate={
                  copiedId
                    ? { scale: 1.15, rotate: 8, opacity: 1 }
                    : { scale: 1, rotate: 0, opacity: 1 }
                }
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
              >
                {copiedId ? <FaCheck /> : <FaRegCopy />}
              </motion.span>
            </Button>
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="relative w-32 h-32 shrink-0">
                <img
                  src={headerAvatar}
                  alt={t("avatarAlt")}
                  className="w-32 h-32 rounded-full border-4 border-primary/30 object-cover"
                />
                {canEdit && (
                  <label
                    className="absolute bottom-1 right-1 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white shadow-lg cursor-pointer"
                    aria-label={t("avatarAlt")}
                  >
                    <FaCamera className="text-sm" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files && handleAvatarChange(e.target.files[0])
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                    {headerDisplayName}
                  </h2>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                      <FaCrown className="text-[11px]" />
                      {t("adminBadge")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-mono text-primary/80">
                  <span>
                    @{normalizeArcstudioUsername(activeUsername) || "user"}
                    {canEdit && (
                      <>
                        {" "}
                        <span className="text-foreground/50">-</span>{" "}
                        <span className="text-foreground">{activeEmail}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {canEdit && (
              <>
                <div className="h-px w-full bg-gray-200 dark:bg-gray-700" />

                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label={t("displayName")}
                    value={displayName}
                    variant="bordered"
                    onChange={(e) => setDisplayName(e.target.value)}
                    isInvalid={!!errors.displayName}
                    errorMessage={errors.displayName}
                  />

                  <div className="space-y-1">
                    <Input
                      label={t("nickname")}
                      value={nickname}
                      variant="bordered"
                      startContent={<span className="text-gray-500">@</span>}
                      onChange={(e) => {
                        setNickname(e.target.value.toLowerCase());
                        setHasEditedNickname(true);
                        if (errors.nickname) {
                          setErrors((prev) => ({
                            ...prev,
                            nickname: undefined,
                          }));
                        }
                      }}
                      isInvalid={!!errors.nickname}
                      errorMessage={errors.nickname}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t("nicknameHint")}
                    </p>
                  </div>
                </div>
              </>
            )}

            <div
              className={`flex flex-col gap-3 pt-1 sm:flex-row ${
                canEdit ? "sm:items-center sm:justify-between" : "sm:justify-end"
              }`}
            >
              {canEdit && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    color="primary"
                    size="lg"
                    onPress={handleSave}
                    isLoading={loading}
                    isDisabled={!isDirty}
                    className="font-semibold tracking-wide"
                  >
                    {loading ? t("saving") : t("saveChanges")}
                  </Button>
                  <Button
                    variant="bordered"
                    color="danger"
                    size="lg"
                    onPress={async () => {
                      const shouldSignOut = window.confirm(
                        t("signOutConfirm"),
                      );
                      if (!shouldSignOut) return;
                      await auth.signOut();
                      router.replace("/");
                    }}
                    className="font-semibold"
                  >
                    <FaSignOutAlt className="mr-2" /> {t("signOut")}
                  </Button>
                </div>
              )}

              <div className="relative group self-start sm:self-auto">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-primary/50 hover:text-primary dark:border-gray-700">
                  <FaInfoCircle />
                </div>
                <div className="pointer-events-none absolute bottom-12 right-0 w-64 translate-y-2 rounded-xl border border-gray-200 bg-background/95 p-3 text-xs text-foreground opacity-0 shadow-lg backdrop-blur transition group-hover:translate-y-0 group-hover:opacity-100 dark:border-gray-700">
                  <div className="space-y-1">
                    <p className="flex items-center gap-2 font-semibold">
                      <FaCalendarAlt className="text-[11px]" />
                      {t("memberSince")}
                    </p>
                    <p className="text-gray-500">
                      {formatDate(activeUser.createdAt || user.createdAt)}
                    </p>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="flex items-center gap-2 font-semibold">
                      <FaCalendarAlt className="text-[11px]" />
                      {t("lastUpdate")}
                    </p>
                    <p className="text-gray-500">
                      {formatDate(activeUser.updatedAt || user.updatedAt)}
                    </p>
                  </div>
                  {canEdit && (
                    <div className="mt-2 space-y-1">
                      <p
                        className={`flex items-center gap-2 font-semibold ${
                          (activeUser.emailVerified ?? user.emailVerified)
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        <FaEnvelope className="text-[11px]" />
                        {t("emailLabel")}
                      </p>
                      <p
                        className={`break-all ${
                          (activeUser.emailVerified ?? user.emailVerified)
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {activeEmail}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                  <FaBuilding className="text-sm" />
                  {t("orgsTitle")}
                </div>
                {isViewingSelf && (
                  <div className="relative" ref={notificationsRef}>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen((prev) => !prev)}
                      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:border-primary/50 hover:text-primary dark:border-gray-700"
                      aria-label={t("orgNotificationsTitle")}
                    >
                      <FaBell />
                      {invitesCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
                          {invitesCount}
                        </span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className="absolute right-0 mt-3 w-80 overflow-hidden rounded-2xl border border-gray-200 bg-background/95 shadow-xl backdrop-blur dark:border-gray-700">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                            {t("orgNotificationsTitle")}
                          </span>
                          <span className="text-xs text-gray-500">
                            {invitesCount}
                          </span>
                        </div>
                        <div className="max-h-72 overflow-y-auto">
                          {invitesLoading && (
                            <p className="px-4 py-3 text-xs text-gray-500">
                              {t("orgNotificationsLoading")}
                            </p>
                          )}

                          {!invitesLoading && invitesError && (
                            <p className="px-4 py-3 text-xs text-danger">
                              {invitesError}
                            </p>
                          )}

                          {!invitesLoading &&
                            !invitesError &&
                            invites.length === 0 && (
                              <p className="px-4 py-3 text-xs text-gray-500">
                                {t("orgNotificationsEmpty")}
                              </p>
                            )}

                          {!invitesLoading &&
                            !invitesError &&
                            invites.map((invite) => (
                              <div
                                key={invite.id}
                                className="px-4 py-3 border-b border-gray-100 last:border-b-0 dark:border-gray-800"
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">
                                      {invite.organizationName ||
                                        invite.organizationId}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      @{invite.role || "member"} ·{" "}
                                      {formatDate(invite.createdAt)}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      color="success"
                                      variant="flat"
                                      onPress={() =>
                                        handleAcceptInvitation(invite.id)
                                      }
                                      isDisabled={
                                        inviteActionId === invite.id ||
                                        invitesLoading
                                      }
                                      isLoading={inviteActionId === invite.id}
                                    >
                                      <FaCheckCircle className="text-sm" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      color="danger"
                                      variant="flat"
                                      onPress={() =>
                                        handleRejectInvitation(invite.id)
                                      }
                                      isDisabled={
                                        inviteActionId === invite.id ||
                                        invitesLoading
                                      }
                                      isLoading={inviteActionId === invite.id}
                                    >
                                      <FaTimesCircle className="text-sm" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {orgLoading && (
                <p className="text-xs text-gray-500">{t("orgLoading")}</p>
              )}

              {orgError && <p className="text-xs text-danger">{orgError}</p>}

              {!orgLoading && !orgError && organizations.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 px-4 py-6 text-center text-sm text-gray-500">
                  <div className="flex items-center justify-center gap-2">
                    <span>{t("orgEmpty")}</span>
                    <motion.span
                      className="inline-flex text-lg text-foreground/70"
                      style={{
                        transformOrigin: "50% 50%",
                        scaleX: ghostFacing,
                      }}
                      onUpdate={handleGhostUpdate}
                      animate={{
                        x: [0, 18, 0],
                      }}
                      transition={{
                        duration: 2.4,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: 0.4,
                        ease: "easeInOut",
                      }}
                    >
                      <FaGhost />
                    </motion.span>
                  </div>
                </div>
              )}

              {!orgLoading && organizations.length > 0 && (
                <div className="space-y-3">
                  {organizations.map((org) => {
                    const isActive = org.id === activeOrganizationId;
                    const memberRole =
                      org.currentRole ||
                      org.members?.find(
                        (member) => member.userId === user.id,
                      )?.role ||
                      (isActive && typeof activeMemberRole === "string"
                        ? activeMemberRole
                        : "");
                    const normalizedRole =
                      typeof memberRole === "string"
                        ? memberRole.toLowerCase()
                        : "";
                    const isOwner = normalizedRole === "owner";
                    const isCreator = getCreatorId(org.metadata) === user.id;
                    const canDeleteOrg = isViewingSelf && (isOwner || isCreator);
                    const canLeaveOrg =
                      isViewingSelf && !canDeleteOrg && !!normalizedRole;
                    return (
                      <div
                        key={org.id}
                        className={`rounded-2xl border border-gray-200 dark:border-gray-700 p-4 transition ${
                          isActive && isViewingSelf
                            ? "border-primary/50 bg-primary/5"
                            : "hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-foreground/5 text-sm font-bold text-foreground overflow-hidden">
                            {org.logo ? (
                              <img
                                src={org.logo}
                                alt={org.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>
                                {org.name?.[0]?.toUpperCase() || "O"}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {org.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              @{org.slug}
                            </p>
                          </div>
                          {isViewingSelf && isActive && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                              <FaCheckCircle className="text-[10px]" />
                              {t("orgActive")}
                            </span>
                          )}
                        </div>

                        {canManageOrganizations && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant="bordered"
                              onPress={() =>
                                handleSetActiveOrganization(org.id)
                              }
                              isDisabled={isActive}
                              className="text-xs"
                            >
                              {t("orgSetActive")}
                            </Button>
                            {isOwner && (
                              <Button
                                size="sm"
                                variant="flat"
                                onPress={() => startEditOrganization(org)}
                                className="text-xs"
                              >
                                <FaPen className="mr-1" />
                                {t("orgEdit")}
                              </Button>
                            )}
                            {canDeleteOrg && (
                              <Button
                                size="sm"
                                variant="bordered"
                                color="danger"
                                onPress={() =>
                                  handleDeleteOrganization(org.id, org.name)
                                }
                                className="text-xs"
                              >
                                <FaTrash className="mr-1" />
                                {t("orgDelete")}
                              </Button>
                            )}
                            {canLeaveOrg && (
                              <Button
                                size="sm"
                                variant="bordered"
                                onPress={() => handleLeaveOrganization(org.id)}
                                className="text-xs"
                              >
                                <FaDoorOpen className="mr-1" />
                                {t("orgLeave")}
                              </Button>
                            )}
                          </div>
                        )}

                        {canManageOrganizations &&
                          isOwner &&
                          editingOrgId === org.id && (
                          <div className="mt-4 space-y-3">
                            <Input
                              label={t("orgNameLabel")}
                              value={editOrgName}
                              variant="bordered"
                              onChange={(e) => {
                                setEditOrgName(e.target.value);
                                if (editOrgErrors.name) {
                                  setEditOrgErrors((prev) => ({
                                    ...prev,
                                    name: undefined,
                                  }));
                                }
                              }}
                              isInvalid={!!editOrgErrors.name}
                              errorMessage={editOrgErrors.name}
                            />
                            <div className="space-y-1">
                              <Input
                                label={t("orgSlugLabel")}
                                value={editOrgSlug}
                                variant="bordered"
                                onChange={(e) => {
                                  setEditOrgSlug(e.target.value);
                                  setEditSlugTouched(true);
                                  if (editOrgErrors.slug) {
                                    setEditOrgErrors((prev) => ({
                                      ...prev,
                                      slug: undefined,
                                    }));
                                  }
                                }}
                                isInvalid={!!editOrgErrors.slug}
                                errorMessage={editOrgErrors.slug}
                              />
                              <p className="text-xs text-gray-500">
                                {t("orgSlugHint")}
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                                {t("orgLogoLabel")}
                              </label>
                              <div className="flex flex-wrap items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 text-sm font-bold text-foreground overflow-hidden">
                                  {editOrgLogoPreview ? (
                                    <img
                                      src={editOrgLogoPreview}
                                      alt={editOrgName || "Organization"}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <FaBuilding className="text-sm text-gray-500" />
                                  )}
                                </div>
                                <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 cursor-pointer">
                                  <FaCamera className="text-xs" />
                                  {t("orgLogoSelect")}
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                      handleEditOrgLogoFileChange(
                                        e.target.files?.[0] || null,
                                      )
                                    }
                                    className="hidden"
                                  />
                                </label>
                                {editOrgLogoFile && (
                                  <span className="text-xs text-gray-500">
                                    {editOrgLogoFile.name}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {t("orgLogoHint")}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                color="primary"
                                onPress={handleUpdateOrganization}
                                isLoading={orgUpdating}
                                className="font-semibold"
                              >
                                {orgUpdating
                                  ? t("orgUpdating")
                                  : t("orgUpdateButton")}
                              </Button>
                              <Button
                                size="sm"
                                variant="light"
                                onPress={resetEditOrganization}
                                className="font-semibold"
                              >
                                <FaTimes className="mr-1" />
                                {t("avatar.cancel")}
                              </Button>
                            </div>
                          </div>
                        )}


                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {canManageOrganizations && (
                <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                    <FaPlus className="text-sm" />
                    {t("orgCreateTitle")}
                  </div>
                  <Input
                    label={t("orgNameLabel")}
                    value={orgName}
                    variant="bordered"
                    onChange={(e) => {
                      setOrgName(e.target.value);
                      if (orgFormErrors.name) {
                        setOrgFormErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }
                    }}
                    isInvalid={!!orgFormErrors.name}
                    errorMessage={orgFormErrors.name}
                  />
                  <div className="space-y-1">
                    <Input
                      label={t("orgSlugLabel")}
                      value={orgSlug}
                      variant="bordered"
                      onChange={(e) => {
                        setOrgSlug(e.target.value);
                        setOrgSlugTouched(true);
                        if (orgFormErrors.slug) {
                          setOrgFormErrors((prev) => ({
                            ...prev,
                            slug: undefined,
                          }));
                        }
                      }}
                      isInvalid={!!orgFormErrors.slug}
                      errorMessage={orgFormErrors.slug}
                    />
                    <p className="text-xs text-gray-500">
                      {t("orgSlugHint")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                      {t("orgLogoLabel")}
                    </label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground/5 text-sm font-bold text-foreground overflow-hidden">
                        {orgLogoPreview ? (
                          <img
                            src={orgLogoPreview}
                            alt={orgName || "Organization"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <FaBuilding className="text-sm text-gray-500" />
                        )}
                      </div>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 text-xs font-semibold text-foreground/80 transition hover:border-primary/40 cursor-pointer">
                        <FaCamera className="text-xs" />
                        {t("orgLogoSelect")}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleOrgLogoFileChange(
                              e.target.files?.[0] || null,
                            )
                          }
                          className="hidden"
                        />
                      </label>
                      {orgLogoFile && (
                        <span className="text-xs text-gray-500">
                          {orgLogoFile.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{t("orgLogoHint")}</p>
                  </div>
                  <Button
                    color="primary"
                    size="lg"
                    onPress={handleCreateOrganization}
                    isLoading={orgCreating}
                    className="font-semibold tracking-wide"
                  >
                    {orgCreating ? t("orgCreating") : t("orgCreateButton")}
                  </Button>
                </div>
              )}

            {canInviteMembers && (
                <div className="rounded-3xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-gray-500">
                    <FaUserPlus className="text-sm" />
                    {t("orgInviteTitle")}
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                        {t("orgSelectLabel")}
                      </label>
                      <select
                        value={selectedOrgId || ""}
                        onChange={(e) => setSelectedOrgId(e.target.value)}
                        disabled={!organizations.length}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-60"
                      >
                        {!organizations.length && (
                          <option value="">{t("orgSelectEmpty")}</option>
                        )}
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Input
                      label={t("orgInviteEmail")}
                      value={inviteEmail}
                      variant="bordered"
                      onChange={(e) => {
                        setInviteEmail(e.target.value);
                        if (inviteErrors.email) {
                          setInviteErrors((prev) => ({
                            ...prev,
                            email: undefined,
                          }));
                        }
                      }}
                      isInvalid={!!inviteErrors.email}
                      errorMessage={inviteErrors.email}
                    />
                    <Input
                      label={t("orgInviteRole")}
                      value={inviteRole}
                      variant="bordered"
                      onChange={(e) => {
                        setInviteRole(e.target.value);
                        if (inviteErrors.role) {
                          setInviteErrors((prev) => ({
                            ...prev,
                            role: undefined,
                          }));
                        }
                      }}
                      isInvalid={!!inviteErrors.role}
                      errorMessage={inviteErrors.role}
                    />
                    <Button
                      color="primary"
                      size="lg"
                      onPress={handleInviteMember}
                      isLoading={inviteLoading}
                      isDisabled={!organizations.length}
                      className="font-semibold tracking-wide"
                    >
                      {inviteLoading ? t("orgInviting") : t("orgInviteButton")}
                    </Button>
                  </div>
                </div>
            )}
          </aside>
        </div>
      </div>

      {cropModalOpen && cropImage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-4 rounded-lg w-full max-w-sm">
            <div className="relative w-full h-64">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onPress={() => setCropModalOpen(false)}>
                {t("avatar.cancel")}
              </Button>
              <Button color="primary" onPress={getCroppedImage}>
                {t("avatar.save")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
