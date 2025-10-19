"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  Input,
  Textarea,
  Divider,
  Link as HeroLink,
} from "@heroui/react";

export default function CreateProjectPage() {
  const router = useRouter();

  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  const handleCreateProject = () => {
    // Aqui você pode enviar para seu backend / MongoDB
    console.log("Novo projeto criado:", { bannerUrl, description, githubUrl });
    router.push("/app/profile/me"); // voltar para perfil
  };

  return (
    <section className="flex justify-center items-start min-h-screen pt-32 px-4 sm:px-6 bg-background/20">
      <div className="w-full max-w-4xl flex flex-col md:flex-row gap-6">
        {/* Formulário */}
        <Card className="flex-1 bg-background border border-grid-line rounded-xl shadow-lg p-6">
          <CardBody className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-white">Criar Novo Projeto</h1>
            <Divider className="bg-grid-line my-2" />

            <Input
              placeholder="URL do Banner"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              className="bg-background/80 text-white"
            />
            <Textarea
              placeholder="Descrição do projeto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/80 text-white"
            />
            <Input
              placeholder="URL do GitHub"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="bg-background/80 text-white"
            />

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="bordered" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button color="primary" onClick={handleCreateProject}>
                Criar projeto
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Preview */}
        <Card className="flex-1 bg-background/70 border border-grid-line rounded-xl shadow-lg p-6">
          <CardBody className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-white">Preview do Projeto</h2>
            <Divider className="bg-grid-line my-1" />

            {/* Banner */}
            {bannerUrl ? (
              <div className="w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={bannerUrl}
                  alt="Banner do projeto"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400">
                Banner aparecerá aqui
              </div>
            )}

            {/* Descrição */}
            <p className="text-gray-300">{description || "Descrição do projeto"}</p>

            {/* GitHub Preview */}
            {githubUrl ? (
              <div className="border border-gray-600 rounded-lg p-2 bg-gray-900">
                <HeroLink
                  href={githubUrl}
                  target="_blank"
                  className="text-blue-400 hover:underline break-all"
                >
                  {githubUrl}
                </HeroLink>
                <iframe
                  src={githubUrl.replace("github.com", "github.com")} // placeholder para embed
                  className="w-full h-40 mt-2 rounded-lg border border-gray-700"
                />
              </div>
            ) : (
              <div className="border border-gray-600 rounded-lg p-2 bg-gray-900 h-40 flex items-center justify-center text-gray-400">
                Preview do GitHub aparecerá aqui
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </section>
  );
}
