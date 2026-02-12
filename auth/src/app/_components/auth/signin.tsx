"use client";

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
} from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";

import { auth } from "@/lib/auth";

type FieldErrors = {
  email?: string;
  password?: string;
};

export function SigninSection({ callback }: { callback?: string }) {
  const t = useTranslations("_components.auth.signin");
  const router = useRouter();

  const signupHref = "/?auth=signup";
  const callbackURL = callback || process.env.NEXT_PUBLIC_BASE_URL;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (!email) nextErrors.email = t("validation.emailRequired");
    else if (!email.includes("@"))
      nextErrors.email = t("validation.emailInvalid");

    if (!password) nextErrors.password = t("validation.passwordRequired");
    else if (password.length < 6)
      nextErrors.password = t("validation.passwordMin");

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submitHandler(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) {
      addToast({
        title: t("toast.errorTitle"),
        description: t("toast.errorDescription"),
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
          title: t("toast.loginFailed"),
          description: result.error.message || t("toast.unexpectedError"),
          color: "danger",
        });
        setLoading(false);
        return;
      }

      addToast({
        title: t("toast.loginSuccess"),
        description: t("toast.connecting"),
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

  async function githubSignIn() {
    setLoading(true);
    try {
      const result = await auth.signIn.social({
        provider: "github",
        callbackURL,
      });

      if (result.error) {
        addToast({
          title: t("toast.githubFailed"),
          description: result.error.message || t("toast.unexpectedError"),
          color: "danger",
        });
        setLoading(false);
        return;
      }

      addToast({
        title: t("toast.loginSuccess"),
        description: t("toast.connecting"),
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

  // ===================== DESKTOP =====================
  const DesktopForm = (
    <Card className="hidden md:flex w-full max-w-md rounded-lg shadow-lg bg-background/50 backdrop-blur-md border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-col gap-2 px-8 pt-8">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/20 px-3 py-1 rounded-full">
          {t("badge")}
        </span>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          {t("title")}
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </CardHeader>

      <CardBody className="px-8 pb-8">
        <form className="space-y-6" onSubmit={submitHandler}>
          <Input
            label={t("email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            variant="bordered"
            isInvalid={!!errors.email}
            errorMessage={errors.email}
          />

          <Input
            label={t("password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            variant="bordered"
            isInvalid={!!errors.password}
            errorMessage={errors.password}
          />

          <div className="flex items-center justify-between pt-1">
            <Checkbox
              isSelected={rememberMe}
              onValueChange={setRememberMe}
              size="sm"
            >
              {t("rememberMe")}
            </Checkbox>

            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() =>
                addToast({
                  title: t("toast.passwordRecovery"),
                  description: t("toast.notAvailable"),
                  color: "warning",
                })
              }
            >
              {t("forgotPassword")}
            </button>
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-4 font-semibold tracking-wide"
          >
            {t("submit")}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-3">
          <Button
            variant="bordered"
            size="lg"
            fullWidth
            onPress={githubSignIn}
            isLoading={loading}
            startContent={<FaGithub />}
          >
            {t("github")}
          </Button>
        </div>

        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          {t("noAccount")}{" "}
          <Link
            href={signupHref}
            className="font-medium text-primary hover:underline"
          >
            {t("createAccount")}
          </Link>
        </div>
      </CardBody>
    </Card>
  );

  // ===================== MOBILE =====================
  const MobileForm = (
    <Card className="md:hidden w-full max-w-sm rounded-lg shadow-lg bg-background/50 backdrop-blur-md border border-gray-200 dark:border-gray-700">
      <CardHeader className="flex flex-col gap-2 px-6 pt-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/20 px-2 py-1 rounded-full">
          {t("badge")}
        </span>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t("title")}
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </CardHeader>

      <CardBody className="px-6 pb-6">
        <form className="space-y-4" onSubmit={submitHandler}>
          <Input
            label={t("email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@empresa.com"
            variant="bordered"
            isInvalid={!!errors.email}
            errorMessage={errors.email}
          />

          <Input
            label={t("password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            variant="bordered"
            isInvalid={!!errors.password}
            errorMessage={errors.password}
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-1 gap-2">
            <Checkbox
              isSelected={rememberMe}
              onValueChange={setRememberMe}
              size="sm"
            >
              {t("rememberMe")}
            </Checkbox>

            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() =>
                addToast({
                  title: t("toast.passwordRecovery"),
                  description: t("toast.notAvailable"),
                  color: "warning",
                })
              }
            >
              {t("forgotPassword")}
            </button>
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            className="mt-4 font-semibold tracking-wide"
          >
            {t("submit")}
          </Button>
        </form>

        <div className="mt-4 flex flex-col gap-3">
          <Button
            variant="bordered"
            size="lg"
            fullWidth
            onPress={githubSignIn}
            isLoading={loading}
            startContent={<FaGithub />}
          >
            {t("github")}
          </Button>
        </div>

        <div className="mt-4 border-t border-gray-200/50 dark:border-gray-700/50 pt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          {t("noAccount")}{" "}
          <Link
            href={signupHref}
            className="font-medium text-primary hover:underline"
          >
            {t("createAccount")}
          </Link>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <>
      {DesktopForm}
      {MobileForm}
    </>
  );
}
