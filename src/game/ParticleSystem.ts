// Particle and visual effects engine for Prairie Defense

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'fluff' | 'spark' | 'dirt' | 'water' | 'ring' | 'leaf' | 'text';
  text?: string;
  spin?: number;
  rotation?: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (p.rotation !== undefined && p.spin !== undefined) {
        p.rotation += p.spin * dt;
      }

      // Fade alpha
      p.alpha = Math.max(0, p.life / p.maxLife);

      // Light gravity or drag depending on type
      if (p.type === 'dirt') {
        p.vy += 280 * dt; // gravity
      } else if (p.type === 'fluff') {
        p.vx += Math.sin(p.life * 5) * 8 * dt; // gentle flutter
        p.vy -= 10 * dt; // upward drift
      } else if (p.type === 'text') {
        p.vy -= 15 * dt; // gentle upward rise
      } else if (p.type === 'ring') {
        p.size += 180 * dt; // expand ring
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;

      if (p.type === 'text' && p.text) {
        ctx.font = 'bold 13px system-ui, sans-serif';
        ctx.fillStyle = p.color;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4;
        ctx.textAlign = 'center';
        ctx.fillText(p.text, p.x, p.y);
      } else if (p.type === 'ring') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();
      } else if (p.type === 'fluff') {
        // Soft white milkweed seed fluff
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        // Little seed tail
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 4, p.y + 6);
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (p.type === 'leaf') {
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.6, p.size, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Standard circular particles (spark, dirt, water)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public addPollenBurst(x: number, y: number, color: string = '#facc15', count: number = 10) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        size: 2.5 + Math.random() * 2,
        color,
        alpha: 1,
        type: 'spark',
      });
    }
  }

  public addAcornExplosion(x: number, y: number, radius: number = 60) {
    // Shockwave ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.3,
      maxLife: 0.3,
      size: Math.max(15, radius * 0.25),
      color: '#eab308',
      alpha: 0.9,
      type: 'ring',
    });

    // Flying dirt and wood fragments
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 140;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 50,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.5 ? '#78350f' : '#854d0e',
        alpha: 1,
        type: 'dirt',
      });
    }

    // Flash burst
    this.addPollenBurst(x, y, '#fde047', 8);
  }

  public addWaterSplash(x: number, y: number, count: number = 14) {
    // Water ripple ring
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.45,
      maxLife: 0.45,
      size: 10,
      color: '#38bdf8',
      alpha: 0.8,
      type: 'ring',
    });

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 90;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.6,
        size: 2.5 + Math.random() * 3,
        color: '#67e8f9',
        alpha: 1,
        type: 'water',
      });
    }
  }

  public addBatSonarWave(x: number, y: number, color: string = '#818cf8') {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 0,
      life: 0.25,
      maxLife: 0.25,
      size: 8,
      color,
      alpha: 0.85,
      type: 'ring',
    });
  }

  public addEnemyDefeatEffect(x: number, y: number, color: string, sun: number, biomass: number) {
    // Compost cloud / leafy burst
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 30 + Math.random() * 70;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        size: 3 + Math.random() * 3,
        color,
        alpha: 1,
        type: 'leaf',
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 8,
      });
    }

    // Floating resource text
    this.particles.push({
      x,
      y: y - 10,
      vx: 0,
      vy: -40,
      life: 0.9,
      maxLife: 0.9,
      size: 13,
      color: '#facc15',
      alpha: 1,
      type: 'text',
      text: `+${sun} ☀️`,
    });

    if (biomass > 0) {
      this.particles.push({
        x: x + 15,
        y: y + 5,
        vx: 0,
        vy: -35,
        life: 0.9,
        maxLife: 0.9,
        size: 12,
        color: '#4ade80',
        alpha: 1,
        type: 'text',
        text: `+${biomass} 🍂`,
      });
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#ffffff') {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: -35,
      life: 0.8,
      maxLife: 0.8,
      size: 12,
      color,
      alpha: 1,
      type: 'text',
      text,
    });
  }

  public addVictoryLeaves() {
    for (let i = 0; i < 45; i++) {
      const colors = ['#4ade80', '#fbbf24', '#f43f5e', '#a855f7', '#60a5fa'];
      const col = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: Math.random() * 960,
        y: -10 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 80,
        vy: 60 + Math.random() * 90,
        life: 2.5 + Math.random() * 1.5,
        maxLife: 4.0,
        size: 4 + Math.random() * 4,
        color: col,
        alpha: 1,
        type: 'leaf',
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 5,
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
