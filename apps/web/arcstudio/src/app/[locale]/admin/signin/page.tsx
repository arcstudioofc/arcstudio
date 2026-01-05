"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { FaLock, FaEnvelope, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { Card, CardBody, Input, Button } from "@heroui/react";
import ARC from "@/components/UI/ARC";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const signInSchema = z.object({
  email: z.email("Digite um e-mail válido"),
  password: z.string().min(6, "No mínimo 6 caracteres"),
});

type SignInSchema = z.infer<typeof signInSchema>;

export default function AdminSignInPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInSchema>();
  const { data: session } = auth.useSession();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      const userRoles = session.user.role?.split(',') || [];
      if (userRoles.includes('admin')) {
        router.replace("/admin");
      } else {
        auth.signOut();
        router.replace("/");
      }
    }
  }, [session, router]);

  async function handleSignIn({ email, password }: SignInSchema) {
    setErrorMessage(null);
    try {
      await auth.signIn.email(
        {
          email,
          password,
          callbackURL: "/admin",
          rememberMe: true,
        },
        {
          onSuccess: (context) => {
            const userRoles = context.data.user.role?.split(',') || [];
            if (!userRoles.includes('admin')) {
              auth.signOut();
              setErrorMessage("Acesso negado. Apenas administradores podem acessar esta área.");
            } else {
              router.push("/admin");
            }
          },
          onError: (context) => {
            setErrorMessage(context.error.message || "Credenciais inválidas. Tente novamente.");
          },
        }
      );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      setErrorMessage("Ocorreu um erro inesperado. Tente novamente mais tarde.");
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden">

      <Link
        href="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        <span>Voltar ao site</span>
      </Link>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <ARC />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Painel Administrativo</h1>
          <p className="text-foreground/60">Entre com suas credenciais para gerenciar o ARC Studio</p>
        </div>

        <Card className="border border-foreground/10 bg-background/40 backdrop-blur-xl shadow-2xl p-2">
          <CardBody className="p-6">
            <form onSubmit={handleSubmit(handleSignIn)} className="space-y-6">
              <div className="space-y-4">
                <Input
                  label="E-mail"
                  variant="bordered"
                  type="email"
                  placeholder="seu@email.com"
                  labelPlacement="outside"
                  startContent={<FaEnvelope className="text-foreground/40" />}
                  {...register("email")}
                  isInvalid={!!errors.email}
                  errorMessage={errors.email?.message}
                  classNames={{
                    inputWrapper: "h-12 border-foreground/10 hover:border-primary/50 focus-within:!border-primary transition-all",
                  }}
                />

                <Input
                  label="Senha"
                  variant="bordered"
                  type="password"
                  placeholder="••••••••"
                  labelPlacement="outside"
                  startContent={<FaLock className="text-foreground/40" />}
                  {...register("password")}
                  isInvalid={!!errors.password}
                  errorMessage={errors.password?.message}
                  classNames={{
                    inputWrapper: "h-12 border-foreground/10 hover:border-primary/50 focus-within:!border-primary transition-all",
                  }}
                />
              </div>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm text-center animate-in fade-in slide-in-from-top-1">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                isLoading={isSubmitting}
                color="primary"
                className="w-full h-12 font-bold text-lg shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              >
                Acessar Painel
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className="text-center text-xs text-foreground/40 uppercase tracking-widest">
          Acesso restrito • ARC Studio Security
        </p>
      </div>
    </div>
  );
}
