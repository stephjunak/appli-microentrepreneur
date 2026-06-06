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
- **Factures** : saisie multi-lignes par catégorie (BNC, BIC, vente), support TVA
- **Frais** : charges récurrentes (mensuelles, trimestrielles, ponctuelles) avec historique de tarifs
- **À provisionner** : cotisations URSSAF, TVA à reverser, provisions frais, CFE

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

## Estimateur de CFE

- Calculateur dépliable dans l'onglet "Charges et provisions", section CFE
- Hypothèse : travail à domicile, sans local professionnel (base minimum). Avec un local, saisie manuelle du montant
- Saisie du CA de référence N-2 et du taux communal (défaut 26 %, moyenne nationale)
- Applique le barème 2026 de la base minimum (7 tranches), retient le haut de fourchette pour une provision prudente, et affiche la fourchette complète
- Exonération automatique si CA N-2 inférieur à 5 000 €
- Bouton "Utiliser cette estimation" qui remplit le montant et déclenche la provision mensuelle

---

## Améliorations à venir

### Gestion dynamique des années (chantier de fond)

Aujourd'hui l'année est codée en dur (`const YEAR = 2026`). L'app est donc figée sur 2026 : elle ne lit jamais l'année réelle et ne permet pas de naviguer dans l'historique.

Objectif :
- Déduire l'année courante de la date réelle, avec un sélecteur pour changer d'année
- Naviguer dans l'historique des années passées (le stockage des factures par clé `année-mois` le permet déjà par construction)
- Vérifier la cohérence de tous les usages de `YEAR` : échéances, barèmes URSSAF par date d'effet, CFE, projections annuelles, prevYears

Bénéfice clé : une fois fait, l'estimateur de CFE pourra récupérer le CA N-2 automatiquement depuis l'historique, au lieu de la saisie manuelle actuelle.
