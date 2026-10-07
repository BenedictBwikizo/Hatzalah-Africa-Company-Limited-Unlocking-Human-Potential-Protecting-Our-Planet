(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  // Theme
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('hz-theme');
    if (saved) root.setAttribute('data-theme', saved);
    else if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme', 'dark');
    else root.setAttribute('data-theme', 'light');
  } catch (e) {}
  $('#themeBtn').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('hz-theme', next); } catch (e) {}
  });

  // Mobile nav
  var burger = $('#burger'), nav = $('#nav');
  function closeNav() { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
  $$('#nav a').forEach(function (a) { a.addEventListener('click', closeNav); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });

  // Scroll: progress bar, header shadow, back-to-top
  var progress = $('#progress'), header = $('#header'), toTop = $('#toTop');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    header.classList.toggle('scrolled', h.scrollTop > 10);
    toTop.classList.toggle('show', h.scrollTop > 700);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // Reveal on scroll
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  } else reveals.forEach(function (r) { r.classList.add('visible'); });

  // Active nav link
  var links = $$('#nav a[href^="#"]:not(.nav-cta)');
  var sections = links.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window) {
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  // Generic tab helper
  function tabs(tabSel, panelFor, activate) {
    var list = $$(tabSel);
    list.forEach(function (t, i) {
      t.addEventListener('click', function () { activate(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = list[(i + 1) % list.length];
        if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = list[(i - 1 + list.length) % list.length];
        if (n) { e.preventDefault(); n.focus(); activate(n); }
      });
    });
  }
  // Vision / mission / values
  tabs('.tab', null, function (t) {
    $$('.tab').forEach(function (x) {
      var on = x === t;
      x.classList.toggle('active', on);
      x.setAttribute('aria-selected', on);
      var p = $('#' + x.getAttribute('aria-controls'));
      p.hidden = !on; p.classList.toggle('active', on);
    });
  });
  // Services
  tabs('.svc-tab', null, function (t) {
    $$('.svc-tab').forEach(function (x) {
      var on = x === t;
      x.classList.toggle('active', on);
      x.setAttribute('aria-selected', on);
      $('#svc-' + x.getAttribute('data-svc')).hidden = !on;
    });
  });

  // CEO message toggle
  var ceoBtn = $('#ceoToggle'), ceoMore = $('#ceoMore');
  ceoBtn.addEventListener('click', function () {
    var open = ceoMore.hidden;
    ceoMore.hidden = !open;
    ceoBtn.setAttribute('aria-expanded', open);
    ceoBtn.firstChild.textContent = open ? 'Show less ' : 'Read the full message ';
    ceoBtn.lastElementChild.textContent = open ? '↑' : '↓';
  });

  // Contact form (static site: opens the visitor's email app addressed to info@hatzalahs.com)
  var form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#fName'), email = $('#fEmail'), msg = $('#fMsg');
    var ok = true;
    [name, email, msg].forEach(function (f) {
      var bad = !f.value.trim() || (f.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value));
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    status.className = 'form-status';
    if (!ok) { status.textContent = 'Please fill in all fields with valid details.'; status.classList.add('err'); return; }
    var subject = 'Website enquiry: ' + $('#fTopic').value;
    var body = 'Name: ' + name.value.trim() + '\nEmail: ' + email.value.trim() + '\n\n' + msg.value.trim();
    window.location.href = 'mailto:info@hatzalahs.com?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    status.textContent = 'Thank you, ' + name.value.trim() + '. Your email app should open with your message ready to send.';
    status.classList.add('ok');
    form.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
