import Link from 'next/link';
import Image from 'next/image';
import SearchInput from '@/components/SearchInput';
import QuoteBlock from '@/components/QuoteBlock';
import { getAllCommunes, countProjets, countDeliberations } from '@/lib/db';

export default async function Home() {
  const communes = await getAllCommunes();
  const totalProjets = await countProjets();
  const totalDelibs = await countDeliberations();

  return (
    <div className="bg-[var(--creme)]">
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[var(--violet)] text-sm uppercase tracking-wider mb-4">
                Pays Basque Nord - Sud Landes
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold text-[var(--violet)] mb-6 leading-tight">
                Que se passe-t-il dans ta commune ?
              </h1>
              <p className="text-lg mb-8" style={{ color: '#5528FF' }}>
                Découvre les projets, les délibérations et les décisions qui façonnent ton territoire.
              </p>

              {/* Search */}
              <SearchInput className="max-w-lg" />
            </div>

            {/* Illustration */}
            <div className="hidden lg:block">
              <Image
                src="/illustration-pays-basque.png"
                alt="Carte du Pays Basque Nord et Sud Landes"
                width={500}
                height={400}
                className="w-full h-auto max-h-[400px] object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Illustration */}
      <section className="lg:hidden py-8">
        <div className="container">
          <Image
            src="/illustration-pays-basque.png"
            alt="Carte du Pays Basque Nord et Sud Landes"
            width={400}
            height={320}
            className="w-full h-auto max-h-[300px] object-contain"
          />
        </div>
      </section>

      {/* Presentation Section */}
      <section className="section">
        <div className="container">
          <div className="bg-[#DCD3FF] rounded-lg p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            <QuoteBlock>
              <p className="text-lg text-black leading-relaxed">
                <strong>L&apos;association Vue d&apos;Ensemble</strong> a développé un outil inédit permettant d&apos;analyser en continu
                les conseils municipaux des communes au Pays basque nord et Sud Landes.
                Notre outil digère des milliers de documents peu accessibles pour le citoyen
                et en propose une synthèse lisible et opérationnelle pour tous.tes.
              </p>
              <p className="text-lg text-black leading-relaxed mt-4">
                Car comprendre ce qu&apos;il se passe dans sa commune, c&apos;est <strong>retrouver du pouvoir d&apos;agir</strong>.
                C&apos;est redonner la possibilité aux citoyen.nes de contribuer aux choix structurants
                de leur commune, de mettre en débat ces choix, de faire porter sa voix
                et d&apos;agir tant qu&apos;il est encore temps.
              </p>
              <p className="text-lg text-black leading-relaxed mt-4 font-bold">
                C&apos;est renouer avec sa citoyenneté au quotidien, ses droits et ses devoirs.
              </p>
            </QuoteBlock>
          </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6">
                <div className="w-12 h-12 bg-[var(--violet)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Transparence</h3>
                <p className="text-sm text-[var(--neutre)]">
                  Accès libre à toutes les informations avec liens vers les documents sources
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-12 h-12 bg-[var(--vert)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Simplicité</h3>
                <p className="text-sm text-[var(--neutre)]">
                  Interface claire et synthèses lisibles pour tous les citoyens
                </p>
              </div>

              <div className="text-center p-6 sm:col-span-2 lg:col-span-1">
                <div className="w-12 h-12 bg-[var(--orange)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-[var(--violet-dark)] mb-2">Accessibilité</h3>
                <p className="text-sm text-[var(--neutre)]">
                  Pas de compte requis, ouvert à tous
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="stat-box">
              <div className="stat-value">{communes.length}</div>
              <div className="stat-label">Communes suivies</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">158</div>
              <div className="stat-label">Communes CAPB</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalProjets}</div>
              <div className="stat-label">Projets analysés</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{totalDelibs}</div>
              <div className="stat-label">Délibérations</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <div className="bg-[var(--violet)] rounded-lg p-8 lg:p-12 text-center text-white">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4" style={{ color: 'white' }}>
              Soutenez le projet
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              Vue d&apos;Ensemble est un projet citoyen porté par des bénévoles.
              Votre soutien nous permet de continuer à développer cet outil.
            </p>
            <Link href="/soutenir" className="btn bg-white text-[var(--violet)] hover:bg-[var(--creme)]">
              Soutenir le projet
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
