# Appli Micro-Entrepreneur

Web app de gestion des revenus pour micro-entrepreneurs et freelances.

## Objectif principal

Aider un micro-entrepreneur à voir **clairement et simplement** deux choses que les logiciels comptables rendent confuses, et surtout à ne jamais les mélanger :

1. **Ce qui va être réellement prélevé ce mois-ci** (la trésorerie qui sort vraiment du compte) : l'URSSAF correspondant à l'activité d'il y a 2 mois, la TVA du mois précédent, les frais et abonnements débités ce mois, la CFE le cas échéant.
2. **Ce qu'il faut mettre de côté pour plus tard** (les provisions générées par l'activité du mois en cours, avec leurs dates d'échéance futures).

Les deux sont utiles, mais doivent rester visuellement séparés. Le but est que l'utilisateur sache, sans être comptable : combien part maintenant, combien bloquer, et combien il peut réellement utiliser.

## Statut

En cours de développement.

## Fichiers

- `index.html` — application principale

---

## Fonctionnalités

- **Tableau de bord** : KPIs du mois, cascade de déduction, donut de répartition, graphe mensuel, synthèse annuelle avec projection
- **Factures** : saisie en fenêtre modale, lignes multiples par catégorie (BNC, BIC, vente), support TVA, synthèse du mois et assistance à la déclaration URSSAF
- **Frais** : charges récurrentes (mensuelles, trimestrielles, ponctuelles) avec historique de tarifs
- **À provisionner** : cotisations URSSAF, TVA à reverser, provisions frais, CFE

### Factures

- **Création / modification en fenêtre modale** : le bouton "Nouvelle facture" ouvre une fenêtre ; rien n'est enregistré tant qu'on n'a pas cliqué sur "Valider" (plus de cartes vides). "Valider" est actif dès qu'une date est saisie.
- **Cartes en lecture seule** dans la liste, avec un bouton crayon (modifier, rouvre la modale pré-remplie) et un bouton corbeille (supprimer).
- **Déplacement automatique** : si on change la date d'une facture vers un autre mois, elle se range dans le bon mois (stockage par clé `année-mois`).
- **Synthèse du mois** en haut de l'onglet : décomposition du TTC encaissé (− TVA à reverser, − cotisations URSSAF, = net pour vous).
- **Assistance à la déclaration URSSAF** : le CA à déclarer par catégorie (arrondi à l'euro, comme sur le formulaire) + total, affiché dans la synthèse.

### CFE — Cotisation Foncière des Entreprises

- Saisie du montant annuel estimé directement dans l'onglet "À provisionner"
- Provision mensuelle calculée automatiquement (montant ÷ 12)
- Bouton "Valider l'avis" pour verrouiller le montant définitif à réception de l'avis (novembre)
- Données stockées par année (`mef2:cfe`) — l'historique est conservé d'une année sur l'autre
- Intégrée dans tous les calculs : dashboard, synthèse annuelle, total à provisionner

### Taux officiels — URSSAF et TVA

- Historique des taux URSSAF par catégorie (BNC, BIC vente, BIC prestation, BNC CIPAV), avec date d'effet
- Le moteur de calcul choisit automatiquement le taux applicable selon la date de la facture ou du mois
- Taux TVA disponibles dans les listes configurables (ajout/suppression)
- Interface de gestion dans "Profil & paramètres" (icône engrenage)
- Données stockées dans `mef2:urssaf_history` et `mef2:tva_config`, incluses dans l'export/import JSON

---

## Améliorations à venir

### Gestion dynamique des années (chantier de fond)

Aujourd'hui l'année est codée en dur (`const YEAR = 2026`). L'app est donc figée sur 2026 : elle ne lit jamais l'année réelle et ne permet pas de naviguer dans l'historique.

Objectif :
- Déduire l'année courante de la date réelle, avec un sélecteur pour changer d'année
- Naviguer dans l'historique des années passées (le stockage des factures par clé `année-mois` le permet déjà par construction)
- Vérifier la cohérence de tous les usages de `YEAR` : échéances, barèmes URSSAF par date d'effet, CFE, projections annuelles, prevYears

Bénéfice clé : une fois fait, le champ CFE pourra récupérer le CA N-2 automatiquement depuis l'historique, au lieu de la saisie manuelle actuelle.

### Navigateur de période amélioré

Le sélecteur de mois en haut (`avril 2026`) ne se déplace qu'avec les flèches, un mois à la fois.

À ajouter :
- Un navigateur plus général (menu déroulant) pour sauter directement à un mois éloigné sans cliquer plusieurs fois
- Un bouton "revenir au mois en cours" pour repartir vite du mois réel
- À traiter en lien avec le chantier des années dynamiques ci-dessus (navigation possible vers d'autres années ou non, à décider)

### Sauvegarde des données utilisateur

Aujourd'hui les données vivent dans le `localStorage` du navigateur (export/import JSON manuel). Risque de perte si l'utilisateur change de navigateur ou vide son cache.

À réfléchir : une solution de sauvegarde plus robuste (synchronisation cloud, base de données, sauvegarde automatique, etc.).

### Aides contextuelles sur les notions fiscales

Ajouter des informations d'aide (infobulles ou encadrés explicatifs) sur les notions qui ne sont pas évidentes pour un débutant : CFE, base déclarée, versement libératoire, TVA à reverser, etc.

### Modèles de factures récurrentes

Permettre d'enregistrer un modèle de facture (client, lignes, montants) pour le réutiliser rapidement chaque mois, sans tout ressaisir.

### Calendrier de paiement

Ajouter un calendrier regroupant tous les prélèvements à venir : TVA, URSSAF, abonnements et autres charges, avec leurs dates d'échéance, pour avoir une vision claire de la trésorerie.

### Décalage réel des paiements — FAIT

Le tableau de bord sépare désormais strictement **deux notions, qui ne se mélangent jamais** :

- **Trésorerie** (ce qui sort vraiment du compte ce mois) : l'URSSAF d'il y a 2 mois, la TVA du mois précédent, les frais réellement débités, la CFE le cas échéant. Ces montants viennent de l'activité passée, déjà provisionnée. Vue purement informative, elle n'entre pas dans le calcul du revenu.
- **Rentabilité** (ce que l'activité du mois rapporte vraiment) : l'URSSAF, la TVA et la CFE générées par le mois courant, plus tous les frais à leur **part mensuelle lissée** (mensuel = montant, trimestriel ÷3, annuel ÷12). Le revenu net raisonnable = CA TTC − ces charges.

Principe de fond : **on ne met jamais dans la même vue la provision d'un mois et le prélèvement d'un mois.** C'est ce mélange qui faussait l'ancien "revenu net" (il déduisait à la fois une provision et un frais réellement payé, et comptait deux fois les frais trimestriels/annuels les mois de prélèvement). Corrigé via la fonction `chargeLisse` et le champ `netLisse` du moteur de calcul.

Les décalages de prélèvement (jour et nombre de mois pour l'URSSAF et la TVA) sont réglables dans "Profil & paramètres".
