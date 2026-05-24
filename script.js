/* ================================================================
   EcoConnect-X  ·  Landing Page v2  ·  script.js
   ================================================================ */

(function () {
  'use strict';

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 50);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile hamburger ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', open);
    // Animate bars
    const bars = hamburger.querySelectorAll('span');
    if (open) {
      bars[0].style.transform = 'translateY(7px) rotate(45deg)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  });

  document.addEventListener('click', e => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    });
  });

  /* ── Smooth scroll for anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 12;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ── Intersection Observer — fade-up reveal ── */
  const fadeEls = document.querySelectorAll('.fade-up');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      // Stagger children in the same parent
      const siblings = Array.from(entry.target.parentElement.children)
        .filter(el => el.classList.contains('fade-up'));
      const idx = siblings.indexOf(entry.target);
      entry.target.style.transitionDelay = `${Math.min(idx * 0.08, 0.45)}s`;
      entry.target.classList.add('visible');
      revealObs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });
  fadeEls.forEach(el => revealObs.observe(el));

  /* ── Pipeline animation on scroll ── */
  const pipeline = document.querySelector('.pipeline');
  if (pipeline) {
    const pipeObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        pipeline.classList.add('animate');
        pipeObs.disconnect();
      }
    }, { threshold: 0.3 });
    pipeObs.observe(pipeline);
  }

  /* ── Active nav link highlight ── */
  const sections   = document.querySelectorAll('section[id], .cta-section');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const highlightNav = () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - navbar.offsetHeight - 80)
        current = s.getAttribute('id') || '';
    });
    navAnchors.forEach(a => {
      const matches = a.getAttribute('href') === `#${current}`;
      a.style.color = matches ? 'var(--green)' : '';
    });
  };
  window.addEventListener('scroll', highlightNav, { passive: true });

  /* ── Role tabs ── */
  const rtabs   = document.querySelectorAll('.rtab');
  const rpanels = document.querySelectorAll('.role-panel');

  rtabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      rtabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      rpanels.forEach(p => {
        const active = p.id === `role-${role}`;
        p.classList.toggle('active', active);
        if (active) {
          // Trigger lazy images inside newly shown panel
          p.querySelectorAll('img[loading="lazy"]').forEach(img => {
            if (img.dataset.src) img.src = img.dataset.src;
          });
        }
      });
    });
  });

  /* ── Carousel ── */
  const track    = document.getElementById('carouselTrack');
  const prevBtn  = document.getElementById('prevBtn');
  const nextBtn  = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('carouselDots');

  if (track && prevBtn && nextBtn && dotsWrap) {
    const slides    = Array.from(track.children);
    let current     = 0;
    let autoTimer   = null;
    let slidesVisible = getSlidesVisible();

    function getSlidesVisible() {
      return window.innerWidth <= 640 ? 1 : window.innerWidth <= 900 ? 2 : 3;
    }

    const totalPages = () => Math.max(1, slides.length - slidesVisible + 1);

    // Build dots
    function buildDots() {
      dotsWrap.innerHTML = '';
      const n = totalPages();
      for (let i = 0; i < n; i++) {
        const d = document.createElement('button');
        d.className = 'cdot' + (i === current ? ' active' : '');
        d.setAttribute('aria-label', `Go to slide ${i + 1}`);
        d.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(d);
      }
    }

    function updateDots() {
      dotsWrap.querySelectorAll('.cdot').forEach((d, i) =>
        d.classList.toggle('active', i === current));
    }

    function getSlideWidth() {
      if (!slides[0]) return 0;
      const gap = 24; // 1.5rem
      return slides[0].offsetWidth + gap;
    }

    function goTo(idx) {
      const max = totalPages() - 1;
      current = Math.max(0, Math.min(idx, max));
      track.style.transform = `translateX(-${current * getSlideWidth()}px)`;
      updateDots();
    }

    prevBtn.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
    nextBtn.addEventListener('click', () => { goTo(current + 1); resetAuto(); });

    function resetAuto() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        goTo(current + 1 < totalPages() ? current + 1 : 0);
      }, 4000);
    }

    // Touch / swipe
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) { goTo(diff > 0 ? current + 1 : current - 1); resetAuto(); }
    });

    window.addEventListener('resize', () => {
      const newVis = getSlidesVisible();
      if (newVis !== slidesVisible) {
        slidesVisible = newVis;
        current = 0;
        buildDots();
      }
      goTo(current);
    });

    buildDots();
    goTo(0);
    resetAuto();
  }

  /* ── Counter animation for hero stats ── */
  function animateCount(el, target, suffix) {
    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    const isNumeric = !isNaN(parseInt(target));
    if (!isNumeric) return; // skip non-numeric like "ESP32", "Live"

    const end = parseInt(target);
    const step = timestamp => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(start + (end - start) * ease) + (suffix || '');
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  const statsObs = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.hstat strong').forEach(el => {
      animateCount(el, el.textContent, '');
    });
    statsObs.disconnect();
  }, { threshold: 0.5 });
  const statsEl = document.querySelector('.hero-stats');
  if (statsEl) statsObs.observe(statsEl);

  /* ── Language tabs ── */
  const ltabs   = document.querySelectorAll('.ltab');
  const lpanels = document.querySelectorAll('.lang-panel');

  ltabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      ltabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      lpanels.forEach(p => {
        p.classList.toggle('active', p.id === `lang-${lang}`);
      });
    });
  });

  /* ── Image error fallback ── */
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      img.style.background = 'var(--surface2)';
      img.style.minHeight  = '80px';
      img.alt = img.alt || 'Image unavailable';
    });
  });

})();
