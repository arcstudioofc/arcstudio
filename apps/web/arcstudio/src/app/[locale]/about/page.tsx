import ARC from "@/components/UI/ARC";

export default function AboutPage() {
    return (
        <div className="min-h-screen flex justify-center items-start p-12">
            <div className="max-w-5xl w-full">
                {/* Header */}
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-5xl font-extrabold">Sobre a</h1>
                        <ARC />
                    </div>
                    <p className="mt-4 text-lg max-w-2xl">
                        Transformamos ideias em experiências digitais memoráveis. Na <strong>ARC Studio</strong>, criamos soluções que inspiram, engajam e conectam marcas com pessoas de forma única.
                    </p>
                </div>

                {/* Introdução */}
                <div className="space-y-6 mb-12 text-lg">
                    <p>
                        Fundada com o objetivo de redefinir padrões no mercado de design e tecnologia, a <strong>ARC Studio</strong> combina criatividade, inovação e estratégia para entregar projetos que impressionam e fazem diferença. Nosso time de especialistas une talento artístico e domínio tecnológico para criar experiências digitais de alto impacto.
                    </p>

                    <p>
                        Cada projeto é abordado com atenção aos detalhes, compreensão profunda do propósito do cliente e uma visão clara de como comunicar sua mensagem de forma poderosa. Estamos sempre à frente das tendências, garantindo resultados únicos e relevantes.
                    </p>
                </div>

                {/* Missão, Visão, Valores */}
                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold mb-3 text-indigo-600">Missão</h2>
                        <p>Transformar ideias em experiências inesquecíveis, conectando marcas e pessoas de forma significativa.</p>
                    </div>
                    <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold mb-3 text-green-600">Visão</h2>
                        <p>Ser referência em criatividade e tecnologia, reconhecida pela excelência e inovação de cada projeto.</p>
                    </div>
                    <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold mb-3 text-pink-600">Valores</h2>
                        <p>Criatividade, inovação, colaboração, excelência e compromisso com resultados impactantes.</p>
                    </div>
                </div>

                {/* Fechamento */}
                <div className="text-center text-lg">
                    <p>
                        Na ARC Studio, cada projeto é mais que trabalho: é uma oportunidade de criar algo memorável e deixar um legado digital. Estamos prontos para transformar sua visão em realidade, com excelência e inovação em cada detalhe.
                    </p>
                </div>
            </div>
        </div>
    );
}
