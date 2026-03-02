# Étape 3 — OCR des PDFs de Sceaux

**Date** : 2026-03-01
**Commande** : `uv run python -m observatoire.cli.run ocr datasets/cities/ --manifest sceaux_manifest.json -v`

## Résultat

- **Statut** : Terminé avec succès
- **PDFs traités** : 266 / 266
- **Batches Mistral** : 2 (168 + 98, limite 200MB par batch)
- **Batch 1** : `bc03350d-987a-4797-924a-508fbd35ac2b` — 168 PDFs
- **Batch 2** : automatique — 98 PDFs

## Détails

Tous les 266 PDFs filtrés (procès-verbaux et comptes-rendus de séances) ont été envoyés à l'API Mistral OCR. Les résultats sont sauvegardés en `_ocr.json` à côté de chaque PDF.

## Log complet

Voir `03-ocr-sceaux.log` dans le même dossier.
