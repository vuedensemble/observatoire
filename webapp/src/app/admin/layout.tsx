import { requireAuth } from '@/lib/auth-utils';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <div className="p-6">{children}</div>
    </div>
  );
}
