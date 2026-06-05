# Appli Micro-Entrepreneur

Web app de gestion des revenus pour micro-entrepreneurs et freelances.

## Objectif

Permettre à un micro-entrepreneur de suivre ses revenus, déduire les charges (URSSAF, frais professionnels, etc.) et avoir une vision claire de son net réel.

## Statut

En cours de développement.

## Fichiers

- `index.html` — application principale

---

## Corrections et améliorations à venir

### Bugs connus

- **Onglet Frais > Calendrier** : le calendrier ne fonctionne plus depuis la refonte en catégories.

### Améliorations prévues

#### Onglet Frais
- Camembert de répartition des charges mensuelles par catégorie.

#### Onglet Tableau de bord
- Synthèse annuelle : ajouter la colonne CA HT.
- Histogramme : proposer un affichage par année (en plus du mois en cours).

#### Onglet Charges & Provisions
- Assistance à la déclaration URSSAF (récapitulatif prêt à remplir).

### Gros chantiers

- **Déclaration URSSAF** : gérer le calcul par chiffre arrondi, gérer les éventuels changements de taux.
- **CFE** : intégrer la Cotisation Foncière des Entreprises.
- **TVA déductible** : gérer la TVA déductible sur les achats, afficher le détail dans l'onglet Charges & Provisions.
- **Changements de taux** : gérer les modifications de taux URSSAF et TVA dans le temps (historique).
