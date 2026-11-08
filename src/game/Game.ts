// Core Game controller, wave orchestrator, and simulation loop

import { MAPS, type GameMap, type PathDef } from '../data/maps';
import { PRAIRIE_WAVES, type WaveDef, type WaveGroup } from '../data/waves';
import { TOWERS, type TowerType } from '../data/towers';
import { Tower } from './Tower';
import { Enemy } from './Enemy';
import { Projectile } from './Projectile';
import { ParticleSystem } from './ParticleSystem';
import { MapRenderer } from './MapRenderer';
import { GridManager } from './Grid';
import { soundManager } from '../audio/SoundManager';

export interface ActiveWaveGroupState {
  group: WaveGroup;
  spawned: number;
  timeSinceStart: number;
  lastSpawnTime: number;
  path: PathDef;
}

export class Game {
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;

  public map: GameMap;
  public sun: number = 380;
  public biomass: number = 0;
  public health: number = 20;
  public maxHealth: number = 20;

  public currentWaveIndex: number = 0;
  public waveInProgress: boolean = false;
  public autoStartWave: boolean = false;
  public gameSpeed: number = 1.0;
  public isPaused: boolean = false;
  public gameStatus: 'playing' | 'victory' | 'defeat' = 'playing';

  public towers: Tower[] = [];
  public enemies: Enemy[] = [];
  public projectiles: Projectile[] = [];
  public particles: ParticleSystem;
  public mapRenderer: MapRenderer;

  public selectedTower: Tower | null = null;
  public placingTowerType: TowerType | null = null;
  public mousePos: { x: number; y: number } = { x: -100, y: -100 };
  public isMouseOnCanvas: boolean = false;

  // Wave state
  private activeWaveGroups: ActiveWaveGroupState[] = [];
  private waveElapsedTime: number = 0;

  // Passive sunlight timer
  private sunTimer: number = 0;

  // Statistics
  public totalInvadersDefeated: number = 0;
  public totalSunCollected: number = 0;
  public totalBiomassCollected: number = 0;

  // Callbacks for UI updates
  public onStateChange: (() => void) | null = null;
  public onTowerSelected: ((tower: Tower | null) => void) | null = null;

  constructor(canvas: HTMLCanvasElement, mapId: string = 'prairie') {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.map = MAPS[mapId] || MAPS.prairie;
    this.particles = new ParticleSystem();
    this.mapRenderer = new MapRenderer();

    this.initMap(this.map);
    this.setupEventListeners();
  }

  public initMap(map: GameMap) {
    this.map = map;
    this.sun = map.startingSun;
    this.biomass = map.startingBiomass;
    this.health = map.sanctuaryHealth;
    this.maxHealth = map.sanctuaryHealth;
    this.currentWaveIndex = 0;
    this.waveInProgress = false;
    this.gameStatus = 'playing';

    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles.clear();
    this.selectedTower = null;
    this.placingTowerType = null;
    this.activeWaveGroups = [];

    this.totalInvadersDefeated = 0;
    this.totalSunCollected = this.sun;
    this.totalBiomassCollected = this.biomass;

    this.notifyState();
  }

  public get currentWaveDef(): WaveDef | null {
    if (this.currentWaveIndex < PRAIRIE_WAVES.length) {
      return PRAIRIE_WAVES[this.currentWaveIndex];
    }
    return null;
  }

  public get isPlacing(): boolean {
    return this.placingTowerType !== null;
  }

  public startNextWave(): boolean {
    if (this.waveInProgress || this.gameStatus !== 'playing') return false;
    if (this.currentWaveIndex >= PRAIRIE_WAVES.length) return false;

    soundManager.ensureAudio();
    soundManager.playWaveStart();

    const wave = PRAIRIE_WAVES[this.currentWaveIndex];
    this.waveInProgress = true;
    this.waveElapsedTime = 0;
    this.activeWaveGroups = [];

    for (const group of wave.groups) {
      // Pick path for group (e.g. aquatic creeps use water path if available)
      let path = this.map.paths[0];
      if (group.pathId) {
        const found = this.map.paths.find((p) => p.id === group.pathId);
        if (found) path = found;
      } else if (group.enemyType === 'asian_carp' || group.enemyType === 'zebra_mussel') {
        const waterPath = this.map.paths.find((p) => p.isWater);
        if (waterPath) path = waterPath;
      }

      this.activeWaveGroups.push({
        group,
        spawned: 0,
        timeSinceStart: 0,
        lastSpawnTime: -999,
        path,
      });
    }

    this.notifyState();
    return true;
  }

  public setSpeed(speed: number) {
    if (speed === 0) {
      this.isPaused = true;
    } else {
      this.isPaused = false;
      this.gameSpeed = speed;
    }
    this.notifyState();
  }

  public togglePause() {
    this.isPaused = !this.isPaused;
    this.notifyState();
  }

  public toggleAutoStart() {
    this.autoStartWave = !this.autoStartWave;
    this.notifyState();
  }

  public selectPlacingTower(type: TowerType | null) {
    soundManager.ensureAudio();
    this.placingTowerType = type;
    if (type !== null) {
      this.selectedTower = null;
      if (this.onTowerSelected) this.onTowerSelected(null);
    }
    this.notifyState();
  }

  public selectTower(tower: Tower | null) {
    soundManager.ensureAudio();
    if (this.selectedTower) {
      this.selectedTower.isSelected = false;
    }
    this.selectedTower = tower;
    if (this.selectedTower) {
      this.selectedTower.isSelected = true;
      this.placingTowerType = null;
    }
    if (this.onTowerSelected) {
      this.onTowerSelected(this.selectedTower);
    }
    this.notifyState();
  }

  public buyAndPlaceTower(type: TowerType, x: number, y: number): boolean {
    const config = TOWERS[type];
    if (this.sun < config.baseCostSun || this.biomass < config.baseCostBiomass) {
      this.particles.addFloatingText(x, y, 'Not enough resources!', '#ef4444');
      return false;
    }

    const check = GridManager.canPlaceTower(x, y, type, this.towers, this.map);
    if (!check.valid) {
      this.particles.addFloatingText(x, y, check.reason || 'Invalid location', '#ef4444');
      return false;
    }

    this.sun -= config.baseCostSun;
    this.biomass -= config.baseCostBiomass;

    const newTower = new Tower(type, x, y);
    this.towers.push(newTower);

    soundManager.playPlaceTower();
    this.particles.addPollenBurst(x, y, '#22c55e', 14);

    this.selectTower(newTower);
    this.notifyState();
    return true;
  }

  public upgradeSelectedTower(): boolean {
    if (!this.selectedTower) return false;
    const nextTier = this.selectedTower.nextTier;
    if (!nextTier) return false;

    if (this.sun < nextTier.costSun || this.biomass < nextTier.costBiomass) {
      this.particles.addFloatingText(
        this.selectedTower.x,
        this.selectedTower.y,
        'Need more resources!',
        '#ef4444'
      );
      return false;
    }

    this.sun -= nextTier.costSun;
    this.biomass -= nextTier.costBiomass;
    this.selectedTower.upgrade();
    this.particles.addPollenBurst(
      this.selectedTower.x,
      this.selectedTower.y,
      nextTier.color,
      18
    );

    this.notifyState();
    return true;
  }

  public compostSelectedTower(): boolean {
    if (!this.selectedTower) return false;

    // Refund 70% of invested resources
    const refundSun = Math.floor(this.selectedTower.totalInvestedSun * 0.7);
    const refundBio = Math.floor(this.selectedTower.totalInvestedBiomass * 0.7);

    this.sun += refundSun;
    this.biomass += refundBio;

    this.particles.addEnemyDefeatEffect(
      this.selectedTower.x,
      this.selectedTower.y,
      '#65a30d',
      refundSun,
      refundBio
    );

    const index = this.towers.indexOf(this.selectedTower);
    if (index !== -1) {
      this.towers.splice(index, 1);
    }

    this.selectTower(null);
    this.notifyState();
    return true;
  }

  public update(realDt: number) {
    if (this.isPaused || this.gameStatus !== 'playing') {
      // Still update ambient particles / map animations at 1x
      this.mapRenderer.update(realDt);
      this.particles.update(realDt);
      return;
    }

    const dt = Math.min(0.1, realDt) * this.gameSpeed;

    // 1. Passive Sunlight Generation (simulating photosynthesis across the biome)
    this.sunTimer += dt;
    if (this.sunTimer >= 1.0) {
      this.sunTimer -= 1.0;
      this.sun += 4; // +4 sunlight per second
      this.totalSunCollected += 4;
      this.notifyState();
    }

    // 2. Map and visual FX update
    this.mapRenderer.update(dt);
    this.particles.update(dt);

    // 3. Update Allelopathy & Monarch Synergies
    this.updateSynergies();

    // 4. Update Towers
    for (const tower of this.towers) {
      tower.update(dt, this.enemies, this.projectiles, this.particles);
    }

    // 5. Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.update(dt, this.enemies, this.particles, (killedEnemy) => {
        this.onEnemyDefeated(killedEnemy);
      });
      if (proj.isDead) {
        this.projectiles.splice(i, 1);
      }
    }

    // 6. Update Enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const deathResult = enemy.update(dt);

      if (enemy.isDead) {
        this.onEnemyDefeated(enemy);
        if (deathResult && deathResult.split) {
          this.handleEnemySplit(deathResult.split);
        }
        this.enemies.splice(i, 1);
      } else if (enemy.hasReachedEnd) {
        // Encroached into core sanctuary!
        this.health -= enemy.config.sanctuaryDamage;
        soundManager.playSanctuaryDamage();
        this.particles.addFloatingText(
          enemy.x,
          enemy.y,
          `-${enemy.config.sanctuaryDamage} Core Health!`,
          '#ef4444'
        );
        this.enemies.splice(i, 1);

        if (this.health <= 0) {
          this.health = 0;
          this.gameStatus = 'defeat';
          this.notifyState();
        } else {
          this.notifyState();
        }
      }
    }

    // 7. Process Active Wave Spawning
    if (this.waveInProgress) {
      this.waveElapsedTime += dt;
      let allGroupsFinished = true;

      for (const ag of this.activeWaveGroups) {
        ag.timeSinceStart += dt;
        if (ag.timeSinceStart >= ag.group.delay && ag.spawned < ag.group.count) {
          allGroupsFinished = false;
          if (ag.timeSinceStart - ag.lastSpawnTime >= ag.group.interval) {
            ag.lastSpawnTime = ag.timeSinceStart;
            ag.spawned++;

            const newEnemy = new Enemy(ag.group.enemyType, ag.path.waypoints);
            this.enemies.push(newEnemy);
          }
        } else if (ag.spawned < ag.group.count) {
          allGroupsFinished = false;
        }
      }

      // Check if wave finished (all spawned AND all dead)
      if (allGroupsFinished && this.enemies.length === 0) {
        this.completeWave();
      }
    }
  }

  private updateSynergies() {
    // Check Monarch Haven buffs (Tier 3 Milkweed)
    const monarchHavens = this.towers.filter(
      (t) => t.type === 'milkweed' && t.tierIndex >= 2
    );

    // Check Garlic Mustard allelopathic auras
    const mustardEnemies = this.enemies.filter(
      (e) => !e.isDead && e.config.isAllelopathic
    );

    for (const tower of this.towers) {
      // 1. Monarch buff (+25% attack speed to adjacent native plants within 140px)
      let buffed = false;
      for (const mh of monarchHavens) {
        if (mh !== tower && Math.hypot(mh.x - tower.x, mh.y - tower.y) <= 140) {
          buffed = true;
          break;
        }
      }
      tower.hasMonarchBuff = buffed;

      // 2. Allelopathic suppression (within 60px of garlic mustard)
      // Note: Opossum is immune!
      let sapped = false;
      if (tower.type !== 'opossum') {
        for (const me of mustardEnemies) {
          if (Math.hypot(me.x - tower.x, me.y - tower.y) <= 60) {
            sapped = true;
            break;
          }
        }
      }
      tower.isAllelopathSapped = sapped;
    }
  }

  private handleEnemySplit(split: {
    type: Enemy['type'];
    count: number;
    distance: number;
    waypoints: PathDef['waypoints'];
  }) {
    for (let s = 0; s < split.count; s++) {
      const offsetDist = Math.max(0, split.distance + (s - 0.5) * 20);
      const child = new Enemy(split.type, split.waypoints, offsetDist);
      this.enemies.push(child);
      this.particles.addPollenBurst(child.x, child.y, '#eab308', 6);
    }
  }

  private onEnemyDefeated(enemy: Enemy) {
    this.totalInvadersDefeated++;
    let sunReward = enemy.config.rewardSun;
    let bioReward = enemy.config.rewardBiomass;

    // Check if near an Opossum (bonus compost!)
    const nearOpossum = this.towers.some(
      (t) => t.type === 'opossum' && Math.hypot(t.x - enemy.x, t.y - enemy.y) <= 130
    );
    if (nearOpossum) {
      bioReward = Math.ceil(bioReward * 1.5);
    }

    this.sun += sunReward;
    this.biomass += bioReward;
    this.totalSunCollected += sunReward;
    this.totalBiomassCollected += bioReward;

    soundManager.playEnemyDefeated();
    this.particles.addEnemyDefeatEffect(
      enemy.x,
      enemy.y,
      enemy.config.color,
      sunReward,
      bioReward
    );

    this.notifyState();
  }

  private completeWave() {
    this.waveInProgress = false;
    const wave = PRAIRIE_WAVES[this.currentWaveIndex];

    // Award wave bonus
    this.sun += wave.rewardSun;
    this.biomass += wave.rewardBiomass;
    this.totalSunCollected += wave.rewardSun;
    this.totalBiomassCollected += wave.rewardBiomass;

    soundManager.playVictory();
    this.particles.addVictoryLeaves();
    this.particles.addFloatingText(
      480,
      280,
      `Wave ${wave.waveNumber} Cleared! +${wave.rewardSun} ☀️ +${wave.rewardBiomass} 🍂`,
      '#4ade80'
    );

    this.currentWaveIndex++;

    if (this.currentWaveIndex >= PRAIRIE_WAVES.length) {
      this.gameStatus = 'victory';
      this.notifyState();
      return;
    }

    this.notifyState();

    if (this.autoStartWave) {
      setTimeout(() => {
        if (this.gameStatus === 'playing' && !this.waveInProgress) {
          this.startNextWave();
        }
      }, 1500);
    }
  }

  public render() {
    this.ctx.clearRect(0, 0, 960, 640);

    // 1. Render Map Biome & Paths
    this.mapRenderer.render(this.ctx, this.map);

    // 2. Render Towers
    for (const tower of this.towers) {
      tower.render(this.ctx);
    }

    // 3. Render Enemies
    for (const enemy of this.enemies) {
      enemy.render(this.ctx);
    }

    // 4. Render Projectiles
    for (const proj of this.projectiles) {
      proj.render(this.ctx);
    }

    // 5. Render Particle FX
    this.particles.render(this.ctx);

    // 6. Render Placement Preview if hovering in placement mode
    if (this.placingTowerType && this.isMouseOnCanvas) {
      this.renderPlacementPreview();
    }
  }

  private renderPlacementPreview() {
    if (!this.placingTowerType) return;
    const cfg = TOWERS[this.placingTowerType];
    const check = GridManager.canPlaceTower(
      this.mousePos.x,
      this.mousePos.y,
      this.placingTowerType,
      this.towers,
      this.map
    );

    this.ctx.save();
    this.ctx.translate(this.mousePos.x, this.mousePos.y);

    // Range preview circle
    this.ctx.beginPath();
    this.ctx.arc(0, 0, cfg.tiers[0].range, 0, Math.PI * 2);
    this.ctx.fillStyle = check.valid
      ? 'rgba(74, 222, 128, 0.16)'
      : 'rgba(239, 68, 68, 0.16)';
    this.ctx.fill();

    this.ctx.strokeStyle = check.valid ? '#22c55e' : '#ef4444';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([6, 4]);
    this.ctx.stroke();

    // Base footprint indicator
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 18, 0, Math.PI * 2);
    this.ctx.fillStyle = check.valid
      ? 'rgba(34, 197, 94, 0.4)'
      : 'rgba(239, 68, 68, 0.4)';
    this.ctx.fill();
    this.ctx.strokeStyle = check.valid ? '#15803d' : '#991b1b';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([]);
    this.ctx.stroke();

    // Tower Icon preview
    this.ctx.font = '20px system-ui';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(cfg.tiers[0].icon, 0, -6);

    // Cost label
    this.ctx.font = 'bold 11px system-ui';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.shadowColor = 'rgba(0,0,0,0.8)';
    this.ctx.shadowBlur = 4;
    this.ctx.fillText(`${cfg.baseCostSun} ☀️`, 0, 18);

    this.ctx.restore();
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mousePos = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
      this.isMouseOnCanvas = true;
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isMouseOnCanvas = false;
    });

    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      soundManager.ensureAudio();

      if (this.placingTowerType) {
        // Place tower
        const placed = this.buyAndPlaceTower(this.placingTowerType, clickX, clickY);
        if (placed) {
          // If shift key not held, exit placing mode
          if (!e.shiftKey) {
            this.placingTowerType = null;
          }
        }
        return;
      }

      // Check if clicking existing tower
      let clickedTower: Tower | null = null;
      for (const t of this.towers) {
        const dist = Math.hypot(t.x - clickX, t.y - clickY);
        if (dist <= 26) {
          clickedTower = t;
          break;
        }
      }

      this.selectTower(clickedTower);
    });

    // Right-click cancels placement
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (this.placingTowerType) {
        this.selectPlacingTower(null);
      } else if (this.selectedTower) {
        this.selectTower(null);
      }
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.selectPlacingTower(null);
        this.selectTower(null);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (!this.waveInProgress) {
          this.startNextWave();
        } else {
          this.togglePause();
        }
      } else if (e.key === '1') {
        this.selectPlacingTower('milkweed');
      } else if (e.key === '2') {
        this.selectPlacingTower('coneflower');
      } else if (e.key === '3') {
        this.selectPlacingTower('bur_oak');
      } else if (e.key === '4') {
        this.selectPlacingTower('beaver');
      } else if (e.key === '5') {
        this.selectPlacingTower('bat_roost');
      } else if (e.key === '6') {
        this.selectPlacingTower('opossum');
      } else if (e.key === 'u' || e.key === 'U') {
        this.upgradeSelectedTower();
      } else if (e.key === 's' || e.key === 'S') {
        this.compostSelectedTower();
      }
    });
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange();
    }
  }
}
