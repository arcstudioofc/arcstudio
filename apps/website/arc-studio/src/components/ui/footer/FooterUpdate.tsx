import fs from "fs";

interface FooterUpdateProps {
  filePath?: string; // opcional, se quiser sobrescrever
}

export default function FooterUpdate({ filePath }: FooterUpdateProps) {
  // se não passar, pega automaticamente o page.tsx atual (stack trace trick)
  const file = filePath || __filename;

  let lastUpdate = "Desconhecida";

  try {
    const stats = fs.statSync(file);
    const date = new Date(stats.mtime);

    const day = date.getDate().toString().padStart(2, "0");
    const month = date.toLocaleString("pt-BR", { month: "long" });
    const year = date.getFullYear();
    const hour = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = date.getHours() >= 12 ? "PM" : "AM";

    lastUpdate = `${day} ${month} ${year} — ${hour}:${minutes} ${ampm}`;
  } catch (err) {
    console.error("Erro ao pegar data do arquivo:", err);
  }

  return (
    <footer className="select-none text-end text-[#7e879ed5] text-sm relative mt-6">
      <span className="group cursor-pointer">
        Última alteração
        <span className="absolute bottom-full right-0 mb-2 w-max max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300
          bg-[#0f1622c2] backdrop-blur-sm text-[#798397c2] text-xs px-3 py-1 rounded shadow-lg whitespace-nowrap z-10">
          {lastUpdate}
        </span>
      </span>
    </footer>
  );
}
