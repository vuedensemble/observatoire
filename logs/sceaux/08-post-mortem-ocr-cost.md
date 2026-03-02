# Post-mortem — Coût OCR excessif pour Sceaux (~25€)

## Problème

L'OCR Mistral a traité 266 PDFs, mais seulement 103 étaient des fichiers uniques. **163 fichiers (61%) étaient des doublons exacts** — le même PDF (même URL source) téléchargé dans plusieurs dossiers section.

## Cause racine

Le site sceaux.fr publie chaque séance de conseil municipal sur une page dédiée. Sur cette page, chaque délibération est un bloc séparé avec ses pièces jointes. **Le procès-verbal (PV) de la séance est répété sur chaque bloc de délibération** de la même séance.

Le scraper crée une section par bloc. Donc pour une séance avec 15 délibérations, le même PV de ~80 pages est téléchargé 15 fois dans 15 sections différentes. Le filtre `filter-pdfs` matche ensuite le PV dans chaque section, et l'OCR les traite tous.

Exemple : `proces-verbal-250925-approuve.pdf` (séance du 25/09/2025) apparaît 4 fois dans le manifest.

## Chiffres

| Métrique | Valeur |
|----------|--------|
| PDFs dans le manifest | 266 |
| URLs sources uniques | 103 |
| Doublons exacts | 163 (61%) |
| Taille utile | 70.1 MB |
| Taille gaspillée (doublons) | 128.3 MB |
| Coût estimé gaspillé | ~15€ sur 25€ |

## Solution à implémenter

Ajouter une étape de **déduplication par URL source** entre le `filter-pdfs` et l'`ocr`. Deux approches possibles :

### Option A : Dédup dans `filter-pdfs`
Avant d'écrire le manifest, dédupliquer les entrées par URL source. Garder seulement la première occurrence de chaque fichier et noter les sections associées dans les métadonnées.

### Option B : Dédup dans `ocr`
Avant de soumettre le batch OCR, hasher ou comparer les chemins pour éviter de traiter deux fois le même contenu. Copier le résultat `_ocr.json` vers les sections dupliquées au lieu de re-OCR.

**Option A est préférable** car elle réduit aussi le nombre de fichiers passés à l'extraction et la structuration.
