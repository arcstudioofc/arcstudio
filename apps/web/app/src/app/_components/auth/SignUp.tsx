"use client";

import { Button, Input } from "@heroui/react";
import { useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ARC from "@/components/UI/ARC";
import { signUp, useSession } from "@/lib/auth";
import { settings } from "@/lib";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

type FieldErrors = {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  password?: string;
  passwordConfirmation?: string;
  general?: string;
};

type ApiError = {
  message?: string;
  field?: keyof FieldErrors;
  errors?: Array<{
    field?: keyof FieldErrors;
    message: string;
  }>;
};

export default function SignUp() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] =
    useState<boolean | null>(null);

  const clearError = (field: keyof FieldErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUsernameChange = async (value: string) => {
    const normalized = value.toLowerCase();
    setUsername(normalized);
    setUsernameAvailable(null);

    if (normalized.length < 3 || normalized.length > 18) {
      setErrors(prev => ({
        ...prev,
        username: "O username deve ter entre 3 e 18 caracteres.",
      }));
      return;
    }

    if (!USERNAME_REGEX.test(normalized)) {
      setErrors(prev => ({
        ...prev,
        username: "Use apenas letras, números, _ ou -.",
      }));
      return;
    }

    clearError("username");
    setCheckingUsername(true);

    try {
      const res = await fetch(
        `${settings.apiUrl}/auth/is-username-available`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            username: normalized,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Falha ao verificar username");
      }

      const data: { available: boolean } = await res.json();

      setUsernameAvailable(data.available);

      if (!data.available) {
        setErrors(prev => ({
          ...prev,
          username: "Esse nome de usuário já está em uso.",
        }));
      }
    } catch {
      setErrors(prev => ({
        ...prev,
        username: "Erro ao verificar username.",
      }));
    }
    finally {
      setCheckingUsername(false);
    }
  };


  const handleSubmit = async () => {
    setErrors({});

    if (password !== passwordConfirmation) {
      setErrors({
        passwordConfirmation: "As senhas não coincidem.",
      });
      return;
    }

    try {
      setLoading(true);

      await signUp.email({
        email,
        password,
        name: `${firstName} ${lastName}`,
        image: image ? await convertImageToBase64(image) : "",
        callbackURL: `${settings.callbaclUrl}/home`!,
        fetchOptions: {
          body: {
            username,
          },
        },
      });

      router.push(`${settings.callbaclUrl}/home`!);
    } catch (err) {
      const error = err as ApiError;

      if (error.field && error.message) {
        setErrors({ [error.field]: error.message });
        return;
      }

      if (error.errors) {
        const fieldErrors: FieldErrors = {};
        for (const e of error.errors) {
          if (e.field) fieldErrors[e.field] = e.message;
        }
        setErrors(fieldErrors);
        return;
      }

      setErrors({
        general: "Erro ao criar conta. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled =
    loading ||
    !firstName ||
    !lastName ||
    !username ||
    !email ||
    !password ||
    password !== passwordConfirmation ||
    !!errors.username ||
    usernameAvailable === false;

  return (
    <div className="w-full h-screen bg-[#edecf1] dark:bg-[#01000a] shadow-lg lg:max-w-sm xl:max-w-sm lg:mx-0">
      <div className="flex flex-col gap-2 text-center p-6">
        <h1 className="flex text-xl gap-2 font-semibold justify-center">
          <ARC />
          Crie sua conta
        </h1>
        <p className="text-sm text-default-500">
          Preencha os dados abaixo para começar
        </p>
      </div>

      <div className="flex flex-col gap-4 px-6">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome"
            isRequired
            variant="bordered"
            value={firstName}
            isInvalid={!!errors.firstName}
            errorMessage={errors.firstName}
            onValueChange={v => {
              clearError("firstName");
              setFirstName(v);
            }}
          />
          <Input
            label="Sobrenome"
            isRequired
            variant="bordered"
            value={lastName}
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName}
            onValueChange={v => {
              clearError("lastName");
              setLastName(v);
            }}
          />
        </div>

        <Input
          label="Nome de usuário"
          isRequired
          variant="bordered"
          value={username}
          isInvalid={!!errors.username}
          errorMessage={errors.username}
          onValueChange={handleUsernameChange}
          endContent={
            checkingUsername ? (
              <Loader2 size={14} className="animate-spin text-default-400" />
            ) : usernameAvailable ? (
              <span className="text-success text-xs">Disponível</span>
            ) : usernameAvailable === false ? (
              <span className="text-danger text-xs">Indisponível</span>
            ) : null
          }
        />

        <Input
          type="email"
          label="Email"
          isRequired
          variant="bordered"
          value={email}
          isInvalid={!!errors.email}
          errorMessage={errors.email}
          onValueChange={v => {
            clearError("email");
            setEmail(v);
          }}
        />

        <Input
          type={showPassword ? "text" : "password"}
          label="Senha"
          variant="bordered"
          value={password}
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          onValueChange={v => {
            clearError("password");
            setPassword(v);
          }}
          endContent={
            <button onClick={() => setShowPassword(v => !v)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        <Input
          type={showConfirmPassword ? "text" : "password"}
          label="Confirmar senha"
          variant="bordered"
          value={passwordConfirmation}
          isInvalid={!!errors.passwordConfirmation}
          errorMessage={errors.passwordConfirmation}
          onValueChange={v => {
            clearError("passwordConfirmation");
            setPasswordConfirmation(v);
          }}
          endContent={
            <button onClick={() => setShowConfirmPassword(v => !v)}>
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        <div className="flex items-end gap-4">
          {imagePreview && (
            <div className="relative w-16 h-16 overflow-hidden rounded-sm">
              <Image
                src={imagePreview}
                alt="Profile preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-2 w-full">
            <Input
              type="file"
              label="Imagem de perfil (opcional)"
              variant="bordered"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <X
                className="cursor-pointer text-default-400"
                onClick={() => {
                  setImage(null);
                  setImagePreview(null);
                }}
              />
            )}
          </div>
        </div>

        {errors.general && (
          <p className="text-danger text-sm text-center">
            {errors.general}
          </p>
        )}

        <Button color="primary" isDisabled={isDisabled} onPress={handleSubmit}>
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Criar conta"
          )}
        </Button>
      </div>

      <div className="text-center text-sm text-default-500 pt-5">
        <span>Já possui uma conta? </span>
        <Link href="/auth/signin" className="text-primary hover:underline">
          Entrar
        </Link>
      </div>
    </div>
  );
}

async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
