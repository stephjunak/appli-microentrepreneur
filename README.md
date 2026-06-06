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

## Améliorations à venir
