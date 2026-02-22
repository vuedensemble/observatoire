import { notFound } from 'next/navigation';
import { getCommuneBySlug, getProjetGroupesByCommune } from '@/lib/db';
import AdminGroupList from '@/components/AdminGroupList';

interface PageProps {
  params: Promise<{ commune: string }>;
}

export default async function AdminCommuneProjetsPage({ params }: PageProps) {
  const { commune: communeSlug } = await params;
  const commune = getCommuneBySlug(communeSlug);

  if (!commune) {
    notFound();
  }

  const groups = getProjetGroupesByCommune(commune.id);
  const pendingGroups = groups
    .filter((g) => g.statut === 'proposition')
    .sort((a, b) => b.mentions.length - a.mentions.length);
  const validatedGroups = groups.filter((g) => g.statut === 'valide');
  const rejectedGroups = groups.filter((g) => g.statut === 'rejete');

  const totalMentions = groups.reduce((acc, g) => acc + g.mentions.length, 0);

  return (
    <div className="section">
      <div className="container max-w-4xl">
        <div className="flex items-center gap-4 mb-2">
          <a href="/admin/projets" className="text-[var(--violet)] hover:underline text-sm">
            Toutes les communes
          </a>
          <span className="text-[var(--neutre)]">/</span>
        </div>

        <h1 className="text-2xl font-bold text-[var(--violet)] mb-2">
          Validation des projets — {commune.nom}
        </h1>
        <p className="text-[var(--neutre)] mb-8">
          {pendingGroups.length} groupes proposés · {validatedGroups.length} validés · {rejectedGroups.length} rejetés · {totalMentions} mentions brutes
        </p>

        {pendingGroups.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-[var(--violet)] mb-4">
              En attente de validation ({pendingGroups.length})
            </h2>
            <AdminGroupList groups={pendingGroups} />
          </section>
        )}

        {validatedGroups.length > 0 && (
          <section className="mb-12">
            <h2 className="text-lg font-semibold text-[var(--vert)] mb-4">
              Validés ({validatedGroups.length})
            </h2>
            <div className="space-y-2">
              {validatedGroups.map((group) => (
                <div key={group.id} className="bg-[var(--vert)]/5 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <span className="font-medium text-black">{group.nom_canonique}</span>
                    <span className="text-sm text-[var(--neutre)] ml-3">{group.mentions.length} mentions</span>
                  </div>
                  {group.projet_id && (
                    <a
                      href={`/projet/${group.projet_id}`}
                      className="text-sm text-[var(--violet)] hover:underline"
                    >
                      Voir le projet
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {rejectedGroups.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-[var(--neutre)] mb-4">
              Rejetés ({rejectedGroups.length})
            </h2>
            <div className="space-y-2">
              {rejectedGroups.map((group) => (
                <div key={group.id} className="bg-gray-50 rounded-lg p-4 opacity-60">
                  <span className="text-black line-through">{group.nom_canonique}</span>
                  <span className="text-sm text-[var(--neutre)] ml-3">{group.mentions.length} mentions</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
