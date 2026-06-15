# Tableau-kit — guide de passation (pour Claude Code)

Ce dossier est une **couche de présentation portable** extraite du « Tableau de bord v2 ».
Objectif : **re-styler une application existante** (un seul fichier HTML, plus ses autres pages)
pour qu'elle adopte ce design — **couleurs, typo, infobulles, animations du calendrier, etc.** —
**sans toucher à la logique ni aux données** de l'app.

> ⚠️ Une capture d'écran ne suffit pas : tout l'intérêt (transitions, easings, infobulles,
> jours de calendrier qui s'animent) vit dans le **CSS** et le **JS**. C'est ce que contient ce kit.
> Ouvre **`reference.html`** dans un navigateur : chaque composant y tourne pour de vrai.

---

## 1. Les fichiers

| Fichier | Rôle |
|---|---|
| `tableau-kit.css` | Le design system complet : tokens (couleurs, rayons, ombres), typo et **toutes les classes de composants + animations**. Aucune dépendance. |
| `tableau-kit.js` | Le moteur d'interactions en **vanilla JS** : infobulle de l'histogramme, reliure du menu, toggle, calendrier, donut, barre « où part mon argent ». Zéro framework. |
| `reference.html` | **Galerie vivante** : tous les composants câblés avec des données d'exemple. Sert de catalogue ET de source à copier-coller. |
| `GUIDE.md` | Ce document. |

### Chargement (dans le `<head>` puis fin de `<body>`)
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="tableau-kit.css">
<!-- … ton app … -->
<script src="tableau-kit.js"></script>
```
Puis **enveloppe ton application** dans le scope du design :
```html
<div class="tk" data-accent="citron">
  … toute ton app ici …
</div>
```

---

## 2. Codes couleurs (à respecter)

Tous définis comme variables CSS dans `tableau-kit.css` (`:root`). **Utilise les `var(--…)`**, ne
recode pas les hex en dur.

### Palette de base
| Token | Hex | Usage |
|---|---|---|
| `--accent` | **`#ECFF8C`** | Citron — couleur active, highlights, « ce qui te reste » |
| `--accent-ink` | **`#2D2B1E`** | Texte/icône **posé sur** le citron |
| `--accent-soft` | `#F4FFC6` | Citron très clair |
| `--canvas` | `#F3F3EF` | Fond de page |
| `--paper` | `#FFFFFF` | Fond des cartes |
| `--blue` | `#D0ECE7` | Bleu/vert d'eau — cartes secondaires (Charges) |
| `--blue-ink` | `#1D3F3B` | Texte sur le bleu |
| `--grey` | `#EAECE9` | Gris neutre — pistes de barres, fonds doux |
| `--dark` | `#2D2B1E` | Sombre — fond des **infobulles** |
| `--ink` | `#2D2B1E` | Texte principal |
| `--ink-soft` | `#6F6D5E` | Texte secondaire |
| `--ink-faint` | `#A3A194` | Texte tertiaire / labels |
| `--on-dark` | `#F0EFE6` | Texte clair sur fond sombre (infobulles) |

### Sémantique hausse / baisse
| Token | Hex | |
|---|---|---|
| `--pos-bg` / `--pos-ink` | `#D9EFD9` / `#2F7D46` | Badge **positif** (vert) |
| `--neg-bg` / `--neg-ink` | `#F4DBE1` / `#B04A60` | Badge **négatif** (rose) |

### Catégories financières (segments, donut) — **schéma à 4 couleurs voulu**
| Catégorie | Token | Hex | Rendu |
|---|---|---|---|
| Ce qui reste / revenu | `--seg-poche` | **`#ECFF8C`** (= accent) | **Citron** |
| TVA | `--seg-tva` | **`#FFFFFF`** | **Blanc** (cerclé pour rester visible — classe `spend-seg--outline`) |
| URSSAF | `--seg-urssaf` | **`#80C8C0`** | **Turquoise pastel** |
| Frais (inclut les achats) | `--seg-frais` | **`#D4D6CF`** | **Gris** |
| Charges (arc du donut) | `--charge-blue` | `#5CB7B0` | Turquoise |

> Note : les anciennes catégories « TVA jaune » et « Achats » ont été retirées. **Achats est
> fusionné dans Frais**, et la TVA est passée en **blanc**. Garde ce schéma sobre : ne ré-introduis
> pas de nouvelles teintes.

### Thèmes (`data-accent` sur `.tk`)
- `citron` (défaut) · `bleu` (`--accent #BBE4DD`) · `ardoise` (`--accent #2D2B1E`, accent-ink citron).

---

## 3. Typographie, rayons, ombres

- **Polices** : `Space Grotesk` (titres `h1/h2/h3` + chiffres `.num`) · `Onest` (texte courant).
- **Chiffres** : ajoute la classe `num` → `font-variant-numeric: tabular-nums` (chiffres alignés).
- **Rayons** : `--r-card: 24px` (cartes) · `--r-inner: 16px` (blocs internes) · `--r-pill: 999px`.
- **Ombres** : `--shadow` (cartes claires) · `--shadow-dark` (infobulles sombres).
- **Échelle** : H1 ~27px, valeur KPI 40–46px, label 13px majuscules, corps 15px.

---

## 4. Catalogue des composants

Le markup exact de chacun est dans **`reference.html`** (copie-colle depuis là). Résumé :

| Composant | Classe racine | Câblage JS |
|---|---|---|
| Carte KPI (citron / bleu / claire) | `.kpi .kpi--ca / --dep / --net` | — (statique) |
| Donut charges vs reste | `[data-tk-donut]` | `Tableau.renderDonut(el, {pct, label})` |
| Menu latéral à reliure | `.nav[data-tk-nav]` + `.nav-spine` | auto / `Tableau.initNav(el)` |
| Barre « où part mon argent » | `.spend` + `.spend-bar[data-tk-spendbar]` | auto / `Tableau.initSpendBar(el)` |
| Histogramme annuel + infobulle | `[data-tk-histogram]` | `Tableau.renderHistogram(el, {data, cats})` |
| Barres horizontales (bilan) | `.flow .flow-row` | — (statique, largeur en %) |
| Carte sombre + toggle | `.darkcard` + `.seg[data-tk-seg]` | auto / `Tableau.initSeg(el)` |
| Calendrier prélèvements | `[data-tk-calendar]` | `Tableau.renderCalendar(el, {months})` |
| Badge ▲/▼ | `.badge .badge--pos / --neg` | — |

### Deux façons de câbler
1. **Auto** — ajoute l'attribut `data-tk-*` (+ un `<script type="application/json">` pour les données),
   le kit s'initialise tout seul au chargement. C'est ce que fait `reference.html`.
2. **Manuel** — appelle `Tableau.renderHistogram(monEl, {…})` etc. avec tes propres données.

Exemple histogramme (garde **tes** chiffres, adopte le style) :
```js
Tableau.renderHistogram(document.querySelector('#mon-graphe'), {
  cats: [
    { key:'poche',  cls:'poche',  lbl:'Ma poche' },
    { key:'urssaf', cls:'urssaf', lbl:'URSSAF' },
    { key:'frais',  cls:'frais',  lbl:'Frais' }
  ],
  data: [
    { label:'Jan', ht:4100, segs:{ poche:2640, urssaf:870, frais:590 } },
    { label:'Fév', ht:4400, segs:{ poche:2867, urssaf:933, frais:600 } },
    { label:'Juil' } /* mois futur = barre hachurée */
  ]
});
```

---

## 5. Catalogue des ANIMATIONS (ce que le screenshot ne montre pas)

| Où | Effet | Implémentation |
|---|---|---|
| **Infobulle histogramme** | apparition en fondu, flèche orientée selon la position de la barre | `@keyframes tipIn` + classes `.annual-tip--left/center/right` (CSS) |
| Histogramme (survol) | les barres voisines s'estompent (opacité 0.28) | `[data-on]` sur le plot + `[data-hot]` sur la barre active (CSS) |
| **Menu latéral** | la reliure citron **glisse** vers l'onglet actif | `.nav-spine { transition: top/height .26s cubic-bezier(.4,.8,.3,1) }` ; position calculée en JS (`initNav`) |
| Onglet actif | se décale à gauche pour rejoindre la reliure | `.nav-item.active { margin-left:-14px }` + transition |
| **Toggle Entrées/Sorties** | le curseur **coulisse** d'un côté à l'autre | `.seg-thumb { transition: transform .22s cubic-bezier(.3,.7,.4,1) }`, piloté par `[data-i]` |
| **Calendrier — survol** | le jour se **soulève** | `.cal-day:hover { transform: translateY(-2px) }` |
| **Calendrier — sélection** | le jour sélectionné **grandit** (78→88px) en citron | `.cal-day.selected { height:88px }` + transition |
| Calendrier — pastilles | la pastille active s'**allonge** en barre | `.cal-dots i.on { width:18px }` + transition |
| **Barre « où part mon argent »** | au survol, le segment **monte** + ombre ; les autres pâlissent | `.spend-seg[data-active]{ transform:translateY(-3px) }` + `[data-on]` (CSS), état piloté par `initSpendBar` |
| Remplissage des barres | largeur animée | `.flow-fill / .net-bar-fill { transition: width .5s cubic-bezier(.3,.7,.4,1) }` |

**Important** : pour que ça respire correctement, le JS ne fait que poser/retirer des classes et
attributs (`data-active`, `data-on`, `data-hot`, `data-i`, `.selected`, `.active`). **Toute l'animation
elle-même est en CSS** → tu peux la conserver intacte même si tu changes de framework.

---

## 6. Comment l'appliquer à ton app (procédure)

1. **Charge** `tableau-kit.css` + `tableau-kit.js` et enveloppe l'app dans `<div class="tk" data-accent="citron">`.
2. **Couleurs** : remplace les couleurs en dur de l'app par les `var(--…)` du tableau §2.
3. **Cartes & blocs** : ré-habille les conteneurs existants avec `.panel`, `.kpi`, `.darkcard`, `.calcard`…
   (mêmes données, nouvelle coquille). Copie le markup depuis `reference.html`.
4. **Graphiques** : tu **gardes tes données** mais adoptes le style v2 →
   - barres empilées → `Tableau.renderHistogram(...)` ;
   - donut → `Tableau.renderDonut(...)` ;
   - barres horizontales → markup `.flow` avec `width` en % ;
   - répartition → bloc `.spend` (`renderSpendBar` / auto).
   Si tu as d'autres types de graphes, reprends seulement **les couleurs** (`--seg-*`), le **style
   d'infobulle** (`.annual-tip…`) et les **rayons/ombres** ; garde ta logique de rendu.
5. **Pages secondaires** : même `.tk` wrapper, mêmes classes `.panel` / `.nav` ; le menu (`initNav`)
   gère l'onglet actif.
6. **Vérifie dans le navigateur** que les survols/clics animent bien (compare à `reference.html`).

### À NE PAS faire
- Ne réintroduis pas de couleurs hors palette (pas de nouveau jaune, pas de dégradés décoratifs).
- Ne transforme pas les infobulles claires — elles doivent rester **sombres** (`--dark` / `--on-dark`).
- Ne supprime pas les `transition`/`@keyframes` du CSS : ce sont elles, les « petites animations ».

---

Des questions sur un composant précis ? Tout est démontré, câblé et commenté dans **`reference.html`**
et dans l'en-tête de chaque fichier source.
