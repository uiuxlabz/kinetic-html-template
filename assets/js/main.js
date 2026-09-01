/* ============================================================
   Kinetic — main.js
   Vanilla JS, IIFE pattern, zero dependencies
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Sticky header ---------- */
  var header = document.querySelector('.site-header');
  var isHome = !!document.querySelector('.hero');
  function handleScroll() {
    if (!header) return;
    if (isHome) {
      header.classList.toggle('is-solid', window.scrollY > 60);
    } else {
      header.classList.add('is-solid');
    }
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
        toggle.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!nav.contains(e.target) && !toggle.contains(e.target) && nav.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ---------- Stat counters ---------- */
  var counted = false;
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !counted) {
        counted = true;
        document.querySelectorAll('.stat strong[data-count]').forEach(function (el) {
          var target = parseInt(el.getAttribute('data-count'), 10);
          var suffix = el.getAttribute('data-suffix') || '';
          var duration = 1800;
          var start = performance.now();
          function step(now) {
            var elapsed = now - start;
            var progress = Math.min(elapsed / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.round(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        });
        countObserver.disconnect();
      }
    });
  }, { threshold: 0.5 });
  var statsBand = document.querySelector('.stats-band');
  if (statsBand) countObserver.observe(statsBand);

  /* ---------- Portfolio filter ---------- */
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    var items = document.querySelectorAll('.gallery-item');
    filterBar.querySelectorAll('.filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        filterBar.querySelectorAll('.filter-btn').forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        var f = btn.getAttribute('data-filter');
        items.forEach(function (item) {
          var show = f === 'all' || item.getAttribute('data-cat') === f;
          item.classList.toggle('show', show);
        });
      });
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('.lb-img');
    var lbCaption = lightbox.querySelector('.lb-caption');

    function openLb(src, alt, caption) {
      lbImg.src = src;
      lbImg.alt = alt;
      lbCaption.textContent = caption;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeLb() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('.gallery-item img').forEach(function (img) {
      img.addEventListener('click', function () {
        var figure = img.closest('.gallery-item');
        var tag = figure ? figure.querySelector('.work-tag') : null;
        var title = figure ? figure.querySelector('h3') : null;
        var cap = '';
        if (tag && title) cap = tag.textContent + ' — ' + title.textContent;
        openLb(img.getAttribute('data-full') || img.src, img.alt, cap);
      });
    });
    var lbClose = lightbox.querySelector('.lb-close');
    if (lbClose) lbClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLb();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLb();
    });
  }

  /* ---------- Contact form ---------- */
  var form = document.querySelector('.contact-form[data-form]');
  if (form) {
    var statusEl = form.querySelector('.form-status');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var valid = true;
      form.querySelectorAll('.form-group').forEach(function (g) { g.classList.remove('has-error'); });
      var name = form.querySelector('#f-name');
      var email = form.querySelector('#f-email');
      var message = form.querySelector('#f-message');
      if (!name.value.trim()) { name.closest('.form-group').classList.add('has-error'); valid = false; }
      if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        email.closest('.form-group').classList.add('has-error'); valid = false;
      }
      if (!message.value.trim()) { message.closest('.form-group').classList.add('has-error'); valid = false; }
      if (valid) {
        statusEl.textContent = 'Thanks for reaching out! We\'ll get back to you within 48 hours.';
        statusEl.className = 'form-status ok';
        form.querySelector('button[type="submit"]').disabled = true;
        form.querySelector('button[type="submit"]').textContent = 'Sent ✓';
      } else {
        statusEl.textContent = 'Please fill in all required fields correctly.';
        statusEl.className = 'form-status bad';
      }
    });
  }

  /* ---------- Newsletter validation ---------- */
  var nlForms = document.querySelectorAll('.nl-form[data-nl]');
  nlForms.forEach(function (nl) {
    var status = nl.parentElement.querySelector('.nl-status');
    nl.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nl.querySelector('input[type="email"]');
      var val = input.value.trim();
      if (!val || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        status.textContent = 'Please enter a valid email address.';
        status.className = 'nl-status bad';
        return;
      }
      status.textContent = 'You\'re in motion! Check your inbox for a welcome note.';
      status.className = 'nl-status ok';
      nl.innerHTML = '<p style="font-weight:600;margin:0;">Welcome aboard &mdash; you\'re in motion! 🏃</p>';
    });
  });

})();
