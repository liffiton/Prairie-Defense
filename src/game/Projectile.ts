// Projectile physics, trajectories, AoE blasts, and piercing logic

import type { Enemy } from './Enemy';
import type { ParticleSystem } from './ParticleSystem';
import { soundManager } from '../audio/SoundManager';

export interface ProjectileConfig {
  x: number;
  y: number;
  target: Enemy | null;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  type: 'seed' | 'spine' | 'acorn' | 'water_wave' | 'sonar' | 'butterfly';
  splashRadius?: number;
  pierce?: number;
  slow?: { multiplier: number; duration: number };
  poison?: { dps: number; duration: number };
  stun?: number;
  knockback?: number;
  color?: string;
}

export class Projectile {
  public x: number;
  public y: number;
  public startX: number;
  public startY: number;
  public targetX: number;
  public targetY: number;
  public target: Enemy | null;
  public speed: number;
  public damage: number;
  public type: 'seed' | 'spine' | 'acorn' | 'water_wave' | 'sonar' | 'butterfly';
  public splashRadius?: number;
  public pierce: number;
  public piercedEnemies: Set<string> = new Set();
  public slow?: { multiplier: number; duration: number };
  public poison?: { dps: number; duration: number };
  public stun?: number;
  public knockback?: number;
  public color: string;

  public isDead: boolean = false;
  private life: number = 0;
  private maxLife: number = 3.5;

  // Arc physics for mortar acorns
  private totalDistance: number = 0;
  private currentDistance: number = 0;

  constructor(cfg: ProjectileConfig) {
    this.x = cfg.x;
    this.y = cfg.y;
    this.startX = cfg.x;
    this.startY = cfg.y;
    this.target = cfg.target;
    this.targetX = cfg.targetX;
    this.targetY = cfg.targetY;
    this.speed = cfg.speed;
    this.damage = cfg.damage;
    this.type = cfg.type;
    this.splashRadius = cfg.splashRadius;
    this.pierce = cfg.pierce || 1;
    this.slow = cfg.slow;
    this.poison = cfg.poison;
    this.stun = cfg.stun;
    this.knockback = cfg.knockback;
    this.color = cfg.color || '#ffffff';

    this.totalDistance = Math.hypot(this.targetX - this.startX, this.targetY - this.startY);
  }

  public update(
    dt: number,
    enemies: Enemy[],
    particles: ParticleSystem,
    onEnemyKilled: (enemy: Enemy) => void
  ) {
    if (this.isDead) return;

    this.life += dt;
    if (this.life >= this.maxLife) {
      this.isDead = true;
      return;
    }

    if (this.type === 'acorn') {
      // Parabolic artillery lob
      const distToMove = this.speed * dt;
      this.currentDistance += distToMove;
      const progress = Math.min(1.0, this.currentDistance / Math.max(1, this.totalDistance));

      this.x = this.startX + (this.targetX - this.startX) * progress;
      this.y = this.startY + (this.targetY - this.startY) * progress;

      if (progress >= 1.0) {
        // Impact at target location!
        this.explodeAcorn(enemies, particles, onEnemyKilled);
        this.isDead = true;
      }
      return;
    }

    if (this.type === 'water_wave') {
      // Beaver expanding wave moving outward
      const angle = Math.atan2(this.targetY - this.startY, this.targetX - this.startX);
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;

      // Check collision with enemies in wave front
      for (const enemy of enemies) {
        if (enemy.isDead || this.piercedEnemies.has(enemy.id)) continue;
        const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (dist <= 40) {
          this.hitEnemy(enemy, particles, onEnemyKilled);
          this.piercedEnemies.add(enemy.id);

          // Apply knockback
          if (this.knockback) {
            enemy.distanceTraveled = Math.max(0, enemy.distanceTraveled - this.knockback);
          }

          if (this.piercedEnemies.size >= this.pierce) {
            this.isDead = true;
            break;
          }
        }
      }

      if (Math.hypot(this.x - this.startX, this.y - this.startY) > 160) {
        this.isDead = true;
      }
      return;
    }

    if (this.type === 'spine') {
      // Coneflower piercing line projectile
      const angle = Math.atan2(this.targetY - this.startY, this.targetX - this.startX);
      this.x += Math.cos(angle) * this.speed * dt;
      this.y += Math.sin(angle) * this.speed * dt;

      for (const enemy of enemies) {
        if (enemy.isDead || this.piercedEnemies.has(enemy.id)) continue;
        const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
        if (dist <= enemy.config.size + 8) {
          this.hitEnemy(enemy, particles, onEnemyKilled);
          this.piercedEnemies.add(enemy.id);

          if (this.piercedEnemies.size >= this.pierce) {
            this.isDead = true;
            break;
          }
        }
      }

      // Check boundary
      if (this.x < -40 || this.x > 1000 || this.y < -40 || this.y > 700) {
        this.isDead = true;
      }
      return;
    }

    // Direct homing projectiles (seed pod, bat sonar, butterfly)
    if (this.target && !this.target.isDead) {
      this.targetX = this.target.x;
      this.targetY = this.target.y;
    }

    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= this.speed * dt || dist < 12) {
      if (this.target && !this.target.isDead) {
        this.hitEnemy(this.target, particles, onEnemyKilled);
      } else {
        // Hit location
        particles.addPollenBurst(this.x, this.y, this.color, 6);
      }
      this.isDead = true;
    } else {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * this.speed * dt;
    }
  }

  private hitEnemy(enemy: Enemy, particles: ParticleSystem, onEnemyKilled: (enemy: Enemy) => void) {
    const isAntiAir = this.type === 'sonar';
    const isHeavyAcorn = this.type === 'acorn';
    const isPierce = this.type === 'spine';

    soundManager.playEnemyHit();

    if (this.slow) {
      enemy.applySlow(this.slow.multiplier, this.slow.duration);
    }
    if (this.poison) {
      enemy.applyPoison(this.poison.dps, this.poison.duration);
    }
    if (this.stun) {
      enemy.applyStun(this.stun);
    }

    const killed = enemy.takeDamage(this.damage, { isHeavyAcorn, isAntiAir, isPierce });

    particles.addPollenBurst(enemy.x, enemy.y, this.color, 8);

    if (killed) {
      onEnemyKilled(enemy);
    }
  }

  private explodeAcorn(
    enemies: Enemy[],
    particles: ParticleSystem,
    onEnemyKilled: (enemy: Enemy) => void
  ) {
    const radius = this.splashRadius || 60;
    particles.addAcornExplosion(this.x, this.y, radius);
    soundManager.playAcornExplode();

    for (const enemy of enemies) {
      if (enemy.isDead) continue;
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist <= radius) {
        // Falloff damage
        const damageRatio = Math.max(0.4, 1 - dist / radius);
        const splashDamage = this.damage * damageRatio;

        if (this.stun) {
          enemy.applyStun(this.stun);
        }

        const killed = enemy.takeDamage(splashDamage, { isHeavyAcorn: true });
        if (killed) {
          onEnemyKilled(enemy);
        }
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.type === 'acorn') {
      // Parabolic arc height visually
      const progress = Math.min(1.0, this.currentDistance / Math.max(1, this.totalDistance));
      const arcHeight = Math.sin(progress * Math.PI) * 55;
      ctx.translate(0, -arcHeight);

      // Rotating acorn
      const spin = progress * Math.PI * 4;
      ctx.rotate(spin);

      // Acorn body
      ctx.fillStyle = '#92400e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Textured acorn cup
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.arc(-4, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'spine') {
      // Sharp piercing spine needle
      const angle = Math.atan2(this.targetY - this.startY, this.targetX - this.startX);
      ctx.rotate(angle);

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.stroke();

      // Sharp glowing tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(12, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'sonar') {
      // Echolocation expanding sound pulse
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.stroke();
    } else if (this.type === 'water_wave') {
      // Splashing water wave front
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 16, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
    } else if (this.type === 'butterfly') {
      // Fluttering monarch butterfly projectile
      const flutter = Math.sin(this.life * 25) * 4;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(-3, -flutter, 6, 3, -0.3, 0, Math.PI * 2);
      ctx.ellipse(3, flutter, 6, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Silky milkweed seed puff
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Little tail
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-6, 2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
