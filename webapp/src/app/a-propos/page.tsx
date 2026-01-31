import QuoteBlock from '@/components/QuoteBlock';

export const metadata = {
  title: 'Le projet - Vue d\'Ensemble',
  description: 'Découvrez Vue d\'Ensemble, l\'observatoire citoyen des collectivités du Pays Basque Nord - Sud Landes.',
};

export default function AProposPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-8">
            Le projet Vue d&apos;Ensemble
          </h1>

          <QuoteBlock>
            <p className="text-xl text-[var(--violet-dark)] leading-relaxed">
              Comprendre ce qui se passe dans sa commune, c&apos;est redonner du pouvoir d&apos;agir aux citoyens.
            </p>
          </QuoteBlock>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Notre mission
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              Vue d&apos;Ensemble développe un outil inédit permettant d&apos;analyser en continu
              les conseils municipaux des communes du Pays Basque Nord (Iparralde) et Sud-Landes.
            </p>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              L&apos;outil digère des milliers de documents peu accessibles pour le citoyen
              (PDFs de conseils municipaux) et en propose une synthèse lisible, visuelle et opérationnelle.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Pourquoi ?
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              Comprendre ce qui se passe dans sa commune, c&apos;est :
            </p>
            <ul className="list-disc list-inside space-y-2 text-[var(--foreground)] ml-4">
              <li>Redonner du pouvoir d&apos;agir aux citoyens</li>
              <li>Permettre de contribuer aux choix structurants de sa commune</li>
              <li>Mettre en débat ces choix</li>
              <li>Faire porter sa voix</li>
              <li>Agir tant qu&apos;il est encore temps</li>
              <li>Renouer avec sa citoyenneté au quotidien, ses droits et ses devoirs</li>
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Le collectif
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              Vue d&apos;Ensemble est un collectif citoyen basé à Anglet, composé de bénévoles
              engagés pour la transparence de la vie publique locale.
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">
              Nous croyons qu&apos;une démocratie locale vivante passe par l&apos;accès de tous
              aux informations sur les décisions qui façonnent notre territoire.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Périmètre géographique
            </h2>
            <p className="text-[var(--foreground)] leading-relaxed mb-4">
              Notre observatoire couvre la Communauté d&apos;Agglomération Pays Basque (CAPB),
              soit environ 158 communes.
            </p>
            <p className="text-[var(--foreground)] leading-relaxed">
              Nous ajoutons progressivement les communes à notre base de données,
              en priorisant les plus importantes en termes de population.
            </p>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Nos principes
            </h2>
            <div className="grid sm:grid-cols-3 gap-6 mt-6">
              <div className="p-6 bg-white rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Accessibilité</h3>
                <p className="text-sm text-[var(--neutre)]">
                  Pas de compte requis, accès libre à toutes les informations
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Simplicité</h3>
                <p className="text-sm text-[var(--neutre)]">
                  Interface claire, synthèses lisibles
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg border border-[var(--border)]">
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Transparence</h3>
                <p className="text-sm text-[var(--neutre)]">
                  Lien systématique vers les documents sources
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
