import Image from "next/image";
// import { useTranslations } from "next-intl";

import { ChangelogEntry } from "@/_components/IconTimelineItem";
import ARC from "@/components/UI/ARC";

export const changelog: ChangelogEntry = {
  title: "v3.0.0 - Reboot (Nova era!)",
  date: "31/12/2025",
  type: "Performance",
  children: <Changelog />,
};

function Changelog() {
  // const t = useTranslations("data.changelog.3_0_0");

  return (
    <div>
      <h1 className="text-2xl font-semibold flex gap-2">
        Foi feito uma alteração geral em nosso sistema <ARC />
      </h1>
      <p className="mt-4 text-justify">
        Olá, comunidade ARC Studio! Estamos entusiasmados em anunciar o lançamento da versão 3.0.0 do ARC Studio, uma atualização significativa que traz uma série de melhorias e novos recursos para aprimorar sua experiência de criação de conteúdo.
      </p>
      <p className="mt-4 text-justify">
        Nesta versão, focamos em otimizar o desempenho geral do aplicativo, tornando-o mais rápido e responsivo. Além disso, introduzimos uma interface de usuário redesenhada, proporcionando uma navegação mais intuitiva e agradável.
      </p>
      <p className="mt-4 text-justify">
        Entre os novos recursos, destacamos a integração com plataformas populares de streaming, permitindo que você transmita seu conteúdo diretamente do ARC Studio com facilidade. Também adicionamos novas ferramentas de edição de vídeo e áudio, oferecendo mais opções criativas para seus projetos.
      </p>
      <p className="mt-4 text-justify">
        Agradecemos a todos os nossos usuários pelo feedback contínuo, que tem sido fundamental para o desenvolvimento desta atualização. Estamos comprometidos em continuar aprimorando o ARC Studio e esperamos que vocês aproveitem todas as novidades da versão 3.0.0.
      </p>
      <Image
        src="/images/arc_banner.png"
        alt="ARC Studio Reboot"
        width={900}
        height={500}
        className="mt-6 rounded-lg shadow-lg"
      />
    </div>
  );
}
