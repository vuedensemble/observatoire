import Link from 'next/link';

export const metadata = {
  title: 'Soutenir le projet - Vue d\'Ensemble',
  description: 'Soutenez Vue d\'Ensemble, l\'observatoire citoyen du Pays Basque. Faites un don ou devenez bénévole.',
};

export default function SoutenirPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--violet)] mb-4">
            Soutenir le projet
          </h1>
          <p className="text-lg text-[var(--foreground)] mb-12">
            Vue d&apos;Ensemble est un projet citoyen porté par des bénévoles.
            Votre soutien nous permet de développer et maintenir cet outil.
          </p>

          {/* Don section */}
          <section className="bg-white rounded-lg border border-[var(--border)] p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--violet)] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-2">
                  Faire un don
                </h2>
                <p className="text-[var(--foreground)] mb-4">
                  Vos dons nous permettent de financer l&apos;hébergement, les outils techniques
                  et le développement de nouvelles fonctionnalités.
                </p>
                <a
                  href="https://www.helloasso.com/associations/association-vue-d-ensemble"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary inline-flex"
                >
                  Faire un don sur HelloAsso
                </a>
              </div>
            </div>
          </section>

          {/* Bénévolat section */}
          <section className="bg-white rounded-lg border border-[var(--border)] p-8 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--vert)] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-2">
                  Devenir bénévole
                </h2>
                <p className="text-[var(--foreground)] mb-4">
                  Vous souhaitez contribuer au projet ? Nous recherchons des bénévoles
                  pour différentes missions.
                </p>
                <Link href="/rejoindre" className="btn btn-secondary inline-flex">
                  En savoir plus
                </Link>
              </div>
            </div>
          </section>

          {/* Partage section */}
          <section className="bg-white rounded-lg border border-[var(--border)] p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[var(--orange)] rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-[var(--violet-dark)] mb-2">
                  Parler de nous
                </h2>
                <p className="text-[var(--foreground)] mb-4">
                  Le bouche-à-oreille est précieux ! Partagez Vue d&apos;Ensemble
                  autour de vous, sur les réseaux sociaux, dans votre quartier.
                </p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="text-[var(--violet)] hover:text-[var(--violet-dark)]"
                    aria-label="Partager sur Twitter"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-[var(--violet)] hover:text-[var(--violet-dark)]"
                    aria-label="Partager sur Facebook"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="text-[var(--violet)] hover:text-[var(--violet-dark)]"
                    aria-label="Partager sur LinkedIn"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
