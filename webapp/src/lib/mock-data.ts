import {
  Commune,
  ConseilMunicipal,
  Deliberation,
  Thematique,
  Projet,
  ProjetDeliberation,
  ProjetThematique,
  ProjetCommune,
} from './types';

// Thématiques
export const thematiques: Thematique[] = [
  { id: 'th-1', nom: 'Urbanisme', description: 'Aménagement du territoire, PLU, permis de construire', couleur: '#E57C3A' },
  { id: 'th-2', nom: 'Environnement', description: 'Écologie, espaces verts, développement durable', couleur: '#2EAD6B' },
  { id: 'th-3', nom: 'Budget', description: 'Finances, fiscalité, investissements', couleur: '#6B5CE7' },
  { id: 'th-4', nom: 'Social', description: 'Solidarité, logement social, aide aux personnes', couleur: '#3B82F6' },
  { id: 'th-5', nom: 'Culture', description: 'Événements culturels, patrimoine, associations', couleur: '#EC4899' },
  { id: 'th-6', nom: 'Transports', description: 'Mobilité, voirie, transports en commun', couleur: '#EAB308' },
  { id: 'th-7', nom: 'Éducation', description: 'Écoles, crèches, périscolaire', couleur: '#14B8A6' },
  { id: 'th-8', nom: 'Sport', description: 'Équipements sportifs, clubs, événements', couleur: '#F97316' },
];

// Communes du Pays Basque
export const communes: Commune[] = [
  { id: 'com-1', nom: 'Anglet', slug: 'anglet', code_postal: '64600', population: 39719, maire: 'Claude Olive' },
  { id: 'com-2', nom: 'Bayonne', slug: 'bayonne', code_postal: '64100', population: 52006, maire: 'Jean-René Etchegaray' },
  { id: 'com-3', nom: 'Biarritz', slug: 'biarritz', code_postal: '64200', population: 25532, maire: 'Maider Arosteguy' },
  { id: 'com-4', nom: 'Saint-Jean-de-Luz', slug: 'saint-jean-de-luz', code_postal: '64500', population: 14461, maire: 'Jean-François Irigoyen' },
  { id: 'com-5', nom: 'Hendaye', slug: 'hendaye', code_postal: '64700', population: 17875, maire: 'Kotte Ecenarro' },
  { id: 'com-6', nom: 'Urrugne', slug: 'urrugne', code_postal: '64122', population: 10284, maire: 'Philippe Aramendi' },
  { id: 'com-7', nom: 'Ciboure', slug: 'ciboure', code_postal: '64500', population: 6714, maire: 'Eneko Aldana' },
  { id: 'com-8', nom: 'Bidart', slug: 'bidart', code_postal: '64210', population: 6823, maire: 'Emmanuel Alzuri' },
  { id: 'com-9', nom: 'Guéthary', slug: 'guethary', code_postal: '64210', population: 1394, maire: 'Pierre Etxegaray' },
  { id: 'com-10', nom: 'Ascain', slug: 'ascain', code_postal: '64310', population: 4378, maire: 'Jean-Martin Dutournier' },
  { id: 'com-11', nom: 'Saint-Pée-sur-Nivelle', slug: 'saint-pee-sur-nivelle', code_postal: '64310', population: 7172, maire: 'Jean-Baptiste Daguerre' },
  { id: 'com-12', nom: 'Hasparren', slug: 'hasparren', code_postal: '64240', population: 6441, maire: 'Michel Etchebest' },
  { id: 'com-13', nom: 'Cambo-les-Bains', slug: 'cambo-les-bains', code_postal: '64250', population: 6776, maire: 'Christian Devèze' },
  { id: 'com-14', nom: 'Espelette', slug: 'espelette', code_postal: '64250', population: 2149, maire: 'Jean-Marie Iputcha' },
  { id: 'com-15', nom: 'Ustaritz', slug: 'ustaritz', code_postal: '64480', population: 7096, maire: 'Beñat Inchauspe' },
];

// Conseils municipaux
export const conseilsMunicipaux: ConseilMunicipal[] = [
  // Anglet
  { id: 'cm-1', commune_id: 'com-1', date: '2024-12-15', presents: ['Claude Olive', 'Marie Dupont', 'Jean Martin', 'Sophie Bernard'], absents: ['Pierre Durand'], pdf_url: '/pdfs/anglet-2024-12-15.pdf' },
  { id: 'cm-2', commune_id: 'com-1', date: '2024-10-20', presents: ['Claude Olive', 'Marie Dupont', 'Jean Martin'], absents: ['Sophie Bernard', 'Pierre Durand'], pdf_url: '/pdfs/anglet-2024-10-20.pdf' },
  { id: 'cm-3', commune_id: 'com-1', date: '2024-06-18', presents: ['Claude Olive', 'Marie Dupont', 'Jean Martin', 'Sophie Bernard', 'Pierre Durand'], absents: [], pdf_url: '/pdfs/anglet-2024-06-18.pdf' },
  // Bayonne
  { id: 'cm-4', commune_id: 'com-2', date: '2024-11-25', presents: ['Jean-René Etchegaray', 'Anna Thiery', 'Lucas Mora'], absents: ['Emma Blanc'], pdf_url: '/pdfs/bayonne-2024-11-25.pdf' },
  { id: 'cm-5', commune_id: 'com-2', date: '2024-09-15', presents: ['Jean-René Etchegaray', 'Anna Thiery', 'Lucas Mora', 'Emma Blanc'], absents: [], pdf_url: '/pdfs/bayonne-2024-09-15.pdf' },
  // Biarritz
  { id: 'cm-6', commune_id: 'com-3', date: '2024-12-01', presents: ['Maider Arosteguy', 'Paul Renard', 'Claire Vidal'], absents: ['Hugo Petit'], pdf_url: '/pdfs/biarritz-2024-12-01.pdf' },
  { id: 'cm-7', commune_id: 'com-3', date: '2024-07-10', presents: ['Maider Arosteguy', 'Paul Renard', 'Claire Vidal', 'Hugo Petit'], absents: [], pdf_url: '/pdfs/biarritz-2024-07-10.pdf' },
  // Saint-Jean-de-Luz
  { id: 'cm-8', commune_id: 'com-4', date: '2024-11-05', presents: ['Jean-François Irigoyen', 'Isabelle Moreau', 'Antoine Leroy'], absents: [], pdf_url: '/pdfs/sjdl-2024-11-05.pdf' },
  // Hendaye
  { id: 'cm-9', commune_id: 'com-5', date: '2024-10-12', presents: ['Kotte Ecenarro', 'François Garcia', 'Camille Roux'], absents: ['Louis Simon'], pdf_url: '/pdfs/hendaye-2024-10-12.pdf' },
  // Bidart
  { id: 'cm-10', commune_id: 'com-8', date: '2024-09-28', presents: ['Emmanuel Alzuri', 'Julie Laurent', 'Marc Faure'], absents: [], pdf_url: '/pdfs/bidart-2024-09-28.pdf' },
];

// Délibérations
export const deliberations: Deliberation[] = [
  // Anglet - CM 2024-12-15
  { id: 'del-1', conseil_id: 'cm-1', numero: '2024-12-001', objet: 'Approbation du budget primitif 2025', detail: 'Le conseil municipal approuve le budget primitif pour l\'exercice 2025, comprenant une section de fonctionnement de 85 millions d\'euros et une section d\'investissement de 25 millions d\'euros.', decision: 'Adopté à l\'unanimité', votants: { pour: 35, contre: 0, abstention: 0 } },
  { id: 'del-2', conseil_id: 'cm-1', numero: '2024-12-002', objet: 'Projet de réaménagement du centre-ville', detail: 'Lancement de la phase 2 du projet de réaménagement du centre-ville, incluant la piétonnisation de la rue principale et la création d\'espaces verts.', decision: 'Adopté à la majorité', votants: { pour: 28, contre: 5, abstention: 2 } },
  { id: 'del-3', conseil_id: 'cm-1', numero: '2024-12-003', objet: 'Subvention aux associations sportives', detail: 'Attribution de subventions aux associations sportives de la commune pour un montant total de 450 000 euros.', decision: 'Adopté à l\'unanimité', votants: { pour: 35, contre: 0, abstention: 0 } },
  // Anglet - CM 2024-10-20
  { id: 'del-4', conseil_id: 'cm-2', numero: '2024-10-001', objet: 'Création d\'une piste cyclable avenue de Bayonne', detail: 'Validation du tracé et du financement de la nouvelle piste cyclable reliant le centre-ville à la zone commerciale.', decision: 'Adopté à la majorité', votants: { pour: 25, contre: 3, abstention: 5 } },
  { id: 'del-5', conseil_id: 'cm-2', numero: '2024-10-002', objet: 'Révision du PLU - secteur Chiberta', detail: 'Modification du Plan Local d\'Urbanisme pour le secteur Chiberta, limitant la hauteur des constructions à R+2.', decision: 'Adopté à la majorité', votants: { pour: 22, contre: 8, abstention: 3 } },
  // Anglet - CM 2024-06-18
  { id: 'del-6', conseil_id: 'cm-3', numero: '2024-06-001', objet: 'Compte administratif 2023', detail: 'Présentation et approbation du compte administratif de l\'exercice 2023.', decision: 'Adopté à l\'unanimité', votants: { pour: 35, contre: 0, abstention: 0 } },
  { id: 'del-7', conseil_id: 'cm-3', numero: '2024-06-002', objet: 'Construction d\'un nouveau groupe scolaire', detail: 'Approbation du programme et du financement pour la construction d\'un nouveau groupe scolaire dans le quartier Montbrun.', decision: 'Adopté à la majorité', votants: { pour: 30, contre: 2, abstention: 3 } },
  // Bayonne - CM 2024-11-25
  { id: 'del-8', conseil_id: 'cm-4', numero: '2024-11-001', objet: 'Rénovation du Musée Basque', detail: 'Lancement du projet de rénovation et d\'extension du Musée Basque pour un budget de 12 millions d\'euros.', decision: 'Adopté à l\'unanimité', votants: { pour: 40, contre: 0, abstention: 0 } },
  { id: 'del-9', conseil_id: 'cm-4', numero: '2024-11-002', objet: 'Plan vélo 2025-2030', detail: 'Adoption du plan vélo municipal prévoyant la création de 50 km de pistes cyclables sur 5 ans.', decision: 'Adopté à la majorité', votants: { pour: 35, contre: 3, abstention: 2 } },
  { id: 'del-10', conseil_id: 'cm-4', numero: '2024-11-003', objet: 'Aide au commerce de proximité', detail: 'Création d\'un fonds d\'aide au commerce de proximité doté de 200 000 euros.', decision: 'Adopté à l\'unanimité', votants: { pour: 40, contre: 0, abstention: 0 } },
  // Bayonne - CM 2024-09-15
  { id: 'del-11', conseil_id: 'cm-5', numero: '2024-09-001', objet: 'Renouvellement urbain quartier Saint-Esprit', detail: 'Validation du programme de renouvellement urbain du quartier Saint-Esprit dans le cadre de l\'ANRU.', decision: 'Adopté à la majorité', votants: { pour: 32, contre: 5, abstention: 3 } },
  // Biarritz - CM 2024-12-01
  { id: 'del-12', conseil_id: 'cm-6', numero: '2024-12-001', objet: 'Protection du littoral', detail: 'Adoption du plan de protection du littoral face à l\'érosion côtière, incluant la restauration des falaises de la Côte des Basques.', decision: 'Adopté à l\'unanimité', votants: { pour: 33, contre: 0, abstention: 0 } },
  { id: 'del-13', conseil_id: 'cm-6', numero: '2024-12-002', objet: 'Réglementation des locations saisonnières', detail: 'Renforcement de la réglementation des meublés de tourisme avec limitation à 90 jours par an.', decision: 'Adopté à la majorité', votants: { pour: 25, contre: 6, abstention: 2 } },
  // Biarritz - CM 2024-07-10
  { id: 'del-14', conseil_id: 'cm-7', numero: '2024-07-001', objet: 'Festival de surf 2025', detail: 'Attribution d\'une subvention de 150 000 euros pour l\'organisation du festival international de surf.', decision: 'Adopté à l\'unanimité', votants: { pour: 33, contre: 0, abstention: 0 } },
  // Saint-Jean-de-Luz - CM 2024-11-05
  { id: 'del-15', conseil_id: 'cm-8', numero: '2024-11-001', objet: 'Réhabilitation du port de pêche', detail: 'Lancement du projet de modernisation des infrastructures du port de pêche.', decision: 'Adopté à l\'unanimité', votants: { pour: 29, contre: 0, abstention: 0 } },
  { id: 'del-16', conseil_id: 'cm-8', numero: '2024-11-002', objet: 'Zone piétonne centre historique', detail: 'Extension de la zone piétonne dans le centre historique pendant la saison estivale.', decision: 'Adopté à la majorité', votants: { pour: 24, contre: 3, abstention: 2 } },
  // Hendaye - CM 2024-10-12
  { id: 'del-17', conseil_id: 'cm-9', numero: '2024-10-001', objet: 'Coopération transfrontalière', detail: 'Signature d\'une convention de coopération avec la ville d\'Irun pour le développement durable de la baie de Txingudi.', decision: 'Adopté à l\'unanimité', votants: { pour: 31, contre: 0, abstention: 0 } },
  // Bidart - CM 2024-09-28
  { id: 'del-18', conseil_id: 'cm-10', numero: '2024-09-001', objet: 'Aménagement de la plage du Centre', detail: 'Réaménagement des accès à la plage du Centre et création de sanitaires écologiques.', decision: 'Adopté à l\'unanimité', votants: { pour: 27, contre: 0, abstention: 0 } },
];

// Projets
export const projets: Projet[] = [
  { id: 'proj-1', nom: 'Réaménagement du centre-ville d\'Anglet', slug: 'reamenagement-centre-ville-anglet', description: 'Projet de piétonnisation et de végétalisation du centre-ville d\'Anglet, incluant la création de nouvelles places publiques et l\'amélioration des mobilités douces.', nature: 'Aménagement urbain', competence: 'Urbanisme', statut: 'en_cours', montant: 8500000 },
  { id: 'proj-2', nom: 'Piste cyclable avenue de Bayonne', slug: 'piste-cyclable-avenue-bayonne', description: 'Création d\'une piste cyclable sécurisée le long de l\'avenue de Bayonne, reliant le centre-ville à la zone commerciale BAB2.', nature: 'Infrastructure', competence: 'Mobilité', statut: 'en_cours', montant: 1200000 },
  { id: 'proj-3', nom: 'Groupe scolaire Montbrun', slug: 'groupe-scolaire-montbrun', description: 'Construction d\'un nouveau groupe scolaire dans le quartier Montbrun pour répondre à la croissance démographique.', nature: 'Équipement public', competence: 'Éducation', statut: 'vote', montant: 15000000 },
  { id: 'proj-4', nom: 'Rénovation du Musée Basque', slug: 'renovation-musee-basque', description: 'Projet de rénovation et d\'extension du Musée Basque et de l\'histoire de Bayonne, incluant la création de nouveaux espaces d\'exposition.', nature: 'Culture', competence: 'Culture', statut: 'en_cours', montant: 12000000 },
  { id: 'proj-5', nom: 'Plan vélo Bayonne 2025-2030', slug: 'plan-velo-bayonne', description: 'Plan ambitieux de développement des infrastructures cyclables à Bayonne avec 50 km de nouvelles pistes cyclables.', nature: 'Plan stratégique', competence: 'Mobilité', statut: 'vote', montant: 25000000 },
  { id: 'proj-6', nom: 'Protection du littoral biarrot', slug: 'protection-littoral-biarritz', description: 'Programme de protection du littoral face à l\'érosion côtière, avec restauration des falaises et création de dispositifs de protection.', nature: 'Environnement', competence: 'Environnement', statut: 'en_cours', montant: 6000000 },
  { id: 'proj-7', nom: 'Réglementation locations saisonnières', slug: 'reglementation-locations-saisonnieres-biarritz', description: 'Mise en place d\'une réglementation stricte des locations saisonnières pour préserver l\'habitat permanent.', nature: 'Réglementation', competence: 'Logement', statut: 'vote' },
  { id: 'proj-8', nom: 'Renouvellement urbain Saint-Esprit', slug: 'renouvellement-urbain-saint-esprit', description: 'Programme ANRU de renouvellement urbain du quartier Saint-Esprit à Bayonne.', nature: 'Aménagement urbain', competence: 'Urbanisme', statut: 'en_cours', montant: 45000000 },
  { id: 'proj-9', nom: 'Modernisation du port de Saint-Jean-de-Luz', slug: 'modernisation-port-sjdl', description: 'Réhabilitation et modernisation des infrastructures du port de pêche de Saint-Jean-de-Luz.', nature: 'Infrastructure', competence: 'Économie', statut: 'en_cours', montant: 8000000 },
  { id: 'proj-10', nom: 'Coopération Txingudi', slug: 'cooperation-txingudi', description: 'Programme de coopération transfrontalière avec Irun pour le développement durable de la baie de Txingudi.', nature: 'Coopération', competence: 'Environnement', statut: 'en_cours' },
];

// Relations projet-délibération
export const projetDeliberations: ProjetDeliberation[] = [
  { projet_id: 'proj-1', deliberation_id: 'del-2' },
  { projet_id: 'proj-2', deliberation_id: 'del-4' },
  { projet_id: 'proj-3', deliberation_id: 'del-7' },
  { projet_id: 'proj-4', deliberation_id: 'del-8' },
  { projet_id: 'proj-5', deliberation_id: 'del-9' },
  { projet_id: 'proj-6', deliberation_id: 'del-12' },
  { projet_id: 'proj-7', deliberation_id: 'del-13' },
  { projet_id: 'proj-8', deliberation_id: 'del-11' },
  { projet_id: 'proj-9', deliberation_id: 'del-15' },
  { projet_id: 'proj-10', deliberation_id: 'del-17' },
];

// Relations projet-thématique
export const projetThematiques: ProjetThematique[] = [
  { projet_id: 'proj-1', thematique_id: 'th-1' },
  { projet_id: 'proj-1', thematique_id: 'th-2' },
  { projet_id: 'proj-2', thematique_id: 'th-6' },
  { projet_id: 'proj-2', thematique_id: 'th-2' },
  { projet_id: 'proj-3', thematique_id: 'th-7' },
  { projet_id: 'proj-4', thematique_id: 'th-5' },
  { projet_id: 'proj-5', thematique_id: 'th-6' },
  { projet_id: 'proj-5', thematique_id: 'th-2' },
  { projet_id: 'proj-6', thematique_id: 'th-2' },
  { projet_id: 'proj-7', thematique_id: 'th-4' },
  { projet_id: 'proj-7', thematique_id: 'th-1' },
  { projet_id: 'proj-8', thematique_id: 'th-1' },
  { projet_id: 'proj-8', thematique_id: 'th-4' },
  { projet_id: 'proj-9', thematique_id: 'th-2' },
  { projet_id: 'proj-10', thematique_id: 'th-2' },
];

// Relations projet-commune
export const projetCommunes: ProjetCommune[] = [
  { projet_id: 'proj-1', commune_id: 'com-1' },
  { projet_id: 'proj-2', commune_id: 'com-1' },
  { projet_id: 'proj-3', commune_id: 'com-1' },
  { projet_id: 'proj-4', commune_id: 'com-2' },
  { projet_id: 'proj-5', commune_id: 'com-2' },
  { projet_id: 'proj-6', commune_id: 'com-3' },
  { projet_id: 'proj-7', commune_id: 'com-3' },
  { projet_id: 'proj-8', commune_id: 'com-2' },
  { projet_id: 'proj-9', commune_id: 'com-4' },
  { projet_id: 'proj-10', commune_id: 'com-5' },
];
