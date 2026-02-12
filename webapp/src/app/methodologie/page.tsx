export const metadata = {
  title: 'La méthodologie - Vue d\'Ensemble',
  description: 'Comment Vue d\'Ensemble collecte, analyse et présente les données des conseils municipaux.',
};

const steps = [
  {
    number: 1,
    title: 'Collecte des données',
    description:
      'Nous récupérons les comptes-rendus des conseils municipaux depuis les sites officiels des communes. Ces documents sont généralement disponibles au format PDF.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Extraction du texte',
    description:
      'Les PDFs sont traités par des outils de reconnaissance optique de caractères (OCR) pour en extraire le texte. Cette étape permet de rendre le contenu analysable.',
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'Analyse par intelligence artificielle',
    description:
      'Nous utilisons des modèles de langage (LLM) pour analyser le contenu des délibérations et en extraire les informations clés :',
    details: [
      'Identification des projets et thématiques',
      'Extraction des montants et décisions',
      'Résumé des délibérations',
      'Classification par thématique',
    ],
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'Vérification et publication',
    description:
      "Les informations extraites sont vérifiées avant publication. Un lien vers le document source est toujours fourni pour permettre à chacun de consulter l'original.",
    icon: (
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const warnings = [
  "L'extraction automatique peut contenir des erreurs. Consultez toujours le document source en cas de doute.",
  'Les résumés générés par IA sont des synthèses, pas des citations exactes.',
  "Notre base de données n'est pas exhaustive et est mise à jour progressivement.",
];

export default function MethodologiePage() {
  return (
    <div className="section">
      <div className="container">
        {/* En-tête centré */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-4">
            Notre méthodologie
          </h1>
          <p className="text-lg text-black leading-relaxed">
            Vue d&apos;Ensemble utilise des technologies modernes pour collecter, analyser
            et présenter les informations des conseils municipaux de manière accessible.
          </p>
        </div>

        {/* Timeline verticale */}
        <div className="max-w-2xl mx-auto relative">
          {/* Ligne ondulée verticale */}
          <div
            className="absolute left-6 top-0 bottom-0 w-[14px] -translate-x-1/2"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='60' viewBox='0 0 14 60'%3E%3Cpath d='M7 0 C13 10, 1 20, 7 30 C13 40, 1 50, 7 60' stroke='%2327B782' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat-y',
              backgroundSize: '14px 60px',
            }}
          />

          {steps.map((step, index) => (
            <div key={step.number} className={`relative flex items-start gap-6 ${index < steps.length - 1 ? 'pb-12' : ''}`}>
              {/* Pastille numérotée */}
              <div className="relative z-10 w-12 h-12 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                {step.icon}
              </div>

              {/* Contenu */}
              <div className="bg-white rounded-lg border border-[var(--border)] p-6 flex-1 shadow-sm">
                <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-2">
                  {step.title}
                </h2>
                <p className="text-lg text-black leading-relaxed">
                  {step.description}
                </p>
                {step.details && (
                  <ul className="mt-3 space-y-1.5">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2 text-lg text-black">
                        <span className="w-1.5 h-1.5 bg-[var(--vert)] rounded-full flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Section Limites */}
        <div className="max-w-2xl mx-auto mt-16">
          <div className="bg-[#FFF8F0] rounded-lg border border-[var(--orange)]/20 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[var(--orange)] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--violet-dark)]">
                Limites et précautions
              </h2>
            </div>
            <ul className="space-y-3">
              {warnings.map((warning) => (
                <li key={warning} className="flex items-start gap-3 text-lg text-black">
                  <span className="text-[var(--orange)] mt-1.5 flex-shrink-0">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
