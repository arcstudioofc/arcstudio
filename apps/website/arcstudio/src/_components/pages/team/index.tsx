// Modelo JSON esperado:
// {
//   "name": "Israel Jatobá",
//   "role": "Fullstack Developer",
//   "bio": "Apaixonado por tecnologia e criação de sistemas.",
//   "image": "/team/israel.jpg",
//   "banner": "/banners/dev-banner.jpg",
//   "github": "https://github.com/...",
//   "portfolio": "https://meusite.com"
// }

import TeamProfile from "@/_components/UI/TeamProfile";

// Exemplo de uso na página Team
export const teams = [
  {
    name: "Israel Jatobá",
    role: "Fullstack Developer",
    bio: "Apaixonado por tecnologia e criação de sistemas.",
    image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e", // foto real
    banner: "", // sem banner
    github: "https://github.com/israeljatoba",
    portfolio: "https://meusite.com"
  },
  {
    name: "Membro 2",
    role: "UI/UX Designer",
    bio: "Cria interfaces bonitas e funcionais.",
    image: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39", // foto real
    banner: "https://images.unsplash.com/photo-1503264116251-35a269479413", // banner real
    github: "https://github.com/member2",
    portfolio: "https://portfolio.com"
  }
];

export default function Team() {
  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-10 text-center">Team Page</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {teams.map((member, index) => (
          <TeamProfile key={index} {...member} />
        ))}
      </div>
    </div>
  );
}
