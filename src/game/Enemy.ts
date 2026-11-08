// Enemy representation, movement along waypoints, traits, and status effects

import { ENEMIES, type EnemyConfig, type EnemyType } from '../data/enemies';
import type { Waypoint } from '../data/maps';

export class Enemy {
  public id: string;
  public type: EnemyType;
  public config: EnemyConfig;
  public waypoints: Waypoint[];
  public currentWaypointIndex: number = 0;
  public x: number;
  public y: number;
  public angle: number = 0;
  public distanceTraveled: number = 0;
  public isDead: boolean = false;
  public hasReachedEnd: boolean = false;

  public maxHp: number;
  public hp: number;

  // Status effects
  public slowMultiplier: number = 1.0;
  public slowTimer: number = 0;
  public poisonDps: number = 0;
  public poisonTimer: number = 0;
  public stunTimer: number = 0;

  // Jump timer for Lanternfly / Carp
  private jumpTimer: number = 0;
  private isJumping: boolean = false;
  private jumpProgress: number = 0;

  // Visual animation
  private animTimer: number = 0;

  constructor(type: EnemyType, waypoints: Waypoint[], startProgress: number = 0) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.type = type;
    this.config = ENEMIES[type];
    this.waypoints = waypoints;
    this.maxHp = this.config.health;
    this.hp = this.maxHp;

    const startPt = waypoints[0];
    this.x = startPt.x;
    this.y = startPt.y;

    if (startProgress > 0) {
      this.distanceTraveled = startProgress;
      this.syncPositionToDistance();
    }
  }

  public update(dt: number): { split?: { type: EnemyType; count: number; distance: number; waypoints: Waypoint[] } } | null {
    if (this.isDead || this.hasReachedEnd) return null;

    this.animTimer += dt;

    // 1. Process Poison
    if (this.poisonTimer > 0) {
      this.poisonTimer -= dt;
      this.hp -= this.poisonDps * dt;
      if (this.hp <= 0) {
        this.isDead = true;
        return this.handleDeath();
      }
    }

    // 2. Process Stun
    if (this.stunTimer > 0) {
      this.stunTimer -= dt;
      return null; // stunned, cannot move
    }

    // 3. Process Slow
    if (this.slowTimer > 0) {
      this.slowTimer -= dt;
      if (this.slowTimer <= 0) {
        this.slowMultiplier = 1.0;
      }
    }

    // 4. Process Boss / Enemy Regen
    if (this.config.regenRate && this.hp < this.maxHp) {
      this.hp = Math.min(this.maxHp, this.hp + this.config.regenRate * dt);
    }

    // 5. Calculate Speed
    let currentSpeed = this.config.speed * this.slowMultiplier;

    // Jump behavior (Lanternfly & Asian Carp)
    if (this.config.jumpInterval) {
      this.jumpTimer += dt;
      if (this.isJumping) {
        this.jumpProgress += dt * 2.2;
        currentSpeed *= 2.4;
        if (this.jumpProgress >= 1.0) {
          this.isJumping = false;
          this.jumpProgress = 0;
          this.jumpTimer = 0;
        }
      } else if (this.jumpTimer >= this.config.jumpInterval) {
        this.isJumping = true;
        this.jumpProgress = 0;
      }
    }

    // 6. Move along path waypoints
    const distToMove = currentSpeed * dt;
    this.moveAlongPath(distToMove);

    return null;
  }

  private moveAlongPath(distance: number) {
    let remaining = distance;

    while (remaining > 0 && this.currentWaypointIndex < this.waypoints.length - 1) {
      const targetPt = this.waypoints[this.currentWaypointIndex + 1];
      const dx = targetPt.x - this.x;
      const dy = targetPt.y - this.y;
      const legDist = Math.hypot(dx, dy);

      this.angle = Math.atan2(dy, dx);

      if (remaining < legDist) {
        this.x += (dx / legDist) * remaining;
        this.y += (dy / legDist) * remaining;
        this.distanceTraveled += remaining;
        remaining = 0;
      } else {
        this.x = targetPt.x;
        this.y = targetPt.y;
        this.distanceTraveled += legDist;
        remaining -= legDist;
        this.currentWaypointIndex++;
      }
    }

    if (this.currentWaypointIndex >= this.waypoints.length - 1) {
      this.hasReachedEnd = true;
    }
  }

  private syncPositionToDistance() {
    let dist = this.distanceTraveled;
    for (let i = 0; i < this.waypoints.length - 1; i++) {
      const p1 = this.waypoints[i];
      const p2 = this.waypoints[i + 1];
      const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

      if (dist <= segDist) {
        const ratio = dist / segDist;
        this.x = p1.x + (p2.x - p1.x) * ratio;
        this.y = p1.y + (p2.y - p1.y) * ratio;
        this.currentWaypointIndex = i;
        this.angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        return;
      }
      dist -= segDist;
    }
    const last = this.waypoints[this.waypoints.length - 1];
    this.x = last.x;
    this.y = last.y;
    this.currentWaypointIndex = this.waypoints.length - 1;
  }

  public takeDamage(
    amount: number,
    source: { isHeavyAcorn?: boolean; isAntiAir?: boolean; isPierce?: boolean }
  ): boolean {
    if (this.isDead) return false;

    let finalDamage = amount;

    // Armored enemies resist light seed darts by 60%
    if (this.config.isArmored) {
      if (source.isHeavyAcorn) {
        finalDamage *= 1.4; // bonus vs armored!
      } else {
        finalDamage *= 0.4; // resisted
      }
    }

    // Flying enemies evade 50% damage unless hit by anti-air bat pulses
    if (this.config.isFlying) {
      if (source.isAntiAir) {
        finalDamage *= 2.0; // bat sonar shreds flyers!
      } else {
        finalDamage *= 0.5; // evasive evasion
      }
    }

    this.hp -= finalDamage;
    if (this.hp <= 0) {
      this.isDead = true;
      return true; // killed
    }
    return false;
  }

  public applySlow(multiplier: number, duration: number) {
    if (this.type === 'feral_hog') return; // boss immune to regular slow
    if (multiplier < this.slowMultiplier || this.slowTimer <= 0) {
      this.slowMultiplier = multiplier;
    }
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  public applyPoison(dps: number, duration: number) {
    this.poisonDps = Math.max(this.poisonDps, dps);
    this.poisonTimer = Math.max(this.poisonTimer, duration);
  }

  public applyStun(duration: number) {
    if (this.type === 'feral_hog' || this.type === 'buckthorn_titan') {
      this.stunTimer = Math.max(this.stunTimer, duration * 0.3); // bosses recover quickly
    } else {
      this.stunTimer = Math.max(this.stunTimer, duration);
    }
  }

  public handleDeath() {
    if (this.config.canSplitInto) {
      return {
        split: {
          type: this.config.canSplitInto.type,
          count: this.config.canSplitInto.count,
          distance: this.distanceTraveled,
          waypoints: this.waypoints,
        },
      };
    }
    return null;
  }

  public render(ctx: CanvasRenderingContext2D) {
    if (this.isDead) return;

    ctx.save();
    ctx.translate(this.x, this.y);

    // Allelopathic aura circle (Garlic Mustard)
    if (this.config.isAllelopathic) {
      const pulse = 1 + Math.sin(this.animTimer * 4) * 0.1;
      ctx.beginPath();
      ctx.arc(0, 0, 48 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(132, 204, 22, 0.15)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(163, 230, 53, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, this.config.size * 0.8, this.config.size, this.config.size * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotate to face movement direction
    ctx.rotate(this.angle);

    // Jump vertical offset for leaping creeps
    let yOffset = 0;
    if (this.isJumping) {
      yOffset = -Math.sin(this.jumpProgress * Math.PI) * 16;
    }

    // Render specific species visual
    this.drawSpecies(ctx, yOffset);

    // Restore rotation for UI bars
    ctx.rotate(-this.angle);

    // HP Bar
    const barWidth = Math.max(26, this.config.size * 2);
    const barHeight = 4.5;
    const barY = -this.config.size - 10 + yOffset;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

    const hpRatio = Math.max(0, this.hp / this.maxHp);
    ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
    ctx.fillRect(-barWidth / 2, barY, barWidth * hpRatio, barHeight);

    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-barWidth / 2, barY, barWidth, barHeight);

    // Status effect icons
    let badgeX = -barWidth / 2;
    if (this.slowTimer > 0) {
      ctx.font = '10px sans-serif';
      ctx.fillText('❄️', badgeX, barY - 3);
      badgeX += 11;
    }
    if (this.poisonTimer > 0) {
      ctx.font = '10px sans-serif';
      ctx.fillText('☠️', badgeX, barY - 3);
      badgeX += 11;
    }
    if (this.stunTimer > 0) {
      ctx.font = '10px sans-serif';
      ctx.fillText('💫', badgeX, barY - 3);
    }

    ctx.restore();
  }

  private drawSpecies(ctx: CanvasRenderingContext2D, yOffset: number) {
    const s = this.config.size;

    switch (this.type) {
      case 'emerald_ash_borer': {
        // Metallic iridescent green beetle with flapping wings
        const wingFlap = Math.sin(this.animTimer * 28) * 6;
        // Translucent wings
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.ellipse(-2, -8 + yOffset - wingFlap, 10, 4, -0.4, 0, Math.PI * 2);
        ctx.ellipse(-2, 8 + yOffset + wingFlap, 10, 4, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Elytra / metallic body
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.ellipse(0, yOffset, s, s * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head and copper sheen
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.arc(s * 0.7, yOffset, s * 0.35, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(s * 0.8, yOffset - 3, 2, 2);
        ctx.fillRect(s * 0.8, yOffset + 1, 2, 2);
        break;
      }

      case 'spotted_lanternfly': {
        // Spotted pinkish/grey wings with black spots
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(0, yOffset, s, s * 0.65, 0, 0, Math.PI * 2);
        ctx.fill();

        // Black spots
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-3, yOffset - 4, 1.5, 0, Math.PI * 2);
        ctx.arc(2, yOffset - 3, 1.8, 0, Math.PI * 2);
        ctx.arc(-1, yOffset + 3, 1.5, 0, Math.PI * 2);
        ctx.arc(3, yOffset + 4, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Red hindwing flash
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(-s * 0.6, yOffset, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'garlic_mustard': {
        // Weed cluster with toothed heart-shaped leaves
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(0, yOffset, s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.arc(s * 0.3, yOffset - s * 0.3, s * 0.5, 0, Math.PI * 2);
        ctx.arc(-s * 0.3, yOffset + s * 0.3, s * 0.5, 0, Math.PI * 2);
        ctx.fill();

        // Tiny white four-petaled flower cluster
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, yOffset, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'zebra_mussel': {
        // Striped triangular mollusk shell
        ctx.fillStyle = '#475569';
        ctx.beginPath();
        ctx.moveTo(s * 0.9, yOffset);
        ctx.lineTo(-s * 0.8, yOffset - s * 0.7);
        ctx.lineTo(-s * 0.8, yOffset + s * 0.7);
        ctx.closePath();
        ctx.fill();

        // Chevron stripes
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-s * 0.4, yOffset - s * 0.5);
        ctx.lineTo(s * 0.2, yOffset);
        ctx.lineTo(-s * 0.4, yOffset + s * 0.5);
        ctx.stroke();
        break;
      }

      case 'japanese_knotweed':
      case 'knotweed_sprout': {
        // Hollow jointed bamboo-like red-speckled stems
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(-s, yOffset - s * 0.4, s * 2, s * 0.8);

        // Nodes
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-s * 0.3, yOffset - s * 0.5, 3, s);
        ctx.fillRect(s * 0.4, yOffset - s * 0.5, 3, s);

        // Sprouting green spade leaves
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.ellipse(0, yOffset - s * 0.7, s * 0.6, s * 0.4, -0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'asian_carp': {
        // Silvery hydrodynamic fish with leaping tail
        const wag = Math.sin(this.animTimer * 16) * 5;
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.ellipse(0, yOffset, s * 1.2, s * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Silver dorsal highlight
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(0, yOffset - 2, s * 0.8, s * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tail fin
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.moveTo(-s * 1.1, yOffset);
        ctx.lineTo(-s * 1.6, yOffset - 7 + wag);
        ctx.lineTo(-s * 1.6, yOffset + 7 + wag);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'feral_hog': {
        // Massive bristly boar with tusks
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(0, yOffset, s * 1.1, s * 0.75, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head and snout
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.ellipse(s * 0.8, yOffset, s * 0.5, s * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // White razor tusks
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(s * 0.9, yOffset - 4);
        ctx.lineTo(s * 1.3, yOffset - 8);
        ctx.lineTo(s * 0.9, yOffset - 1);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(s * 0.9, yOffset + 4);
        ctx.lineTo(s * 1.3, yOffset + 8);
        ctx.lineTo(s * 0.9, yOffset + 1);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'buckthorn_titan': {
        // Colossal suffocating dark woody thicket
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, yOffset, s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(-s * 0.3, yOffset - s * 0.3, s * 0.7, 0, Math.PI * 2);
        ctx.arc(s * 0.3, yOffset + s * 0.3, s * 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Thorny spikes
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 6; i++) {
          const a = (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (s - 2), yOffset + Math.sin(a) * (s - 2));
          ctx.lineTo(Math.cos(a) * (s + 9), yOffset + Math.sin(a) * (s + 9));
          ctx.stroke();
        }

        // Toxic dark berries
        ctx.fillStyle = '#831843';
        ctx.beginPath();
        ctx.arc(-4, yOffset - 3, 3, 0, Math.PI * 2);
        ctx.arc(4, yOffset + 4, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }
}
