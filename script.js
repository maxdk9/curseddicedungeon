/* ============================================================
   CURSED DICE DUNGEON — PROMO SITE SCRIPTS
   ============================================================ */

'use strict';

// ===== NAVBAR SCROLL EFFECT =====
(function () {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('navBurger');
  const mobile = document.getElementById('navMobile');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  burger.addEventListener('click', () => {
    mobile.classList.toggle('open');
    const spans = burger.querySelectorAll('span');
    if (mobile.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  // Close mobile nav on link click
  mobile.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobile.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });
})();


// ===== SCROLL REVEAL =====
(function () {
  const reveals = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger children in grids
        const delay = entry.target.closest('.features-grid, .monsters-grid')
          ? Array.from(entry.target.parentElement.children).indexOf(entry.target) * 80
          : 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => io.observe(el));
})();


// ===== STATS COUNTER ANIMATION =====
(function () {
  const statNums = document.querySelectorAll('.stat-num[data-target]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 1200;
      const start = performance.now();

      function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
      }
      requestAnimationFrame(update);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  statNums.forEach(el => io.observe(el));
})();


// ===== SCREENSHOT CAROUSEL =====
(function () {
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  if (!track) return;

  const slides = Array.from(track.querySelectorAll('.carousel-slide'));
  const total = slides.length;
  let currentIndex = 0;
  let autoPlayTimer = null;

  // Calculate visible slides based on viewport
  function getVisible() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  // Create dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    const vis = getVisible();
    const dotCount = total - vis + 1;
    for (let i = 0; i < Math.max(dotCount, 1); i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }

  function updateDots() {
    dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentIndex);
    });
  }

  function updateSlideHighlight() {
    slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex + 1));
  }

  function goTo(index) {
    const vis = getVisible();
    const max = Math.max(total - vis, 0);
    currentIndex = Math.max(0, Math.min(index, max));

    // Calculate slide width including gap
    const slideWidth = slides[0].offsetWidth;
    const gap = 16;
    const offset = currentIndex * (slideWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
    updateSlideHighlight();
  }

  function next() { goTo(currentIndex + 1); }
  function prev() { goTo(currentIndex - 1); }

  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
  nextBtn.addEventListener('click', () => { next(); resetAuto(); });

  function startAuto() {
    autoPlayTimer = setInterval(() => {
      const vis = getVisible();
      const max = total - vis;
      if (currentIndex >= max) goTo(0);
      else next();
    }, 3500);
  }
  function resetAuto() { clearInterval(autoPlayTimer); startAuto(); }

  // Touch / drag support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { diff > 0 ? next() : prev(); resetAuto(); }
  });

  // Init
  buildDots();
  updateSlideHighlight();
  startAuto();

  window.addEventListener('resize', () => {
    buildDots();
    goTo(currentIndex);
  });
})();


// ===== PARTICLE CANVAS =====
(function () {
  const container = document.getElementById('particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  let W, H, particles;

  function resize() {
    W = canvas.width = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }

  function createParticles() {
    const count = Math.min(Math.floor(W * H / 10000), 60);
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.8 + 0.4,
      dx: (Math.random() - 0.5) * 0.3,
      dy: -(Math.random() * 0.5 + 0.15),
      alpha: Math.random() * 0.6 + 0.2,
      color: Math.random() > 0.6
        ? `rgba(212,160,23,`
        : Math.random() > 0.5
          ? `rgba(180,100,220,`
          : `rgba(200,80,80,`
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= 0.001;

      if (p.y < -5 || p.alpha <= 0) {
        p.x = Math.random() * W;
        p.y = H + 5;
        p.alpha = Math.random() * 0.6 + 0.2;
        p.dy = -(Math.random() * 0.5 + 0.15);
      }
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
    });
    requestAnimationFrame(draw);
  }

  resize();
  createParticles();
  draw();
  window.addEventListener('resize', () => { resize(); createParticles(); }, { passive: true });
})();


// ===== SMOOTH ANCHOR SCROLL (offset for fixed navbar) =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const id = anchor.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    const offset = 70;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
