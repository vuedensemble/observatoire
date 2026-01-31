# Pages de l'application

## 1. Page d'accueil (`/`)

### Objectif
Permettre à l'utilisateur de trouver rapidement sa commune ou d'explorer le territoire.

### Contenu

#### Header
- Logo "VUE D'ENSEMBLE"
- Navigation : Le projet, La méthodologie, Une info ?, Soutenir le projet, Nous rejoindre

#### Section héro
- Sous-titre : "Observatoire citoyen des collectivités du Pays Basque Nord - Sud Landes"
- Titre accrocheur : "Es-tu au courant de ce qu'il se passe dans ta commune ?"
- Illustration : carte stylisée du territoire avec logo V.E

#### Recherche commune
- Champ de recherche avec autocomplétion
- Placeholder : "rechercher ma commune (nom, code postal)"
- Suggestions en temps réel au fil de la frappe

#### Carte interactive
- Carte cliquable du territoire CAPB
- Au clic sur une commune : redirection vers la page commune
- V1 : carte simple, sans indicateurs visuels

#### Texte de présentation
- Explication de la mission de Vue d'Ensemble
- Bordure verte ondulée à gauche

#### Call-to-action
- Bouton "Soutenir le projet"

---

## 2. Page commune (`/commune/[slug]`)

### Objectif
Présenter toutes les informations d'une commune : infos générales, projets, historique des délibérations.

### Contenu

#### Fil d'ariane
`Accueil > [Nom commune]`

#### En-tête commune
- Nom de la commune
- Code postal
- Population
- Maire en exercice

#### Section Projets (prioritaire)
- Titre : "Projets de la commune"
- Liste des projets avec pour chacun :
  - Nom du projet
  - Thématiques (badges colorés)
  - Nombre de délibérations liées
  - Statut (en cours, voté, abandonné)
- Lien vers la page projet au clic

#### Section Historique des délibérations
- Titre : "Historique des conseils municipaux"
- Liste chronologique (plus récent en premier)
- Pour chaque conseil :
  - Date
  - Nombre de délibérations
  - Lien vers le PDF source
- Possibilité de déplier pour voir la liste des délibérations

#### Filtres
- Par thématique
- Par période

---

## 3. Page projet (`/projet/[slug]`)

### Objectif
Présenter un projet en détail avec toutes les délibérations associées.

### Contenu

#### Fil d'ariane
`Accueil > [Commune] > [Nom projet]`

#### En-tête projet
- Nom du projet
- Commune(s) concernée(s)
- Statut (badge)
- Nature
- Compétence

#### Thématiques
- Liste des thématiques associées (badges colorés)

#### Résumé
- Description du projet (générée ou extraite)
- Montants engagés (si disponible)

#### Chronologie des délibérations
- Timeline verticale
- Pour chaque délibération :
  - Date du conseil
  - Numéro et objet de la délibération
  - Résumé court
  - Décision prise
  - Lien vers le PDF source

---

## 4. Pages statiques

### Le projet (`/projet`)
- Présentation de Vue d'Ensemble
- Histoire du collectif
- Équipe

### La méthodologie (`/methodologie`)
- Comment les données sont collectées
- Comment l'IA analyse les documents
- Limites et précautions

### Une info ? (`/contact`)
- Formulaire de contact
- Pour signaler une erreur ou proposer une info

### Soutenir le projet (`/soutenir`)
- Comment aider (dons, bénévolat)
- Liens vers HelloAsso ou équivalent

### Nous rejoindre (`/rejoindre`)
- Comment rejoindre le collectif
- Compétences recherchées
