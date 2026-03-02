# Étape 2 — Filtrage des PDFs de Sceaux

**Date** : 2026-03-01
**Commande** : `uv run python -m observatoire.cli.run filter-pdfs datasets/cities/ -c Sceaux --validate-large -o sceaux_manifest.json -v`

## Résultat

- **Statut** : Terminé avec succès
- **PDFs trouvés** : 10 743
- **PDFs retenus** : 266
- **PDFs exclus** : 10 477
- **Réduction** : 97.5%

## Raisons de matching

| Raison | Nombre |
|--------|--------|
| filename_crpv_keyword | 170 |
| metadata_linktext_crpv_keyword | 56 |
| metadata_linktext_combined_report | 24 |
| filename_crpv_abbrev | 16 |

## Validation des gros PDFs

- **Gros PDFs vérifiés** : 198 (50+ pages)
- **Gardés** : 198 (tous validés comme comptes-rendus/PV)
- **Exclus** : 0
- **Pages totales** : 17 952
- **Méthode** : extraction de texte (tous les PDFs avaient du texte extractible)

## Manifest

Sauvegardé dans `sceaux_manifest.json` (266 fichiers à traiter par l'OCR).

## Log complet

Voir `02-filter-pdfs-sceaux.log` dans le même dossier.
