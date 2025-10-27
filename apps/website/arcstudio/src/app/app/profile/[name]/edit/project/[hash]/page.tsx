"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { VscPreview } from "react-icons/vsc";
import { GoPencil } from "react-icons/go";
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

export default function EditProjectPage() {
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
  const params = useParams();

  const name = params?.["name"] as string;
  const hash = params?.["hash"] as string;

  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 Buscar dados do projeto existente
  useEffect(() => {
    if (!name || !hash) return;

    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/get?name=${name}&hash=${hash}`);
        const data = await res.json();

        if (!res.ok) {
          console.error("Erro ao buscar projeto:", data.error);
          router.replace(`/app/profile/${name}`);
          return;
        }

        setBannerUrl(data.bannerUrl || "");
        setDescription(data.content || "");
        setGithubUrl(data.githubUrl || "");
      } catch (err) {
        console.error("Erro ao carregar projeto:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [name, hash, router]);

  // 🔸 Redirecionar se não autenticado
  useEffect(() => {
    if (status !== "loading" && !session?.user) {
      router.replace("/app");
    }
  }, [session, status, router]);

  if (status === "loading" || isLoading) return <Loading />;

  // Se dbUser! não existir por algum motivo, não renderiza
  if (!session?.user) return null;

  // 🔹 Salvar alterações
  const handleUpdateProject = async () => {
    if (!dbUser!.name || !hash) return;

    try {
      const res = await fetch("/api/projects/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: dbUser!.name,
          hash,
          bannerUrl,
          description,
          githubUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro ao atualizar projeto:", data.error);
        return;
      }

      console.log("Projeto atualizado:", hash);
      router.push(`/app/profile/${dbUser!.name}`);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
    }
  };

  return (
    <section className="flex select-none justify-center items-start min-h-screen pt-32 px-4 sm:px-6 bg-background/20">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-6">
        {/* Formulário de Edição */}
        <Card className="flex-1 bg-background border border-grid-line rounded-2xl shadow-lg p-6 flex flex-col justify-between">
          <CardBody className="flex flex-col gap-5 flex-grow">
            {/* Cabeçalho */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2 justify-center">
                <GoPencil /> Editar Projeto
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Atualize as informações do seu projeto publicado.
              </p>
            </div>

            <Divider className="bg-grid-line my-1" />

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
              placeholder="Atualize a descrição"
              value={description}
              variant="bordered"
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

            <div className="flex justify-end gap-3 mt-3">
              <Button variant="bordered" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button
                color="primary"
                onClick={handleUpdateProject}
                isDisabled={!description}
              >
                Salvar alterações
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
              <VscPreview /> Preview da Edição
            </h2>
            <Divider className="bg-grid-line my-1" />

            <PostCard
              user={{
                _id: session.user.email ?? "",
                isAdmin: false,
                name: dbUser!.name ?? "Usuário",
                image: dbUser!.image ?? "/images/avatar-placeholder.png",
              }}
              hash={hash}
              isPreview={true}
              bannerUrl={bannerUrl || undefined}
              content={description || "Descrição atualizada"}
              githubUrl={githubUrl || undefined}
            />
          </CardBody>
        </Card>
      </div>

      {/* Modal Markdown */}
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
            {/* Conteúdo do modal mantido igual */}
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
