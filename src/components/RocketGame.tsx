"use client";

import { useEffect, useRef, useCallback, useState } from "react";

// ── Constants ──────────────────────────────────────────────────────
const ROCKET_SIZE = 92;
const THRUST = 350;
const DRAG = 0.99;
const ROTATION_SPEED = 4.5;
const MAX_EXHAUST = 40;

const BULLET_SPEED = 500;
const BULLET_RADIUS = 3;
const BULLET_LIFETIME = 1.5;
const BULLET_COOLDOWN = 0.18;
const MAX_BULLETS = 8;

const ASTEROID_SIZES = { large: 40, medium: 24, small: 14 } as const;
type AsteroidSize = keyof typeof ASTEROID_SIZES;
const ASTEROID_SPEED: Record<AsteroidSize, [number, number]> = {
  large: [30, 70],
  medium: [50, 110],
  small: [70, 150],
};
const ASTEROID_SCORE: Record<AsteroidSize, number> = {
  large: 25,
  medium: 50,
  small: 100,
};
const INITIAL_ASTEROIDS = 4;
const STARTING_LIVES = 3;
const INVINCIBILITY_TIME = 2.0;
const ROCKET_HITBOX_FACTOR = 0.35;

// ── Types ──────────────────────────────────────────────────────────
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: AsteroidSize;
  radius: number;
  rotation: number;
  rotSpeed: number;
  vertices: number[]; // offset ratios for irregular shape
}

function createAsteroidVertices(): number[] {
  const count = 8 + Math.floor(Math.random() * 5);
  const verts: number[] = [];
  for (let i = 0; i < count; i++) {
    verts.push(0.7 + Math.random() * 0.3);
  }
  return verts;
}

function spawnAsteroid(
  w: number,
  h: number,
  size: AsteroidSize,
  x?: number,
  y?: number
): Asteroid {
  const radius = ASTEROID_SIZES[size];
  const [minSpd, maxSpd] = ASTEROID_SPEED[size];
  const speed = minSpd + Math.random() * (maxSpd - minSpd);
  const angle = Math.random() * Math.PI * 2;

  // If no position given, spawn from a random edge
  if (x === undefined || y === undefined) {
    const edge = Math.floor(Math.random() * 4);
    switch (edge) {
      case 0:
        x = Math.random() * w;
        y = -radius;
        break; // top
      case 1:
        x = w + radius;
        y = Math.random() * h;
        break; // right
      case 2:
        x = Math.random() * w;
        y = h + radius;
        break; // bottom
      default:
        x = -radius;
        y = Math.random() * h;
        break; // left
    }
  }

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size,
    radius,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 2,
    vertices: createAsteroidVertices(),
  };
}

function spawnWave(w: number, h: number, count: number): Asteroid[] {
  const asteroids: Asteroid[] = [];
  for (let i = 0; i < count; i++) {
    asteroids.push(spawnAsteroid(w, h, "large"));
  }
  return asteroids;
}

// ── Component ──────────────────────────────────────────────────────
export function RocketGame({
  onExit,
  startX,
  startY,
}: {
  onExit: () => void;
  startX: number;
  startY: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketImgRef = useRef<HTMLImageElement | null>(null);

  const stateRef = useRef({
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    angle: 0,
    thrusting: false,
    score: 0,
    lives: STARTING_LIVES,
    wave: 1,
    gameOver: false,
    invincibleTimer: INVINCIBILITY_TIME,
    bulletCooldown: 0,
    screenFlash: 0,
  });

  const keysRef = useRef(new Set<string>());
  const exhaustRef = useRef<Particle[]>([]);
  const explosionsRef = useRef<Particle[]>([]);
  const bulletsRef = useRef<Bullet[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const [showHud, setShowHud] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowHud(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // Initialise first wave
  useEffect(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    asteroidsRef.current = spawnWave(w, h, INITIAL_ASTEROIDS);
  }, []);

  useEffect(() => {
    const img = new window.Image();
    img.src = "/rocket-game.png";
    rocketImgRef.current = img;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onExit();
        return;
      }
      keysRef.current.add(e.key.toLowerCase());
      if (
        [
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
          " ",
        ].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onExit]);

  const restartGame = useCallback(() => {
    const s = stateRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;
    s.x = w / 2;
    s.y = h / 2;
    s.vx = 0;
    s.vy = 0;
    s.angle = 0;
    s.score = 0;
    s.lives = STARTING_LIVES;
    s.wave = 1;
    s.gameOver = false;
    s.invincibleTimer = INVINCIBILITY_TIME;
    s.bulletCooldown = 0;
    s.screenFlash = 0;
    bulletsRef.current = [];
    explosionsRef.current = [];
    exhaustRef.current = [];
    asteroidsRef.current = spawnWave(w, h, INITIAL_ASTEROIDS);
  }, []);

  // ── Game loop ────────────────────────────────────────────────────
  const gameLoop = useCallback(
    (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        rafRef.current = requestAnimationFrame(gameLoop);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      const state = stateRef.current;
      const keys = keysRef.current;

      // ─── Game-over state: only render, no physics ────────────
      if (state.gameOver) {
        // Check for restart
        if (keys.has(" ")) {
          keys.delete(" ");
          restartGame();
        }

        ctx.clearRect(0, 0, w, h);
        renderAsteroids(ctx, asteroidsRef.current);
        renderExplosions(ctx, explosionsRef.current);

        // Update remaining explosions
        explosionsRef.current = explosionsRef.current.filter((p) => {
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          return p.life > 0;
        });

        // Drift asteroids
        for (const a of asteroidsRef.current) {
          a.x += a.vx * dt;
          a.y += a.vy * dt;
          a.rotation += a.rotSpeed * dt;
          wrapEntity(a, a.radius, w, h);
        }

        // Game over text
        ctx.fillStyle = "#33E692";
        ctx.font = "bold 48px monospace";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", w / 2, h / 2 - 40);
        ctx.font = "24px monospace";
        ctx.fillText(`Score: ${state.score}`, w / 2, h / 2 + 10);
        ctx.font = "16px monospace";
        ctx.fillStyle = "rgba(51, 230, 146, 0.7)";
        ctx.fillText(
          "SPACE or Click to restart  |  ESC to exit",
          w / 2,
          h / 2 + 50
        );
        ctx.textAlign = "start";

        renderHud(ctx, state, w);

        rafRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // ─── Input ───────────────────────────────────────────────
      if (keys.has("arrowleft") || keys.has("a"))
        state.angle -= ROTATION_SPEED * dt;
      if (keys.has("arrowright") || keys.has("d"))
        state.angle += ROTATION_SPEED * dt;

      state.thrusting = keys.has("arrowup") || keys.has("w");

      if (state.thrusting) {
        state.vx += Math.sin(state.angle) * THRUST * dt;
        state.vy -= Math.cos(state.angle) * THRUST * dt;

        // Exhaust particles
        for (let i = 0; i < 2; i++) {
          const spread = (Math.random() - 0.5) * 0.6;
          const exhaustAngle = state.angle + Math.PI + spread;
          const speed = 60 + Math.random() * 80;
          const lifetime = 0.4 + Math.random() * 0.4;
          exhaustRef.current.push({
            x: state.x - Math.sin(state.angle) * ROCKET_SIZE * 0.35,
            y: state.y + Math.cos(state.angle) * ROCKET_SIZE * 0.35,
            vx: Math.sin(exhaustAngle) * speed + state.vx * 0.2,
            vy: -Math.cos(exhaustAngle) * speed + state.vy * 0.2,
            life: lifetime,
            maxLife: lifetime,
            r: 255,
            g: 200,
            b: 50,
          });
        }
        if (exhaustRef.current.length > MAX_EXHAUST) {
          exhaustRef.current.splice(0, exhaustRef.current.length - MAX_EXHAUST);
        }
      }

      // ─── Shooting ────────────────────────────────────────────
      state.bulletCooldown -= dt;
      if (
        keys.has(" ") &&
        state.bulletCooldown <= 0 &&
        bulletsRef.current.length < MAX_BULLETS
      ) {
        state.bulletCooldown = BULLET_COOLDOWN;
        const noseX = state.x + Math.sin(state.angle) * ROCKET_SIZE * 0.45;
        const noseY = state.y - Math.cos(state.angle) * ROCKET_SIZE * 0.45;
        bulletsRef.current.push({
          x: noseX,
          y: noseY,
          vx: Math.sin(state.angle) * BULLET_SPEED + state.vx * 0.3,
          vy: -Math.cos(state.angle) * BULLET_SPEED + state.vy * 0.3,
          life: BULLET_LIFETIME,
        });
      }

      // ─── Physics ─────────────────────────────────────────────
      state.vx *= Math.pow(DRAG, dt * 60);
      state.vy *= Math.pow(DRAG, dt * 60);
      state.x += state.vx * dt;
      state.y += state.vy * dt;
      wrapEntity(state, ROCKET_SIZE, w, h);

      // Update invincibility
      if (state.invincibleTimer > 0) state.invincibleTimer -= dt;

      // Update bullets
      bulletsRef.current = bulletsRef.current.filter((b) => {
        b.life -= dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        wrapEntity(b, BULLET_RADIUS, w, h);
        return b.life > 0;
      });

      // Update asteroids
      for (const a of asteroidsRef.current) {
        a.x += a.vx * dt;
        a.y += a.vy * dt;
        a.rotation += a.rotSpeed * dt;
        wrapEntity(a, a.radius, w, h);
      }

      // Update particles
      exhaustRef.current = exhaustRef.current.filter((p) => {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life > 0;
      });
      explosionsRef.current = explosionsRef.current.filter((p) => {
        p.life -= dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        return p.life > 0;
      });

      // Screen flash decay
      if (state.screenFlash > 0) state.screenFlash -= dt * 3;

      // ─── Collisions ──────────────────────────────────────────
      // Bullet vs Asteroid
      const newAsteroids: Asteroid[] = [];
      asteroidsRef.current = asteroidsRef.current.filter((a) => {
        for (let bi = bulletsRef.current.length - 1; bi >= 0; bi--) {
          const b = bulletsRef.current[bi];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < BULLET_RADIUS + a.radius) {
            // Hit!
            bulletsRef.current.splice(bi, 1);
            state.score += ASTEROID_SCORE[a.size];

            // Explosion particles
            spawnExplosion(explosionsRef.current, a.x, a.y, a.size);

            if (a.size === "large") {
              state.screenFlash = 0.3;
            }

            // Split
            if (a.size === "large") {
              newAsteroids.push(spawnAsteroid(w, h, "medium", a.x, a.y));
              newAsteroids.push(spawnAsteroid(w, h, "medium", a.x, a.y));
            } else if (a.size === "medium") {
              newAsteroids.push(spawnAsteroid(w, h, "small", a.x, a.y));
              newAsteroids.push(spawnAsteroid(w, h, "small", a.x, a.y));
            }
            return false; // remove this asteroid
          }
        }
        return true;
      });
      asteroidsRef.current.push(...newAsteroids);

      // Rocket vs Asteroid
      if (state.invincibleTimer <= 0) {
        const rocketHitR = ROCKET_SIZE * ROCKET_HITBOX_FACTOR;
        for (const a of asteroidsRef.current) {
          const dx = state.x - a.x;
          const dy = state.y - a.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < rocketHitR + a.radius) {
            state.lives -= 1;
            if (state.lives <= 0) {
              state.gameOver = true;
              // Final explosion at rocket position
              spawnExplosion(explosionsRef.current, state.x, state.y, "large");
              state.screenFlash = 0.5;
            } else {
              // Respawn at center
              state.x = w / 2;
              state.y = h / 2;
              state.vx = 0;
              state.vy = 0;
              state.invincibleTimer = INVINCIBILITY_TIME;
              state.screenFlash = 0.3;
            }
            break;
          }
        }
      }

      // New wave check
      if (asteroidsRef.current.length === 0 && !state.gameOver) {
        state.wave += 1;
        asteroidsRef.current = spawnWave(
          w,
          h,
          INITIAL_ASTEROIDS + state.wave - 1
        );
      }

      // ─── Render ──────────────────────────────────────────────
      ctx.clearRect(0, 0, w, h);

      // Screen flash
      if (state.screenFlash > 0) {
        ctx.fillStyle = `rgba(51, 230, 146, ${state.screenFlash * 0.15})`;
        ctx.fillRect(0, 0, w, h);
      }

      // 1. Asteroids
      renderAsteroids(ctx, asteroidsRef.current);

      // 2. Exhaust particles + Explosion particles
      renderParticles(ctx, exhaustRef.current, "exhaust");
      renderExplosions(ctx, explosionsRef.current);

      // 3. Bullets
      for (const b of bulletsRef.current) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
        ctx.shadowColor = "#33E692";
        ctx.shadowBlur = 12;
        ctx.fillStyle = "#aaffcc";
        ctx.fill();
        ctx.restore();
      }

      // 4. Flame
      if (state.thrusting && !state.gameOver) {
        ctx.save();
        ctx.translate(state.x, state.y);
        ctx.rotate(state.angle);

        const flameLen = 20 + Math.random() * 15;
        const flameW = 8 + Math.random() * 4;

        ctx.beginPath();
        ctx.moveTo(-flameW, ROCKET_SIZE * 0.38);
        ctx.lineTo(flameW, ROCKET_SIZE * 0.38);
        ctx.lineTo(0, ROCKET_SIZE * 0.38 + flameLen);
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 100, 0, 0.7)";
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(-flameW * 0.5, ROCKET_SIZE * 0.38);
        ctx.lineTo(flameW * 0.5, ROCKET_SIZE * 0.38);
        ctx.lineTo(0, ROCKET_SIZE * 0.38 + flameLen * 0.6);
        ctx.closePath();
        ctx.fillStyle = "rgba(255, 220, 50, 0.9)";
        ctx.fill();

        ctx.restore();
      }

      // 5. Rocket
      if (!state.gameOver) {
        const img = rocketImgRef.current;
        // Invincibility blink: visible half the time
        const visible =
          state.invincibleTimer <= 0 ||
          Math.sin(state.invincibleTimer * 15) > 0;
        if (img && img.complete && visible) {
          ctx.save();
          ctx.translate(state.x, state.y);
          ctx.rotate(state.angle);
          ctx.shadowColor = "rgba(51, 230, 146, 0.4)";
          ctx.shadowBlur = 20;
          const aspect = img.naturalWidth / img.naturalHeight;
          const rh = ROCKET_SIZE;
          const rw = rh * aspect;
          ctx.drawImage(img, -rw / 2, -rh / 2, rw, rh);
          ctx.restore();
        }
      }

      // 6. HUD
      renderHud(ctx, state, w);

      rafRef.current = requestAnimationFrame(gameLoop);
    },
    [restartGame]
  );

  useEffect(() => {
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [gameLoop]);

  const handleCanvasClick = useCallback(() => {
    if (stateRef.current.gameOver) {
      restartGame();
    }
  }, [restartGame]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70">
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%", cursor: "crosshair" }}
        onClick={handleCanvasClick}
      />

      {/* Instruction HUD */}
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none transition-opacity duration-1000 ${showHud ? "opacity-100" : "opacity-0"}`}
      >
        <div
          className="px-4 py-2 bg-black/70 backdrop-blur-sm rounded-lg border font-mono text-xs text-center whitespace-nowrap"
          style={{ borderColor: "rgba(51, 230, 146, 0.3)", color: "#33E692" }}
        >
          Arrows / WASD to fly — SPACE to shoot — ESC to exit
        </div>
      </div>

      {/* Exit button */}
      <button
        onClick={onExit}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 border border-white/20 text-white/60 hover:text-white hover:bg-black/70 transition-colors cursor-pointer"
        aria-label="Exit asteroids mode"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-4 h-4"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      {/* Mobile touch controls */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 lg:hidden">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.add("arrowleft");
          }}
          onTouchEnd={() => keysRef.current.delete("arrowleft")}
          onTouchCancel={() => keysRef.current.delete("arrowleft")}
          className="w-14 h-14 rounded-full bg-black/50 border flex items-center justify-center active:bg-green/20 select-none"
          style={{ borderColor: "rgba(51, 230, 146, 0.3)", color: "#33E692" }}
          aria-label="Rotate left"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-6 h-6"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.add("arrowup");
          }}
          onTouchEnd={() => keysRef.current.delete("arrowup")}
          onTouchCancel={() => keysRef.current.delete("arrowup")}
          className="w-14 h-14 rounded-full bg-black/50 border flex items-center justify-center active:bg-green/20 select-none"
          style={{ borderColor: "rgba(51, 230, 146, 0.3)", color: "#33E692" }}
          aria-label="Thrust"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-6 h-6"
          >
            <path d="M5 15l7-7 7 7" />
          </svg>
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.add("arrowright");
          }}
          onTouchEnd={() => keysRef.current.delete("arrowright")}
          onTouchCancel={() => keysRef.current.delete("arrowright")}
          className="w-14 h-14 rounded-full bg-black/50 border flex items-center justify-center active:bg-green/20 select-none"
          style={{ borderColor: "rgba(51, 230, 146, 0.3)", color: "#33E692" }}
          aria-label="Rotate right"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-6 h-6"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            keysRef.current.add(" ");
          }}
          onTouchEnd={() => keysRef.current.delete(" ")}
          onTouchCancel={() => keysRef.current.delete(" ")}
          className="w-14 h-14 rounded-full bg-black/50 border flex items-center justify-center active:bg-green/20 select-none"
          style={{ borderColor: "rgba(51, 230, 146, 0.3)", color: "#33E692" }}
          aria-label="Fire"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="w-6 h-6"
          >
            {/* Crosshair icon */}
            <circle cx="12" cy="12" r="6" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Render helpers ─────────────────────────────────────────────────

function wrapEntity(
  e: { x: number; y: number },
  margin: number,
  w: number,
  h: number
) {
  if (e.x < -margin) e.x += w + 2 * margin;
  if (e.x > w + margin) e.x -= w + 2 * margin;
  if (e.y < -margin) e.y += h + 2 * margin;
  if (e.y > h + margin) e.y -= h + 2 * margin;
}

function renderAsteroids(ctx: CanvasRenderingContext2D, asteroids: Asteroid[]) {
  for (const a of asteroids) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rotation);
    ctx.beginPath();
    const vCount = a.vertices.length;
    for (let i = 0; i < vCount; i++) {
      const angle = (i / vCount) * Math.PI * 2;
      const r = a.radius * a.vertices[i];
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.strokeStyle = "#33E692";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

function renderParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  _type: "exhaust"
) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    const size = 2 + (1 - alpha) * 4;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.r}, ${Math.floor(p.g * alpha + 100 * (1 - alpha))}, ${Math.floor(p.b * alpha)}, ${alpha * 0.8})`;
    ctx.fill();
  }
}

function renderExplosions(
  ctx: CanvasRenderingContext2D,
  particles: Particle[]
) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    const size = 1.5 + (1 - alpha) * 3;
    ctx.save();
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.shadowColor = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
    ctx.shadowBlur = 6;
    ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

function spawnExplosion(
  particles: Particle[],
  x: number,
  y: number,
  size: AsteroidSize
) {
  const count = size === "large" ? 20 : size === "medium" ? 16 : 12;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 40 + Math.random() * 120;
    const lifetime = 0.3 + Math.random() * 0.3;
    const isWhite = Math.random() < 0.3;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: lifetime,
      maxLife: lifetime,
      r: isWhite ? 255 : 51,
      g: isWhite ? 255 : 230,
      b: isWhite ? 255 : 146,
    });
  }
}

function renderHud(
  ctx: CanvasRenderingContext2D,
  state: { score: number; lives: number; wave: number },
  w: number
) {
  // Anchor top-left, pushed below the site logo (~60px tall)
  const lx = 20;
  const topY = 72;

  // Score
  ctx.fillStyle = "#33E692";
  ctx.font = "bold 20px monospace";
  ctx.textAlign = "start";
  ctx.fillText(`SCORE ${state.score}`, lx, topY);

  // Wave
  ctx.font = "14px monospace";
  ctx.fillStyle = "rgba(51, 230, 146, 0.6)";
  ctx.fillText(`WAVE ${state.wave}`, lx, topY + 20);

  // Lives as small triangles (rocket icons)
  const lifeY = topY + 40;
  for (let i = 0; i < state.lives; i++) {
    const lifeX = lx + 8 + i * 22;
    ctx.save();
    ctx.translate(lifeX, lifeY);
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-5, 6);
    ctx.lineTo(5, 6);
    ctx.closePath();
    ctx.strokeStyle = "#33E692";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  void w;
}
