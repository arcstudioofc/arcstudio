"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGithub } from "react-icons/fa";
import {
  Input,
  Button,
  Checkbox,
  Card,
  CardBody,
  CardHeader,
  Accordion,
  AccordionItem,
  addToast,
} from "@heroui/react";

import { auth } from "@/lib/auth";
import Icon from "@/widgets/Icon";
import LocaleSwitcher from "@/widgets/switcher/locale";
import ThemeSwitcher from "@/widgets/switcher/theme";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function SigninSection({ callback }: { callback: string }) {
  const router = useRouter();
  const signupHref = "/?auth=signup";
  const callbackURL = callback || process.env.NEXT_PUBLIC_BASE_URL;
  console.log(callbackURL);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const nextErrors: FieldErrors = {};
    if (!email) nextErrors.email = "E-mail obrigatório";
    else if (!email.includes("@")) nextErrors.email = "E-mail inválido";
    if (!password) nextErrors.password = "Senha obrigatória";
    else if (password.length < 6)
      nextErrors.password = "Mínimo de 6 caracteres";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitHandler(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) {
      addToast({
        title: "Erro ao entrar",
        description: "Verifique os campos e tente novamente.",
        color: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await auth.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL,
      });

      if (result.error) {
        addToast({
          title: "Falha no login",
          description: result.error.message || "Erro desconhecido",
          color: "danger",
        });
        setLoading(false);
        return;
      }

      addToast({
        title: "Login bem‑sucedido",
        description: "Conectando…",
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

  async function githubSignIn() {
    setLoading(true);
    try {
      const result = await auth.signIn.social({
        provider: "github",
        callbackURL,
      });

      if (result.error) {
        addToast({
          title: "Falha no login com GitHub",
          description: result.error.message || "Erro desconhecido",
          color: "danger",
        });
        setLoading(false);
        return;
      }

      addToast({
        title: "Login com GitHub bem‑sucedido",
        description: "Conectando…",
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
      <CardHeader className="flex flex-col gap-2 px-8 pt-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/20 px-3 py-1 rounded-full">
          Autenticação
        </span>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Bem‑vindo de volta
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Entre com suas credenciais para continuar
        </p>
      </CardHeader>

      <CardBody className="px-8 pb-8">
        <form className="space-y-6" onSubmit={submitHandler}>
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

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              isSelected={rememberMe}
              onValueChange={setRememberMe}
              size="sm"
            >
              Manter conectado
            </Checkbox>

            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() =>
                addToast({
                  title: "Recuperação de senha",
                  description: "Fluxo ainda não disponível.",
                  color: "warning",
                })
              }
            >
              Esqueceu a senha?
            </button>
          </div>

          <Button
            type="submit"
            variant="solid"
            color="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-4 font-semibold tracking-wide"
          >
            Entrar na plataforma
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="bordered"
            color="default"
            size="lg"
            fullWidth
            onPress={githubSignIn}
            isLoading={loading}
            startContent={<FaGithub />}
          >
            Entrar com GitHub
          </Button>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Ainda não tem conta?{" "}
          <Link
            href={signupHref}
            className="font-medium text-primary hover:underline"
          >
            Criar conta
          </Link>
        </div>

        <div className="flex items-center justify-center gap-4 pt-6">
          <Icon />
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <LocaleSwitcher />
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <ThemeSwitcher />
        </div>
      </CardBody>
    </Card>
  );
}
