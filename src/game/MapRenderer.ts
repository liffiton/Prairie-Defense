// Procedural terrain and biome renderer for Midwest maps

import type { GameMap, Decoration } from '../data/maps';

export class MapRenderer {
  private grassPatternCanvas: HTMLCanvasElement | null = null;
  private animTimer: number = 0;

  constructor() {
    this.createGrassTexture();
  }

  private createGrassTexture() {
    this.grassPatternCanvas = document.createElement('canvas');
    this.grassPatternCanvas.width = 64;
    this.grassPatternCanvas.height = 64;
    const ctx = this.grassPatternCanvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#6e9140';
    ctx.fillRect(0, 0, 64, 64);

    // Subtle grass blade textures
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    for (let i = 0; i < 24; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      ctx.fillRect(x, y, 2, 6);
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let i = 0; i < 24; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      ctx.fillRect(x, y, 2, 5);
    }
  }

  public update(dt: number) {
    this.animTimer += dt;
  }

  public render(ctx: CanvasRenderingContext2D, map: GameMap) {
    // 1. Draw base terrain
    ctx.fillStyle = map.groundColor;
    ctx.fillRect(0, 0, 960, 640);

    if (this.grassPatternCanvas) {
      ctx.save();
      ctx.globalAlpha = 0.25;
      const pattern = ctx.createPattern(this.grassPatternCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, 960, 640);
      }
      ctx.restore();
    }

    // 2. Draw water zones (if wetland map)
    if (map.waterZones) {
      for (const wz of map.waterZones) {
        const grad = ctx.createLinearGradient(wz.x, wz.y, wz.x, wz.y + wz.h);
        grad.addColorStop(0, '#2563eb');
        grad.addColorStop(1, '#1d4ed8');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(wz.x, wz.y, wz.w, wz.h, wz.radius || 12);
        ctx.fill();

        // Animated gentle ripples
        ctx.save();
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1.5;
        const rippleOffset = (this.animTimer * 20) % 40;
        for (let rx = wz.x + 30; rx < wz.x + wz.w - 30; rx += 80) {
          const ry = wz.y + 20 + ((rx * 17) % (wz.h - 40));
          ctx.beginPath();
          ctx.arc(rx, ry, (rippleOffset + rx % 15) % 25, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 3. Draw Paths with smooth curves and earthen borders
    for (const path of map.paths) {
      this.drawPath(ctx, path.waypoints, map.pathColor, map.pathWidth, !!path.isWater);
    }

    // 4. Draw Start Spawners and End Sanctuary Gates
    for (const path of map.paths) {
      const startPt = path.waypoints[0];
      const endPt = path.waypoints[path.waypoints.length - 1];

      // Invasive entry portal / encroaching weeds
      this.drawInvasiveSpawn(ctx, startPt.x, startPt.y);

      // Pristine Core Sanctuary Gate
      this.drawSanctuaryGate(ctx, endPt.x, endPt.y);
    }

    // 5. Draw scenery decorations
    for (const d of map.decorations) {
      this.drawDecoration(ctx, d);
    }
  }

  private drawPath(
    ctx: CanvasRenderingContext2D,
    waypoints: { x: number; y: number }[],
    pathColor: string,
    width: number,
    isWater: boolean
  ) {
    if (waypoints.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Outer border (dirt edge or river bank)
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.strokeStyle = isWater ? '#1e3a8a' : '#854d0e';
    ctx.lineWidth = width + 8;
    ctx.stroke();

    // Inner path
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.strokeStyle = isWater ? '#3b82f6' : pathColor;
    ctx.lineWidth = width;
    ctx.stroke();

    // Subtle path texture or water stream center line
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
    ctx.strokeStyle = isWater ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.06)';
    ctx.lineWidth = isWater ? 4 : width * 0.4;
    ctx.setLineDash(isWater ? [15, 12] : []);
    ctx.lineDashOffset = -this.animTimer * 25;
    ctx.stroke();

    ctx.restore();
  }

  private drawInvasiveSpawn(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Dark encroaching thorn marker
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.stroke();

    // Warning skull or thorn icon
    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠️', 0, 0);

    ctx.restore();
  }

  private drawSanctuaryGate(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.translate(x, y);

    // Glowing nature core ring
    const pulse = 1 + Math.sin(this.animTimer * 3) * 0.08;
    ctx.beginPath();
    ctx.arc(0, 0, 28 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#166534';
    ctx.fill();

    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#bbf7d0';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🛡️', 0, 0);

    ctx.restore();
  }

  private drawDecoration(ctx: CanvasRenderingContext2D, d: Decoration) {
    ctx.save();
    ctx.translate(d.x, d.y);
    const scale = d.scale || 1.0;

    switch (d.type) {
      case 'tree': {
        // Bur Oak tree canopy & trunk
        // Trunk shadow
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.beginPath();
        ctx.ellipse(0, 16 * scale, 24 * scale, 10 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Trunk
        ctx.fillStyle = '#5c3a21';
        ctx.fillRect(-6 * scale, 0, 12 * scale, 18 * scale);

        // Canopy layers
        ctx.fillStyle = '#2d5a27';
        ctx.beginPath();
        ctx.arc(0, -14 * scale, 32 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3f7a36';
        ctx.beginPath();
        ctx.arc(-8 * scale, -22 * scale, 22 * scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4e9343';
        ctx.beginPath();
        ctx.arc(10 * scale, -18 * scale, 20 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'wildflower': {
        // Wildflower stalk & petals
        const sway = Math.sin(this.animTimer * 2 + d.x * 0.1) * 3;
        ctx.strokeStyle = '#15803d';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 6);
        ctx.quadraticCurveTo(sway, 0, sway, -10);
        ctx.stroke();

        // Petals
        ctx.fillStyle = d.color || '#ec4899';
        ctx.beginPath();
        ctx.arc(sway, -10, 6, 0, Math.PI * 2);
        ctx.fill();

        // Golden center
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(sway, -10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'grass_cluster': {
        // Prairie grass tufts (Big Bluestem)
        ctx.strokeStyle = '#4d7c0f';
        ctx.lineWidth = 2;
        const sway = Math.sin(this.animTimer * 2.5 + d.x * 0.05) * 4;
        ctx.beginPath();
        ctx.moveTo(-6, 8);
        ctx.quadraticCurveTo(-6 + sway, 0, -10 + sway * 1.2, -14);
        ctx.moveTo(0, 8);
        ctx.quadraticCurveTo(sway, 0, sway * 1.3, -18);
        ctx.moveTo(6, 8);
        ctx.quadraticCurveTo(6 + sway, 0, 10 + sway * 1.2, -12);
        ctx.stroke();
        break;
      }

      case 'rock': {
        // Prairie boulder / glade rock
        ctx.fillStyle = '#78716c';
        ctx.beginPath();
        ctx.ellipse(0, 0, 14 * scale, 9 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#a8a29e';
        ctx.beginPath();
        ctx.ellipse(-3 * scale, -2 * scale, 9 * scale, 5 * scale, 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'cattail': {
        // Wetland cattail
        const sway = Math.sin(this.animTimer * 2 + d.x * 0.1) * 3;
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, 10);
        ctx.lineTo(sway, -16);
        ctx.stroke();

        // Brown fuzzy sausage head
        ctx.fillStyle = '#713f12';
        ctx.beginPath();
        ctx.roundRect(sway - 3, -16, 6, 14, 3);
        ctx.fill();
        break;
      }

      case 'lilypad': {
        // Water lily pad
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, 0, 10 * scale, 0.4, Math.PI * 2 - 0.4);
        ctx.lineTo(0, 0);
        ctx.fill();

        // Tiny white water flower
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-2 * scale, -2 * scale, 3 * scale, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
    }

    ctx.restore();
  }
}
