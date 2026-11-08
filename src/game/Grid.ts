// Tower placement validation, path collision checks, and grid coordinates

import type { GameMap } from '../data/maps';
import { TOWERS, type TowerType } from '../data/towers';
import type { Tower } from './Tower';

export class GridManager {
  public static canPlaceTower(
    x: number,
    y: number,
    towerType: TowerType,
    existingTowers: Tower[],
    map: GameMap
  ): { valid: boolean; reason?: string } {
    const config = TOWERS[towerType];

    // 1. Boundary check
    if (x < 30 || x > 930 || y < 30 || y > 610) {
      return { valid: false, reason: 'Too close to sanctuary boundary' };
    }

    // 2. Collision with existing towers
    for (const t of existingTowers) {
      const dist = Math.hypot(t.x - x, t.y - y);
      if (dist < 38) {
        return { valid: false, reason: 'Too close to another guardian' };
      }
    }

    // 3. Collision with paths
    const minPathDist = (map.pathWidth / 2) + 14;
    for (const path of map.paths) {
      // If it's a water path and the tower is amphibious (like beaver), allow placing near water edge
      for (let i = 0; i < path.waypoints.length - 1; i++) {
        const p1 = path.waypoints[i];
        const p2 = path.waypoints[i + 1];
        const dist = this.distToSegment({ x, y }, p1, p2);
        if (dist < minPathDist) {
          return { valid: false, reason: 'Cannot plant directly on invader path' };
        }
      }
    }

    // 4. Water zone check
    if (map.waterZones && config.placementType !== 'any' && config.placementType !== 'water') {
      for (const wz of map.waterZones) {
        if (x >= wz.x && x <= wz.x + wz.w && y >= wz.y && y <= wz.y + wz.h) {
          return { valid: false, reason: 'This native species cannot take root in deep water' };
        }
      }
    }

    return { valid: true };
  }

  // Point to line segment distance
  public static distToSegment(
    p: { x: number; y: number },
    v: { x: number; y: number },
    w: { x: number; y: number }
  ): number {
    const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);

    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));

    const projX = v.x + t * (w.x - v.x);
    const projY = v.y + t * (w.y - v.y);
    return Math.hypot(p.x - projX, p.y - projY);
  }
}
