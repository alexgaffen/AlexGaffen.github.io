/**
 * The drifting node-and-line backdrop behind photos, blog and game. Home,
 * resume and notes are plain colour and never load this.
 */
interface Star {
  x: number;
  y: number;
  radius: number;
  speed: number;
  phase: number;
  driftX: number;
  driftY: number;
  glow: number;
  color: string;
}

interface Profile {
  linkAlpha: number;
  glowAlpha: number;
  nodeAlpha: number;
  sparkAlpha: number;
  nearLineWidth: number;
  farLineWidth: number;
}

export function initWorldCanvas(): void {
  const body = document.body;
  if (document.getElementById('site-world-canvas')) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'site-world-canvas';
  canvas.className =
    'site-world-canvas fixed inset-0 z-0 h-full w-full pointer-events-none opacity-[var(--site-world-canvas-opacity,0.88)] saturate-[1.16] contrast-[1.03]';
  body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let stars: Star[] = [];
  let width = 0;
  let height = 0;
  let linkDistance = 180;
  let colors: string[] = [];
  let profile: Profile = {
    linkAlpha: 0.2,
    glowAlpha: 0.16,
    nodeAlpha: 0.92,
    sparkAlpha: 0.55,
    nearLineWidth: 1.2,
    farLineWidth: 0.8,
  };

  const readNumberVar = (name: string, fallback: number) => {
    const value = parseFloat(getComputedStyle(body).getPropertyValue(name));
    return Number.isFinite(value) ? value : fallback;
  };

  const refreshVisualProfile = () => {
    const computed = getComputedStyle(body);
    colors = [
      computed.getPropertyValue('--site-world-a').trim() || 'rgba(90, 197, 255, 0.42)',
      computed.getPropertyValue('--site-world-b').trim() || 'rgba(255, 143, 92, 0.22)',
      computed.getPropertyValue('--site-world-c').trim() || 'rgba(255, 243, 175, 0.24)',
    ];
    profile = {
      linkAlpha: readNumberVar('--site-world-link-alpha', 0.2),
      glowAlpha: readNumberVar('--site-world-glow-alpha', 0.16),
      nodeAlpha: readNumberVar('--site-world-node-alpha', 0.92),
      sparkAlpha: readNumberVar('--site-world-spark-alpha', 0.55),
      nearLineWidth: readNumberVar('--site-world-near-line-width', 1.2),
      farLineWidth: readNumberVar('--site-world-far-line-width', 0.8),
    };
  };

  const resizeCanvas = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const count = Math.max(34, Math.min(70, Math.round(width / 30)));
    linkDistance = Math.max(200, Math.min(380, width * 0.27));
    stars = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.4 + Math.random() * 3.6,
      speed: 0.05 + Math.random() * 0.28,
      phase: Math.random() * Math.PI * 2,
      driftX: 10 + Math.random() * 22,
      driftY: 8 + Math.random() * 18,
      glow: 5 + Math.random() * 10,
      color: colors[index % colors.length]!,
    }));
  };

  const drawFrame = (time: number) => {
    ctx.clearRect(0, 0, width, height);

    const linkDistanceSq = linkDistance * linkDistance;
    const nearCut = linkDistance * 0.4;
    const farCut = linkDistance * 0.7;
    const orbit = time * 0.00016;
    const points = stars.map((star) => {
      if (!prefersReducedMotion) star.y = (star.y + star.speed) % (height + 60);
      return {
        x: star.x + Math.sin(orbit + star.phase) * star.driftX,
        y: star.y + Math.cos(orbit * 1.18 + star.phase) * star.driftY,
        star,
      };
    });

    for (let index = 0; index < points.length; index += 1) {
      const point = points[index]!;
      const star = point.star;

      for (let linkIndex = index + 1; linkIndex < points.length; linkIndex += 1) {
        const peer = points[linkIndex]!;
        const dx = point.x - peer.x;
        const dy = point.y - peer.y;

        // Compare squared distances first -- most pairs are out of range, and
        // this skips the sqrt for all of them.
        const distSq = dx * dx + dy * dy;
        if (distSq > linkDistanceSq) continue;

        const distance = Math.sqrt(distSq);
        const fade = 1 - distance / linkDistance;
        const alpha = fade * fade * profile.linkAlpha;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(peer.x, peer.y);
        ctx.strokeStyle = star.color;
        ctx.globalAlpha = Math.min(1, alpha * 1.6);
        ctx.lineWidth =
          distance < nearCut
            ? profile.nearLineWidth
            : distance < farCut
              ? (profile.nearLineWidth + profile.farLineWidth) / 2
              : profile.farLineWidth;
        ctx.stroke();
      }

      // outer glow ring (wide, soft)
      ctx.beginPath();
      ctx.fillStyle = star.color;
      ctx.globalAlpha = profile.glowAlpha * 1.4;
      ctx.arc(point.x, point.y, star.radius * star.glow * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // mid glow (tighter, stronger)
      ctx.beginPath();
      ctx.fillStyle = star.color;
      ctx.globalAlpha = profile.glowAlpha * 2.2;
      ctx.arc(point.x, point.y, star.radius * 3.5, 0, Math.PI * 2);
      ctx.fill();

      // solid node core
      ctx.beginPath();
      ctx.fillStyle = star.color;
      ctx.globalAlpha = profile.nodeAlpha;
      ctx.arc(point.x, point.y, star.radius, 0, Math.PI * 2);
      ctx.fill();

      // bright white highlight
      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.globalAlpha = profile.sparkAlpha * 1.25;
      ctx.arc(point.x, point.y, Math.max(0.6, star.radius * 0.44), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1;
  };

  // The backdrop drifts slowly, so painting it at ~30fps looks identical to
  // 60fps while halving the work. The loop also stops entirely whenever the
  // tab is hidden, so a background tab costs nothing.
  const FRAME_MS = 1000 / 30;
  let rafId: number | null = null;
  let lastPaint = 0;

  const loop = (time: number) => {
    rafId = requestAnimationFrame(loop);
    if (time - lastPaint < FRAME_MS) return;
    lastPaint = time;
    drawFrame(time);
  };
  const startLoop = () => {
    if (rafId !== null || prefersReducedMotion) return;
    lastPaint = 0;
    rafId = requestAnimationFrame(loop);
  };
  const stopLoop = () => {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  };

  refreshVisualProfile();
  resizeCanvas();

  const begin = () => {
    if (prefersReducedMotion) drawFrame(0);
    else if (!document.hidden) startLoop();
  };

  // A page being pre-rendered for an instant tab switch must not burn CPU
  // animating a backdrop nobody is looking at yet.
  if (document.prerendering) document.addEventListener('prerenderingchange', begin, { once: true });
  else begin();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopLoop();
    else if (!document.prerendering) begin();
  });

  window.addEventListener('resize', () => {
    resizeCanvas();
    if (prefersReducedMotion) drawFrame(0);
  });

  new MutationObserver(() => {
    refreshVisualProfile();
    if (prefersReducedMotion) drawFrame(0);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
}
