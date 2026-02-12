export const metadata = {
  title: 'Mentions légales - Vue d\'Ensemble',
  description: 'Mentions légales du site Observatoire des collectivités de Vue d\'Ensemble.',
};

export default function MentionsLegalesPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-12">
            Mentions légales
          </h1>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Éditeur du site
            </h2>
            <p className="text-black text-sm leading-relaxed">
              Le site <strong>Observatoire des collectivités</strong> est édité par
              l&apos;association loi 1901 <strong>Vue d&apos;Ensemble</strong>.
            </p>
            <ul className="mt-4 space-y-2 text-black text-sm">
              <li><strong>Siège social :</strong> Pays basque nord - Sud Landes</li>
              <li><strong>Adresse e-mail :</strong>{' '}
                <a href="mailto:contact@vuedensemble.fr" className="text-[var(--violet)]">
                  contact@vuedensemble.fr
                </a>
              </li>
              <li><strong>Site internet :</strong>{' '}
                <a href="https://www.vuedensemble.fr" target="_blank" rel="noopener noreferrer" className="text-[var(--violet)]">
                  www.vuedensemble.fr
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Directrice de la publication
            </h2>
            <p className="text-black text-sm leading-relaxed">
              <strong>Lalie Ory</strong>, en qualité de représentante de l&apos;association Vue d&apos;Ensemble.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Hébergement
            </h2>
            <p className="text-black text-sm leading-relaxed">
              Le site est hébergé par :
            </p>
            <ul className="mt-4 space-y-2 text-black text-sm">
              <li><strong>Infomaniak Network SA</strong></li>
              <li>Rue Eugène-Marziano 25, 1227 Les Acacias, Genève, Suisse</li>
              <li><strong>Site :</strong>{' '}
                <a href="https://www.infomaniak.com" target="_blank" rel="noopener noreferrer" className="text-[var(--violet)]">
                  www.infomaniak.com
                </a>
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Propriété intellectuelle
            </h2>
            <p className="text-black text-sm leading-relaxed">
              L&apos;ensemble du contenu de ce site (textes, images, graphismes, logo, icônes, etc.)
              est la propriété exclusive de l&apos;association Vue d&apos;Ensemble, sauf mention contraire.
              Toute reproduction, représentation, modification, publication ou adaptation de tout ou
              partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite
              sans autorisation écrite préalable de l&apos;association.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Données personnelles
            </h2>
            <p className="text-black text-sm leading-relaxed">
              Ce site ne collecte aucune donnée personnelle de ses utilisateurs.
              Aucun cookie de traçage ou publicitaire n&apos;est utilisé.
            </p>
            <p className="text-black text-sm leading-relaxed mt-4">
              Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification
              et de suppression de vos données. Pour exercer ces droits, vous pouvez nous contacter
              à l&apos;adresse :{' '}
              <a href="mailto:contact@vuedensemble.fr" className="text-[var(--violet)]">
                contact@vuedensemble.fr
              </a>.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Responsabilité
            </h2>
            <p className="text-black text-sm leading-relaxed">
              Les informations publiées sur ce site sont fournies à titre informatif.
              L&apos;association Vue d&apos;Ensemble s&apos;efforce d&apos;assurer l&apos;exactitude
              des informations diffusées, notamment en s&apos;appuyant sur les documents publics
              des conseils municipaux. Toutefois, elle ne saurait être tenue responsable des erreurs,
              omissions ou des résultats qui pourraient être obtenus par un mauvais usage de ces informations.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Liens hypertextes
            </h2>
            <p className="text-black text-sm leading-relaxed">
              Le site peut contenir des liens vers d&apos;autres sites internet.
              L&apos;association Vue d&apos;Ensemble ne dispose d&apos;aucun contrôle sur le contenu
              de ces sites tiers et décline toute responsabilité quant à leur contenu.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[var(--violet)] mb-4">
              Crédits
            </h2>
            <p className="text-black text-sm leading-relaxed">
              Conception et développement : association Vue d&apos;Ensemble.
            </p>
          </section>

          <p className="text-sm text-[var(--neutre)] mt-12">
            Dernière mise à jour : février 2025
          </p>
        </div>
      </div>
    </div>
  );
}
