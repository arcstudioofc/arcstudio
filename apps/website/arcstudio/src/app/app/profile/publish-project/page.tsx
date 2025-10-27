"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { VscPreview } from "react-icons/vsc";
import { GoProjectSymlink } from "react-icons/go";
import { FaQuestionCircle } from "react-icons/fa";
import {
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@heroui/react";

import PostCard from "@/components/config/PostCard";
import Loading from "@/components/config/auth/Loading";
import { IUser } from "@/lib/database/mongoose/models/User";

export default function CreateProjectPage() {
  const { data: session, status } = useSession();
  const [dbUser, setDbUser] = useState<IUser | null>(null);

  // Buscar usuário no banco
  useEffect(() => {
    if (!session?.user?.email) return;

    (async () => {
      try {
          const res = await fetch(`/api/user?email=${session.user.email}`);
        const data = await res.json();
        setDbUser(data.user);
      } catch (err) {
        console.error("Erro ao buscar usuário:", err);
      }
    })();
  }, [session]);

  const router = useRouter();

  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  useEffect(() => {
    if (status !== "loading" && !session?.user) {
      router.replace("/app");
    }
  }, [session, status, router]);

  if (status === "loading") return <Loading />;

  const handleCreateProject = async () => {
    if (!session?.user?.name) return;

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dbUser?.name, // agora enviamos o name
          bannerUrl,
          description,
          githubUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro ao criar projeto:", data.error);
        return;
      }

      console.log("Projeto criado:", data.createdPost.hash);

      // Redireciona para perfil do usuário
      router.push(`/app/profile/${dbUser?.name}`);
    } catch (err) {
      console.error("Erro ao enviar projeto:", err);
    }
  };

  return (
    <section className="flex select-none justify-center items-start min-h-screen pt-32 px-4 sm:px-6 bg-background/20">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        {/* Formulário */}
        <Card className="flex-1 bg-background border border-grid-line rounded-2xl shadow-lg p-6 flex flex-col justify-between">
          <CardBody className="flex flex-col gap-5 flex-grow">
            {/* Cabeçalho aprimorado */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 justify-center">
                <GoProjectSymlink /> Publicar Projeto
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Preencha os campos abaixo para publicar seu projeto no ARC
                Studio.
              </p>
            </div>
            <Divider className="bg-grid-line my-1" />

            {/* Campos do formulário */}
            <Input
              label="Banner do projeto"
              placeholder="Cole a URL do banner"
              value={bannerUrl}
              variant="bordered"
              onChange={(e) => setBannerUrl(e.target.value)}
              className="bg-background/90 text-white"
            />

            <Textarea
              label="Descrição do projeto"
              placeholder="Descreva seu projeto de forma clara e objetiva"
              value={description}
              variant="bordered"
              isRequired
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/90 text-white"
            />

            <Input
              label="GitHub"
              placeholder="https://github.com/seu-projeto"
              value={githubUrl}
              variant="bordered"
              onChange={(e) => setGithubUrl(e.target.value)}
              className="bg-background/90 text-white"
            />

            {/* Botões de ação */}
            <div className="flex justify-end gap-3 mt-3">
              <Button variant="bordered" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onClick={handleCreateProject}
                isDisabled={!description}
              >
                Enviar projeto
              </Button>
            </div>
          </CardBody>

          {/* Footer fixo com ajuda */}
          <footer className="flex justify-end items-center border-t border-grid-line pt-3 mt-4">
            <Button
              onClick={() => setIsHelpOpen(true)}
              className="text-white/70 hover:text-white transition"
              isIconOnly
              variant="light"
              aria-label="Ajuda de formatação"
              title="Guia de formatação Markdown"
            >
              <FaQuestionCircle className="text-2xl" />
            </Button>
          </footer>
        </Card>

        {/* Preview */}
        <Card className="flex-1 bg-background/70 border border-grid-line rounded-xl shadow-lg p-6">
          <CardBody className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 justify-center">
              <VscPreview /> Preview do Projeto
            </h2>
            <Divider className="bg-grid-line my-1" />

            {session?.user ? (
              <PostCard
                user={{
                  _id: session.user.email ?? "",
                  isAdmin: false,
                  name: dbUser?.name || "Usuário",
                  image: dbUser?.image || "/images/avatar-placeholder.png",
                }}
                hash="preview"
                isPreview={true}
                bannerUrl={bannerUrl || undefined}
                content={description || "Descrição do projeto"}
                githubUrl={githubUrl || undefined}
              />
            ) : (
              <div className="border border-gray-600 rounded-lg p-4 bg-gray-900 h-48 flex items-center justify-center text-gray-400">
                Faça login para visualizar o preview
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Modal de Instruções */}
      <Modal
        isOpen={isHelpOpen}
        onOpenChange={setIsHelpOpen}
        size="xl"
        backdrop="blur"
        scrollBehavior="inside"
        classNames={{
          base: "bg-background/90 backdrop-blur-sm text-white max-h-[80vh] overflow-hidden",
          header:
            "sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-grid-line shadow-sm",
          body: "p-6 overflow-y-auto space-y-6",
        }}
      >
        <ModalContent>
          <ModalHeader>
            <h2 className="text-lg font-semibold">
              Guia de Formatação Markdown
            </h2>
          </ModalHeader>

          <ModalBody>
            {/* SEÇÃO: Títulos */}
            <section>
              <h3 className="text-base font-bold text-primary mb-2">Títulos</h3>
              <div className="space-y-1">
                <code># Título Nível 1</code> →{" "}
                <span className="font-bold text-lg">Título 1</span>
                <br />
                <code>## Título Nível 2</code> →{" "}
                <span className="font-semibold text-md">Título 2</span>
                <br />
                <code>### Título Nível 3</code> →{" "}
                <span className="font-medium text-sm">Título 3</span>
              </div>
            </section>

            <Divider className="bg-grid-line" />

            {/* SEÇÃO: Texto */}
            <section>
              <h3 className="text-base font-bold text-primary mb-2">
                Texto e Estilo
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <code>**negrito**</code> → <b>negrito</b>
                </li>
                <li>
                  <code>*itálico*</code> → <i>itálico</i>
                </li>
                <li>
                  <code>__sublinhado__</code> → <u>sublinhado</u>
                </li>
                <li>
                  <code>~~riscado~~</code> → <s>riscado</s>
                </li>
              </ul>
              <br />
              <p>Como quebrar linha:</p>
              <br />
              Texto
              <br />
              <br />
              {"<br />"}
              <br />
              <br />
              Texto
            </section>

            <Divider className="bg-grid-line" />

            {/* SEÇÃO: Links */}
            <section>
              <h3 className="text-base font-bold text-primary mb-2">Links</h3>
              <p>
                Você pode adicionar links usando:{" "}
                <code>[texto](https://exemplo.com)</code>
              </p>
              <p className="mt-2">
                Exemplo: <code>[Visite o GitHub](https://github.com)</code> →{" "}
                <a
                  href="https://github.com"
                  target="_blank"
                  className="text-blue-400 underline hover:text-blue-300"
                >
                  Visite o GitHub
                </a>
              </p>
            </section>

            <Divider className="bg-grid-line" />

            {/* SEÇÃO: Listas */}
            <section>
              <h3 className="text-base font-bold text-primary mb-2">Listas</h3>
              <ul className="list-disc pl-6 space-y-1">
                <li>Item comum</li>
                <li>
                  Outro item
                  <ul className="list-disc pl-6">
                    <li>Subitem</li>
                  </ul>
                </li>
              </ul>

              <p className="mt-3 font-semibold">Listas numeradas:</p>
              <ol className="list-decimal pl-6">
                <li>Primeiro item</li>
                <li>Segundo item</li>
              </ol>

              <p className="mt-3 font-semibold">Listas de tarefas:</p>
              <ul className="list-none pl-2 space-y-1">
                <li>
                  <code>- [x] Tarefa completa</code>
                </li>
                <li>
                  <code>- [ ] Tarefa pendente</code>
                </li>
              </ul>
            </section>

            <Divider className="bg-grid-line" />

            {/* SEÇÃO: Código */}
            <section>
              <h2 className="text-base font-bold text-primary mb-2">Códigos</h2>
              <p className="mt-2 font-semibold">Bloco de código:</p>
              <pre className="bg-black/40 p-3 rounded-lg overflow-x-auto mt-2">
                <code className="language-js">
                  {`\`\`\`js
function hello(name) {
  console.log(\`Olá, \${name}!\`);
}
hello("Mundo");
\`\`\``}
                </code>
              </pre>
            </section>
          </ModalBody>
        </ModalContent>
      </Modal>
    </section>
  );
}

/**
# [ARC Studio](https://arcstudio.online), Inc.

<br>

Não limite suas ideias apénas no papel — deixe sua criatividade lhe guiar!

<br>

[Publique aqui](https://arcstudio.online/app/profile/publish-project) seu projeto!
 */
