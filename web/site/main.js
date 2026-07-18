/* Summit & Stitch — scroll motion
   Damped parallax on the clay bands, hero push-in, reveals, header state.
   No dependencies; everything gated on prefers-reduced-motion. */

(function () {
  'use strict';

  document.documentElement.classList.add('js');

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* header turns solid past the hero */
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');

  function headerState() {
    if (!header || !hero) return;
    header.classList.toggle('is-solid', window.scrollY > hero.offsetHeight * 0.75);
  }
  window.addEventListener('scroll', headerState, { passive: true });
  headerState();

  /* reveals */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* drop list form */
  var form = document.getElementById('CaptureForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.hidden = true;
      document.getElementById('CaptureOk').hidden = false;
    });
  }

  if (reduced) return;

  /* scroll-scrubbed motion: hero push-in + band parallax, damped */
  var heroMedia = document.querySelector('.hero__media');
  var bands = [].slice.call(document.querySelectorAll('.band__media'));
  var target = 0;
  var current = 0;
  var raf = null;

  function onScroll() {
    target = window.scrollY;
    if (raf === null) raf = requestAnimationFrame(tick);
  }

  function tick() {
    current += (target - current) * 0.12;

    if (heroMedia && hero) {
      var hp = Math.min(Math.max(current / hero.offsetHeight, 0), 1);
      heroMedia.style.transform =
        'scale(' + (1 + hp * 0.16) + ') translateY(' + hp * 6 + '%)';
    }

    var vh = window.innerHeight;
    bands.forEach(function (media) {
      var rect = media.parentElement.getBoundingClientRect();
      var progress = (rect.top + rect.height / 2 - vh / 2) / (vh / 2 + rect.height / 2);
      media.style.transform = 'translateY(' + (progress * -9) + '%)';
    });

    if (Math.abs(target - current) > 0.5) {
      raf = requestAnimationFrame(tick);
    } else {
      raf = null;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
