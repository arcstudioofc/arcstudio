"use client";

import { useState, useEffect } from "react";
import { Input, Spinner, User, Card, CardBody } from "@heroui/react";
import Link from "next/link";

export default function SearchUserPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Busca dinâmica na API com debounce
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (!query.trim()) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/user/search?name=${encodeURIComponent(query)}`);
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error("Erro ao buscar usuários:", err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <div
      className="flex flex-col items-center min-h-screen px-4"
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-fg)",
      }}
    >
      {/* Espaço para centralizar o input mais abaixo */}
      <div className="flex flex-col items-center justify-start w-full pt-32 sm:pt-40">
        <Card
          className="w-full max-w-md border"
          style={{
            backgroundColor: "var(--color-bg-variant)",
            borderColor: "var(--grid-line-color)",
          }}
        >
          <CardBody className="flex flex-col gap-5">
            <Input
              label="Buscar usuário"
              placeholder="Digite um nome..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              isClearable
              variant="flat"
              classNames={{
                inputWrapper: "bg-transparent border border-[var(--grid-line-color)]",
                label: "text-[var(--color-fg)]",
                input: "text-[var(--color-fg)]",
              }}
            />

            {loading && (
              <div className="flex justify-center py-4">
                <Spinner label="Procurando usuários..." color="primary" />
              </div>
            )}

            {!loading && users.length > 0 && (
              <div className="flex flex-col gap-1">
                {users.map((user) => (
                  <Link
                    key={user._id}
                    href={`/app/profile/${encodeURIComponent(user.name)}`}
                    className="block w-full rounded-xl transition-colors duration-200 hover:bg-[var(--grid-line-color)]"
                  >
                    <div className="p-2">
                      <User
                        avatarProps={{
                          src: user.image || `https://i.pravatar.cc/150?u=${user._id}`,
                        }}
                        name={user.name}
                        description={user.email}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {!loading && query && users.length === 0 && (
              <p className="text-center text-sm text-gray-400">
                Nenhum usuário encontrado.
              </p>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
