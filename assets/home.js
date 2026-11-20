/* SVIS homepage behaviour: header state, menu, carousels, parallax dots and reveals. */
(() => {
  const d = document, body = d.body;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const hd = d.getElementById('hd');

  /* Header turns solid green once the page scrolls. */
  const setHeader = () => hd.classList.toggle('solid', scrollY > 60);
  setHeader();

  /* Menu overlay. */
  const burger = d.getElementById('burger');
  const menu = d.getElementById('menu');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    menu.inert = !open;
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) menu.querySelector('nav a').focus({ preventScroll: true });
  };
  burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('menu-open')) { setMenu(false); burger.focus(); }
  });

  /* Hero motion pause. */
  const hero = d.querySelector('.hero');
  const pause = d.getElementById('pause');
  pause.addEventListener('click', () => {
    const on = hero.classList.toggle('paused');
    pause.setAttribute('aria-pressed', on);
    pause.setAttribute('aria-label', on ? 'Play background motion' : 'Pause background motion');
  });

  /* "Learn by doing" carousel: the slide nearest the centre is in colour. */
  const track = d.getElementById('ltrack');
  const slides = [...track.children];
  const centre = (el) => el.offsetLeft + el.offsetWidth / 2;
  const nearest = () => {
    const mid = track.scrollLeft + track.clientWidth / 2;
    return slides.reduce((best, s, i) => Math.abs(centre(s) - mid) < Math.abs(centre(slides[best]) - mid) ? i : best, 0);
  };
  const markActive = () => { const n = nearest(); slides.forEach((s, i) => s.classList.toggle('on', i === n)); };
  const goTo = (i, smooth) => {
    const s = slides[Math.max(0, Math.min(slides.length - 1, i))];
    track.scrollTo({ left: centre(s) - track.clientWidth / 2, behavior: smooth && !reduce.matches ? 'smooth' : 'instant' });
  };
  goTo(1, false);
  markActive();
  track.addEventListener('scroll', () => requestAnimationFrame(markActive), { passive: true });
  d.querySelectorAll('[data-l]').forEach((b) => b.addEventListener('click', () => goTo(nearest() + +b.dataset.l, true)));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); goTo(nearest() + (e.key === 'ArrowRight' ? 1 : -1), true); }
  });
  addEventListener('resize', () => goTo(nearest(), false));

  /* Voices row arrows. */
  const vo = d.getElementById('votrack');
  d.querySelectorAll('[data-v]').forEach((b) => b.addEventListener('click', () => {
    vo.scrollBy({ left: +b.dataset.v * vo.firstElementChild.offsetWidth, behavior: reduce.matches ? 'instant' : 'smooth' });
  }));

  /* Reveal on scroll. */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -12% 0px' });
  d.querySelectorAll('[data-rv]').forEach((el) => io.observe(el));

  /* Parallax drift for dots and campus circles. */
  const movers = [...d.querySelectorAll('[data-speed]')];
  let ticking = false;
  const drift = () => {
    ticking = false;
    const vh = innerHeight;
    const still = reduce.matches;
    movers.forEach((el) => {
      if (still) { el.style.translate = ''; return; }
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > vh + 200) return;
      const off = (r.top + r.height / 2 - vh / 2) * +el.dataset.speed;
      el.style.translate = `0 ${off.toFixed(1)}px`;
    });
  };
  addEventListener('scroll', () => {
    setHeader();
    if (!ticking) { ticking = true; requestAnimationFrame(drift); }
  }, { passive: true });
  drift();
})();
