import Link from 'next/link';

export const metadata = {
  title: 'Nous rejoindre - Vue d\'Ensemble',
  description: 'Rejoignez le collectif Vue d\'Ensemble et contribuez à la transparence de la vie publique locale.',
};

export default function RejoindrePage() {
  return (
    <div className="section">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-4">
            Nous rejoindre
          </h1>
          <p className="text-lg text-[var(--foreground)] mb-12">
            Vue d&apos;Ensemble est un collectif ouvert. Rejoignez-nous pour contribuer
            à la transparence de la vie publique locale !
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-6">
              Compétences recherchées
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg border border-[var(--border)] p-6">
                <div className="w-10 h-10 bg-[var(--violet)] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Développement</h3>
                <p className="text-sm text-[var(--neutre)]">
                  React, Next.js, Python, traitement de données, IA/ML
                </p>
              </div>

              <div className="bg-white rounded-lg border border-[var(--border)] p-6">
                <div className="w-10 h-10 bg-[var(--vert)] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Design</h3>
                <p className="text-sm text-[var(--neutre)]">
                  UX/UI, design graphique, illustration, cartographie
                </p>
              </div>

              <div className="bg-white rounded-lg border border-[var(--border)] p-6">
                <div className="w-10 h-10 bg-[var(--orange)] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Rédaction</h3>
                <p className="text-sm text-[var(--neutre)]">
                  Communication, rédaction, journalisme, vulgarisation
                </p>
              </div>

              <div className="bg-white rounded-lg border border-[var(--border)] p-6">
                <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Analyse</h3>
                <p className="text-sm text-[var(--neutre)]">
                  Analyse de données, science politique, droit public
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-6">
              Comment ça marche ?
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[var(--creme)] border-2 border-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--violet)] font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--violet-dark)]">Contactez-nous</h3>
                  <p className="text-[var(--foreground)]">
                    Envoyez-nous un message pour vous présenter et indiquer comment vous souhaitez contribuer.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[var(--creme)] border-2 border-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--violet)] font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--violet-dark)]">Échangeons</h3>
                  <p className="text-[var(--foreground)]">
                    Nous organiserons un échange pour mieux nous connaître et identifier les missions qui vous correspondent.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-[var(--creme)] border-2 border-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[var(--violet)] font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--violet-dark)]">Contribuez</h3>
                  <p className="text-[var(--foreground)]">
                    Participez aux réunions, contribuez au code, rédigez des contenus... selon vos disponibilités et envies.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[var(--violet)] rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Prêt à nous rejoindre ?
            </h2>
            <p className="mb-6 opacity-90">
              Contactez-nous pour en savoir plus sur les missions disponibles.
            </p>
            <Link href="/contact" className="btn bg-white text-[var(--violet)] hover:bg-[var(--creme)]">
              Nous contacter
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
