"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardBody } from "@heroui/react";
import Image from "next/image";
import Link from "next/link";

interface Commit {
    sha: string;
    commit: {
        message: string;
        author: {
            name: string;
            date: string;
        };
    };
    author?: {
        avatar_url?: string;
        login?: string;
    };
}

export default function ChangelogPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const currentTab = searchParams.get("logs") || "github";
    const [commits, setCommits] = useState<Commit[]>([]);

    useEffect(() => {
        if (currentTab === "github") {
            fetch("https://api.github.com/repos/arcstudioofc/arcstudio/commits")
                .then((res) => res.json())
                .then((data) => setCommits(data));
        }
    }, [currentTab]);

    const changeTab = (tab: string) => {
        router.push(`?logs=${tab}`);
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-3xl mx-auto">

                {/* <h1 className="text-3xl font-bold mb-6">Changelog</h1> */}

                {/* ---------------- TABS (NO TOPO) ---------------- */}
                <div className="flex w-full mb-6 ">
                    <button
                        onClick={() => changeTab("github")}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${currentTab === "github"
                                ? "border-primary text-primary"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                    >
                        GitHub Logs
                    </button>

                    <button
                        onClick={() => changeTab("especific")}
                        className={`px-4 py-2 font-medium transition-colors border-b-2 ${currentTab === "especific"
                                ? "border-secondary text-secondary"
                                : "border-transparent opacity-60 hover:opacity-100"
                            }`}
                    >
                        Específico
                    </button>
                </div>

                {/* ---------------- CONTEÚDO ---------------- */}
                {currentTab === "github" && (
                    <div className="space-y-4">
                        {commits.slice(0, 10).map((c) => (
                            <Link
                                key={c.sha}
                                href={`https://github.com/arcstudioofc/arcstudio/commit/${c.sha}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                    >
                            <Card
                                key={c.sha}
                                className="rounded-2xl overflow-hidden shadow-sm mb-3 cursor-pointer"
                                // onClick={() =>
                                //     window.open(
                                //         `https://github.com/arcstudioofc/arcstudio/commit/${c.sha}`,
                                //         "_blank"
                                //     )
                                // }
                            >
                                <div className="flex h-full">
                                    {/* Imagem */}
                                    <div className="w-24 min-h-full bg-gray-300 dark:bg-gray-700">
                                        <Image
                                            src={c.author?.avatar_url || "/images/default-avatar.png"}
                                            width={69}
                                            height={69}
                                            alt={c.commit.author.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Texto */}
                                    <CardBody className="p-5">
                                        <p className="text-lg font-semibold leading-tight">
                                            {c.commit.message.length > 80
                                                ? c.commit.message.slice(0, 80) + "..."
                                                : c.commit.message}
                                        </p>

                                        <p className="text-sm opacity-80 mt-1">
                                            {c.author?.login || c.commit.author.name}
                                        </p>

                                        <p className="text-xs opacity-60 mt-1">
                                            {new Date(c.commit.author.date).toLocaleString()}
                                        </p>
                                    </CardBody>
                                </div>
                            </Card>
                            </Link>
                        ))}
                    </div>
                )}

                {currentTab === "especific" && (
                    <Card className="rounded-2xl p-4 shadow-sm">
                        <CardBody>
                            <p className="opacity-60">Nenhum log específico adicionado ainda.</p>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );
}
