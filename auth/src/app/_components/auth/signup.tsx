"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaCamera } from "react-icons/fa";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Accordion,
  addToast,
} from "@heroui/react";
import Cropper from "react-easy-crop";

// Tipagem manual do Area, evitando erro de TS
type Area = { x: number; y: number; width: number; height: number };

import { auth } from "@/lib/auth";
import Icon from "@/widgets/Icon";
import LocaleSwitcher from "@/widgets/switcher/locale";
import ThemeSwitcher from "@/widgets/switcher/theme";

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  displayName?: string;
  avatar?: string;
};

export function SignupSection({ callback }: { callback?: string }) {
  const router = useRouter();
  const signinHref = "/?auth=signin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  // Cropper states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const callbackURL = callback || process.env.NEXT_PUBLIC_BASE_URL;

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (!displayName) nextErrors.displayName = "Nome obrigatório";
    if (!email) nextErrors.email = "E-mail obrigatório";
    else if (!email.includes("@")) nextErrors.email = "E-mail inválido";
    if (!password) nextErrors.password = "Senha obrigatória";
    else if (password.length < 6)
      nextErrors.password = "Mínimo de 6 caracteres";
    if (password !== confirmPassword)
      nextErrors.confirmPassword = "Senhas não conferem";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleAvatarChange(file: File) {
    if (!file) return;
    setCropImage(URL.createObjectURL(file));
    setCropModalOpen(true);
  }

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!cropImage || !croppedAreaPixels) return null;
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

    return new Promise<File | null>((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) return resolve(null);
        const file = new File([blob], "avatar.png", { type: "image/png" });
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
        resolve(file);
        setCropModalOpen(false);
      }, "image/png");
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
        title: "Erro ao criar conta",
        description: "Verifique os campos e tente novamente.",
        color: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      let avatarUrl = "/images/avatar-placeholder.png";
      if (avatar) {
        avatarUrl = await fileToBase64(avatar);
      }

      const result = await auth.signUp.email({
        email,
        password,
        name: displayName,
        image: avatarUrl,
        callbackURL,
      });

      if (result.error) {
        addToast({
          title: "Falha ao criar conta",
          description: result.error.message || "Erro desconhecido",
          color: "danger",
        });
        setLoading(false);
        return;
      }

      addToast({
        title: "Conta criada com sucesso",
        description: "Redirecionando…",
        color: "success",
      });

      setTimeout(() => router.refresh(), 500);
    } catch (err: any) {
      addToast({
        title: "Erro inesperado",
        description: err.message || "Tente novamente mais tarde.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md rounded-lg shadow-lg bg-background/50 backdrop-blur-md border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-col items-center gap-4 px-8 pt-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/20 px-3 py-1 rounded-full">
          Cadastro
        </span>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 text-center">
          Crie sua conta
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Preencha os campos para começar
        </p>
      </CardHeader>

      <CardBody className="px-8 pb-8">
        <form className="space-y-6" onSubmit={submitHandler}>
          <div className="flex items-center gap-4">
            <div
              className="relative flex-shrink-0 cursor-pointer"
              onClick={() => avatarPreview && setCropModalOpen(true)}
            >
              <img
                src={avatarPreview || "/images/avatar-placeholder.png"}
                alt="Avatar"
                className="h-16 w-16 aspect-square object-cover rounded-full border-2 border-primary dark:border-primary/70"
              />
              <label className="absolute bottom-0 right-0 bg-primary p-1 rounded-full hover:bg-primary/80">
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

            <div className="flex-1">
              <Input
                label="Nome de exibição"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                variant="bordered"
                isInvalid={!!errors.displayName}
                errorMessage={errors.displayName}
                classNames={{
                  inputWrapper:
                    "transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
                  input: "bg-background/80 dark:bg-gray-800",
                }}
              />
            </div>
          </div>

          <Input
            label="E‑mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            variant="bordered"
            isInvalid={!!errors.email}
            errorMessage={errors.email}
            classNames={{
              inputWrapper:
                "transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
              input: "bg-background/80 dark:bg-gray-800",
            }}
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            variant="bordered"
            isInvalid={!!errors.password}
            errorMessage={errors.password}
            classNames={{
              inputWrapper:
                "transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
              input: "bg-background/80 dark:bg-gray-800",
            }}
          />

          <Input
            label="Confirmar senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            variant="bordered"
            isInvalid={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword}
            classNames={{
              inputWrapper:
                "transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/30",
              input: "bg-background/80 dark:bg-gray-800",
            }}
          />

          <Button
            type="submit"
            variant="solid"
            color="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-4 font-semibold tracking-wide"
          >
            Criar conta
          </Button>
        </form>

        {/* Cropper Modal */}
        {cropModalOpen && cropImage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg p-4 w-full max-w-sm">
              <div className="relative w-full h-64 bg-gray-200">
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
              <div className="mt-4">
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="ghost"
                  color="default"
                  onPress={() => setCropModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  onPress={getCroppedImage}
                >
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-center gap-4 pt-6">
          <Icon />
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <LocaleSwitcher />
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <ThemeSwitcher />
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Já tem conta?{" "}
          <Link
            href={signinHref}
            className="font-medium text-primary hover:underline"
          >
            Entrar
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
