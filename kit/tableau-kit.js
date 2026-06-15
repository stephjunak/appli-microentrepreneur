/* ╔══════════════════════════════════════════════════════════════════════════╗
   ║  TABLEAU-KIT.JS — Moteur d'interactions « Tableau de bord »                ║
   ║                                                                            ║
   ║  Vanilla JS, zéro dépendance. C'est ICI que vivent les animations que     ║
   ║  l'on ne voit PAS sur une capture d'écran :                                ║
   ║    • infobulle de l'histogramme (apparition en fondu + barres estompées)  ║
   ║    • reliure « spine » du menu qui glisse vers l'onglet actif             ║
   ║    • toggle Entrées/Sorties dont le curseur coulisse                       ║
   ║    • jour de calendrier qui se soulève / grandit à la sélection           ║
   ║    • barre « où part mon argent » : survol → segment mis en avant         ║
   ║                                                                            ║
   ║  Deux façons de l'utiliser :                                              ║
   ║   1. AUTO  — ajoute un attribut data-tk-* sur ton markup, le kit s'auto-  ║
   ║              câble au chargement (voir GUIDE.md pour le markup attendu).   ║
   ║   2. MANUEL — appelle Tableau.renderHistogram(el, data), etc.             ║
   ╚══════════════════════════════════════════════════════════════════════════╝ */
(function () {
  'use strict';

  /* ── formatage € à la française : 3 095 € · −1 080 € ───────────────────── */
  var NBSP = '\u202f'; // fine insécable
  function eur(n) {
    var s = Math.round(Math.abs(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
    return (n < 0 ? '\u2212' : '') + s + NBSP + '€';
  }
  function pct(part, whole) { return Math.round(part / whole * 100); }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ════════════════════════════════════════════════════════════════════════
     1. MENU LATÉRAL — reliure « spine » citron qui glisse vers l'onglet actif
     Markup attendu :
       <nav class="nav" data-tk-nav>
         <span class="nav-spine"></span>
         <button class="nav-item active">…</button>
         <button class="nav-item">…</button>
       </nav>
     ════════════════════════════════════════════════════════════════════════ */
  function initNav(nav) {
    var spine = nav.querySelector('.nav-spine');
    function place() {
      var act = nav.querySelector('.nav-item.active');
      if (!spine || !act) return;
      var top = act.offsetTop;
      spine.style.top = top + 'px';
      spine.style.height = Math.max(0, nav.clientHeight - top) + 'px';
    }
    nav.querySelectorAll('.nav-item').forEach(function (item) {
      item.addEventListener('click', function () {
        nav.querySelectorAll('.nav-item').forEach(function (b) { b.classList.remove('active'); });
        item.classList.add('active');
        place();
      });
    });
    // z-index : l'actif passe devant, sinon empilement décroissant
    var items = [].slice.call(nav.querySelectorAll('.nav-item'));
    items.forEach(function (it, i) { it.style.zIndex = it.classList.contains('active') ? 50 : items.length - i; });
    nav.addEventListener('click', function () {
      items.forEach(function (it, i) { it.style.zIndex = it.classList.contains('active') ? 50 : items.length - i; });
    });
    place();
    window.addEventListener('resize', place);
  }

  /* ════════════════════════════════════════════════════════════════════════
     2. TOGGLE segmenté (Entrées / Sorties) — le curseur coulisse
     Markup attendu :
       <div class="seg" data-tk-seg data-i="0">
         <span class="seg-thumb"></span>
         <button class="on">ENTRÉES</button>
         <button>SORTIES</button>
       </div>
     Émet un CustomEvent 'tk:toggle' (detail = index) sur l'élément.
     ════════════════════════════════════════════════════════════════════════ */
  function initSeg(seg) {
    var btns = [].slice.call(seg.querySelectorAll('button'));
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        seg.setAttribute('data-i', i);
        btns.forEach(function (x, j) { x.classList.toggle('on', i === j); });
        seg.dispatchEvent(new CustomEvent('tk:toggle', { detail: i, bubbles: true }));
      });
    });
  }

  /* ════════════════════════════════════════════════════════════════════════
     3. BARRE « OÙ PART MON ARGENT » — survol d'un segment/chip → mise en avant
     Markup attendu (chaque élément interactif porte data-key) :
       <div class="spend">
         <div class="spend-bar" data-tk-spendbar>
           <button class="spend-seg" data-key="tva" style="flex:1080">17%</button> …
         </div>
         <div class="spend-legend">
           <button class="spend-chip" data-key="tva"><i class="spend-dot"></i>TVA</button> …
         </div>
         <div class="spend-detail" data-tk-detail>… (rempli par le kit, voir GUIDE) …</div>
       </div>
     Le détail est piloté par un dictionnaire data-tk-info (JSON inline).
     ════════════════════════════════════════════════════════════════════════ */
  function initSpendBar(bar) {
    var spend = bar.closest('.spend') || bar.parentElement;
    var info = readJSON(spend.querySelector('script[type="application/json"]')) || {};
    var detail = spend.querySelector('[data-tk-detail], .spend-detail');
    var targets = [].slice.call(spend.querySelectorAll('[data-key]'));
    var defaultKey = bar.getAttribute('data-default') ||
      (targets[targets.length - 1] && targets[targets.length - 1].getAttribute('data-key'));

    function paint(key) {
      var on = key && key !== defaultKey;
      bar.toggleAttribute('data-on', !!on);
      targets.forEach(function (t) { t.toggleAttribute('data-active', t.getAttribute('data-key') === key); });
      var d = info[key];
      if (detail && d) {
        detail.innerHTML =
          '<i class="spend-detail-dot" style="background:var(--seg-' + key + ')"></i>' +
          '<div class="spend-detail-main"><span class="spend-detail-name">' + d.name + '</span>' +
          '<span class="spend-detail-note">' + (d.note || '') + '</span></div>' +
          '<div class="spend-detail-num"><span class="num spend-detail-val">' +
          (d.out ? '\u2212' : '') + eur(d.val) + '</span>' +
          '<span class="spend-detail-pct">' + (d.pct != null ? d.pct : '') + '\u00a0% du TTC</span></div>';
      }
    }
    targets.forEach(function (t) {
      t.addEventListener('mouseenter', function () { paint(t.getAttribute('data-key')); });
    });
    spend.addEventListener('mouseleave', function () { paint(defaultKey); });
    paint(defaultKey);
  }

  /* ════════════════════════════════════════════════════════════════════════
     4. HISTOGRAMME ANNUEL — barres empilées + infobulle sombre au survol
     Usage : Tableau.renderHistogram(mountEl, { data, cats, max })
       data : [{ label:'Jan', ht:4100, segs:{poche:2200,urssaf:870,frais:590}, future:false }, …]
       cats : [{ key:'poche', cls:'poche', lbl:'Ma poche' }, …]  (ordre bas→haut)
     Animations : .annual-tip apparaît en fondu (CSS tipIn) ; les barres voisines
     s'estompent via [data-on] / [data-hot] (CSS). Tout le visuel est dans le CSS.
     ════════════════════════════════════════════════════════════════════════ */
  function renderHistogram(mount, opts) {
    var data = opts.data, cats = opts.cats;
    var PLOT_H = opts.plotHeight || 248, PAD_B = 34, INNER = PLOT_H - PAD_B;
    var max = opts.max || Math.max.apply(null, data.map(function (d) { return d.ht || 0; })) * 1.12;
    mount.classList.add('annual');
    mount.innerHTML = '';

    var plot = el('div', 'annual-plot');
    [0.25, 0.5, 0.75, 1].forEach(function (g) {
      var grid = el('div', 'annual-grid'); grid.style.bottom = (PAD_B + g * INNER) + 'px'; plot.appendChild(grid);
    });

    data.forEach(function (mm, i) {
      var col = el('div', 'annual-col');
      var barH = mm.ht != null ? mm.ht / max * INNER : 22;
      var align = i <= 1 ? 'left' : i >= data.length - 2 ? 'right' : 'center';

      if (mm.ht != null) {
        var abar = el('div', 'abar');
        cats.forEach(function (c) {
          var seg = el('div', 'aseg aseg--' + c.cls);
          seg.style.height = ((mm.segs[c.key] || 0) / max * INNER) + 'px';
          abar.appendChild(seg);
        });
        col.appendChild(abar);

        var tip = el('div', 'annual-tip annual-tip--' + align);
        tip.style.bottom = (barH + 12) + 'px';
        var rows = cats.map(function (c) {
          return '<div class="annual-tip-row"><span><i class="bk bk--' + c.cls + '"></i>' + c.lbl +
            '</span><span class="num">' + eur(mm.segs[c.key] || 0) + '</span></div>';
        }).join('');
        tip.innerHTML =
          '<div class="annual-tip-head"><span class="annual-tip-month">' + mm.label + '</span>' +
          '<span class="num annual-tip-ht">' + eur(mm.ht) + '<span class="annual-tip-ht-lbl"> HT</span></span></div>' +
          '<div class="annual-tip-rows">' + rows + '</div>';
        tip.style.display = 'none';
        col.appendChild(tip);

        col.addEventListener('mouseenter', function () {
          plot.setAttribute('data-on', '');
          abar.setAttribute('data-hot', '');
          tip.style.display = '';
        });
        col.addEventListener('mouseleave', function () {
          abar.removeAttribute('data-hot');
          tip.style.display = 'none';
        });
      } else {
        var fut = el('div', 'abar abar--future');
        var seg2 = el('div', 'aseg'); seg2.style.height = '22px'; fut.appendChild(seg2);
        col.appendChild(fut);
      }
      col.appendChild(el('div', 'annual-x', mm.label));
      plot.appendChild(col);
    });
    plot.addEventListener('mouseleave', function () { plot.removeAttribute('data-on'); });
    mount.appendChild(plot);

    if (opts.legend !== false) {
      var lg = el('div', 'chart-legend',
        cats.map(function (c) { return '<span class="lg"><i class="bk bk--' + c.cls + '"></i>' + c.lbl + '</span>'; }).join(''));
      mount.appendChild(lg);
    }
  }

  /* ════════════════════════════════════════════════════════════════════════
     5. DONUT — deux segments (charges vs reste), % au centre
     Usage : Tableau.renderDonut(mountEl, { pct:52, label:'de charges' })
     ════════════════════════════════════════════════════════════════════════ */
  function renderDonut(mount, opts) {
    var p = opts.pct, size = opts.size || 124, stroke = opts.stroke || 19;
    var r = (size - stroke) / 2, c = 2 * Math.PI * r, charge = c * p / 100;
    mount.classList.add('donut-wrap');
    mount.innerHTML =
      '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" style="stroke:var(--accent)"/>' +
      '<circle cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + stroke + '" ' +
      'style="stroke:var(--charge-blue)" stroke-dasharray="' + charge + ' ' + (c - charge) + '" ' +
      'transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/></svg>' +
      '<div class="donut-center"><span class="num donut-pct">' + p + '\u00a0%</span>' +
      '<span class="donut-lbl">' + (opts.label || '') + '</span></div>';
  }

  /* ════════════════════════════════════════════════════════════════════════
     6. CALENDRIER — strip de jours, sélection qui grandit, pastilles animées
     Usage : Tableau.renderCalendar(mountEl, { months })
       months : [{ key, label:'Juin 2026', daysInMonth:30, firstDow:0,
                   events:{ 12:{name:'Achats', val:520} }, focus:12 }]
     firstDow : jour de la semaine du 1er (0 = lundi … 6 = dimanche)
     ════════════════════════════════════════════════════════════════════════ */
  var DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  function renderCalendar(mount, opts) {
    var months = opts.months, mi = 0, sel;
    mount.classList.add('calcard');

    // Coquille construite UNE fois : en-tête, strip, détail, pastilles.
    var monthBtn = el('button', 'cal-month');
    var menu = el('div', 'cal-menu');
    menu.appendChild(monthBtn);
    var head = el('div', 'cal-head');
    head.innerHTML =
      '<div class="cal-head-left"><span class="logo-mark" style="width:30px;height:30px;border-radius:9px">' +
      ICON_CAL + '</span><span class="cal-title">' + (opts.title || 'Prochain prélèvement') + '</span></div>';
    head.appendChild(menu);
    var strip = el('div', 'cal-strip');
    var detail = el('div', 'cal-detail');
    var dots = el('div', 'cal-dots');
    mount.appendChild(head);
    mount.appendChild(strip);
    mount.appendChild(detail);
    mount.appendChild(dots);

    monthBtn.addEventListener('click', function () {
      var pop = menu.querySelector('.cal-pop');
      if (pop) { pop.remove(); return; }
      pop = el('div', 'cal-pop');
      months.forEach(function (m, i) {
        var b = el('button', i === mi ? 'on' : '', m.label);
        b.addEventListener('click', function () { pop.remove(); buildMonth(i); });
        pop.appendChild(b);
      });
      menu.appendChild(pop);
    });

    // MAJ de la sélection EN PLACE — aucune reconstruction, aucun scroll forcé.
    function select(day) {
      sel = day;
      var month = months[mi];
      strip.querySelectorAll('.cal-day').forEach(function (b) {
        b.classList.toggle('selected', Number(b.dataset.day) === day);
      });
      var ev = month.events[day];
      detail.innerHTML = ev
        ? '<div class="cal-detail-main"><span class="cal-detail-day">' + day + ' ' + month.label.split(' ')[0] +
          '</span><span class="cal-detail-name">' + ev.name + '</span></div>' +
          '<span class="num cal-detail-val">\u2212' + eur(ev.val) + '</span>'
        : '<span class="cal-detail-empty">Aucun prélèvement ce jour-là.</span>';
      dots.querySelectorAll('i').forEach(function (d) {
        d.classList.toggle('on', Number(d.dataset.day) === day);
      });
    }

    // Reconstruit le strip + les pastilles UNIQUEMENT au changement de mois.
    function buildMonth(i) {
      mi = i;
      var month = months[mi];
      sel = month.focus;
      monthBtn.innerHTML = month.label + ICON_CHEV;

      strip.innerHTML = '';
      for (var d = 1; d <= month.daysInMonth; d++) {
        (function (day) {
          var ev = month.events[day];
          var b = el('button', 'cal-day' + (ev ? ' has-event' : ''));
          b.dataset.day = day;
          b.innerHTML = '<span class="cal-day-dow">' + DOW[(month.firstDow + day - 1) % 7] +
            '</span><span class="cal-day-num">' + day + '</span><span class="cal-day-dot"></span>';
          b.addEventListener('click', function () { select(day); });
          strip.appendChild(b);
        })(d);
      }

      dots.innerHTML = '';
      Object.keys(month.events).map(Number).sort(function (a, b) { return a - b; }).forEach(function (d) {
        var i = el('i'); i.dataset.day = d; dots.appendChild(i);
      });

      strip.scrollLeft = 0; // strip neuf : on repart du début (instantané)
      select(month.focus);
    }

    buildMonth(0);
  }

  var ICON_CAL = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  var ICON_CHEV = '<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>';

  function readJSON(node) { try { return node ? JSON.parse(node.textContent) : null; } catch (e) { return null; } }

  /* ── AUTO-INIT : câble tout ce qui porte un attribut data-tk-* ──────────── */
  function init(root) {
    root = root || document;
    root.querySelectorAll('[data-tk-nav]').forEach(initNav);
    root.querySelectorAll('[data-tk-seg]').forEach(initSeg);
    root.querySelectorAll('[data-tk-spendbar]').forEach(initSpendBar);
    root.querySelectorAll('[data-tk-donut]').forEach(function (m) { renderDonut(m, readJSON(m.querySelector('script')) || {}); });
    root.querySelectorAll('[data-tk-histogram]').forEach(function (m) { var o = readJSON(m.querySelector('script')); if (o) renderHistogram(m, o); });
    root.querySelectorAll('[data-tk-calendar]').forEach(function (m) { var o = readJSON(m.querySelector('script')); if (o) renderCalendar(m, o); });
  }

  window.Tableau = {
    eur: eur, pct: pct,
    initNav: initNav, initSeg: initSeg, initSpendBar: initSpendBar,
    renderHistogram: renderHistogram, renderDonut: renderDonut, renderCalendar: renderCalendar,
    init: init
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { init(); });
  else init();
})();
