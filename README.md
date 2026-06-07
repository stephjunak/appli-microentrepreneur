# Appli Micro-Entrepreneur

Web app de gestion des revenus pour micro-entrepreneurs et freelances.

## Objectif

Permettre à un micro-entrepreneur de suivre ses revenus, déduire les charges (URSSAF, frais professionnels, etc.) et avoir une vision claire de son net réel.

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

### Décalage réel des paiements (gros chantier)

Sur le tableau de bord, distinguer clairement deux choses aujourd'hui mélangées :
- **Ce qu'on paie réellement ce mois-ci** : la TVA du mois précédent et l'URSSAF d'il y a 2 mois (les cotisations sont décalées dans le temps)
- **Les provisions à constituer** : la TVA et l'URSSAF des mois à venir, qu'on met de côté mais qu'on ne paie pas encore

Objectif : ne plus confondre "à provisionner pour plus tard" et "à décaisser maintenant".
