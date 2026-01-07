"use client";

import { useEffect, useRef, useState } from "react";
import { Modal, ModalContent, Input, Listbox, ListboxItem } from "@heroui/react";
import { useRouter } from "next/navigation";
import { FaSearch, FaUser } from "react-icons/fa";
import Fuse from "fuse.js";

type Command = {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
};

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();
    const lastClickTimeRef = useRef<number>(0);

    const commands: Command[] = [
        {
            id: "admin-login",
            label: "Admin: User login",
            description: "Acessar área administrativa",
            icon: <FaUser />,
            action: () => router.push("/admin/signin"),
        },
        // mais comandos podem ser adicionados aqui
    ];

    // Configuração do Fuse.js
    const fuse = new Fuse(commands, {
        keys: ["label", "description"],
        threshold: 0.4, // menor = mais restritivo
    });

    // Atualiza o filtro usando Fuse.js
    useEffect(() => {
        if (search.trim() === "") {
            setFilteredCommands(commands);
        } else {
            const results = fuse.search(search);
            setFilteredCommands(results.map(res => res.item));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Listener para duplo clique direito
    useEffect(() => {
        function onMouseDown(e: MouseEvent) {
            if (e.button === 2) {
                const now = Date.now();
                if (now - lastClickTimeRef.current < 400) {
                    e.preventDefault();
                    setOpen(true);
                }
                lastClickTimeRef.current = now;
            }
        }

        function onContextMenu(e: MouseEvent) {
            if (open) e.preventDefault();
        }

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") setOpen(false);
        }

        window.addEventListener("mousedown", onMouseDown);
        window.addEventListener("contextmenu", onContextMenu);
        window.addEventListener("keydown", onKeyDown);

        return () => {
            window.removeEventListener("mousedown", onMouseDown);
            window.removeEventListener("contextmenu", onContextMenu);
            window.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    // Focar input ao abrir
    useEffect(() => {
        if (open) {
            setTimeout(() => inputRef.current?.focus(), 0);
            setSearch(""); // limpa search
        }
    }, [open]);

    function handleCommand(cmd: Command) {
        setOpen(false);
        cmd.action();
    }

    return (
        <Modal
            isOpen={open}
            onOpenChange={setOpen}
            placement="center"
            classNames={{
                base: "border-1 border-foreground/30 bg-background/90 backdrop-blur-md",
            }}
            backdrop="opaque"
            hideCloseButton
        >
            <ModalContent>
                <div className="p-4 space-y-3">
                    <Input
                        ref={inputRef}
                        startContent={<FaSearch />}
                        placeholder="Digite um comando..."
                        variant="bordered"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />

                    <Listbox
                        aria-label="Command palette"
                        variant="faded"
                        className="mt-2"
                        disabledKeys={["empty"]}
                        itemClasses={{
                            base: "px-3 gap-3 h-12 data-[hover=true]:bg-primary/50 data-[hover=true]:border-primary/30",
                        }}
                    >
                        {filteredCommands.length > 0 ? (
                            filteredCommands.map(cmd => (
                                <ListboxItem
                                    key={cmd.id}
                                    startContent={cmd.icon}
                                    onClick={() => handleCommand(cmd)}
                                    textValue={cmd.label}
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{cmd.label}</span>
                                        <span className="text-xs text-default-500">{cmd.description}</span>
                                    </div>
                                </ListboxItem>
                            ))
                        ) : (
                            <ListboxItem
                                key="empty"
                                textValue="Nenhum comando encontrado"
                            >
                                <span className="px-3 py-2 text-xs text-default-500 block">
                                    Nenhum comando encontrado
                                </span>
                            </ListboxItem>
                        )}
                    </Listbox>

                </div>
            </ModalContent>
        </Modal>
    );
}
