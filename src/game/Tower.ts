// Native Guardian Tower implementation, targeting, upgrades, and rendering

import { TOWERS, type TargetPriority, type TowerConfig, type TowerType, type UpgradeTier } from '../data/towers';
import type { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { soundManager } from '../audio/SoundManager';
import type { ParticleSystem } from './ParticleSystem';

export class Tower {
  public id: string;
  public type: TowerType;
  public config: TowerConfig;
  public tierIndex: number = 0; // 0, 1, 2
  public x: number;
  public y: number;
  public targetPriority: TargetPriority = 'first';

  public cooldown: number = 0;
  public totalDamageDealt: number = 0;
  public kills: number = 0;
  public isSelected: boolean = false;

  // Synergies & debuffs
  public isAllelopathSapped: boolean = false;
  public hasMonarchBuff: boolean = false;

  // Animation states
  private animTimer: number = 0;
  private attackAnimProgress: number = 0;
  public targetAngle: number = 0;

  constructor(type: TowerType, x: number, y: number) {
    this.id = Math.random().toString(36).substring(2, 9);
    this.type = type;
    this.config = TOWERS[type];
    this.x = x;
    this.y = y;
    this.animTimer = Math.random() * 10;
  }

  public get currentTier(): UpgradeTier {
    return this.config.tiers[this.tierIndex];
  }

  public get nextTier(): UpgradeTier | null {
    if (this.tierIndex < this.config.tiers.length - 1) {
      return this.config.tiers[this.tierIndex + 1];
    }
    return null;
  }

  public get totalInvestedSun(): number {
    let sun = 0;
    for (let i = 0; i <= this.tierIndex; i++) {
      sun += this.config.tiers[i].costSun;
    }
    return sun;
  }

  public get totalInvestedBiomass(): number {
    let bio = 0;
    for (let i = 0; i <= this.tierIndex; i++) {
      bio += this.config.tiers[i].costBiomass;
    }
    return bio;
  }

  public update(
    dt: number,
    enemies: Enemy[],
    projectiles: Projectile[],
    particles: ParticleSystem
  ) {
    this.animTimer += dt;
    if (this.attackAnimProgress > 0) {
      this.attackAnimProgress = Math.max(0, this.attackAnimProgress - dt * 4);
    }

    if (this.cooldown > 0) {
      this.cooldown -= dt;
    }

    // Check if ready to attack
    if (this.cooldown <= 0) {
      const target = this.findBestTarget(enemies);
      if (target) {
        this.targetAngle = Math.atan2(target.y - this.y, target.x - this.x);
        this.executeAttack(target, projectiles, particles);

        // Calculate fire interval
        let rate = this.currentTier.fireRate;
        if (this.isAllelopathSapped) {
          rate *= 0.65; // -35% attack rate when poisoned by garlic mustard
        }
        if (this.hasMonarchBuff) {
          rate *= 1.25; // +25% attack rate pollinator synergy
        }
        this.cooldown = 1.0 / Math.max(0.2, rate);
        this.attackAnimProgress = 1.0;
      }
    }
  }

  public findBestTarget(enemies: Enemy[]): Enemy | null {
    const range = this.currentTier.range;
    const inRange: Enemy[] = [];

    for (const enemy of enemies) {
      if (enemy.isDead || enemy.hasReachedEnd) continue;
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist <= range) {
        inRange.push(enemy);
      }
    }

    if (inRange.length === 0) return null;

    // Apply prioritization
    switch (this.targetPriority) {
      case 'flying': {
        const flyers = inRange.filter((e) => e.config.isFlying);
        if (flyers.length > 0) {
          return flyers.sort((a, b) => b.distanceTraveled - a.distanceTraveled)[0];
        }
        return inRange.sort((a, b) => b.distanceTraveled - a.distanceTraveled)[0];
      }
      case 'strongest':
        return inRange.sort((a, b) => b.hp - a.hp)[0];
      case 'weakest':
        return inRange.sort((a, b) => a.hp - b.hp)[0];
      case 'closest':
        return inRange.sort(
          (a, b) => Math.hypot(a.x - this.x, a.y - this.y) - Math.hypot(b.x - this.x, b.y - this.y)
        )[0];
      case 'last':
        return inRange.sort((a, b) => a.distanceTraveled - b.distanceTraveled)[0];
      case 'first':
      default:
        return inRange.sort((a, b) => b.distanceTraveled - a.distanceTraveled)[0];
    }
  }

  private executeAttack(
    target: Enemy,
    projectiles: Projectile[],
    particles: ParticleSystem
  ) {
    const tier = this.currentTier;

    switch (this.type) {
      case 'milkweed': {
        soundManager.playMilkweedShoot();
        projectiles.push(
          new Projectile({
            x: this.x,
            y: this.y,
            target,
            targetX: target.x,
            targetY: target.y,
            speed: tier.projectileSpeed,
            damage: tier.damage,
            type: 'seed',
            poison: this.tierIndex >= 1 ? { dps: 6, duration: 3.0 } : undefined,
            color: tier.color,
          })
        );
        particles.addPollenBurst(this.x, this.y, '#fbcfe8', 3);
        break;
      }

      case 'coneflower': {
        soundManager.playConeflowerShoot();
        // Piercing spine line shot
        projectiles.push(
          new Projectile({
            x: this.x,
            y: this.y,
            target: null,
            targetX: target.x,
            targetY: target.y,
            speed: tier.projectileSpeed,
            damage: tier.damage,
            type: 'spine',
            pierce: tier.pierce || 2,
            slow: this.tierIndex >= 2 ? { multiplier: 0.55, duration: 3.0 } : undefined,
            color: tier.color,
          })
        );
        break;
      }

      case 'bur_oak': {
        soundManager.playAcornLaunch();
        projectiles.push(
          new Projectile({
            x: this.x,
            y: this.y - 12,
            target: null,
            targetX: target.x,
            targetY: target.y,
            speed: tier.projectileSpeed,
            damage: tier.damage,
            type: 'acorn',
            splashRadius: tier.splashRadius || 60,
            stun: this.tierIndex >= 1 ? 0.6 : undefined,
            color: tier.color,
          })
        );
        break;
      }

      case 'beaver': {
        soundManager.playBeaverSplash();
        particles.addWaterSplash(this.x, this.y, 10);
        projectiles.push(
          new Projectile({
            x: this.x,
            y: this.y,
            target: null,
            targetX: target.x,
            targetY: target.y,
            speed: tier.projectileSpeed,
            damage: tier.damage,
            type: 'water_wave',
            pierce: 6,
            knockback: this.tierIndex >= 2 ? 30 : 16,
            slow: this.tierIndex >= 1 ? { multiplier: 0.7, duration: 2.0 } : undefined,
            color: '#38bdf8',
          })
        );
        break;
      }

      case 'bat_roost': {
        soundManager.playBatSonar();
        particles.addBatSonarWave(this.x, this.y, tier.color);
        projectiles.push(
          new Projectile({
            x: this.x,
            y: this.y - 10,
            target,
            targetX: target.x,
            targetY: target.y,
            speed: tier.projectileSpeed,
            damage: tier.damage,
            type: 'sonar',
            color: tier.color,
          })
        );
        break;
      }

      case 'opossum': {
        soundManager.playOpossumChomp();
        projectiles.push(
          new Projectile({
            x: this.x,
            y: this.y,
            target,
            targetX: target.x,
            targetY: target.y,
            speed: tier.projectileSpeed,
            damage: tier.damage,
            type: 'seed',
            color: '#71717a',
          })
        );
        break;
      }
    }
  }

  public upgrade(): boolean {
    if (this.nextTier) {
      this.tierIndex++;
      soundManager.playUpgrade();
      return true;
    }
    return false;
  }

  public render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Selected or Hover Range Ring
    if (this.isSelected) {
      ctx.beginPath();
      ctx.arc(0, 0, this.currentTier.range, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(74, 222, 128, 0.12)';
      ctx.fill();
      ctx.strokeStyle = '#4ade80';
      ctx.lineWidth = 1.8;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Highlight base pedestal
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 8, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Plant base soil mound
    ctx.fillStyle = '#543d2b';
    ctx.beginPath();
    ctx.ellipse(0, 5, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw specific Guardian artwork
    this.drawGuardianArt(ctx);

    // Monarch Butterfly Orbit (Tier 3 Milkweed)
    if (this.type === 'milkweed' && this.tierIndex >= 2) {
      const orbitAngle = this.animTimer * 2.5;
      const ox = Math.cos(orbitAngle) * 26;
      const oy = Math.sin(orbitAngle) * 16 - 12;
      const wing = Math.sin(this.animTimer * 20) * 4;

      ctx.save();
      ctx.translate(ox, oy);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.ellipse(-3, -wing, 5, 3, -0.3, 0, Math.PI * 2);
      ctx.ellipse(3, wing, 5, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-1, -2, 2, 4);
      ctx.restore();
    }

    // Allelopathy debuff indicator
    if (this.isAllelopathSapped) {
      ctx.font = '12px sans-serif';
      ctx.fillText('☣️', -8, -26);
    }

    // Tier Stars
    const stars = this.tierIndex + 1;
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 9px system-ui';
    ctx.textAlign = 'center';
    let starStr = '★';
    if (stars === 2) starStr = '★★';
    if (stars === 3) starStr = '★★★';
    ctx.fillText(starStr, 0, 18);

    ctx.restore();
  }

  private drawGuardianArt(ctx: CanvasRenderingContext2D) {
    const recoil = Math.sin(this.attackAnimProgress * Math.PI) * 4;
    const sway = Math.sin(this.animTimer * 2) * 2;

    switch (this.type) {
      case 'milkweed': {
        // Milkweed stem
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.quadraticCurveTo(sway, -8, sway, -18);
        ctx.stroke();

        // Broad green leaves
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(-7, -8, 8, 3.5, -0.4, 0, Math.PI * 2);
        ctx.ellipse(7, -6, 8, 3.5, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Pink/mauve spherical flower umbel
        ctx.fillStyle = this.currentTier.color;
        ctx.beginPath();
        ctx.arc(sway, -20 - recoil, 9, 0, Math.PI * 2);
        ctx.fill();

        // Fluffy seed star center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sway, -20 - recoil, 3, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'coneflower': {
        // Deep roots hint
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(0, 4);
        ctx.lineTo(sway, -22);
        ctx.stroke();

        // Drooping purple/pink ray petals
        ctx.fillStyle = this.currentTier.color;
        const cx = sway;
        const cy = -22 - recoil;
        for (let i = 0; i < 7; i++) {
          const a = (i * Math.PI) / 6 + 0.1;
          ctx.beginPath();
          ctx.ellipse(cx + Math.cos(a) * 10, cy + Math.sin(a) * 10 + 2, 7, 2.5, a, 0, Math.PI * 2);
          ctx.fill();
        }

        // Prominent spiky coppery cone
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(cx, cy, 7, Math.PI, 0);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(cx, cy - 2, 4, Math.PI, 0);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'bur_oak': {
        // Massive textured trunk
        ctx.fillStyle = '#451a03';
        ctx.fillRect(-6, -10, 12, 16);

        // Broad savanna canopy
        const canopySize = 16 + this.tierIndex * 4;
        ctx.fillStyle = '#166534';
        ctx.beginPath();
        ctx.arc(0, -18 - recoil, canopySize, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(-4, -22 - recoil, canopySize * 0.7, 0, Math.PI * 2);
        ctx.arc(5, -20 - recoil, canopySize * 0.65, 0, Math.PI * 2);
        ctx.fill();

        // Acorn catapult / branch ready
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, -28 - recoil, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'beaver': {
        // Flat scaly tail
        ctx.fillStyle = '#292524';
        ctx.beginPath();
        ctx.ellipse(-14, 2, 8, 4, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Brown furry body
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.ellipse(0, -4 - recoil, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Beaver head
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(8, -8 - recoil, 7, 0, Math.PI * 2);
        ctx.fill();

        // Orange chewing incisors
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(13, -7 - recoil, 3, 3);

        // Water droplets at feet
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-4, 6, 2, 0, Math.PI * 2);
        ctx.arc(4, 7, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'bat_roost': {
        // Wooden post
        ctx.fillStyle = '#57534e';
        ctx.fillRect(-3, -26, 6, 32);

        // Cedar bat house box
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, -28 - recoil, 20, 16);

        // Roof bevel
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.moveTo(-13, -28 - recoil);
        ctx.lineTo(0, -34 - recoil);
        ctx.lineTo(13, -28 - recoil);
        ctx.closePath();
        ctx.fill();

        // Bat perched underneath or wings
        ctx.fillStyle = '#312e81';
        ctx.beginPath();
        ctx.arc(0, -12 - recoil, 5, 0, Math.PI * 2);
        ctx.fill();

        // Ultrasonic pulse indicator
        ctx.strokeStyle = '#818cf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, -32 - recoil, 6, -Math.PI * 0.7, -Math.PI * 0.3);
        ctx.stroke();
        break;
      }

      case 'opossum': {
        // White face with pink nose, grey body, hairless tail
        // Tail
        ctx.strokeStyle = '#fda4af';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-10, 2);
        ctx.quadraticCurveTo(-18, 0, -16, -6);
        ctx.stroke();

        // Grey marsupial body
        ctx.fillStyle = '#71717a';
        ctx.beginPath();
        ctx.ellipse(0, -3 - recoil, 11, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pointed white face
        ctx.fillStyle = '#f4f4f5';
        ctx.beginPath();
        ctx.moveTo(4, -8 - recoil);
        ctx.lineTo(14, -3 - recoil);
        ctx.lineTo(4, 2 - recoil);
        ctx.closePath();
        ctx.fill();

        // Pink nose & black eye
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(14, -3 - recoil, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#18181b';
        ctx.beginPath();
        ctx.arc(7, -5 - recoil, 1.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }
  }
}
