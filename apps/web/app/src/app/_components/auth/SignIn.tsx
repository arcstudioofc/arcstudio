"use client";

import { Button, Input, Checkbox } from "@heroui/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { FaGithub, FaEye, FaEyeSlash } from "react-icons/fa";
import Link from "next/link";

import ARC from "@/components/UI/ARC";
import { signIn, useSession } from "@/lib/auth";
import { settings } from "@/lib";

const USERNAME_REGEX = /^[a-zA-Z0-9_-]+$/;

type FieldErrors = {
  username?: string;
  password?: string;
  general?: string;
};

export default function SignIn() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  const clearError = (field: keyof FieldErrors) => {
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleUsernameChange = (value: string) => {
    const normalized = value.toLowerCase();
    setUsername(normalized);

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
  };

  const isDisabled =
    loading ||
    !username ||
    !password ||
    !!errors.username;

  const handleSubmit = async () => {
    setErrors({});
    setLoading(true);

    try {
      await signIn.username(
        {
          username,
          password,
          rememberMe,
          callbackURL: `${settings.callbaclUrl}/home`,
        },
        {
          onRequest: () => setLoading(true),
          onResponse: () => setLoading(false),
          onError: (c) => {
            setErrors({
              general:c.error.message,
            });
            setLoading(false);
          }
        }
      );
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#edecf1] dark:bg-[#01000a] shadow-lg lg:max-w-sm xl:max-w-sm lg:mx-0">
      <div className="flex flex-col gap-2 text-center p-6">
        <h1 className="flex text-xl gap-2 font-semibold justify-center">
          <ARC />
          Bem-vindo de volta
        </h1>
        <p className="text-sm text-default-500">
          Faça login para continuar
        </p>
      </div>

      <div className="flex flex-col gap-4 px-6">
        <Input
          label="Usuário"
          isRequired
          variant="bordered"
          value={username}
          isInvalid={!!errors.username}
          errorMessage={errors.username}
          onValueChange={handleUsernameChange}
        />

        <Input
          type={showPassword ? "text" : "password"}
          label="Senha"
          isRequired
          variant="bordered"
          value={password}
          isInvalid={!!errors.password}
          errorMessage={errors.password}
          onValueChange={v => {
            clearError("password");
            setPassword(v);
          }}
          endContent={
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          }
        />

        <Checkbox
          isSelected={rememberMe}
          onValueChange={setRememberMe}
        >
          Lembrar de mim
        </Checkbox>

        {errors.general && (
          <p className="text-danger text-sm text-center">
            {errors.general}
          </p>
        )}

        <Button
          color="primary"
          isDisabled={isDisabled}
          onPress={handleSubmit}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Entrar"
          )}
        </Button>
      </div>

      <div className="text-center text-sm text-default-500 pt-5">
        <span>Não possui uma conta? </span>
        <Link
          href="/auth/signup"
          className="text-primary hover:underline"
        >
          Registre-se
        </Link>
      </div>

      <div className="flex flex-col gap-3 px-6 pb-6 pt-4">
        <Button
          variant="bordered"
          startContent={<FaGithub />}
          isDisabled={loading}
          onPress={async () => {
            try {
              await signIn.social(
                {
                  provider: "github",
                  callbackURL: `${settings.callbaclUrl}/home`,
                },
                {
                  onRequest: () => setLoading(true),
                  onResponse: () => setLoading(false),
                }
              );
            } catch {
              setLoading(false);
            }
          }}
        >
          GitHub
        </Button>
      </div>
    </div>
  );
}
