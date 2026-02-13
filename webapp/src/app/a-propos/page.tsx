import QuoteBlock from '@/components/QuoteBlock';

export const metadata = {
  title: 'Le projet - Vue d\'Ensemble',
  description: 'Découvrez pourquoi Vue d\'Ensemble a créé un observatoire citoyen des collectivités au Pays Basque Nord et Sud Landes.',
};

export default function AProposPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="max-w-3xl mx-auto">

          {/* En-tête */}
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-6 text-center">
            Le projet
          </h1>
          <p className="text-lg text-black leading-relaxed text-center mb-12">
            Pourquoi nous avons créé cet outil et ce que nous prévoyons pour la suite.
          </p>

          {/* Section 1 — Le constat */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-[var(--violet-dark)] mb-4">
              Le constat
            </h2>
            <p className="text-lg text-black leading-relaxed mb-4">
              Chaque mois, les conseils municipaux des communes du Pays Basque Nord et Sud Landes prennent des décisions
              qui impactent directement la vie quotidienne des habitants : urbanisme, budget, environnement, transports,
              culture, social...
            </p>
            <p className="text-lg text-black leading-relaxed mb-4">
              Pourtant, ces décisions restent largement invisibles. Les comptes-rendus sont publiés sous forme de PDFs
              souvent longs et techniques, enfouis dans les sites internet des mairies. Très peu de citoyens y ont accès,
              encore moins les lisent.
            </p>
            <QuoteBlock>
              <p className="text-lg text-black leading-relaxed font-bold">
                Résultat : un fossé grandissant entre élus et citoyens, malgré les tentatives de démocratie
                participative à l&apos;échelle locale. Ainsi qu&apos;un sentiment de frustration, d&apos;absence d&apos;écoute
                et de résignation.
              </p>
            </QuoteBlock>
          </section>

          {/* Section 2 — Pourquoi cet outil */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-[var(--violet-dark)] mb-4">
              Pourquoi cet outil
            </h2>
            <p className="text-lg text-black leading-relaxed mb-4">
              Pour agir il faut comprendre. Et pour comprendre il faut avoir un accès juste et transparent
              à l&apos;information. Nous pensons que la transparence de la vie publique locale est un pilier
              essentiel de la résilience d&apos;un territoire. Les enjeux écologiques, sociaux et démocratiques
              sont intrinsèquement liés.
            </p>
            <p className="text-lg text-black leading-relaxed mb-4">
              Le manque d&apos;accès à l&apos;information n&apos;est pas une fatalité, c&apos;est un problème de design.
            </p>
            <p className="text-lg text-black leading-relaxed mb-4">
              Les informations existent, elles sont publiques. Mais elles sont éparpillées, difficiles à trouver,
              complexes à lire. Il manquait un outil pour les rendre accessibles, lisibles et utiles à tous.
            </p>
            <p className="text-lg text-black leading-relaxed">
              C&apos;est exactement ce que fait l&apos;Observatoire des collectivités.
            </p>
          </section>

          {/* Section 3 — Ce que nous faisons */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-[var(--violet-dark)] mb-4">
              Ce que nous faisons
            </h2>
            <p className="text-lg text-black leading-relaxed mb-6">
              L&apos;association Vue d&apos;Ensemble a développé un outil qui collecte, analyse et synthétise
              automatiquement les comptes-rendus des conseils municipaux. Concrètement :
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="w-2 h-2 bg-[var(--vert)] rounded-full flex-shrink-0 mt-2.5" />
                <p className="text-lg text-black leading-relaxed">
                  Nous récupérons les documents officiels publiés par les communes
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-2 h-2 bg-[var(--vert)] rounded-full flex-shrink-0 mt-2.5" />
                <p className="text-lg text-black leading-relaxed">
                  Nous en extrayons le contenu grâce à des technologies de reconnaissance de texte (OCR)
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-2 h-2 bg-[var(--vert)] rounded-full flex-shrink-0 mt-2.5" />
                <p className="text-lg text-black leading-relaxed">
                  Nous analysons les délibérations par intelligence artificielle pour en tirer les projets, montants,
                  votes et thématiques
                </p>
              </div>
              <div className="flex items-start gap-4">
                <span className="w-2 h-2 bg-[var(--vert)] rounded-full flex-shrink-0 mt-2.5" />
                <p className="text-lg text-black leading-relaxed">
                  Nous publions le tout sous forme de fiches lisibles, avec un lien systématique vers le document source
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 — Notre plan */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-[var(--violet-dark)] mb-4">
              Notre plan
            </h2>
            <p className="text-lg text-black leading-relaxed mb-6">
              L&apos;observatoire est un projet en évolution permanente. Voici les grandes étapes de notre feuille de route :
            </p>
            <div className="space-y-6">
              {/* Étape 1 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[var(--vert)] rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--violet-dark)]">Phase 1 — Prototype</h3>
                  <p className="text-lg text-black leading-relaxed">
                    Collecte et analyse automatisée des conseils municipaux sur un premier échantillon de communes.
                    Développement de la plateforme web.
                  </p>
                </div>
              </div>
              {/* Étape 2 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--violet-dark)]">Phase 2 — Déploiement</h3>
                  <p className="text-lg text-black leading-relaxed">
                    Extension à l&apos;ensemble des communes du Pays Basque Nord et Sud Landes.
                    Amélioration de la qualité d&apos;analyse et de la navigation.
                  </p>
                </div>
              </div>
              {/* Étape 3 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--violet-dark)]">Phase 3 — Fonctionnalités citoyennes</h3>
                  <p className="text-lg text-black leading-relaxed">
                    Alertes personnalisées par commune et thématique. Suivi de projets dans le temps.
                    Outils de comparaison entre communes.
                  </p>
                </div>
              </div>
              {/* Étape 4 */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[var(--violet-dark)]">Phase 4 — Essaimage</h3>
                  <p className="text-lg text-black leading-relaxed">
                    Ouverture du modèle à d&apos;autres territoires. Partage de notre méthodologie et de nos outils
                    en open source pour permettre à d&apos;autres collectifs de répliquer la démarche.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 — Nos principes */}
          <section className="mb-14">
            <h2 className="text-2xl font-bold text-[var(--violet-dark)] mb-6">
              Nos principes
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg text-center">
                <div className="w-12 h-12 bg-[var(--violet)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[var(--violet-dark)] mb-2">Accessibilité</h3>
                <p className="text-lg text-black">
                  Pas de compte requis, accès libre à toutes les informations
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg text-center">
                <div className="w-12 h-12 bg-[var(--vert)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[var(--violet-dark)] mb-2">Simplicité</h3>
                <p className="text-lg text-black">
                  Interface claire, synthèses lisibles et compréhensibles par tous
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg text-center">
                <div className="w-12 h-12 bg-[var(--orange)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-[var(--violet-dark)] mb-2">Transparence</h3>
                <p className="text-lg text-black">
                  Lien systématique vers les documents sources originaux
                </p>
              </div>
            </div>
          </section>

          {/* Citation de fermeture */}
          <section>
            <QuoteBlock>
              <p className="text-lg text-black leading-relaxed">
                Comprendre ce qu&apos;il se passe dans sa commune, c&apos;est <strong>retrouver du pouvoir d&apos;agir</strong>.
                C&apos;est redonner la possibilité aux citoyen.nes de contribuer aux choix structurants
                de leur commune, de mettre en débat ces choix, de faire porter sa voix
                et d&apos;agir tant qu&apos;il est encore temps.
              </p>
              <p className="text-lg text-black leading-relaxed mt-4 font-bold">
                C&apos;est renouer avec sa citoyenneté au quotidien, ses droits et ses devoirs.
              </p>
            </QuoteBlock>
          </section>

        </div>
      </div>
    </div>
  );
}
