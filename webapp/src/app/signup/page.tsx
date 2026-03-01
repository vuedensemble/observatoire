import Link from 'next/link';
import SignUpForm from '@/components/admin/SignUpForm';

export const metadata = {
  title: 'Créer un compte - Admin Observatoire',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--creme)]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-[var(--violet-fonce)] mb-6">
            Créer un compte
          </h1>
          <SignUpForm />
          <p className="mt-4 text-center text-sm text-gray-600">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[var(--violet)] hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
