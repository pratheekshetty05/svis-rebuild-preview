(function(){
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) root.classList.add('paused');
  function all(sel, ctx){ return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* menu panel */
  var menuBtn = document.getElementById('menuBtn');
  var menu = document.getElementById('siteMenu');
  function setMenu(open){
    root.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('span').textContent = open ? 'Close' : 'Menu';
    all('main, .ribbons, footer.site').forEach(function(el){ el.inert = open; });
    if(open) menu.querySelector('a').focus();
    else menuBtn.focus({ preventScroll: true });
  }
  menuBtn.addEventListener('click', function(){ setMenu(!root.classList.contains('menu-open')); });
  document.querySelector('.scrim').addEventListener('click', function(){ setMenu(false); });
  menu.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && root.classList.contains('menu-open')) setMenu(false);
  });

  /* header: hide on scroll down, follow the tone of the section beneath it */
  var header = document.getElementById('siteHeader');
  var sticky = document.querySelector('.sticky-cta');
  var zones = all('main > *, .ribbons, footer.site');
  var DARK = '.vh.ready, .story, .skills, .voices, .guide, .page-hero, .on-navy, .quote-band, .ribbons, footer.site';
  var lastY = window.scrollY, chromeQueued = false;
  function updateChrome(){
    chromeQueued = false;
    var y = window.scrollY;
    header.classList.toggle('hide', y > lastY && y > 120);
    lastY = y;
    var zone = zones.filter(function(el){
      var r = el.getBoundingClientRect();
      return r.top <= 44 && r.bottom > 44;
    })[0];
    header.classList.toggle('on-dark', !!zone && zone.matches(DARK));
    if(sticky) sticky.classList.toggle('on', y > 480);
  }
  window.addEventListener('scroll', function(){
    if(!chromeQueued){ chromeQueued = true; requestAnimationFrame(updateChrome); }
  }, { passive: true });
  updateChrome();

  /* word-by-word rise for large statements */
  function splitWords(el){
    var i = 0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(child){
        if(child.nodeType === 1){ walk(child); return; }
        var frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach(function(part){
          if(!part) return;
          if(/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'), inner = document.createElement('i');
          w.className = 'w';
          inner.textContent = part;
          inner.style.setProperty('--i', i++);
          w.appendChild(inner);
          frag.appendChild(w);
        });
        child.replaceWith(frag);
      });
    })(el);
  }
  if(!reduced) all('[data-words]').forEach(splitWords);

  var revealIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); revealIO.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  all('[data-reveal], [data-words], .wave, .sk-rows').forEach(function(el){ revealIO.observe(el); });

  /* sliders: story, voices, stats */
  all('[data-slider]').forEach(function(box){
    var slides = all('[data-slide]', box);
    var dots = box.querySelector('[data-dots]');
    var ms = parseInt(box.dataset.slider, 10) || 0;
    var index = 0, visible = false, held = false;
    var buttons = slides.map(function(_, n){
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Show ' + (n + 1) + ' of ' + slides.length);
      b.addEventListener('click', function(){ show(n); });
      dots.appendChild(b);
      return b;
    });
    function show(n){
      index = (n + slides.length) % slides.length;
      slides.forEach(function(s, k){ s.classList.toggle('on', k === index); });
      buttons.forEach(function(b, k){ b.setAttribute('aria-current', String(k === index)); });
    }
    var prev = box.querySelector('[data-prev]'), next = box.querySelector('[data-next]');
    if(prev) prev.addEventListener('click', function(){ show(index - 1); });
    if(next) next.addEventListener('click', function(){ show(index + 1); });
    box.addEventListener('mouseenter', function(){ held = true; });
    box.addEventListener('mouseleave', function(){ held = false; });
    box.addEventListener('focusin', function(){ held = true; });
    box.addEventListener('focusout', function(){ held = false; });
    new IntersectionObserver(function(e){ visible = e[0].isIntersecting; }).observe(box);
    show(0);
    if(ms) setInterval(function(){
      if(visible && !held && !root.classList.contains('paused')) show(index + 1);
    }, ms);
  });

  /* academics accordion: one row open at a time, marquee sets cloned for a seamless loop */
  var rows = all('.sk-row');
  rows.forEach(function(row){
    var track = row.querySelector('.sk-track');
    var set = track.querySelector('.sk-set');
    for(var i = 0; i < 3; i++){
      var copy = set.cloneNode(true);
      all('img', copy).forEach(function(img){ img.alt = ''; });
      track.appendChild(copy);
    }
    var btn = row.querySelector('.sk-btn');
    btn.addEventListener('click', function(){
      var open = !row.classList.contains('open');
      rows.forEach(function(other){
        other.classList.toggle('open', other === row && open);
        other.querySelector('.sk-btn').setAttribute('aria-expanded', String(other === row && open));
      });
    });
  });

  /* guide: background tint while the section is centred */
  var guide = document.querySelector('.guide');
  if(guide){
    new IntersectionObserver(function(e){
      guide.classList.toggle('active', e[0].isIntersecting);
    }, { rootMargin: '-45% 0px -45% 0px' }).observe(guide);
  }

  /* hero */
  var hero = document.querySelector('.vh');
  if(!hero) return;
  var reveal = hero.querySelector('.vh-reveal');
  var copy = hero.querySelector('.vh-copy');
  var media = hero.querySelector('.vh-media');
  var cue = hero.querySelector('.vh-cue');
  var pause = hero.querySelector('.vh-pause');

  pause.hidden = reduced;
  pause.addEventListener('click', function(){
    var paused = root.classList.toggle('paused');
    pause.setAttribute('aria-pressed', String(paused));
    pause.querySelector('span').textContent = paused ? 'Play motion' : 'Pause motion';
  });

  /* load reveal: the headline sits on paper, then a circle opens onto the campus */
  function finishReveal(){
    var over = hero.querySelector('.vh-over');
    if(over) over.remove();
    hero.classList.add('done');
  }
  if(reduced){
    hero.classList.add('ready');
    finishReveal();
    updateChrome();
  } else {
    var over = document.createElement('div');
    var title = copy.cloneNode(true);
    var h1 = title.querySelector('h1');
    var plain = document.createElement('div');
    plain.className = h1.className;
    plain.innerHTML = h1.innerHTML;
    h1.replaceWith(plain);
    over.className = 'vh-over';
    over.setAttribute('aria-hidden', 'true');
    over.appendChild(title);
    hero.insertBefore(over, reveal);
    var heroImg = media.querySelector('img');
    var loaded = heroImg.decode ? heroImg.decode().catch(function(){}) : Promise.resolve();
    var timeout = new Promise(function(done){ setTimeout(done, 1600); });
    var hold = new Promise(function(done){ setTimeout(done, 600); });
    Promise.all([hold, Promise.race([loaded, timeout])]).then(function(){
      hero.classList.add('ready');
      updateChrome();
      setTimeout(finishReveal, 1600);
    });
  }

  if(reduced) return;

  /* parallax: photo drifts down, headline lifts faster */
  var target = 0, current = 0, running = false;
  function renderParallax(){
    var d = target - current;
    current = Math.abs(d) < 0.3 ? target : current + d * 0.14;
    var h = hero.offsetHeight;
    var p = Math.min(1, current / h);
    media.style.transform = 'translate3d(0,' + (current * 0.16).toFixed(1) + 'px,0)';
    copy.style.transform = 'translate3d(0,' + (-current * 0.22).toFixed(1) + 'px,0)';
    copy.style.opacity = Math.max(0, 1 - p * 1.5).toFixed(3);
    if(current !== target) requestAnimationFrame(renderParallax);
    else running = false;
  }
  window.addEventListener('scroll', function(){
    target = Math.min(window.scrollY, hero.offsetHeight);
    if(!running){ running = true; requestAnimationFrame(renderParallax); }
  }, { passive: true });

  /* cursor-following scroll button on devices with a precise pointer */
  if(window.matchMedia('(pointer: fine)').matches){
    cue.classList.add('fine');
    var cx = 0, cy = 0, gx = 0, gy = 0, following = false;
    function followCue(){
      cx += (gx - cx) * 0.18;
      cy += (gy - cy) * 0.18;
      cue.style.setProperty('--x', cx.toFixed(1) + 'px');
      cue.style.setProperty('--y', cy.toFixed(1) + 'px');
      if(following) requestAnimationFrame(followCue);
    }
    hero.addEventListener('mousemove', function(e){
      var r = hero.getBoundingClientRect();
      gx = e.clientX - r.left - 46;
      gy = e.clientY - r.top - 46;
      if(!following){
        following = true;
        cx = gx; cy = gy;
        cue.style.setProperty('--s', 1);
        requestAnimationFrame(followCue);
      }
    });
    hero.addEventListener('mouseleave', function(){
      following = false;
      cue.style.setProperty('--s', 0);
    });
  }
})();
