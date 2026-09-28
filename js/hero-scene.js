/* ============================================================
   ADYA TRAVELS — Hero scene
   A hand-built canvas animation: a road in true perspective,
   receding into a vanishing point, with drifting headlight /
   taillight bokeh. Replaces a stock photo with something that
   is actually ours and actually moves. No libraries.
   ============================================================ */
(() => {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || !canvas.getContext) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0, dpr = 1;
  let running = true;
  let mx = 0.5, my = 0.42; // vanishing point, as a fraction of the canvas
  let targetMx = 0.5, targetMy = 0.42;

  // Palette pulled from the site's own tokens, not a random gradient.
  const BRONZE = [207, 174, 114];   // --bronze-light
  const BRONZE_DEEP = [176, 141, 82];
  const IVORY = [247, 242, 233];

  function resize(){
    const rect = canvas.parentElement.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Lane rungs: spaced with true perspective (dense near the horizon,
  // wide near the camera), each one drifting toward the viewer.
  const RUNG_COUNT = 22;
  let rungs = [];
  function seedRungs(){
    rungs = [];
    for (let i = 0; i < RUNG_COUNT; i++) rungs.push(i / RUNG_COUNT);
  }
  seedRungs();

  // Headlight / taillight bokeh — soft blurred discs drifting past,
  // each on its own depth layer for a little parallax.
  const LIGHTS = [];
  function seedLights(){
    LIGHTS.length = 0;
    const count = 9;
    for (let i = 0; i < count; i++){
      const depth = 0.25 + Math.random() * 0.75; // 0 = far, 1 = near
      LIGHTS.push({
        x: Math.random(),
        y: 0.18 + Math.random() * 0.5,
        depth,
        r: 10 + depth * 46,
        speed: (0.02 + depth * 0.05) * (Math.random() < 0.5 ? 1 : -1),
        warm: Math.random() < 0.72,
        phase: Math.random() * Math.PI * 2
      });
    }
  }
  seedLights();

  function rgba(c, a){ return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }

  function drawRoad(t){
    const vpX = w * targetMx;
    const vpY = h * targetMy;
    const roadHalfWidthBottom = w * 0.62;
    const roadHalfWidthTop = w * 0.015;

    // Two converging road edges
    ctx.save();
    ctx.strokeStyle = rgba(BRONZE_DEEP, 0.35);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(vpX - roadHalfWidthTop, vpY);
    ctx.lineTo(vpX - roadHalfWidthBottom, h);
    ctx.moveTo(vpX + roadHalfWidthTop, vpY);
    ctx.lineTo(vpX + roadHalfWidthBottom, h);
    ctx.stroke();

    // A handful of secondary guide-lines either side (fainter)
    ctx.strokeStyle = rgba(BRONZE_DEEP, 0.14);
    for (const frac of [0.35, 0.68, 1.35, 1.7]){
      ctx.beginPath();
      ctx.moveTo(vpX - roadHalfWidthTop * frac, vpY);
      ctx.lineTo(vpX - roadHalfWidthBottom * frac, h);
      ctx.moveTo(vpX + roadHalfWidthTop * frac, vpY);
      ctx.lineTo(vpX + roadHalfWidthBottom * frac, h);
      ctx.stroke();
    }

    // Rungs: perspective-correct spacing, animated toward the camera
    ctx.lineCap = 'round';
    for (let i = 0; i < rungs.length; i++){
      let p = (rungs[i] + t) % 1; // 0 at horizon, 1 at camera
      const ease = p * p; // bunch up near the horizon like a real road
      const y = vpY + (h - vpY) * ease;
      const halfW = roadHalfWidthTop + (roadHalfWidthBottom - roadHalfWidthTop) * ease;
      const alpha = Math.min(1, ease * 1.6) * (1 - ease * 0.15);
      const lineW = 1 + ease * 3;

      ctx.strokeStyle = rgba(BRONZE, alpha * 0.5);
      ctx.lineWidth = lineW;
      ctx.beginPath();
      ctx.moveTo(vpX - halfW, y);
      ctx.lineTo(vpX + halfW, y);
      ctx.stroke();

      // Center dash, brighter — the literal "route line" motif, in motion
      ctx.strokeStyle = rgba(IVORY, alpha * 0.6);
      ctx.lineWidth = lineW * 0.6;
      ctx.beginPath();
      ctx.moveTo(vpX - halfW * 0.02, y);
      ctx.lineTo(vpX + halfW * 0.02, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawLights(time){
    ctx.save();
    for (const L of LIGHTS){
      const x = ((L.x + time * L.speed) % 1.2 + 1.2) % 1.2 - 0.1;
      const bob = Math.sin(time * 1.6 + L.phase) * 0.012;
      const px = x * w;
      const py = (L.y + bob) * h;
      const color = L.warm ? BRONZE : IVORY;
      const grad = ctx.createRadialGradient(px, py, 0, px, py, L.r);
      grad.addColorStop(0, rgba(color, 0.5 * L.depth));
      grad.addColorStop(0.4, rgba(color, 0.18 * L.depth));
      grad.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(px, py, L.r, L.r * 0.62, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawSky(){
    // A few faint stars up in the dark, static so they read as depth not noise
    ctx.save();
    ctx.fillStyle = rgba(IVORY, 0.5);
    for (let i = 0; i < 46; i++){
      const sx = (i * 97 % 100) / 100 * w;
      const sy = (i * 53 % 40) / 100 * h * 0.5;
      const r = (i % 3 === 0) ? 1.3 : 0.7;
      ctx.globalAlpha = 0.15 + (i % 5) * 0.07;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  let start = null;
  let raf = null;
  function frame(now){
    if (!running) return;
    if (start === null) start = now;
    const t = (now - start) / 1000;

    // Ease the vanishing point toward the mouse target (parallax)
    targetMx += (mx - targetMx) * 0.04;
    targetMy += (my - targetMy) * 0.04;

    ctx.clearRect(0, 0, w, h);
    drawSky();
    drawRoad((t * 0.09) % 1);
    drawLights(t * 0.6);

    raf = requestAnimationFrame(frame);
  }

  function drawStatic(){
    // Reduced-motion: one still frame, no rAF loop
    ctx.clearRect(0, 0, w, h);
    drawSky();
    drawRoad(0.4);
    drawLights(0);
  }

  function onMove(e){
    const rect = canvas.getBoundingClientRect();
    const cx = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const cy = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    mx = 0.5 + Math.max(-0.5, Math.min(0.5, (cx / rect.width - 0.5))) * 0.5;
    my = 0.42 + Math.max(-0.5, Math.min(0.5, (cy / rect.height - 0.5))) * 0.18;
  }

  const section = canvas.closest('section') || canvas.parentElement;
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
    running = entry.isIntersecting && document.visibilityState === 'visible';
    if (running && !raf && !reduceMotion) raf = requestAnimationFrame(frame);
    if (!running && raf){ cancelAnimationFrame(raf); raf = null; }
  }, { threshold: 0.05 }) : null;

  function start_(){
    resize();
    if (reduceMotion){ drawStatic(); return; }
    if (io) io.observe(section);
    raf = requestAnimationFrame(frame);
  }

  window.addEventListener('resize', () => { resize(); if (reduceMotion) drawStatic(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    running = document.visibilityState === 'visible';
    if (running && !raf && !reduceMotion) raf = requestAnimationFrame(frame);
  });
  section.addEventListener('pointermove', onMove, { passive: true });
  section.addEventListener('touchmove', onMove, { passive: true });

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start_);
  } else {
    start_();
  }
})();
