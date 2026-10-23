export interface BatsOptions {
  /** Cantidad de murciélagos en pantalla. */
  count?: number;
  /** Color de la silueta (cualquier valor CSS válido). */
  color?: string;
  /** Tamaño mínimo de cada murciélago, en px. */
  minSize?: number;
  /** Tamaño máximo de cada murciélago, en px. */
  maxSize?: number;
  /** Color de fondo a repintar cada frame, o null para dejar el canvas transparente. */
  background?: string | null;
}

export interface BatsController {
  /** Detiene la animación. */
  stop(): void;
  /** Reanuda la animación si estaba detenida. */
  start(): void;
  /** Cambia la cantidad de murciélagos y los reconstruye. */
  setCount(n: number): void;
}

interface ResolvedOptions {
  count: number;
  color: string;
  minSize: number;
  maxSize: number;
  background: string | null;
}

const DEFAULTS: ResolvedOptions = {
  count: 15,
  color: '#111111',
  minSize: 14,
  maxSize: 32,
  background: null,
};

class Bat {
  size = 0;
  x = 0;
  y = 0;
  baseY = 0;
  speedX = 0;
  speedY = 0;
  flapSpeed = 0;
  flapPhase = 0;
  bobSpeed = 0;
  bobPhase = 0;
  bobAmount = 0;
  opacity = 1;

  constructor(private canvas: HTMLCanvasElement, private opts: ResolvedOptions) {
    this.reset(true);
  }

  reset(initial: boolean) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    this.size = this.opts.minSize + Math.random() * (this.opts.maxSize - this.opts.minSize);
    this.x = initial ? Math.random() * w : Math.random() < 0.5 ? -this.size : w + this.size;
    this.y = initial ? Math.random() * h : Math.random() * h * 0.8;
    this.speedX = (0.4 + Math.random() * 1.2) * (Math.random() < 0.5 ? -1 : 1);
    this.speedY = (Math.random() - 0.5) * 0.4;
    this.flapSpeed = 0.15 + Math.random() * 0.15;
    this.flapPhase = Math.random() * Math.PI * 2;
    this.bobSpeed = 0.01 + Math.random() * 0.02;
    this.bobPhase = Math.random() * Math.PI * 2;
    this.bobAmount = 10 + Math.random() * 20;
    this.opacity = 0.5 + Math.random() * 0.5;
    this.baseY = this.y;
  }

  update(t: number) {
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.x += this.speedX;
    this.baseY += this.speedY;
    this.y = this.baseY + Math.sin(t * this.bobSpeed + this.bobPhase) * this.bobAmount;
    this.flapPhase += this.flapSpeed;

    if (
      this.x < -this.size * 2 ||
      this.x > w + this.size * 2 ||
      this.baseY < -this.size * 2 ||
      this.baseY > h + this.size * 2
    ) {
      this.reset(false);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const s = this.size;
    const flap = Math.sin(this.flapPhase);
    const wingLift = flap * (s * 0.45);
    const facingLeft = this.speedX < 0;

    ctx.save();
    ctx.translate(this.x, this.y);
    if (facingLeft) ctx.scale(-1, 1);
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.opts.color;

    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.14, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    drawWing(ctx, s, wingLift, 1);
    drawWing(ctx, s, wingLift, -1);

    ctx.beginPath();
    ctx.moveTo(-s * 0.08, -s * 0.2);
    ctx.lineTo(-s * 0.14, -s * 0.34);
    ctx.lineTo(-s * 0.02, -s * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(s * 0.08, -s * 0.2);
    ctx.lineTo(s * 0.14, -s * 0.34);
    ctx.lineTo(s * 0.02, -s * 0.22);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

function drawWing(ctx: CanvasRenderingContext2D, s: number, lift: number, side: 1 | -1) {
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.05);
  ctx.quadraticCurveTo(side * s * 0.5, -s * 0.5 - lift, side * s * 0.95, -s * 0.15 - lift * 0.6);
  ctx.quadraticCurveTo(side * s * 0.65, -s * 0.05 - lift * 0.3, side * s * 0.55, s * 0.12);
  ctx.quadraticCurveTo(side * s * 0.35, s * 0.02, side * s * 0.15, s * 0.18);
  ctx.quadraticCurveTo(side * s * 0.05, s * 0.05, 0, s * 0.1);
  ctx.closePath();
  ctx.fill();
}

/**
 * Inicializa la animación de murciélagos sobre un canvas.
 */
export function init(canvas: HTMLCanvasElement, options: BatsOptions = {}): BatsController {
  const opts: ResolvedOptions = { ...DEFAULTS, ...options };
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) {
    throw new Error('bats-js: no se pudo obtener el contexto 2d del canvas');
  }
  const ctx: CanvasRenderingContext2D = maybeCtx;

  let bats: Bat[] = [];
  let running = true;
  let rafId = 0;
  let t = 0;

  function resize() {
    canvas.width = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
  }

  function build() {
    bats = [];
    for (let i = 0; i < opts.count; i++) {
      bats.push(new Bat(canvas, opts));
    }
  }

  function loop() {
    if (!running) return;
    t += 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (opts.background) {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    for (const bat of bats) {
      bat.update(t);
      bat.draw(ctx);
    }
    rafId = requestAnimationFrame(loop);
  }

  resize();
  build();
  loop();

  const onResize = () => resize();
  window.addEventListener('resize', onResize);

  return {
    stop() {
      running = false;
      cancelAnimationFrame(rafId);
    },
    start() {
      if (!running) {
        running = true;
        loop();
      }
    },
    setCount(n: number) {
      opts.count = n;
      build();
    },
  };
}

export default { init };
