import Link from 'next/link';
import { db } from '@/lib/db/index';
import { projetGroupes, projetMentions, communes } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function AdminProjetsPage() {
  // Get communes with pending groups
  const rows = await db
    .select({
      commune_id: projetGroupes.commune_id,
      nom: communes.nom,
      slug: communes.slug,
      total_groups: sql<number>`count(DISTINCT ${projetGroupes.id})`,
      pending_groups: sql<number>`count(DISTINCT CASE WHEN ${projetGroupes.statut} = 'proposition' THEN ${projetGroupes.id} END)`,
      validated_groups: sql<number>`count(DISTINCT CASE WHEN ${projetGroupes.statut} = 'valide' THEN ${projetGroupes.id} END)`,
    })
    .from(projetGroupes)
    .innerJoin(communes, eq(communes.id, projetGroupes.commune_id))
    .groupBy(projetGroupes.commune_id);

  // Get mention counts per commune
  const mentionCounts = await db
    .select({
      commune_id: projetMentions.commune_id,
      count: sql<number>`count(*)`,
    })
    .from(projetMentions)
    .groupBy(projetMentions.commune_id);

  const mentionMap = new Map(mentionCounts.map((r) => [r.commune_id, Number(r.count)]));

  return (
    <div className="section">
      <div className="container max-w-4xl">
        <h1 className="text-2xl font-bold text-[var(--violet)] mb-2">
          Validation des projets
        </h1>
        <p className="text-[var(--neutre)] mb-8">
          Validez les groupements de projets proposés automatiquement pour chaque commune.
        </p>

        <div className="space-y-3">
          {rows.map((row) => (
            <Link
              key={row.commune_id}
              href={`/admin/projets/${row.slug}`}
              className="block bg-white rounded-lg p-5 hover:shadow-md transition-shadow border border-transparent hover:border-[var(--violet)]/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-black">{row.nom}</h2>
                  <p className="text-sm text-[var(--neutre)]">
                    {mentionMap.get(row.commune_id) || 0} mentions brutes
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {Number(row.pending_groups) > 0 && (
                    <span className="px-3 py-1 bg-[var(--orange)]/10 text-[var(--orange)] rounded-full font-medium">
                      {row.pending_groups} en attente
                    </span>
                  )}
                  {Number(row.validated_groups) > 0 && (
                    <span className="px-3 py-1 bg-[var(--vert)]/10 text-[var(--vert)] rounded-full font-medium">
                      {row.validated_groups} validés
                    </span>
                  )}
                  <span className="text-[var(--neutre)]">
                    {row.total_groups} groupes
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {rows.length === 0 && (
          <p className="text-center text-[var(--neutre)] py-12">
            Aucun groupe de projets à valider. Lancez d&apos;abord le script de déduplication.
          </p>
        )}
      </div>
    </div>
  );
}
