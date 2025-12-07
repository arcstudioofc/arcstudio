import ARC from "@/components/UI/ARC";
import { useTranslations } from 'next-intl';

export default function AboutPage() {
    const t = useTranslations('About');
    
    return (
        <div className="min-h-screen flex justify-center items-start p-12">
            <div className="max-w-5xl w-full">
                <div className="flex flex-col items-center mb-12 text-center">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-5xl font-extrabold">{t('title')}</h1>
                        <ARC />
                    </div>
                    <p className="mt-4 text-lg max-w-2xl">
                        {t.rich('headline', {
                            arc_studio: (children) => <strong>{children}</strong>,
                        })}
                    </p>
                </div>

                <div className="space-y-6 mb-12 text-lg">
                    <p>
                        {t.rich('intro_paragraph_1', {
                            '**ARC Studio**': (children) => <strong>{children}</strong>,
                        })}
                    </p>

                    <p>
                        {t('intro_paragraph_2')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold mb-3 text-indigo-600">{t('mission_title')}</h2>
                        <p>{t('mission_content')}</p>
                    </div>
                    <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold mb-3 text-green-600">{t('vision_title')}</h2>
                        <p>{t('vision_content')}</p>
                    </div>
                    <div className="p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h2 className="text-2xl font-bold mb-3 text-pink-600">{t('values_title')}</h2>
                        <p>{t('values_content')}</p>
                    </div>
                </div>

                <div className="text-center text-lg">
                    <p>
                        {t('conclusion')}
                    </p>
                </div>
            </div>
        </div>
    );
}