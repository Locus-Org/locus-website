// ─────────────────────────────────────────────────────────────────
// locus / site.js
// quiet behaviors: reveal on scroll, header scroll state,
// mobile drawer, form handling, generative sand patterns.
// ─────────────────────────────────────────────────────────────────

(() => {
  'use strict';

  // ── reveal on scroll ───────────────────────────────────────────
  const reveals = document.querySelectorAll('[data-reveal]');
  if (reveals.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el, i) => {
      if (!el.style.getPropertyValue('--reveal-delay')) {
        const stagger = el.dataset.revealDelay ?? (i % 5) * 0.08;
        el.style.setProperty('--reveal-delay', `${stagger}s`);
      }
      io.observe(el);
    });
  }

  // ── header scroll state ────────────────────────────────────────
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── mobile drawer ──────────────────────────────────────────────
  const drawer = document.querySelector('.nav-drawer');
  const toggles = document.querySelectorAll('[data-nav-toggle]');
  if (drawer && toggles.length) {
    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        const open = drawer.classList.toggle('is-open');
        document.body.style.overflow = open ? 'hidden' : '';
        btn.textContent = open ? 'Close' : 'Menu';
      });
    });
    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        document.body.style.overflow = '';
        toggles.forEach((b) => (b.textContent = 'Menu'));
      });
    });
  }

  // ── current page nav state ─────────────────────────────────────
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav a, .nav-drawer__list a').forEach((a) => {
    const href = a.getAttribute('href');
    if (href === path) a.setAttribute('aria-current', 'page');
  });

  // ── forms ──────────────────────────────────────────────────────
  document.querySelectorAll('form[data-form]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const success = form.parentElement.querySelector('[data-form-success]');
      if (success) {
        form.style.display = 'none';
        success.removeAttribute('hidden');
        success.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
  });

  // ── generative sand patterns ───────────────────────────────────
  // Each pattern is an archimedean-style spiral with a different
  // modulation. Drawn once, then animated via CSS.
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function buildSpiral(svg, opts = {}) {
    const {
      cx = 400, cy = 400,
      r0 = 30, rMax = 360,
      turns = 28, points = 1800,
      wobbleFreq = 3, wobbleAmp = 8,
      strokeWidth = 0.5, opacity = 0.85,
    } = opts;

    let d = '';
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      const angle = t * turns * Math.PI * 2;
      const r = r0 + t * (rMax - r0) + Math.sin(angle * wobbleFreq) * wobbleAmp * (1 - t * 0.3);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', strokeWidth);
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('opacity', opacity);
    svg.appendChild(path);
  }

  function buildField(svg) {
    // an orchid-like rose curve
    const cx = 400, cy = 400;
    const k = 5; const points = 2400;
    let d = '';
    for (let i = 0; i < points; i++) {
      const t = i / (points - 1);
      const angle = t * Math.PI * 12;
      const r = 320 * Math.cos(k * angle) * Math.exp(-t * 0.2) + Math.sin(angle * 2) * 6;
      const x = cx + Math.cos(angle) * Math.abs(r);
      const y = cy + Math.sin(angle) * Math.abs(r);
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
    }
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'currentColor');
    path.setAttribute('stroke-width', '0.5');
    path.setAttribute('opacity', '0.85');
    svg.appendChild(path);
  }

  function buildTide(svg) {
    // concentric ellipses, offset like a slow lapping
    const cx = 400, cy = 400;
    const rings = 36;
    for (let i = 0; i < rings; i++) {
      const t = i / (rings - 1);
      const rx = 60 + t * 320;
      const ry = rx * (0.86 + Math.sin(t * Math.PI * 3) * 0.05);
      const angle = t * 28;
      const el = document.createElementNS(SVG_NS, 'ellipse');
      el.setAttribute('cx', cx);
      el.setAttribute('cy', cy);
      el.setAttribute('rx', rx);
      el.setAttribute('ry', ry);
      el.setAttribute('transform', `rotate(${angle} ${cx} ${cy})`);
      el.setAttribute('fill', 'none');
      el.setAttribute('stroke', 'currentColor');
      el.setAttribute('stroke-width', '0.4');
      el.setAttribute('opacity', (0.25 + t * 0.6).toFixed(2));
      svg.appendChild(el);
    }
  }

  function buildPulse(svg) {
    // radial bursts — like a drop hitting the surface
    const cx = 400, cy = 400;
    const arms = 64;
    for (let i = 0; i < arms; i++) {
      const a = (i / arms) * Math.PI * 2;
      const r1 = 90 + (i % 4) * 8;
      const r2 = 360 + Math.sin(i * 0.5) * 18;
      const x1 = cx + Math.cos(a) * r1;
      const y1 = cy + Math.sin(a) * r1;
      const x2 = cx + Math.cos(a) * r2;
      const y2 = cy + Math.sin(a) * r2;
      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttribute('x1', x1.toFixed(1));
      line.setAttribute('y1', y1.toFixed(1));
      line.setAttribute('x2', x2.toFixed(1));
      line.setAttribute('y2', y2.toFixed(1));
      line.setAttribute('stroke', 'currentColor');
      line.setAttribute('stroke-width', '0.5');
      line.setAttribute('opacity', '0.7');
      svg.appendChild(line);
    }
    // and a few concentric circles, faint
    for (let i = 0; i < 5; i++) {
      const c = document.createElementNS(SVG_NS, 'circle');
      c.setAttribute('cx', cx);
      c.setAttribute('cy', cy);
      c.setAttribute('r', 120 + i * 50);
      c.setAttribute('fill', 'none');
      c.setAttribute('stroke', 'currentColor');
      c.setAttribute('stroke-width', '0.4');
      c.setAttribute('opacity', (0.18 + i * 0.04).toFixed(2));
      svg.appendChild(c);
    }
  }

  const patterns = {
    spiral:  (svg) => buildSpiral(svg),
    drift:   (svg) => buildSpiral(svg, { turns: 22, wobbleFreq: 2, wobbleAmp: 18, points: 2000 }),
    field:   buildField,
    tide:    buildTide,
    pulse:   buildPulse,
  };

  document.querySelectorAll('[data-pattern]').forEach((svg) => {
    const name = svg.dataset.pattern;
    const fn = patterns[name];
    if (fn) fn(svg);
  });

  // ── year stamp ────────────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
