export const metadata = {
  title: 'La méthodologie - Vue d\'Ensemble',
  description: 'Comment Vue d\'Ensemble collecte, analyse et présente les données des conseils municipaux.',
};

export default function MethodologiePage() {
  return (
    <div className="section">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-8">
            Notre méthodologie
          </h1>

          <p className="text-lg text-[var(--foreground)] leading-relaxed mb-12">
            Vue d&apos;Ensemble utilise des technologies modernes pour collecter, analyser
            et présenter les informations des conseils municipaux de manière accessible.
          </p>

          <section className="mb-12">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-2">
                  Collecte des données
                </h2>
                <p className="text-[var(--foreground)] leading-relaxed">
                  Nous récupérons les comptes-rendus des conseils municipaux depuis les sites
                  officiels des communes. Ces documents sont généralement disponibles au format PDF.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-2">
                  Extraction du texte
                </h2>
                <p className="text-[var(--foreground)] leading-relaxed">
                  Les PDFs sont traités par des outils de reconnaissance optique de caractères (OCR)
                  pour en extraire le texte. Cette étape permet de rendre le contenu analysable.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-2">
                  Analyse par intelligence artificielle
                </h2>
                <p className="text-[var(--foreground)] leading-relaxed mb-4">
                  Nous utilisons des modèles de langage (LLM) pour analyser le contenu
                  des délibérations et en extraire les informations clés :
                </p>
                <ul className="list-disc list-inside space-y-2 text-[var(--foreground)] ml-4">
                  <li>Identification des projets et thématiques</li>
                  <li>Extraction des montants et décisions</li>
                  <li>Résumé des délibérations</li>
                  <li>Classification par thématique</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-2">
                  Vérification et publication
                </h2>
                <p className="text-[var(--foreground)] leading-relaxed">
                  Les informations extraites sont vérifiées avant publication.
                  Un lien vers le document source est toujours fourni pour permettre
                  à chacun de consulter l&apos;original.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-lg border border-[var(--border)] p-6 mt-12">
            <h2 className="text-xl font-bold text-[var(--violet)] mb-4">
              Limites et précautions
            </h2>
            <ul className="space-y-3 text-[var(--foreground)]">
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[var(--orange)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>L&apos;extraction automatique peut contenir des erreurs. Consultez toujours le document source en cas de doute.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[var(--orange)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Les résumés générés par IA sont des synthèses, pas des citations exactes.</span>
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-5 h-5 text-[var(--orange)] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Notre base de données n&apos;est pas exhaustive et est mise à jour progressivement.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
