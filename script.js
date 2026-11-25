/* Kova page script: the micro-interactions that site-core.js does not cover.
   - grey heading lines that colour in, word by word, as they scroll into view
   - nav pill that slides to the hovered link or the section in view
   - hero: pointer parallax on the floating cards, balance count-up, a live rate tick
   - send-money converter (two-way, three currencies, three delivery methods)
   - in-view states for the savings bars, chart and Face ID scan
   - savings calculator, billing switch, footer wordmark rise
   Every animated part checks prefers-reduced-motion; the page is complete without it. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Footer year stays current ---------- */
  $$('[data-current-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Nav pill + scroll spy ---------- */
  var nav = $('[data-nav]');
  if (nav) {
    var pill = $('.nav__pill', nav);
    var links = $$('a', nav);
    var active = null, hovered = null;
    var place = function () {
      var target = hovered || active;
      nav.classList.toggle('has-pill', !!target);
      links.forEach(function (a) { a.classList.toggle('is-on', a === target); });
      if (!target) return;
      pill.style.setProperty('--px', target.offsetLeft + 'px');
      pill.style.setProperty('--pw', target.offsetWidth + 'px');
    };
    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { hovered = a; place(); });
      a.addEventListener('focus', function () { hovered = a; place(); });
      a.addEventListener('blur', function () { hovered = null; place(); });
    });
    nav.addEventListener('mouseleave', function () { hovered = null; place(); });
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    if ('IntersectionObserver' in window) {
      var seen = {};
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { seen[e.target.id] = e.isIntersecting; });
        var id = sections.map(function (s) { return s.id; }).filter(function (i) { return seen[i]; }).pop();
        active = id ? links.filter(function (a) { return a.getAttribute('href') === '#' + id; })[0] : null;
        place();
      }, { rootMargin: '-40% 0px -55% 0px' });
      sections.forEach(function (s) { spy.observe(s); });
    }
    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    requestAnimationFrame(function () { place(); requestAnimationFrame(function () { nav.classList.add('is-ready'); }); });
  }

  /* ---------- Hero: pointer parallax on the floating cards ---------- */
  var stage = $('[data-stage]');
  if (stage && finePointer && !reduced) {
    var floats = $$('[data-depth]', stage);
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    var step = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      floats.forEach(function (f) {
        var d = Number(f.dataset.depth) || 10;
        f.style.setProperty('--px', (cx * d).toFixed(2) + 'px');
        f.style.setProperty('--py', (cy * d).toFixed(2) + 'px');
      });
      raf = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.001 ? requestAnimationFrame(step) : 0;
    };
    var kick = function () { if (!raf) raf = requestAnimationFrame(step); };
    var rect = null;
    stage.addEventListener('pointerenter', function () { rect = stage.getBoundingClientRect(); });
    stage.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (!rect) rect = stage.getBoundingClientRect();
      tx = (e.clientX - rect.left) / rect.width - 0.5;
      ty = (e.clientY - rect.top) / rect.height - 0.5;
      kick();
    });
    stage.addEventListener('pointerleave', function () { tx = 0; ty = 0; rect = null; kick(); });
  }

  /* ---------- Hero: balance counts up once the intro has played ---------- */
  var balance = $('[data-balance]');
  if (balance && !reduced) {
    var target = 12480.2, t0 = 0, dur = 1600;
    var paint = function (v) {
      var whole = Math.floor(v), pence = Math.round((v - whole) * 100);
      if (pence === 100) { whole += 1; pence = 0; }
      balance.innerHTML = '£' + whole.toLocaleString('en-GB') + '<span>.' + String(pence).padStart(2, '0') + '</span>';
    };
    var count = function (now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      paint(target * (1 - Math.pow(2, -10 * p)));
      if (p < 1) requestAnimationFrame(count); else paint(target);
    };
    paint(0);
    setTimeout(function () { requestAnimationFrame(count); }, 700);
  }

  /* ---------- Send-money converter ---------- */
  var CUR = {
    NGN: { rate: 2069.10, sym: '₦', dp: 0, city: 'Lagos', badge: '₦', cls: 'cur--ngn' },
    GHS: { rate: 19.42, sym: 'GH₵', dp: 2, city: 'Accra', badge: '₵', cls: 'cur--ghs' },
    KES: { rate: 163.80, sym: 'KSh ', dp: 0, city: 'Nairobi', badge: 'K', cls: 'cur--kes' }
  };
  var METHOD = { bank: { fee: 0.99, eta: 'In seconds', short: 'Seconds' }, wallet: { fee: 0.99, eta: 'In seconds', short: 'Seconds' }, cash: { fee: 1.99, eta: 'Within the hour', short: 'Within the hour' } };
  var conv = $('[data-converter]');
  var state = { to: 'NGN', method: 'bank', send: 500, drift: 0, edited: 'send' };
  var gbp = function (n) { return '£' + n.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var money = function (n, code) { var c = CUR[code]; return c.sym + n.toLocaleString('en-GB', { minimumFractionDigits: c.dp, maximumFractionDigits: c.dp }); };
  var plain = function (n, dp) { return n.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp }); };
  var parse = function (s) { var n = parseFloat(String(s).replace(/[^0-9.]/g, '')); return isFinite(n) ? Math.min(n, 1e9) : 0; };
  var rateOf = function (code) { return CUR[code].rate * (1 + state.drift); };
  var flash = function (el) { if (reduced || !el) return; el.classList.add('is-tick'); requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.remove('is-tick'); }); }); };

  if (conv) {
    var inSend = $('[data-amt="send"]', conv), inGet = $('[data-amt="get"]', conv);
    var toSel = $('[data-to]', conv), toBadge = $('[data-to-badge]', conv), swap = $('[data-swap]', conv);
    var methodBtns = $$('[data-method]', conv);
    var cmpGet = $$('[data-cmp-get]'), cmpTitle = $('[data-compare-title]'), cmpFee = $('[data-cmp-fee]'), cmpEta = $('[data-cmp-eta]');
    var render = function (skip, tick) {
      var c = CUR[state.to], m = METHOD[state.method], rate = rateOf(state.to);
      var get = state.send * rate;
      if (skip !== 'send') inSend.value = plain(state.send, 2);
      if (skip !== 'get') inGet.value = plain(get, c.dp);
      $('[data-rate-line]', conv).textContent = '£1 = ' + c.sym + plain(rate, 2);
      $('[data-fee]', conv).textContent = gbp(m.fee);
      $('[data-eta]', conv).textContent = m.eta;
      $('[data-send-total]', conv).firstChild.textContent = 'Send ' + gbp(state.send + m.fee);
      if (cmpTitle) cmpTitle.textContent = 'Sending ' + gbp(state.send).replace('.00', '') + ' to ' + c.city;
      if (cmpFee) cmpFee.textContent = gbp(m.fee);
      if (cmpEta) cmpEta.textContent = m.short;
      var vals = [get, state.send * rate * 0.936, state.send * rate * 0.96];
      cmpGet.forEach(function (td) { td.textContent = money(vals[Number(td.dataset.cmpGet)], state.to); if (tick) flash(td); });
    };
    var setEdited = function (side) {
      if (state.edited === side) return;
      state.edited = side;
      if (swap) swap.classList.toggle('is-flipped', side === 'get');
    };
    inSend.addEventListener('input', function () { setEdited('send'); state.send = parse(inSend.value); render('send'); });
    inGet.addEventListener('input', function () { setEdited('get'); state.send = parse(inGet.value) / rateOf(state.to); render('get'); });
    [inSend, inGet].forEach(function (i) { i.addEventListener('blur', function () { render(); }); });
    toSel.addEventListener('change', function () {
      var prev = CUR[state.to].cls;
      state.to = toSel.value;
      toBadge.classList.remove(prev); toBadge.classList.add(CUR[state.to].cls);
      toBadge.textContent = CUR[state.to].badge;
      render();
    });
    methodBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        state.method = b.dataset.method;
        methodBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        render();
      });
    });
    conv.addEventListener('submit', function (e) { e.preventDefault(); });
    render();
  }

  /* ---------- Live rate: a small, believable drift every few seconds ---------- */
  var rateHero = $('[data-rate-hero]');
  if (!reduced && (rateHero || conv)) {
    var timer = null;
    var tickRate = function () {
      if (document.hidden) return;
      state.drift = Math.max(-0.004, Math.min(0.004, state.drift + (Math.random() - 0.48) * 0.0012));
      if (rateHero) { rateHero.textContent = '₦' + plain(CUR.NGN.rate * (1 + state.drift), 2); flash(rateHero); }
      if (conv && document.activeElement !== $('[data-amt="get"]')) {
        var active = document.activeElement;
        render(active && active.dataset && active.dataset.amt, true);
      }
    };
    timer = setInterval(tickRate, 4500);
  }

  /* ---------- In-view states (bars, chart, Face ID scan) ---------- */
  var watch = $$('.pots, .chart, .b4, .step');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.target.classList.contains('step')) { $$('.faceid', e.target).forEach(function (f) { f.classList.toggle('is-in', e.isIntersecting); }); return; }
        if (e.isIntersecting) e.target.classList.add('is-in');
        if (e.target.classList.contains('b4')) e.target.classList.toggle('is-in', e.isIntersecting);
        else if (e.isIntersecting) io.unobserve(e.target);
      });
    }, { threshold: 0.35 });
    watch.forEach(function (el) { io.observe(el); });
  } else {
    watch.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Savings calculator ---------- */
  var calc = $('[data-calc]');
  if (calc) {
    var range = $('[data-calc-input]', calc), out = $('[data-calc-out]', calc);
    var r = Math.pow(1.046, 1 / 12) - 1;
    var usd = function (n) { return '$' + n.toLocaleString('en-US'); };
    var update = function () {
      var p = Number(range.value);
      out.textContent = usd(p);
      range.setAttribute('aria-valuetext', usd(p) + ' a month');
      range.parentNode.style.setProperty('--f', ((p - range.min) / (range.max - range.min)).toFixed(4));
      $$('[data-years]', calc).forEach(function (dd) {
        var n = Number(dd.dataset.years) * 12;
        dd.textContent = usd(Math.round(p * (Math.pow(1 + r, n) - 1) / r / 10) * 10);
      });
    };
    range.addEventListener('input', update);
    update();
  }

  /* ---------- Billing switch ---------- */
  var billing = $('[data-billing]');
  if (billing) {
    billing.addEventListener('click', function () {
      var yearly = billing.getAttribute('aria-checked') !== 'true';
      billing.setAttribute('aria-checked', String(yearly));
      $$('.plan__price').forEach(function (p) {
        $$('[data-month]', p).forEach(function (el) { el.textContent = yearly ? el.dataset.year : el.dataset.month; });
        p.classList.remove('is-swap');
        void p.offsetWidth; // restart the swap animation
        p.classList.add('is-swap');
      });
    });
  }

  /* ---------- Grey heading lines colour in as they scroll into view ----------
     The grey second line of each heading is only a starting state: word by word it
     fills to the heading's own colour, tied to the scroll. A line already on screen
     at load (the hero) fills just after the intro. Under reduced motion it starts filled. */
  var tones = $$('.h2 .tone');
  if (tones.length) {
    if (reduced || !window.gsap || !window.ScrollTrigger) {
      tones.forEach(function (t) { t.classList.add('is-lit'); });
    } else {
      tones.forEach(function (t) {
        var from = getComputedStyle(t).color;
        var to = getComputedStyle(t.parentElement).color;
        var words = t.textContent.trim().split(/\s+/);
        t.textContent = '';
        words.forEach(function (w, i) {
          var s = document.createElement('span');
          s.className = 'tone__w';
          s.textContent = w;
          t.appendChild(s);
          if (i < words.length - 1) t.appendChild(document.createTextNode(' '));
        });
        var ws = t.querySelectorAll('.tone__w');
        if (t.closest('.hero')) {
          window.gsap.fromTo(ws, { color: from }, { color: to, duration: 0.9, ease: 'power2.out', stagger: 0.16, delay: 1.5 });
        } else {
          window.gsap.fromTo(ws, { color: from }, { color: to, ease: 'none', stagger: 0.5, scrollTrigger: { trigger: t, start: 'top 85%', end: 'top 45%', scrub: 0.6 } });
        }
      });
    }
  }

  /* ---------- Footer wordmark rises as the footer arrives ---------- */
  var word = $('[data-word]');
  if (word && !reduced && window.gsap && window.ScrollTrigger) {
    window.gsap.fromTo(word, { yPercent: 38 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }
})();
