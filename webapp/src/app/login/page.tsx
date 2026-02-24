import { Suspense } from 'react';
import LoginForm from '@/components/admin/LoginForm';

export const metadata = {
  title: 'Connexion - Admin Observatoire',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--creme)]">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-[var(--violet-fonce)] mb-6">
            Admin Observatoire
          </h1>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
