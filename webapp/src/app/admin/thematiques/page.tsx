import { getAllThematiques } from '@/lib/db';
import ThematiqueEditor from '@/components/admin/ThematiqueEditor';

export default async function AdminThematiques() {
  const thematiques = await getAllThematiques();

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mb-6">
        Thematiques
      </h1>

      <ThematiqueEditor thematiques={thematiques} />
    </div>
  );
}
