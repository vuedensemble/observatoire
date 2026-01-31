# Composants UI

## Navigation

### Header
- Logo "VUE D'ENSEMBLE" (lien vers accueil)
- Menu de navigation horizontal
- Responsive : menu hamburger sur mobile

### Footer
- Logo
- Liens utiles
- Mentions légales
- Réseaux sociaux

### Fil d'ariane (Breadcrumb)
- Navigation hiérarchique
- Séparateur : `>`

---

## Recherche

### SearchInput
- Champ de recherche avec icône loupe
- Autocomplétion en temps réel
- Affiche nom + code postal
- Au clic sur suggestion : navigation vers la page commune

### FilterPanel
- Sélecteur de commune
- Sélecteur de thématique (multi)
- Sélecteur de période (date picker range)
- Bouton "Appliquer les filtres"
- Bouton "Réinitialiser"

---

## Cartes

### CommuneCard
- Nom de la commune
- Code postal
- Nombre de projets actifs
- Lien vers la page commune

### ProjetCard
- Nom du projet
- Commune(s)
- Thématiques (badges)
- Statut (badge coloré)
- Nombre de délibérations
- Lien vers la page projet

### DeliberationCard
- Date du conseil
- Numéro
- Objet (titre)
- Décision (résumé)
- Lien vers PDF source

---

## Badges

### ThematiqueBadge
- Texte de la thématique
- Couleur selon la thématique (palette à définir)
- Petit, arrondi

### StatutBadge
- "En cours" : vert
- "Voté" : violet
- "Abandonné" : gris

---

## Affichage de données

### Timeline
- Affichage vertical chronologique
- Point sur la ligne pour chaque événement
- Contenu à droite de la ligne
- Date à gauche

### StatBox
- Chiffre principal (grand)
- Label (petit)
- Icône optionnelle
- Utilisé pour les stats de la commune

### AccordionList
- Liste repliable
- Titre cliquable pour déplier/replier
- Contenu caché par défaut
- Utilisé pour l'historique des conseils municipaux

---

## Carte géographique

### MapCAPB
- Carte SVG ou Leaflet du territoire CAPB
- Communes cliquables
- Tooltip au survol (nom de la commune)
- V1 : pas de couleurs différenciées
- V2 (future) : couleurs selon indicateurs

---

## Éléments de mise en page

### SectionTitle
- Titre de section (h2)
- Optionnel : sous-titre
- Style cohérent sur toutes les pages

### QuoteBlock
- Bloc de texte avec bordure verte ondulée à gauche
- Pour les citations ou textes importants

### Button
- Primaire : fond violet, texte blanc
- Secondaire : bordure violet, fond transparent
- Arrondi

### Link
- Couleur violet
- Souligné au survol
