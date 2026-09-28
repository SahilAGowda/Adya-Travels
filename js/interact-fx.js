/* ============================================================
   ADYA TRAVELS — Interaction layer
   A custom cursor, magnetic primary buttons, and real perspective
   tilt on cards (not a gradient trick — an actual 3D transform).
   Desktop + fine pointer only; everything is a no-op on touch and
   is fully skipped under prefers-reduced-motion.
   ============================================================ */
(() => {
  const canHover = window.matchMedia('(pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!canHover || reduceMotion) return;

  document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Custom cursor: a dot that leads, a ring that trails ---------- */
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cx-dot';
    ring.className = 'cx-ring';
    document.body.append(dot, ring);
    document.documentElement.classList.add('cx-active');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;
    let shown = false;

    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      if (!shown){ shown = true; dot.classList.add('is-visible'); ring.classList.add('is-visible'); }
    }, { passive: true });

    window.addEventListener('pointerdown', () => ring.classList.add('is-down'));
    window.addEventListener('pointerup', () => ring.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => { dot.classList.remove('is-visible'); ring.classList.remove('is-visible'); });
    document.addEventListener('mouseenter', () => { dot.classList.add('is-visible'); ring.classList.add('is-visible'); });

    const HOVER_SEL = 'a, button, .car-card, .journey-card, .service-card, input, select, textarea, .chip, .faq-q, .mini-car, .route-item';
    document.addEventListener('pointerover', (e) => {
      ring.classList.toggle('is-hover', !!e.target.closest(HOVER_SEL));
    }, { passive: true });

    (function tick(){
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(tick);
    })();

    /* ---------- Magnetic pull on the primary large buttons ---------- */
    document.querySelectorAll('.btn-lg, .fab').forEach((btn) => {
      let rect = null;
      const RANGE = 46;
      btn.addEventListener('pointerenter', () => { rect = btn.getBoundingClientRect(); });
      btn.addEventListener('pointermove', (e) => {
        if (!rect) rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx, dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy);
        if (dist > RANGE + rect.width / 2) return;
        const pull = Math.max(0, 1 - dist / (RANGE + rect.width));
        btn.style.transform = `translate(${dx * 0.22 * pull}px, ${dy * 0.28 * pull}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; rect = null; });
    });

    /* ---------- Real 3D tilt on cards — perspective, not a shadow trick ---------- */
    const TILT_SEL = '.car-card, .journey-card, .mini-car';
    document.querySelectorAll(TILT_SEL).forEach((card) => {
      const strength = card.classList.contains('journey-card') ? 5 : 7;
      let frame = null;
      card.addEventListener('pointerenter', () => { card.style.transitionDuration = '80ms'; });
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          card.style.transform = `perspective(1000px) rotateX(${(-py * strength).toFixed(2)}deg) rotateY(${(px * strength).toFixed(2)}deg) translateY(-6px) translateZ(0)`;
          card.style.setProperty('--glare-x', `${(px + 0.5) * 100}%`);
          card.style.setProperty('--glare-y', `${(py + 0.5) * 100}%`);
        });
      });
      card.addEventListener('pointerleave', () => {
        if (frame) cancelAnimationFrame(frame);
        card.style.transitionDuration = '';
        card.style.transform = '';
      });
    });
  });
})();
