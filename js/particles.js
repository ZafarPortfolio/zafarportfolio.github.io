/**
 * Minimal ambient particle field — small drifting "blocks" of light.
 * Kept intentionally light (low count, no external deps) so it never
 * competes with the plugin.yml signature card for attention.
 */
(function () {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d');
  let particles = [];
  let width, height, raf;

  const COLORS = ['rgba(255,212,0,0.55)', 'rgba(139,108,246,0.5)', 'rgba(255,255,255,0.3)'];

  function resize() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.offsetWidth;
    height = canvas.height = parent.offsetHeight;
  }

  function makeParticles() {
    const count = Math.min(46, Math.floor((width * height) / 26000));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.6 + 1,
      speedY: Math.random() * 0.35 + 0.08,
      drift: Math.random() * 0.4 - 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, width, height);
    for (const p of particles) {
      p.y -= p.speedY;
      p.x += p.drift;
      if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  }

  function init() {
    resize();
    makeParticles();
    if (raf) cancelAnimationFrame(raf);
    if (!reduceMotion) tick();
  }

  window.addEventListener('resize', () => {
    clearTimeout(window.__particleResizeT);
    window.__particleResizeT = setTimeout(init, 200);
  });

  init();
})();
