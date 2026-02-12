import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-[var(--vert)] text-white py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div>
            <Link href="/" className="flex items-center">
              <Image
                src="/Logo-VE-color1.svg"
                alt="Vue d'Ensemble"
                width={90}
                height={22}
                className="h-5 w-auto brightness-0 invert"
              />
            </Link>
            <p className="mt-4 text-sm text-white">
              Depuis 2023, l&apos;association Vue d&apos;Ensemble joue un rôle de catalyseur de l&apos;action écologique au Pays basque nord - Sud Landes, auprès des citoyens et acteurs locaux.
            </p>
          </div>

          {/* Nos outils &amp; services */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Nos outils &amp; services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-white hover:text-white">
                  Observatoire des collectivités
                </Link>
              </li>
              <li>
                <span className="text-white">Agenda écologique local</span>
              </li>
              <li>
                <span className="text-white">Cartographie locale</span>
              </li>
            </ul>
          </div>

          {/* Notre association */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Notre association</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.vuedensemble.fr" target="_blank" rel="noopener noreferrer" className="text-white hover:text-white">
                  www.vuedensemble.fr
                </a>
              </li>
              <li>
                <a href="mailto:contact@vuedensemble.fr" className="text-white hover:text-white">
                  contact@vuedensemble.fr
                </a>
              </li>
            </ul>
          </div>

          {/* Réseaux sociaux */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Nous suivre</h4>
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/vuedensemble_territoires/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61551135269071"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/vuedensemble-territoires/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://www.vuedensemble.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white transition-colors"
                aria-label="Site internet"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </a>
              <a
                href="https://www.helloasso.com/associations/association-vue-d-ensemble"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white transition-colors"
                aria-label="HelloAsso"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/30 text-center text-sm text-white">
          <p>&copy; {new Date().getFullYear()} Vue d&apos;Ensemble. Tous droits réservés. <Link href="/mentions-legales" className="underline" style={{ color: 'white' }}>Mentions légales</Link></p>
        </div>
      </div>
    </footer>
  );
}
