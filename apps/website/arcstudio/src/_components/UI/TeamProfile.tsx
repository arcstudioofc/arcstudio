import Image from "next/image";

export default function TeamProfile({ name, role, bio, image, banner, github, portfolio }: {
    name: string;
    role: string;
    bio?: string;
    image: string;
    banner?: string;
    github?: string;
    portfolio?: string;

}) {
    return (
        <div className="w-full max-w-sm mx-auto bg-white shadow-md rounded-2xl overflow-hidden">
            {banner && (
                <div className="w-full h-24 relative">
                    <Image
                        src={banner}
                        alt={name + " banner"}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="p-6 flex flex-col items-center text-center gap-4">
                <div className="w-28 h-28 rounded-full overflow-hidden shadow-md -mt-14 border-4 border-white">
                    <Image
                        src={image}
                        alt={name}
                        width={200}
                        height={200}
                        className="object-cover w-full h-full"
                    />
                </div>

                <div>
                    <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
                    <p className="text-sm text-gray-500">{role}</p>
                </div>

                {bio && (
                    <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
                        {bio}
                    </p>
                )}

                <div className="flex gap-3 mt-2">
                    {github && (
                        <a
                            href={github}
                            target="_blank"
                            className="px-4 py-2 rounded-xl shadow bg-gray-900 text-white text-sm hover:opacity-80"
                        >
                            GitHub
                        </a>
                    )}

                    {portfolio && (
                        <a
                            href={portfolio}
                            target="_blank"
                            className="px-4 py-2 rounded-xl shadow bg-blue-600 text-white text-sm hover:opacity-80"
                        >
                            Portfólio
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}
