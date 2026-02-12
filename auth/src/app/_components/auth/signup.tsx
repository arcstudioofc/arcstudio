"use client";

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Input,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import { FaCamera } from "react-icons/fa";

import { auth } from "@/lib/auth";

type Area = { x: number; y: number; width: number; height: number };

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
};

export function SignupSection({ callback }: { callback?: string }) {
  const t = useTranslations("_components.auth.signup");
  const router = useRouter();

  const signinHref = "/?auth=signin";
  const callbackURL = callback || process.env.NEXT_PUBLIC_BASE_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (!displayName) nextErrors.displayName = t("validation.nameRequired");

    if (!email) nextErrors.email = t("validation.emailRequired");
    else if (!email.includes("@"))
      nextErrors.email = t("validation.emailInvalid");

    if (!password) nextErrors.password = t("validation.passwordRequired");
    else if (password.length < 6)
      nextErrors.password = t("validation.passwordMin");

    if (password !== confirmPassword)
      nextErrors.confirmPassword = t("validation.passwordMismatch");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleAvatarChange(file: File) {
    if (!file) return;
    setCropImage(URL.createObjectURL(file));
    setCropModalOpen(true);
  }

  const onCropComplete = useCallback(
    (_: Area, cropped: Area) => setCroppedAreaPixels(cropped),
    [],
  );

  const getCroppedImage = useCallback(async () => {
    if (!cropImage || !croppedAreaPixels) return;

    const image = new Image();
    image.src = cropImage;
    await new Promise<void>((resolve) => {
      image.onload = () => resolve();
    });

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
      setAvatar(file);
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

  async function submitHandler(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      addToast({
        title: t("toast.createError"),
        description: t("toast.checkFields"),
        color: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = "/images/avatar-placeholder.png";
      if (avatar) avatarUrl = await fileToBase64(avatar);

      const result = await auth.signUp.email({
        email,
        password,
        name: displayName,
        image: avatarUrl,
        callbackURL,
      });

      if (result.error) {
        addToast({
          title: t("toast.createFailed"),
          description: result.error.message || t("toast.unexpectedError"),
          color: "danger",
        });
        return;
      }

      addToast({
        title: t("toast.createSuccess"),
        description: t("toast.redirecting"),
        color: "success",
      });

      setTimeout(() => router.refresh(), 500);
    } catch (err: any) {
      addToast({
        title: t("toast.unexpectedError"),
        description: err.message || t("toast.tryLater"),
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  // ===================== VERSÃO DESKTOP =====================
  const DesktopForm = (
    <Card className="w-full max-w-md rounded-lg shadow-lg bg-background/50 backdrop-blur-md border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-col items-center gap-4 px-8 pt-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/20 px-3 py-1 rounded-full">
          {t("badge")}
        </span>

        <h1 className="text-4xl font-bold text-center">{t("title")}</h1>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </CardHeader>

      <CardBody className="px-8 pb-8">
        <form className="space-y-6" onSubmit={submitHandler}>
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer">
              <img
                src={avatarPreview || "/images/avatar-placeholder.png"}
                alt="Avatar"
                className="h-16 w-16 rounded-full border-2 border-primary"
              />
              <label className="absolute bottom-0 right-0 bg-primary p-1 rounded-full">
                <FaCamera className="text-white text-xs" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleAvatarChange(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </div>

            <Input
              label={t("displayName")}
              value={displayName}
              variant="bordered"
              onChange={(e) => setDisplayName(e.target.value)}
              isInvalid={!!errors.displayName}
              errorMessage={errors.displayName}
            />
          </div>

          <Input
            label={t("email")}
            type="email"
            value={email}
            variant="bordered"
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!!errors.email}
            errorMessage={errors.email}
          />

          <Input
            label={t("password")}
            type="password"
            value={password}
            variant="bordered"
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={!!errors.password}
            errorMessage={errors.password}
          />

          <Input
            label={t("confirmPassword")}
            type="password"
            value={confirmPassword}
            variant="bordered"
            onChange={(e) => setConfirmPassword(e.target.value)}
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={loading}
          >
            {t("submit")}
          </Button>
        </form>

        <div className="mt-6 border-t pt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {t("haveAccount")}{" "}
          <Link href={signinHref} className="text-primary hover:underline">
            {t("signIn")}
          </Link>
        </div>
      </CardBody>
    </Card>
  );

  // ===================== VERSÃO MOBILE =====================
  const MobileForm = (
    <Card className="w-full max-w-sm rounded-lg shadow-lg bg-background/50 backdrop-blur-md border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-col items-center gap-4 px-6 pt-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/20 px-2 py-1 rounded-full">
          {t("badge")}
        </span>

        <h1 className="text-2xl font-bold text-center">{t("title")}</h1>

        <p className="text-sm text-center text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </CardHeader>

      <CardBody className="px-6 pb-6">
        <form className="space-y-4" onSubmit={submitHandler}>
          <div className="flex flex-col items-center gap-4">
            <div className="relative cursor-pointer">
              <img
                src={avatarPreview || "/images/avatar-placeholder.png"}
                alt="Avatar"
                className="h-14 w-14 rounded-full border-2 border-primary"
              />
              <label className="absolute bottom-0 right-0 bg-primary p-1 rounded-full">
                <FaCamera className="text-white text-xs" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && handleAvatarChange(e.target.files[0])
                  }
                  className="hidden"
                />
              </label>
            </div>

            <Input
              label={t("displayName")}
              value={displayName}
              variant="bordered"
              onChange={(e) => setDisplayName(e.target.value)}
              isInvalid={!!errors.displayName}
              errorMessage={errors.displayName}
            />
          </div>

          <Input
            label={t("email")}
            type="email"
            value={email}
            variant="bordered"
            onChange={(e) => setEmail(e.target.value)}
            isInvalid={!!errors.email}
            errorMessage={errors.email}
          />

          <Input
            label={t("password")}
            type="password"
            value={password}
            variant="bordered"
            onChange={(e) => setPassword(e.target.value)}
            isInvalid={!!errors.password}
            errorMessage={errors.password}
          />

          <Input
            label={t("confirmPassword")}
            type="password"
            value={confirmPassword}
            variant="bordered"
            onChange={(e) => setConfirmPassword(e.target.value)}
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
          />

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={loading}
          >
            {t("submit")}
          </Button>
        </form>

        <div className="mt-4 border-t pt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          {t("haveAccount")}{" "}
          <Link href={signinHref} className="text-primary hover:underline">
            {t("signIn")}
          </Link>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <>
      <div className="hidden md:flex justify-center">{DesktopForm}</div>
      <div className="md:hidden flex justify-center">{MobileForm}</div>

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
    </>
  );
}
