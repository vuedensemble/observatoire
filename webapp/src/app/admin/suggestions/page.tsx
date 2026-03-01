import { db } from '@/lib/db/index';
import { communeSuggestions } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';
import SuggestionsTable from '@/components/admin/SuggestionsTable';

export default async function AdminSuggestions() {
  const suggestions = await db
    .select()
    .from(communeSuggestions)
    .orderBy(desc(communeSuggestions.created_at));

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--violet-fonce)] mb-6">
        Suggestions de communes
      </h1>

      {suggestions.length === 0 ? (
        <p className="text-gray-500">Aucune suggestion pour le moment.</p>
      ) : (
        <SuggestionsTable suggestions={suggestions} />
      )}
    </div>
  );
}
