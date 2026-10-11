/**
 * The easter-egg game (game.html): boost an egg through gaps in the pillars.
 * A plain canvas loop -- nothing in it is component state, so it's a module
 * rather than a React tree, and the page ships no UI framework.
 */
type GameState = 'start' | 'play' | 'over';

const el = <T extends HTMLElement>(id: string): T => {
  const e = document.getElementById(id);
  if (!e) throw new Error(`#${id} missing`);
  return e as T;
};

class Particle {
  x: number;
  y: number;
  vx = (Math.random() - 0.5) * 3 - 2;
  vy = Math.random() * 3 + 1;
  life = 1;
  decay = Math.random() * 0.05 + 0.02;
  color = `hsl(${Math.random() * 360}, 100%, 60%)`;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
  update(): void {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
  }
  draw(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = this.color;
    ctx.globalAlpha = Math.max(0, this.life);
    ctx.fillRect(this.x, this.y, 4, 4);
    ctx.globalAlpha = 1;
  }
}

export function initGame(): void {
  const canvas = el<HTMLCanvasElement>('game');
  const ctx = canvas.getContext('2d')!;
  const scoreEl = el('scoreEl');
  const instructions = el('instructions');
  const gameoverEl = el('gameover');
  const finalScoreEl = el('finalScore');

  let width = 0;
  let height = 0;
  const resize = (): void => {
    width = Math.min(window.innerWidth * 0.95, 800);
    height = Math.min(window.innerHeight * 0.85, 600);
    canvas.width = width;
    canvas.height = height;
  };
  window.addEventListener('resize', resize);
  resize();

  // Game state
  let frames = 0;
  let score = 0;
  let currentState: GameState = 'start';
  let particles: Particle[] = [];
  let obstacles: Obstacle[] = [];

  const egg = {
    x: 100,
    y: 150,
    radiusX: 15,
    radiusY: 20,
    velocity: 0,
    gravity: 0.35,
    jump: -6.5,
    rotation: 0,
    draw(): void {
      ctx.save();
      ctx.translate(this.x, this.y);
      this.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, this.velocity * 0.1));
      ctx.rotate(this.rotation);

      // Fancy egg pattern
      const grad = ctx.createLinearGradient(-this.radiusX, -this.radiusY, this.radiusX, this.radiusY);
      grad.addColorStop(0, '#ff0055');
      grad.addColorStop(0.3, '#ffaa00');
      grad.addColorStop(0.6, '#00ffaa');
      grad.addColorStop(1, '#5500ff');

      ctx.beginPath();
      ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Decorations
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-13, -5);
      ctx.lineTo(13, -5);
      ctx.moveTo(-15, 5);
      ctx.lineTo(15, 5);
      ctx.stroke();

      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0f0f0f';
      ctx.strokeRect(-this.radiusX, -this.radiusY, 0, 0); // Hack to trigger some sharp edges if needed

      ctx.beginPath();
      ctx.ellipse(0, 0, this.radiusX, this.radiusY, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },
    update(): void {
      this.velocity += this.gravity;
      this.y += this.velocity;

      // Floor collision
      if (this.y + this.radiusY >= height) {
        this.y = height - this.radiusY;
        gameOver();
      }
      // Ceiling collision
      if (this.y - this.radiusY <= 0) {
        this.y = this.radiusY;
        this.velocity = 0;
      }
    },
    boost(): void {
      this.velocity = this.jump;
      // Emit particles
      for (let i = 0; i < 5; i++) particles.push(new Particle(this.x - 10, this.y + 15));
    },
  };

  class Obstacle {
    x = width;
    w = 40 + Math.random() * 30;
    gap = 130 + Math.random() * 40;
    topH = 50 + Math.random() * (height - this.gap - 100);
    bottomY = this.topH + this.gap;
    bottomH = height - this.bottomY;
    speed = 3.5 + score * 0.1; // difficulty scaling
    passed = false;

    update(): void {
      this.x -= this.speed;
      if (!this.passed && this.x + this.w < egg.x) {
        score++;
        scoreEl.innerText = String(score);
        this.passed = true;
      }
      // Collision
      const eLeft = egg.x - egg.radiusX + 5;
      const eRight = egg.x + egg.radiusX - 5;
      const eTop = egg.y - egg.radiusY + 5;
      const eBot = egg.y + egg.radiusY - 5;

      if (eRight > this.x && eLeft < this.x + this.w) {
        if (eTop < this.topH || eBot > this.bottomY) gameOver();
      }
    }
    draw(): void {
      ctx.fillStyle = '#0f0f0f';
      ctx.fillRect(this.x, 0, this.w, this.topH); // top pillar
      ctx.fillRect(this.x, this.bottomY, this.w, this.bottomH); // bottom pillar

      // Tech stripes
      ctx.fillStyle = '#d62020';
      ctx.fillRect(this.x, this.topH - 10, this.w, 10);
      ctx.fillRect(this.x, this.bottomY, this.w, 10);
    }
  }

  const spawnObstacle = (): void => {
    if (frames % Math.max(60, 110 - score * 2) === 0) obstacles.push(new Obstacle());
  };

  const gameOver = (): void => {
    currentState = 'over';
    gameoverEl.style.display = 'block';
    finalScoreEl.innerText = String(score);
    // Explosion particles
    for (let i = 0; i < 30; i++) particles.push(new Particle(egg.x, egg.y));
  };

  const resetGame = (): void => {
    egg.y = height / 2;
    egg.velocity = 0;
    obstacles = [];
    particles = [];
    score = 0;
    frames = 0;
    scoreEl.innerText = String(score);
    gameoverEl.style.display = 'none';
    currentState = 'play';
    egg.boost();
  };

  const handleInput = (e: Event): void => {
    if (e.type === 'keydown' && (e as KeyboardEvent).code !== 'Space') return;
    const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
    if (tag === 'button' || tag === 'a') return;
    e.preventDefault();

    if (currentState === 'over') {
      resetGame();
      return;
    }
    if (currentState === 'start') currentState = 'play';
    if (currentState === 'play') {
      egg.boost();
      instructions.style.opacity = '0';
    }
  };

  window.addEventListener('keydown', handleInput, { passive: false });
  window.addEventListener('mousedown', handleInput, { passive: false });
  window.addEventListener('touchstart', handleInput, { passive: false });
  document.querySelector('.restart-btn')?.addEventListener('click', resetGame);

  const loop = (): void => {
    requestAnimationFrame(loop);

    ctx.clearRect(0, 0, width, height);

    if (currentState === 'play') {
      egg.update();
      spawnObstacle();
    }

    // Background grid
    ctx.strokeStyle = 'rgba(0,0,0,0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 40) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = 0; y < height; y += 40) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]!;
      p.update();
      p.draw(ctx);
      if (p.life <= 0) particles.splice(i, 1);
    }

    // Obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obs = obstacles[i]!;
      if (currentState === 'play') obs.update();
      obs.draw();
      if (obs.x + obs.w < 0) obstacles.splice(i, 1);
    }

    if (currentState !== 'over' || particles.length > 0) egg.draw();

    if (currentState === 'play') frames++;
  };

  loop();
}
