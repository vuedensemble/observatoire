# Étape 1 — Scraping de Sceaux

**Date** : 2026-03-01
**Commande** : `uv run python -m observatoire.cli.run scrape sceaux.csv datasets/cities/ -v`

## Résultat

- **Statut** : Crawl terminé avec succès
- **Pages crawlées** : 1 608
- **Sections créées** : 7 074
- **Erreurs de crawl** : 70 (URLs inaccessibles ou timeouts)
- **PDFs référencés** : 11 764 liens PDF dans les métadonnées des sections
- **PDFs téléchargés** : 0 (normal — le téléchargement se fait à l'étape OCR après filtrage)

## Structure du site

Le site sceaux.fr publie les délibérations par séance de conseil municipal, avec pour chaque délibération :
- Une **note de présentation** (PDF)
- La **délibération** elle-même (PDF)
- Parfois des **pièces jointes** supplémentaires (PDF)

Les séances couvrent la période **2014 à février 2026** (~60 séances).

## Erreur non-bloquante

La classification LLM a échoué (`'LLM_API_KEY'` non définie). Cette étape est optionnelle et ne bloque pas le pipeline principal (filter-pdfs → OCR → extraction → import).

## Prochaine étape

Filtrage des PDFs : `uv run python -m observatoire.cli.run filter-pdfs datasets/cities/ -c Sceaux -o sceaux_manifest.json -v`

## Log complet

Voir `01-scrape-sceaux.log` dans le même dossier.
