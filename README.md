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

- **Tableau de bord** : 3 KPIs (CA, Charges payées, Revenu net), KPI factures en attente + carte repliable Revenus à venir, carte Provision, cascade Trésorerie, camembert Mois/Année, synthèse annuelle.
- **Factures** : saisie en fenêtre modale, lignes multiples par catégorie (BNC, BIC, vente), support TVA, statut payé / en attente avec date de paiement.
- **Prévisionnel** : revenus à venir (ponctuels ou mensuels récurrents) non encore facturés, conversion en facture en attente, suivi des factures émises non payées.
- **Frais et achats** : charges récurrentes (mensuelles, trimestrielles, ponctuelles) et achats ponctuels, avec historique de tarifs.
- **Impôts & déclarations mensuelles** : cotisations URSSAF (+ CA à déclarer), TVA nette à reverser, CFE, déclaration IR.
- **Calendrier** : tous les prélèvements du mois ou de l'année (URSSAF, TVA, CFE, charges), avec vue mensuelle en grille et vue annuelle en liste.

### Tableau de bord

Organisé en trois blocs :

- **3 KPIs principaux** : CA TTC encaissé · Charges & achats payés ce mois (URSSAF m-2 + TVA m-1 + frais + achats + CFE) · Revenu net (CA − tout ce qui est sorti du compte).
- **Revenus en attente / à venir** (bande ambrée séparée) : KPI cumulé des factures émises non payées, dépliable sur le prévisionnel du mois suivant. Clairement marqué « n'entre pas dans tes chiffres » : aucune influence sur le CA, l'URSSAF ou la trésorerie.
- **Provision à mettre de côté** (fond ambré, visuellement séparé) : total à provisionner avec le détail par poste (URSSAF, TVA, frais & achats, CFE) et les dates d'échéance.
- **Trésorerie + Camembert** (deux colonnes) :
  - À gauche : cascade détaillée (CA TTC → URSSAF m-2 → TVA m-1 → CFE → Frais récurrents → Achats ponctuels = Revenu net), puis bloc **Trésorerie disponible** = solde de début de mois (saisi par l'utilisateur) + revenu net du mois, avec verdict en couleur.
  - À droite : camembert de répartition avec toggle **Mois / Année**. En mode Mois : valeurs réellement payées ce mois. En mode Année : provisions cumulées depuis janvier.
- **Synthèse annuelle** : chiffres cumulés (CA, TVA, URSSAF, frais & achats, CFE, revenu net cumulé), projection annuelle avec écart N-1, et histogramme du revenu net (vue par mois ou par année).

### Factures

- **Création / modification en fenêtre modale** : le bouton "Nouvelle facture" ouvre une fenêtre ; rien n'est enregistré tant qu'on n'a pas cliqué sur "Valider" (plus de cartes vides). "Valider" est actif dès qu'une date est saisie.
- **Cartes en lecture seule** dans la liste, avec un bouton crayon (modifier, rouvre la modale pré-remplie) et un bouton corbeille (supprimer).
- **Déplacement automatique** : si on change la date d'une facture vers un autre mois, elle se range dans le bon mois (stockage par clé `année-mois`).
- **Statut de paiement** : chaque facture est *payée* ou *en attente*. Une facture en attente n'entre pas dans le CA encaissé ni dans l'URSSAF tant qu'elle n'est pas marquée payée. La carte affiche un badge (vert *Payée* / orange *En attente de paiement*) et un bouton *Marquer payée*. Une *date de paiement* distincte de la date d'édition est renseignée au paiement.
- **Synthèse du mois** en haut de l'onglet : TTC encaissé, plus une ligne *En attente* le cas échéant.

### Prévisionnel

Anticiper des revenus futurs que les logiciels comptables ne permettent pas d'enregistrer, sans fausser les vrais chiffres.

- **Revenus prévisionnels** : saisie de revenus supposés non encore facturés, *ponctuels* (ex. solde d'une prestation à 4 mois) ou *mensuels récurrents* (client régulier), avec une date supposée de paiement. Aucun détail URSSAF, on raisonne en montants bruts.
- **Convertir en facture** : transforme une prévision en *facture en attente* (sans date de paiement, la date supposée est abandonnée). Une prévision ponctuelle disparaît ; une mensuelle est conservée pour les mois suivants.
- **Factures en attente de paiement** : liste des factures émises non payées (tous mois), avec bouton *Marquer payée*.
- Données stockées dans `mef2:previsions`, incluses dans l'export/import JSON.

### Onglet Impôts & déclarations mensuelles

- **Cotisations URSSAF** : détail des cotisations par catégorie + le bloc **"CA à déclarer à l'URSSAF"** (CA par catégorie arrondi à l'euro comme sur le formulaire, et total).
- **TVA nette à reverser** : TVA collectée − TVA déductible.
- **CFE** : voir ci-dessous.
- **Impôt sur le revenu** : affiche le **CA HT cumulé sur l'année** à reporter sur la déclaration de revenus, avec une note d'aide adaptée au profil (versement libératoire ou abattement forfaitaire).
- Un bandeau "Total à mettre de côté ce mois" (URSSAF + TVA + CFE). Les provisions de frais n'apparaissent plus ici (elles sont gérées dans la carte Rentabilité du tableau de bord).

### CFE — Cotisation Foncière des Entreprises

- Saisie du montant annuel estimé directement dans l'onglet "Impôts & déclarations mensuelles"
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

## Fait récemment

- **Factures en attente + revenus prévisionnels** : statut payé/en attente sur les factures (le CA et l'URSSAF ne comptent que les factures payées), date de paiement distincte, nouvel onglet Prévisionnel (revenus à venir + conversion en facture en attente), et sur le tableau de bord un KPI factures en attente + carte repliable du prévisionnel du mois suivant.
- **Onglet Calendrier** (nouvel onglet, dernier de la barre) : regroupe tous les prélèvements — URSSAF, TVA, CFE et charges récurrentes — avec leurs dates exactes. Vue mensuelle en grille (même structure que le calendrier des frais) et vue annuelle en cartes fixes avec scroll interne. Le calendrier a été retiré de l'onglet "Frais et achats" qui affiche désormais uniquement le tableau.
- **Refonte complète du tableau de bord** : 3 KPIs clairs (CA, Charges payées, Revenu net) + carte Provision séparée (fond ambré) + bloc Trésorerie avec cascade détaillée + camembert avec toggle Mois/Année.
- **Revenu net redéfini** : CA TTC − tout ce qui sort réellement du compte ce mois (URSSAF m-2, TVA m-1, frais récurrents, achats ponctuels, CFE).
- **Trésorerie disponible** = solde de début de mois + revenu net du mois.
- Sessions précédentes : moteur de calcul `chargeLisse`/`netLisse`, onglets renommés, déclarations regroupées dans "Impôts & déclarations mensuelles".

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

_Partiellement fait :_ phrases explicatives sur les cartes Trésorerie et Rentabilité, et note d'aide sur l'impôt sur le revenu (versement libératoire / abattement). Reste à couvrir les autres notions.

### Modèles de factures récurrentes

Permettre d'enregistrer un modèle de facture (client, lignes, montants) pour le réutiliser rapidement chaque mois, sans tout ressaisir.

### Logique de calcul — FAIT

**Revenu net** = CA TTC encaissé − URSSAF (m-2) − TVA (m-1) − CFE − frais récurrents débités ce mois − achats ponctuels. C'est ce qui reste sur le compte après toutes les sorties réelles du mois.

**Trésorerie disponible** = solde du compte au 1er du mois (saisi par l'utilisateur) + revenu net du mois.

**Provisions** (carte ambrée, séparée) = URSSAF + TVA + frais lissés + CFE du mois en cours, avec dates d'échéance. Ce sont les montants à mettre de côté maintenant pour les prélèvements futurs.

Les décalages de prélèvement (jour et nombre de mois pour l'URSSAF et la TVA) sont réglables dans "Profil & paramètres".
