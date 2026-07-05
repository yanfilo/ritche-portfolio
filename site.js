// Sticky nav
    const nav  = document.getElementById('sticky-nav');
    const hero = document.getElementById('hero');
    window.addEventListener('scroll', () => {
      nav.classList.toggle('visible', window.scrollY > hero.offsetTop + hero.offsetHeight - 80);
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });

    // Mobile menu
    const burger = document.getElementById('hamburger');
    const menu   = document.getElementById('mobile-menu');
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      menu.classList.toggle('open');
      document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        menu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));

    // Lightbox — grouped per thumbnail
    (function () {
      const overlay   = document.getElementById('lb-overlay');
      const wrap      = document.getElementById('lb-img-wrap');
      const lbImg     = document.getElementById('lb-img');
      const lbFrame   = document.getElementById('lb-frame');
      const lbBadge   = document.getElementById('lb-html-badge');
      const lbTitle   = document.getElementById('lb-caption-title');
      const lbDesc    = document.getElementById('lb-caption-desc');
      const lbClose   = document.getElementById('lb-close');
      const lbPrev    = document.getElementById('lb-prev');
      const lbNext    = document.getElementById('lb-next');
      const lbCounter = document.getElementById('lb-counter');

      // slides for the currently open thumbnail group
      let slides  = [];
      let current = 0;

      function isHTML(src) {
        return typeof src === 'string' && src.toLowerCase().endsWith('.html');
      }

      // The embedded HTML docs are fixed 1080px-wide designs. Scale them down
      // to fit the available width so the whole layout shows (no zoom/crop),
      // and clip to a viewport-sized box that scrolls internally.
      const DOC_W = 1080;
      function fitFrame() {
        const item = slides[current];
        if (!item || !isHTML(item.src)) return;
        const availW = Math.min(window.innerWidth * 0.94, DOC_W);
        const availH = window.innerHeight * 0.80;
        const scale  = availW / DOC_W;
        wrap.style.width      = availW + 'px';
        wrap.style.height     = availH + 'px';
        lbFrame.style.width   = DOC_W + 'px';
        lbFrame.style.height  = (availH / scale) + 'px';
        lbFrame.style.transform = 'scale(' + scale + ')';
      }
      function resetFrame() {
        wrap.classList.remove('is-frame');
        wrap.style.width = '';
        wrap.style.height = '';
        lbFrame.style.width = '';
        lbFrame.style.height = '';
        lbFrame.style.transform = '';
      }

      function buildSlides(el) {
        // Multi-slide: data-lb-slides='[{"src":"","title":"","desc":""},...]'
        const raw = el.getAttribute('data-lb-slides');
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length) return parsed;
          } catch (e) {}
        }
        // Single-image fallback
        const img   = el.querySelector('img');
        const src   = img ? img.src : '';
        // .shot-cap lives outside .shot as a sibling; .gal-cap lives inside .gal-img
        const capEl = el.querySelector('.gal-cap') || el.parentElement.querySelector('.shot-cap');
        const title = capEl ? capEl.textContent.trim() : (img ? img.alt : '');
        return [{ src, title, desc: '' }];
      }

      function open(el) {
        slides  = buildSlides(el);
        current = 0;
        show();
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }

      function close() {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        // Clear iframe src to stop any running content
        lbFrame.src = '';
        resetFrame();
        slides = [];
      }

      function show() {
        const item = slides[current];
        const src  = item.src || '';
        const html = isHTML(src);

        // Toggle between image and iframe
        if (html) {
          lbImg.style.display   = 'none';
          lbFrame.style.display = 'block';
          lbBadge.style.display = 'block';
          lbFrame.src = src;
          wrap.classList.add('is-frame');
          fitFrame();
        } else {
          resetFrame();
          lbFrame.style.display = 'none';
          lbFrame.src           = '';
          lbBadge.style.display = 'none';
          lbImg.style.display   = 'block';
          lbImg.src = src;
          lbImg.alt = item.title || '';
        }

        lbTitle.textContent = item.title || '';
        lbDesc.textContent  = item.desc  || '';
        const multi = slides.length > 1;
        lbCounter.textContent = multi ? (current + 1) + ' / ' + slides.length : '';
        lbPrev.classList.toggle('hidden', current === 0);
        lbNext.classList.toggle('hidden', current === slides.length - 1);
      }

      function prev() { if (current > 0)                  { current--; show(); } }
      function next() { if (current < slides.length - 1)  { current++; show(); } }

      document.querySelectorAll('.shot, .gal-img').forEach(el => {
        el.addEventListener('click', () => open(el));
      });

      lbClose.addEventListener('click', close);
      lbPrev.addEventListener('click',  e => { e.stopPropagation(); prev(); });
      lbNext.addEventListener('click',  e => { e.stopPropagation(); next(); });
      overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

      document.addEventListener('keydown', e => {
        if (!overlay.classList.contains('open')) return;
        if (e.key === 'Escape')     close();
        if (e.key === 'ArrowLeft')  prev();
        if (e.key === 'ArrowRight') next();
      });

      // Re-fit the scaled preview on resize / orientation change.
      window.addEventListener('resize', () => {
        if (overlay.classList.contains('open')) fitFrame();
      });
    })();
