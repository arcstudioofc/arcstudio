'use client';

import { auth } from '@/lib/auth';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

const signInSchema = z.object({
  email: z.string().email("Digite um e-mail válido!"),
  password: z.string().min(3, "No mínimo 3 caracteres"),
});

const signUpSchema = z.object({
  name: z.string().min(3, "No mínimo 3 caracteres"),
  email: z.string().email("Digite um e-mail válido!"),
  password: z.string().min(3, "No mínimo 3 caracteres"),
});

type SignInSchema = z.infer<typeof signInSchema>;
type SignUpSchema = z.infer<typeof signUpSchema>;

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const form = useForm<SignInSchema | SignUpSchema>({
    resolver: zodResolver(mode === "signin" ? signInSchema : signUpSchema),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting } } = form;

  async function handleSignIn(data: SignInSchema) {
    await auth.signIn.email(
      {
        email: data.email,
        password: data.password,
        callbackURL: "/app",
      },
      {
        onError(c) {
          alert(c.error?.message ?? "Falha ao fazer login");
        },
      }
    );
  }

  async function handleSignUp(data: SignUpSchema) {
    await auth.signUp.email(
      {
        name: data.name,
        email: data.email,
        password: data.password,
        image: "",
        callbackURL: "/app",
      },
      {
        onError(c) {
          alert(c.error?.message ?? "Falha ao criar conta");
        },
      }
    );
  }

  const onSubmit = (data: SignInSchema | SignUpSchema) => {
    return mode === "signin"
      ? handleSignIn(data as SignInSchema)
      : handleSignUp(data as SignUpSchema);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md flex flex-col gap-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          {mode === "signin" ? "Entrar na Conta" : "Criar Conta"}
        </h1>

        {/* NAME (signup only) */}
        {mode === "signup" && (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              placeholder="Digite seu nome"
              {...register("name")}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {"name" in errors && errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
        )}

        {/* EMAIL */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            placeholder="Digite seu email"
            {...register("email")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {"email" in errors && errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Senha</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            {...register("password")}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {"password" in errors && errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? mode === "signin"
              ? "Entrando..."
              : "Criando conta..."
            : mode === "signin"
            ? "Entrar"
            : "Criar conta"}
        </button>

        {/* TOGGLE MODE */}
        <p className="text-center text-sm text-gray-500">
          {mode === "signin" ? (
            <>
              Ainda não tem conta?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-indigo-600 hover:underline"
              >
                Criar conta
              </button>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-indigo-600 hover:underline"
              >
                Entrar
              </button>
            </>
          )}
        </p>
      </form>
    </div>
  );
}
