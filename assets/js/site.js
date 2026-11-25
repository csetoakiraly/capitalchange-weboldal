/* Zero Change – weboldal szkript (külső könyvtár nélkül) */
(function () {
  'use strict';
  var D = window.ZC_I18N || {};
  var LANGS = {
    hu: { name: 'Magyar', short: 'HU', flag: 'flag-hu', locale: 'hu-HU' },
    en: { name: 'English', short: 'EN', flag: 'flag-gb', locale: 'en-GB' },
    de: { name: 'Deutsch', short: 'DE', flag: 'flag-de', locale: 'de-DE' }
  };
  var TZ = 'Europe/Budapest';
  var lang = 'hu';

  /* ---------- segédfüggvények ---------- */
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function t(key) { var d = D[lang] || D.hu || {}; return d[key] != null ? d[key] : ((D.hu || {})[key] || ''); }
  function fill(s, o) { return String(s).replace(/\{(\w+)\}/g, function (_, k) { return o[k] != null ? o[k] : ''; }); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function svgUse(id, cls) {
    var ns = 'http://www.w3.org/2000/svg', s = document.createElementNS(ns, 'svg'), u = document.createElementNS(ns, 'use');
    s.setAttribute('class', cls || 'i'); s.setAttribute('aria-hidden', 'true');
    u.setAttribute('href', '#' + id); s.appendChild(u); return s;
  }

  /* ---------- nyelv ---------- */
  function pickLang() {
    var q = (location.search.match(/[?&]lang=([a-z]{2})/) || [])[1];
    if (q && LANGS[q]) { store('zc_lang', q); return q; }
    var s = store('zc_lang');
    return s && LANGS[s] ? s : 'hu';
  }
  function applyLang(l) {
    lang = LANGS[l] ? l : 'hu';
    store('zc_lang', lang);
    var html = document.documentElement;
    html.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach(function (n) { var v = t(n.getAttribute('data-i18n')); if (v) n.textContent = v; });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (n) {
      n.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var p = pair.split(':'); if (p.length === 2) { var v = t(p[1].trim()); if (v) n.setAttribute(p[0].trim(), v); }
      });
    });
    var page = html.getAttribute('data-page');
    if (page) {
      var tt = t('t_' + page); if (tt) document.title = tt;
      var md = document.querySelector('meta[name="description"]'), dd = t('d_' + page);
      if (md && dd) md.setAttribute('content', dd);
    }
    var L = LANGS[lang];
    document.querySelectorAll('.lang-cur-flag use').forEach(function (u) { u.setAttribute('href', '#' + L.flag); });
    document.querySelectorAll('.lang-cur-text').forEach(function (n) { n.textContent = L.short; });
    document.querySelectorAll('.lang-menu button').forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('data-lang') === lang ? 'true' : 'false'); });
    var mapFrame = document.getElementById('mapFrame');
    if (mapFrame) {
      var src = mapFrame.getAttribute('data-src').replace('hl=hu', 'hl=' + lang);
      if (mapFrame.getAttribute('src') !== src) mapFrame.setAttribute('src', src);
    }
    status();
    if (rates.length) renderRates();
    if (coinData) renderCoins();
  }
  function buildLangMenus() {
    document.querySelectorAll('.lang').forEach(function (box) {
      var btn = box.querySelector('.lang-btn'), menu = box.querySelector('.lang-menu');
      if (!btn || !menu) return;
      Object.keys(LANGS).forEach(function (k) {
        var b = el('button'); b.type = 'button'; b.setAttribute('data-lang', k); b.setAttribute('lang', k);
        b.appendChild(svgUse(LANGS[k].flag, 'flag')); b.appendChild(el('span', null, LANGS[k].name));
        b.addEventListener('click', function () { applyLang(k); close(); btn.focus(); });
        menu.appendChild(b);
      });
      function close() { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = !menu.classList.contains('open');
        menu.classList.toggle('open', open); btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) { var cur = menu.querySelector('[aria-current=true]') || menu.querySelector('button'); if (cur) cur.focus(); }
      });
      menu.addEventListener('keydown', function (e) {
        var items = [].slice.call(menu.querySelectorAll('button')), i = items.indexOf(document.activeElement);
        if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
        else if (e.key === 'Escape') { close(); btn.focus(); }
      });
      document.addEventListener('click', function (e) { if (!box.contains(e.target)) close(); });
    });
  }

  /* ---------- mobil menü, vissza a tetejére ---------- */
  function drawer() {
    var d = document.getElementById('drawer'), open = document.getElementById('menuOpen');
    if (!d || !open) return;
    var closeBtn = d.querySelector('button[data-close]');
    function set(on) {
      d.classList.toggle('open', on); open.setAttribute('aria-expanded', on ? 'true' : 'false');
      document.body.style.overflow = on ? 'hidden' : '';
      if (on && closeBtn) closeBtn.focus(); else open.focus();
    }
    open.addEventListener('click', function () { set(true); });
    d.querySelectorAll('[data-close]').forEach(function (n) { n.addEventListener('click', function () { set(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && d.classList.contains('open')) set(false); });
  }
  function toTop() {
    var b = document.getElementById('toTop'); if (!b) return;
    var on = false;
    window.addEventListener('scroll', function () { var s = window.scrollY > 500; if (s !== on) { on = s; b.classList.toggle('show', s); } }, { passive: true });
    b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }

  /* ---------- nyitvatartás: H–P 9–17, Szo 9–14, V zárva ---------- */
  var HOURS = { 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 14], 0: null };
  function bpNow() {
    var p = {};
    try {
      new Intl.DateTimeFormat('en-GB', { timeZone: TZ, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
      var wd = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday];
      return { day: wd, min: (+p.hour) * 60 + (+p.minute) };
    } catch (e) { var d = new Date(); return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() }; }
  }
  function hh(h) { return h + ':00'; }
  function status() {
    var n = bpNow(), h = HOURS[n.day], txt, open = false;
    if (h && n.min >= h[0] * 60 && n.min < h[1] * 60) { open = true; txt = fill(t('st_open'), { t: hh(h[1]) }); }
    else {
      var off = (h && n.min < h[0] * 60) ? 0 : 1, nd = (n.day + off) % 7;
      while (!HOURS[nd]) { off++; nd = (n.day + off) % 7; }
      var key = off === 0 ? 'st_today' : (off === 1 ? 'st_tomorrow' : 'st_monday');
      txt = fill(t(key), { t: hh(HOURS[nd][0]) });
    }
    document.querySelectorAll('[data-status]').forEach(function (s) {
      s.classList.toggle('is-open', open); s.classList.toggle('is-closed', !open);
      var l = s.querySelector('[data-status-t]'); if (l) l.textContent = txt;
    });
    document.querySelectorAll('.hrs [data-days]').forEach(function (r) {
      r.classList.toggle('today', r.getAttribute('data-days').split(',').indexOf(String(n.day)) !== -1);
    });
  }

  /* ---------- árfolyamok (a zerochange.hu meglévő adatforrása) ----------
     Az árfolyam API percenként csak 1 lekérést enged, ezért a lekért adatot
     Firebase-ben (közös cache, minden látogató látja) és localStorage-ban is eltároljuk.
     Az API-t csak akkor hívjuk, ha a közös cache már 1 percnél régebbi. */
  var API_URL = 'https://cassanova.hu/rates/rates.php?path=arfolyam&APIkey=7jOwi1HfVWGbNAYzpFINrtOOsjWfaSArNea&Valuta=ALL&TID=0001';
  var DB = 'https://zerochange-6ac9f-default-rtdb.europe-west1.firebasedatabase.app';
  var CACHE_URL = DB + '/apiCache/arfolyam.json';
  var LOCAL_KEY = 'zerochange_arfolyam';
  var CACHE_MAX_AGE = 60 * 1000, RETRY_DELAY = 65 * 1000, REFRESH = 5 * 60 * 1000;

  /* a táblázatban megjelenő valuták sorrendje és magyar neve */
  var CUR = [
    ['GBP', 'Angol font'], ['EUR', 'Euró'], ['CHF', 'Svájci frank'], ['USD', 'USA dollár'], ['CAD', 'Kanadai dollár'],
    ['AUD', 'Ausztrál dollár'], ['PLN', 'Lengyel zloty'], ['RON', 'Román lej'], ['CZK', 'Cseh korona'], ['NOK', 'Norvég korona'],
    ['SEK', 'Svéd korona'], ['DKK', 'Dán korona'], ['RSD', 'Szerb dinár'], ['JPY', 'Japán jen'], ['AED', 'Arab emírségekbeli dirham'],
    ['RUB', 'Orosz rubel'], ['UAH', 'Ukrán hrivnya'], ['THB', 'Thai bát'], ['IDR', 'Indonéz rúpia'], ['VND', 'Vietnámi dong'],
    ['TRY', 'Török líra'], ['ALL', 'Albán lek'], ['BAM', 'Bosnyák konvertibilis márka'], ['ILS', 'Izraeli sékel'], ['CNY', 'Kínai jüan'],
    ['MXN', 'Mexikói peso'], ['KRW', 'Dél-koreai von'], ['HKD', 'Hongkongi dollár']
  ];
  var FEATURED = ['EUR', 'USD', 'GBP', 'CHF'];
  var rates = [], updatedAt = 0, retryTimer = null;

  var nameCache = {};
  function curName(code, hu) {
    if (lang === 'hu') return hu;
    var k = lang + ':' + code;
    if (nameCache[k]) return nameCache[k];
    var n = '';
    try { if (window.Intl && Intl.DisplayNames) n = new Intl.DisplayNames([LANGS[lang].locale], { type: 'currency' }).of(code) || ''; } catch (e) { n = ''; }
    if (!n || n === code) n = hu;
    n = n.charAt(0).toLocaleUpperCase(LANGS[lang].locale) + n.slice(1);
    nameCache[k] = n; return n;
  }
  function num(v) {
    if (v == null || v === '' || !isFinite(v) || +v <= 0) return '–';
    try { return new Intl.NumberFormat(LANGS[lang].locale, { minimumFractionDigits: 2, maximumFractionDigits: 4 }).format(+v); } catch (e) { return String(v).replace('.', ','); }
  }
  function when(ts) {
    if (!ts) return '…';
    try { return new Intl.DateTimeFormat(LANGS[lang].locale, { dateStyle: 'long', timeStyle: 'short', timeZone: TZ }).format(new Date(ts)); }
    catch (e) { return new Date(ts).toLocaleString(); }
  }
  function flagImg(code) {
    var img = el('img', 'cflag'); img.alt = ''; img.width = 36; img.height = 36; img.decoding = 'async';
    img.src = 'assets/flags/' + code + '.png';
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; }, { once: true });
    return img;
  }
  function rateOf(code) { for (var i = 0; i < rates.length; i++) if (rates[i].Valuta === code) return rates[i]; return null; }

  function renderRates() {
    var q = ((document.getElementById('rateSearch') || {}).value || '').trim().toLocaleLowerCase();
    var w = when(updatedAt);
    document.querySelectorAll('[data-upd]').forEach(function (n) { n.textContent = w; });

    document.querySelectorAll('[data-feat]').forEach(function (card) {
      var r = rateOf(card.getAttribute('data-feat'));
      var b = card.querySelector('.c-buy'), s = card.querySelector('.c-sell'), nm = card.querySelector('[data-cname]');
      if (nm) { var c = card.getAttribute('data-feat'); CUR.forEach(function (x) { if (x[0] === c) nm.textContent = curName(c, x[1]); }); }
      if (b) b.textContent = num(r && r.Veteli);
      if (s) s.textContent = num(r && r.Eladasi);
    });

    var shown = CUR.filter(function (c) {
      if (!q) return true;
      return (c[0] + ' ' + c[1] + ' ' + curName(c[0], c[1])).toLocaleLowerCase().indexOf(q) !== -1;
    });
    var tb = document.getElementById('rateBody'), ml = document.getElementById('rateList'), st = document.getElementById('rateState');
    if (tb) {
      tb.textContent = '';
      shown.forEach(function (c) {
        var r = rateOf(c[0]);
        var tr = el('tr'), td1 = el('td'), cc = el('div', 'cc');
        cc.appendChild(flagImg(c[0])); cc.appendChild(el('span', null, c[0])); td1.appendChild(cc); tr.appendChild(td1);
        tr.appendChild(el('td', 'nm', curName(c[0], c[1])));
        var t1 = el('td', 'num'); t1.appendChild(el('span', 'pill b', num(r && r.Veteli))); tr.appendChild(t1);
        var t2 = el('td', 'num'); t2.appendChild(el('span', 'pill s', num(r && r.Eladasi))); tr.appendChild(t2);
        tb.appendChild(tr);
      });
    }
    if (ml) {
      ml.textContent = '';
      var h = el('div', 'rl-h'); h.appendChild(el('span', null, t('th_currency'))); h.appendChild(el('span', null, t('buy_sell'))); ml.appendChild(h);
      shown.forEach(function (c) {
        var r = rateOf(c[0]);
        var row = el('div', 'rl-r'), nm = el('div', 'nm'), vv = el('div', 'vv');
        row.appendChild(flagImg(c[0]));
        nm.appendChild(el('b', null, c[0])); nm.appendChild(el('small', null, curName(c[0], c[1]))); row.appendChild(nm);
        var pb = el('span', 'pill b', num(r && r.Veteli)); pb.title = t('buy');
        var ps = el('span', 'pill s', num(r && r.Eladasi)); ps.title = t('sell');
        vv.appendChild(pb); vv.appendChild(ps); row.appendChild(vv); ml.appendChild(row);
      });
    }
    if (st) { st.hidden = shown.length > 0; st.className = 'state'; st.textContent = shown.length ? '' : t('no_result'); }
  }

  function cleanRates(data) {
    if (!Array.isArray(data)) return null;
    var out = data.filter(function (x) { return x && typeof x.Valuta === 'string'; })
      .map(function (x) { return { Valuta: x.Valuta, Veteli: x.Veteli == null ? null : x.Veteli, Eladasi: x.Eladasi == null ? null : x.Eladasi }; });
    return out.length ? out : null;
  }
  function showRates(r, upd) {
    if (!r || (upd && upd < updatedAt)) return;
    rates = r; if (upd) updatedAt = upd;
    renderRates();
  }
  function readLocal() { try { var c = JSON.parse(store(LOCAL_KEY)); if (c && cleanRates(c.rates)) return c; } catch (e) {} return null; }
  function writeLocal(r, upd) { store(LOCAL_KEY, JSON.stringify({ rates: r, updated: upd })); }
  function readShared() {
    return fetch(CACHE_URL, { cache: 'no-store' }).then(function (res) { return res.ok ? res.json() : null; })
      .then(function (c) { var r = cleanRates(c && c.rates); return r ? { rates: r, updated: Number(c.updated) || 0 } : null; })
      .catch(function () { return null; });
  }
  function writeShared(r) {
    fetch(CACHE_URL, { method: 'PUT', body: JSON.stringify({ rates: r, updated: { '.sv': 'timestamp' } }) }).catch(function () {});
  }
  function fetchApi() {
    return fetch(API_URL, { cache: 'no-store' }).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (d) { var r = cleanRates(d); if (!r) throw new Error('empty'); return r; });
  }
  function loadRates() {
    clearTimeout(retryTimer);
    return readShared().then(function (shared) {
      if (shared) {
        showRates(shared.rates, shared.updated);
        writeLocal(shared.rates, shared.updated);
        if (Date.now() - shared.updated < CACHE_MAX_AGE) return;
      }
      return fetchApi().then(function (r) {
        var now = Date.now(); showRates(r, now); writeLocal(r, now); writeShared(r);
      });
    }).catch(function () {
      if (!rates.length) {
        var st = document.getElementById('rateState');
        if (st) { st.hidden = false; st.className = 'state err'; st.textContent = t('rates_error'); }
        retryTimer = setTimeout(loadRates, RETRY_DELAY);
      }
    });
  }
  function initRates() {
    if (!document.getElementById('rateBody') && !document.querySelector('[data-feat]')) return;
    var local = readLocal();
    if (local) { rates = cleanRates(local.rates); updatedAt = Number(local.updated) || 0; }
    renderRates();
    if (!local) { var st = document.getElementById('rateState'); if (st) { st.hidden = false; st.textContent = t('loading'); } }
    var s = document.getElementById('rateSearch');
    if (s) s.addEventListener('input', renderRates);
    loadRates();
    setInterval(loadRates, REFRESH);
  }

  /* ---------- fémpénz árak (Firebase: rates/coinAmount) ---------- */
  var coinData = null;
  function renderCoins() {
    document.querySelectorAll('[data-coin]').forEach(function (c) {
      var v = coinData && coinData[c.getAttribute('data-coin')];
      var out = c.querySelector('.pill'); if (!out) return;
      var raw = v && v.buy != null ? String(v.buy).trim() : '';
      if (raw) { out.textContent = raw.replace('.', ',').replace(/(\d)\s*Ft/i, '$1 Ft').replace(/\s*\/\s*/, ' / '); out.classList.remove('s'); out.classList.add('b'); }
      else { out.textContent = t('coin_ask'); out.classList.remove('b'); out.classList.add('s'); }
    });
  }
  function loadCoins() {
    if (!document.querySelector('[data-coin]')) return;
    fetch(DB + '/rates/coinAmount.json', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (d) { coinData = d || {}; renderCoins(); })
      .catch(function () { if (!coinData) { coinData = {}; renderCoins(); } });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var y = document.getElementById('year'); if (y) y.textContent = String(new Date().getFullYear());
    buildLangMenus(); drawer(); toTop();
    applyLang(pickLang());
    initRates();
    loadCoins();
    if (document.querySelector('[data-coin]')) setInterval(loadCoins, 60 * 1000);
    setInterval(status, 60 * 1000);
  });
})();
