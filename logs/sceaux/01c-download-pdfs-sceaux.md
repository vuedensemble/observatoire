# Étape 1c — Téléchargement des PDFs de Sceaux

**Date** : 2026-03-01
**Commande** : Script Python appelant `download_files_from_crawl()` avec filtre sur les sections de conseil municipal

## Résultat

- **Statut** : Terminé
- **Sections traitées** : 6 400 / 6 400 sections municipales
- **PDFs téléchargés** : 10 599 fichiers PDF sur disque
- **Erreurs 404** : ~20 fichiers (principalement des "Décisions" 2025 et quelques anciens PV)
- **ZIPs trouvés** : 0

## Détails

Après la classification LLM, 6 400 sections sur 7 074 ont été identifiées comme liées au conseil municipal. Les fichiers PDF de ces sections ont été téléchargés depuis sceaux.fr. Le site publie pour chaque délibération :
- Une note de présentation (NP)
- La délibération signée (DEL)
- Des pièces jointes éventuelles (PJ)
- Des procès-verbaux de séance (PV)

## Log complet

Voir `01c-download-pdfs-sceaux.log` dans le même dossier.
