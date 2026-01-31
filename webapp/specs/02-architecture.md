# Architecture technique

## Stack technique

- **Frontend** : Next.js (React)
- **Base de données** : PostgreSQL
- **Hébergement** : À définir

## Modèle de données

### Commune

| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | Identifiant unique |
| nom | string | Nom de la commune |
| code_postal | string | Code postal |
| population | integer | Nombre d'habitants |
| maire | string | Nom du maire |
| infos_generales | jsonb | Autres informations |

### Conseil Municipal

| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | Identifiant unique |
| commune_id | uuid | FK vers Commune |
| date | date | Date du conseil |
| presents | string[] | Liste des présents |
| absents | string[] | Liste des absents |
| pdf_url | string | Lien vers le PDF source |

### Délibération

| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | Identifiant unique |
| conseil_id | uuid | FK vers Conseil Municipal |
| numero | string | Numéro de la délibération |
| objet | string | Objet/titre |
| detail | text | Contenu détaillé |
| decision | string | Décision prise |
| votants | jsonb | Détail des votes |

### Projet

| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | Identifiant unique |
| nom | string | Nom du projet |
| description | text | Description |
| nature | string | Nature du projet |
| competence | string | Compétence concernée |
| statut | string | En cours, voté, abandonné |

### Thématique

| Champ | Type | Description |
|-------|------|-------------|
| id | uuid | Identifiant unique |
| nom | string | Nom de la thématique |
| description | string | Description |

### Tables de liaison

- **projet_deliberation** : Lien N-N entre projets et délibérations
- **projet_thematique** : Lien N-N entre projets et thématiques
- **projet_commune** : Lien N-N entre projets et communes (un projet peut concerner plusieurs communes)

## API Routes (Next.js)

```
GET /api/communes                    # Liste des communes
GET /api/communes/[id]               # Détail d'une commune
GET /api/communes/[id]/projets       # Projets d'une commune
GET /api/communes/[id]/deliberations # Délibérations d'une commune

GET /api/projets                     # Liste/recherche de projets
GET /api/projets/[id]                # Détail d'un projet

GET /api/thematiques                 # Liste des thématiques

GET /api/search                      # Recherche globale avec filtres
```

## Filtres disponibles

- **commune** : ID ou nom de commune
- **thematique** : ID ou nom de thématique
- **periode** : date_debut, date_fin
