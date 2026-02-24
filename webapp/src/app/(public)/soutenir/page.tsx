import Link from 'next/link';

export const metadata = {
  title: 'Soutenir le projet - Vue d\'Ensemble',
  description: 'Soutenez Vue d\'Ensemble, l\'observatoire citoyen du Pays Basque. Faites un don ou devenez bénévole.',
};

export default function SoutenirPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-4 text-center">
            Soutenir le projet
          </h1>
          <p className="text-lg text-black mb-16 text-center max-w-2xl mx-auto">
            Vue d&apos;Ensemble est un projet citoyen porté par des bénévoles.
            Votre soutien nous permet de développer et maintenir cet outil.
          </p>

          {/* 3 colonnes avec flèches */}
          <div className="flex flex-col lg:flex-row items-stretch gap-0">

            {/* Colonne 1 - Faire un don */}
            <div className="flex-1 flex flex-col items-center text-center px-6 py-8">
              <div className="w-14 h-14 bg-[var(--violet)] rounded-full flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-3 uppercase tracking-wide">
                Faire un don
              </h2>
              <p className="text-lg text-black mb-6 leading-relaxed">
                Vos dons nous permettent de financer l&apos;hébergement, les outils techniques
                et le développement de nouvelles fonctionnalités.
              </p>
              <div className="mt-auto">
                <a
                  href="https://www.helloasso.com/associations/association-vue-d-ensemble"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex text-lg"
                >
                  Je fais un don
                </a>
              </div>
            </div>

            {/* Trait ondulé vertical 1 → 2 */}
            <div className="flex items-center justify-center py-4 lg:py-0 lg:px-2">
              <svg width="14" height="60" viewBox="0 0 14 60" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 0 C13 10, 1 20, 7 30 C13 40, 1 50, 7 60" stroke="#27B782" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            {/* Colonne 2 - Devenir bénévole */}
            <div className="flex-1 flex flex-col items-center text-center px-6 py-8">
              <div className="w-14 h-14 bg-[var(--vert)] rounded-full flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-3 uppercase tracking-wide">
                Devenir bénévole
              </h2>
              <p className="text-lg text-black mb-6 leading-relaxed">
                Vous souhaitez contribuer au projet ? Nous recherchons des bénévoles
                pour différentes missions.
              </p>
              <div className="mt-auto">
                <a
                  href="https://www.vuedensemble.fr#nousrejoindre"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary inline-flex text-lg"
                >
                  Je m&apos;engage
                </a>
              </div>
            </div>

            {/* Trait ondulé vertical 2 → 3 */}
            <div className="flex items-center justify-center py-4 lg:py-0 lg:px-2">
              <svg width="14" height="60" viewBox="0 0 14 60" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 0 C13 10, 1 20, 7 30 C13 40, 1 50, 7 60" stroke="#27B782" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            </div>

            {/* Colonne 3 - Parler de nous */}
            <div className="flex-1 flex flex-col items-center text-center px-6 py-8">
              <div className="w-14 h-14 bg-[var(--orange)] rounded-full flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-3 uppercase tracking-wide">
                Parler de nous
              </h2>
              <p className="text-lg text-black mb-6 leading-relaxed">
                Le bouche-à-oreille est précieux ! Partagez l&apos;outil autour de vous,
                parlez de notre association, relayez nos communications sur les réseaux sociaux.
              </p>
              <div className="mt-auto flex gap-4">
                <a
                  href="https://www.instagram.com/vuedensemble_territoires/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--violet)' }}
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61551135269071"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--violet)' }}
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/company/vuedensemble-territoires/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-70 transition-opacity"
                  style={{ color: 'var(--violet)' }}
                  aria-label="LinkedIn"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
