import type { Metadata } from 'next';
import { Rubik_Dirt, Barlow, Barlow_Semi_Condensed } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const rubikDirt = Rubik_Dirt({
  weight: '400',
  variable: '--font-rubik-dirt',
  subsets: ['latin'],
});

const barlow = Barlow({
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow',
  subsets: ['latin'],
});

const barlowSemiCondensed = Barlow_Semi_Condensed({
  weight: ['400', '500', '600', '700'],
  variable: '--font-barlow-semi-condensed',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vue d\'Ensemble - Observatoire citoyen du Pays Basque',
  description:
    'Observatoire citoyen des collectivités du Pays Basque Nord - Sud Landes. Suivez les conseils municipaux et les projets de votre commune.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${rubikDirt.variable} ${barlow.variable} ${barlowSemiCondensed.variable} antialiased min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
