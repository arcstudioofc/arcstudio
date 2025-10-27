"use client";

import React, { useEffect, useRef, useState } from "react";
import { Input, Spinner, Tooltip, Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { VscVerifiedFilled } from "react-icons/vsc";
import { HiOutlineClock, HiOutlineFire } from "react-icons/hi";
import Image from "next/image";

type UserType = {
  _id: string;
  name: string;
  image?: string | null;
  isAdmin?: boolean;
  account?: { isVerified?: boolean; followers?: string[] } | null;
};

const RECENT_KEY = "arcstudio_recent_profiles_v1";

function UserItem({ user, onClick }: { user: UserType; onClick: () => void }) {
  return (
    <Link
      href={`/app/profile/${encodeURIComponent(user.name)}`}
      onClick={onClick}
      className="block w-full rounded-xl transition hover:bg-[rgba(255,255,255,0.1)] p-2 flex items-center gap-3"
    >
      <Image
        src={user.image || `/images/avatar-placeholder.png`}
        alt={user.name}
        className="w-12 h-12 rounded-full object-cover"
        width={48}
        height={48}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.name}</span>
          {user.account?.isVerified && (
            <Tooltip content="Conta verificada">
              <VscVerifiedFilled className="text-primary" />
            </Tooltip>
          )}
        </div>
        <span className="text-xs opacity-70">
          {user.account?.followers?.length || 0}{" "}
          {(user.account?.followers?.length || 0) <= 1 ? "seguidor" : "seguidores"}
        </span>
      </div>
    </Link>
  );
}

export default function SearchUserPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommended, setRecommended] = useState<UserType[]>([]);
  const [recent, setRecent] = useState<UserType[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem(RECENT_KEY);
    if (raw) {
      try {
        setRecent(JSON.parse(raw) as UserType[]);
      } catch (e) {
        console.warn("Erro ao parsear histórico:", e);
      }
    }

    (async () => {
      try {
        const res = await fetch("/api/user/recommendations");
        if (res.ok) {
          const data = await res.json();
          setRecommended(data.users || []);
        }
      } catch (err) {
        console.debug("Recomendações não encontradas.", err);
      }
    })();
  }, []);

  function addToRecent(user: UserType) {
    const next = [user, ...recent.filter((r) => r._id !== user._id)].slice(0, 8);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  }

  useEffect(() => {
    if (controllerRef.current) controllerRef.current.abort();

    if (!query.trim()) {
      setUsers([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/user/search?name=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        if ((err as DOMException).name !== "AbortError") {
          console.error("Erro ao buscar usuários:", err);
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-24 pb-12">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel principal */}
        <Card
          className="lg:col-span-2 border border-grid-line
          bg-[rgba(14, 14, 37, 0.49)] backdrop-blur-sm shadow-lg"
        >
          <CardBody className="p-6">
            {/* Campo de busca */}
            <div className="mb-6">
              <Input
                label="Buscar usuário"
                placeholder="Digite um nome..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                isClearable
                variant="flat"
                ref={inputRef}
                classNames={{
                  inputWrapper:
                    "bg-transparent border border-grid-line focus-within:bg-transparent !bg-transparent",
                  label: "text-white",
                  input: "bg-transparent focus:bg-transparent text-white",
                }}
              />
            </div>

            {/* Resultados da busca (acima da divisória) */}
            {query.trim() && (
              <div className="mb-6">
                {!loading && users.length === 0 && (
                  <div className="text-center py-6 text-sm opacity-70 text-white">
                    Nenhum usuário encontrado para &quot;{query}&quot;
                  </div>
                )}
                {!loading && users.length > 0 && (
                  <ul className="space-y-1">
                    {users.map((user) => (
                      <li key={user._id}>
                        <UserItem user={user} onClick={() => addToRecent(user)} />
                      </li>
                    ))}
                  </ul>
                )}
                {loading && (
                  <div className="flex justify-center py-4">
                    <Spinner label="Carregando resultados..." />
                  </div>
                )}
              </div>
            )}

            {/* Divisória */}
            <div className="border-t border-grid-line mb-6"></div>

            {/* Últimos visitados e Recomendações */}
            <div className="space-y-6">
              {recent.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-white">
                      <HiOutlineClock /> Últimos visitados
                    </h3>
                    <button
                      className="text-xs opacity-70 hover:opacity-100 text-white"
                      onClick={() => {
                        setRecent([]);
                        localStorage.removeItem(RECENT_KEY);
                      }}
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {recent.map((r) => (
                      <UserItem key={r._id} user={r} onClick={() => addToRecent(r)} />
                    ))}
                  </div>
                </section>
              )}

              {recommended.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-white">
                    <HiOutlineFire /> Recomendações para você
                  </h3>
                  <div className="space-y-2">
                    {recommended.slice(0, 6).map((rec) => (
                      <UserItem key={rec._id} user={rec} onClick={() => addToRecent(rec)} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Painel lateral */}
        <aside>
          <Card className="bg-[rgba(14, 14, 37, 0.49)] backdrop-blur-sm shadow-lg border border-grid-line">
            <CardBody className="p-6 text-white">
              <h4 className="text-sm font-semibold mb-2">Dicas rápidas</h4>
              <ul className="text-sm opacity-80 space-y-2">
                <li>Use nomes de usuário ou nomes reais.</li>
                <li>
                  Pressione <span className="font-medium">Enter</span> para abrir o perfil.
                </li>
                <li>Mantenha nomes claros e consistentes para facilitar a busca.</li>
              </ul>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
