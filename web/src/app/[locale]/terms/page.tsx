import { useTranslations } from 'next-intl';

export default function Terms() {
  const t = useTranslations('Terms'); 

  return (
    <div className="max-w-6xl mx-auto py-20 px-6 sm:px-8 lg:px-12">
      
      {/* Título Principal */}
      <header className="text-center mb-16">
        <h1 className="text-5xl font-extrabold leading-tight">
          {t('title')}
        </h1>
        <p className="mt-3 text-xl">
          {t('subtitle')}
        </p>
      </header>

      {/* Mapeamento dos Termos */}
      <div className="space-y-12 text-justify leading-relaxed">
        
        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.1.title')}</h2>
          <p>
            {t('sections.1.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.2.title')}</h2>
          <p>
            <strong>{t.rich('sections.2.content.services', { strong: (children) => <strong>{children}</strong> })}</strong>
            <br/>
            <strong>{t.rich('sections.2.content.user', { strong: (children) => <strong>{children}</strong> })}</strong>
            <br/>
            <strong>{t.rich('sections.2.content.content', { strong: (children) => <strong>{children}</strong> })}</strong>
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.3.title')}</h2>
          <p>
            {t('sections.3.content')}
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.4.title')}</h2>
          <p>
            {t('sections.4.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.5.title')}</h2>
          <p>
            {t('sections.5.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.6.title')}</h2>
          <p>
            {t('sections.6.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.7.title')}</h2>
          <p>
            {t('sections.7.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.8.title')}</h2>
          <p>
            {t('sections.8.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.9.title')}</h2>
          <p>
            {t('sections.9.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.10.title')}</h2>
          <p>
            {t('sections.10.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.11.title')}</h2>
          <p>
            {t('sections.11.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.12.title')}</h2>
          <p>
            {t('sections.12.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.13.title')}</h2>
          <p>
            {t('sections.13.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.14.title')}</h2>
          <p>
            {t('sections.14.content')}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">{t('sections.15.title')}</h2>
          <p>
            {t('sections.15.content')}
          </p>
        </section>

      </div>

      <footer className="mt-20 text-center text-sm text-gray-400">
        <p>
          {t('last_updated')}
        </p>
      </footer>
    </div>
  );
}