import Link from "next/link"
import { FiGlobe } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";

import { settings } from "@/lib";
import { useTranslations } from "next-intl";

type ProjectType = typeof settings.projects[number];

interface OfficialProjectCardProps {
    project: ProjectType;
}

const OfficialProjectCard = ({ project }: OfficialProjectCardProps) => {
    const t = useTranslations("OfficialProjects.OfficialProjectsCard");

    const { name, authors, infos } = project;
    const { banner } = infos.images;
    const { website, github } = infos.links;

    return (
        <div
            className="shadow-lg rounded-xl overflow-hidden"
        >
            <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${banner})` }} />

            <div className="p-6">
                <h3 className="text-2xl font-bold mb-2 capitalize">{name}</h3>

                <p className="text-sm mb-4">
                    {t("author")}: {authors.join(', ')}
                </p>

                <div className="flex space-x-4">
                    {website && (
                        <Link
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 hover:text-primary font-medium transition duration-150 group"
                            title="Acessar Website" 
                        >
                            <FiGlobe className="h-5 w-5" />
                        </Link>
                    )}
                    {github && (
                        <Link
                            href={github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 hover:text-primary font-medium transition duration-150 group"
                            title="Acessar GitHub"
                        >
                            <FaGithub className="h-5 w-5" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function OfficialProjectsPage() {
    const projects = settings.projects;

    return (
        <div className="min-h-screen max-w-6xl mx-auto py-20 px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {projects.map((projectItem) => (
                    <OfficialProjectCard
                        key={projectItem.key}
                        project={projectItem}
                    />
                ))}
            </div>
        </div>
    )
}