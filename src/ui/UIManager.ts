// UI Manager for HUD, Tower Selection Drawer, Upgrades, Tooltips, and Overlays

import type { Game } from '../game/Game';
import type { Tower } from '../game/Tower';
import { TOWERS, type TargetPriority, type TowerType } from '../data/towers';
import { MAPS } from '../data/maps';
import { ENEMIES } from '../data/enemies';
import { soundManager } from '../audio/SoundManager';
import { FieldGuideModal } from './FieldGuideModal';

export class UIManager {
  private game: Game;
  private fieldGuideModal: FieldGuideModal;
  private container: HTMLElement;

  constructor(game: Game, container: HTMLElement) {
    this.game = game;
    this.container = container;
    this.fieldGuideModal = new FieldGuideModal();

    this.renderSkeleton();
    this.attachEventListeners();
    this.updateHUD();

    // Hook game callbacks
    this.game.onStateChange = () => this.updateHUD();
    this.game.onTowerSelected = (tower) => this.updateSelectedTowerPanel(tower);
  }

  private renderSkeleton() {
    this.container.innerHTML = `
      <!-- Top HUD Header -->
      <header class="game-hud">
        <div class="hud-left">
          <div class="game-brand">
            <span class="brand-leaf">🌾</span>
            <div>
              <h1 class="game-title">Prairie Defense</h1>
              <span class="game-tagline">Midwest Native Guardians vs. Invasive Species</span>
            </div>
          </div>

          <div class="biome-selector-wrap">
            <label for="biome-select" class="hud-label">Biome:</label>
            <select id="biome-select" class="hud-select">
              <option value="prairie" ${this.game.map.id === 'prairie' ? 'selected' : ''}>🌾 Tallgrass Prairie (Easy)</option>
              <option value="savanna" ${this.game.map.id === 'savanna' ? 'selected' : ''}>🌳 Oak Savanna (Medium)</option>
              <option value="wetland" ${this.game.map.id === 'wetland' ? 'selected' : ''}>🌊 Coastal Wetland (Hard)</option>
            </select>
          </div>
        </div>

        <div class="hud-center">
          <!-- Resource Counters -->
          <div class="resource-pill" id="sun-counter" title="Sunlight: Absorbed passively and harvested to plant native species">
            <span class="res-icon">☀️</span>
            <span class="res-value" id="val-sun">0</span>
            <span class="res-rate">+4/s</span>
          </div>

          <div class="resource-pill" id="biomass-counter" title="Biomass / Rich Soil: Dropped by composting invasive species into fertile humus">
            <span class="res-icon">🍂</span>
            <span class="res-value" id="val-biomass">0</span>
          </div>

          <div class="resource-pill" id="health-counter" title="Sanctuary Core Biodiversity Integrity">
            <span class="res-icon">🛡️</span>
            <div class="hp-wrap">
              <div class="hp-bar-bg">
                <div class="hp-bar-fill" id="val-health-bar"></div>
              </div>
              <span class="hp-text"><span id="val-health">20</span>/<span id="val-max-health">20</span></span>
            </div>
          </div>
        </div>

        <div class="hud-right">
          <!-- Audio & Info Controls -->
          <button class="icon-btn" id="btn-sfx" title="Toggle Sound FX">🔊</button>
          <button class="icon-btn" id="btn-ambient" title="Toggle Nature Sounds">🍃</button>
          <button class="btn btn-guide" id="btn-open-guide">📖 Field Guide</button>
        </div>
      </header>

      <!-- Main Game Canvas Container -->
      <main class="game-viewport">
        <div class="canvas-wrapper" id="canvas-container">
          <!-- Canvas injected here -->
        </div>

        <!-- Selected Tower Inspector Overlay (Right Floating Card) -->
        <div class="tower-inspector hidden" id="tower-inspector">
          <!-- Populated dynamically -->
        </div>

        <!-- Defeat / Victory Modal Overlays -->
        <div class="game-overlay hidden" id="game-overlay">
          <!-- Populated dynamically -->
        </div>
      </main>

      <!-- Bottom Control Bar & Shop Drawer -->
      <footer class="game-footer">
        <div class="shop-drawer" id="shop-drawer">
          <!-- Rendered dynamically -->
        </div>

        <div class="wave-controls">
          <div class="wave-info-box">
            <div class="wave-header-line">
              <span class="wave-tag" id="hud-wave-tag">Wave 1 / 15</span>
              <span class="wave-name" id="hud-wave-name">Mustard Incursion</span>
            </div>
            <div class="wave-hint" id="hud-wave-hint">Garlic Mustard seeds are drifting in!</div>
            <div class="wave-creeps-preview" id="hud-wave-creeps">
              <!-- Upcoming creep icons -->
            </div>
          </div>

          <div class="wave-buttons-wrap">
            <button class="btn btn-wave" id="btn-start-wave">
              <span class="btn-wave-icon">⚔️</span>
              <span id="btn-wave-text">Start Wave</span>
            </button>

            <div class="playback-controls">
              <label class="auto-wave-toggle" title="Automatically start the next wave when current is cleared">
                <input type="checkbox" id="chk-auto-wave" ${this.game.autoStartWave ? 'checked' : ''} />
                <span>Auto Next</span>
              </label>

              <div class="speed-btn-group">
                <button class="speed-btn ${this.game.isPaused ? 'active' : ''}" data-speed="0" title="Pause (Space)">⏸</button>
                <button class="speed-btn ${!this.game.isPaused && this.game.gameSpeed === 1 ? 'active' : ''}" data-speed="1" title="Normal Speed">1x</button>
                <button class="speed-btn ${!this.game.isPaused && this.game.gameSpeed === 2 ? 'active' : ''}" data-speed="2" title="Fast Speed">2x</button>
                <button class="speed-btn ${!this.game.isPaused && this.game.gameSpeed === 4 ? 'active' : ''}" data-speed="4" title="Super Fast">4x</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    `;

    // Move canvas into wrapper
    const wrapper = this.container.querySelector('#canvas-container');
    if (wrapper) {
      wrapper.appendChild(this.game.canvas);
    }

    this.renderShop();
  }

  private renderShop() {
    const drawer = this.container.querySelector('#shop-drawer');
    if (!drawer) return;

    const towerTypes: TowerType[] = ['milkweed', 'coneflower', 'bur_oak', 'beaver', 'bat_roost', 'opossum'];
    const keys = ['1', '2', '3', '4', '5', '6'];

    drawer.innerHTML = towerTypes
      .map((type, index) => {
        const config = TOWERS[type];
        const tier0 = config.tiers[0];
        const isPlacingThis = this.game.placingTowerType === type;
        const canAfford = this.game.sun >= config.baseCostSun && this.game.biomass >= config.baseCostBiomass;

        return `
          <div class="tower-shop-card ${isPlacingThis ? 'active-placing' : ''} ${canAfford ? '' : 'disabled'}" data-type="${type}" title="Hotkey: [${keys[index]}]">
            <div class="card-hotkey">[${keys[index]}]</div>
            <div class="card-icon" style="background: ${tier0.color}22; border-color: ${tier0.color}">
              ${tier0.icon}
            </div>
            <div class="card-title">${config.name}</div>
            <div class="card-sciname"><em>${config.scientificName}</em></div>
            <div class="card-costs">
              <span class="cost-sun">☀️ ${config.baseCostSun}</span>
              ${config.baseCostBiomass > 0 ? `<span class="cost-bio">🍂 ${config.baseCostBiomass}</span>` : ''}
            </div>
            <div class="card-desc">${config.description}</div>
          </div>
        `;
      })
      .join('');

    // Attach card click events
    drawer.querySelectorAll('.tower-shop-card').forEach((card) => {
      card.addEventListener('click', () => {
        const type = card.getAttribute('data-type') as TowerType;
        if (this.game.placingTowerType === type) {
          this.game.selectPlacingTower(null);
        } else {
          this.game.selectPlacingTower(type);
        }
      });
    });
  }

  private attachEventListeners() {
    // Biome selector
    const biomeSelect = this.container.querySelector('#biome-select') as HTMLSelectElement;
    if (biomeSelect) {
      biomeSelect.addEventListener('change', () => {
        const newMap = MAPS[biomeSelect.value];
        if (newMap) {
          this.game.initMap(newMap);
        }
      });
    }

    // Audio buttons
    const sfxBtn = this.container.querySelector('#btn-sfx');
    if (sfxBtn) {
      sfxBtn.addEventListener('click', () => {
        const on = this.game ? soundManager.toggleSfx() : true;
        sfxBtn.textContent = on ? '🔊' : '🔇';
      });
    }

    const ambientBtn = this.container.querySelector('#btn-ambient');
    if (ambientBtn) {
      ambientBtn.addEventListener('click', () => {
        const on = soundManager.toggleAmbient();
        ambientBtn.textContent = on ? '🍃' : '🍂';
      });
    }

    // Field Guide Button
    const guideBtn = this.container.querySelector('#btn-open-guide');
    if (guideBtn) {
      guideBtn.addEventListener('click', () => {
        this.openFieldGuide();
      });
    }

    // Start Wave Button
    const startWaveBtn = this.container.querySelector('#btn-start-wave');
    if (startWaveBtn) {
      startWaveBtn.addEventListener('click', () => {
        this.game.startNextWave();
      });
    }

    // Auto Next Wave Checkbox
    const autoWaveChk = this.container.querySelector('#chk-auto-wave') as HTMLInputElement;
    if (autoWaveChk) {
      autoWaveChk.addEventListener('change', () => {
        this.game.toggleAutoStart();
      });
    }

    // Speed Buttons
    const speedButtons = this.container.querySelectorAll('.speed-btn');
    speedButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const spd = parseFloat(btn.getAttribute('data-speed') || '1');
        this.game.setSpeed(spd);
      });
    });
  }

  public openFieldGuide(id?: string) {
    this.fieldGuideModal.open(id);
  }

  public updateHUD() {
    // 1. Resources
    const valSun = this.container.querySelector('#val-sun');
    if (valSun) valSun.textContent = Math.floor(this.game.sun).toString();

    const valBio = this.container.querySelector('#val-biomass');
    if (valBio) valBio.textContent = Math.floor(this.game.biomass).toString();

    const valHealth = this.container.querySelector('#val-health');
    const valMaxHealth = this.container.querySelector('#val-max-health');
    const healthBar = this.container.querySelector('#val-health-bar') as HTMLElement;

    if (valHealth) valHealth.textContent = Math.max(0, this.game.health).toString();
    if (valMaxHealth) valMaxHealth.textContent = this.game.maxHealth.toString();
    if (healthBar) {
      const pct = Math.max(0, Math.min(100, (this.game.health / this.game.maxHealth) * 100));
      healthBar.style.width = `${pct}%`;
      healthBar.style.backgroundColor = pct > 50 ? '#22c55e' : pct > 25 ? '#eab308' : '#ef4444';
    }

    // 2. Wave Info
    const waveTag = this.container.querySelector('#hud-wave-tag');
    const waveName = this.container.querySelector('#hud-wave-name');
    const waveHint = this.container.querySelector('#hud-wave-hint');
    const waveCreeps = this.container.querySelector('#hud-wave-creeps');
    const startWaveBtn = this.container.querySelector('#btn-start-wave') as HTMLButtonElement;
    const btnWaveText = this.container.querySelector('#btn-wave-text');

    const curWave = this.game.currentWaveDef;
    if (curWave) {
      if (waveTag) waveTag.textContent = `Wave ${curWave.waveNumber} / 15`;
      if (waveName) waveName.textContent = curWave.name;
      if (waveHint) waveHint.textContent = curWave.hint;

      if (waveCreeps) {
        waveCreeps.innerHTML = curWave.groups
          .map((g) => {
            const enemyCfg = ENEMIES[g.enemyType];
            return `<span class="creep-preview-badge" title="${enemyCfg.name}: ${g.count} units">${enemyCfg.icon} x${g.count}</span>`;
          })
          .join('');
      }

      if (startWaveBtn) {
        if (this.game.waveInProgress) {
          startWaveBtn.disabled = true;
          startWaveBtn.classList.add('in-progress');
          if (btnWaveText) btnWaveText.textContent = 'Defending Prairie...';
        } else {
          startWaveBtn.disabled = false;
          startWaveBtn.classList.remove('in-progress');
          if (btnWaveText) btnWaveText.textContent = `Start Wave ${curWave.waveNumber}`;
        }
      }
    } else {
      if (waveTag) waveTag.textContent = 'All Waves Cleared!';
      if (waveName) waveName.textContent = 'Pristine Heartland Sanctuary';
      if (waveHint) waveHint.textContent = 'Native species have reclaimed the ecosystem!';
      if (startWaveBtn) startWaveBtn.disabled = true;
    }

    // Speed Buttons active class
    const speedButtons = this.container.querySelectorAll('.speed-btn');
    speedButtons.forEach((btn) => {
      const spd = parseFloat(btn.getAttribute('data-speed') || '1');
      if (this.game.isPaused && spd === 0) {
        btn.classList.add('active');
      } else if (!this.game.isPaused && this.game.gameSpeed === spd) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // 3. Shop cards affordability state
    this.renderShop();

    // 4. Overlays for Victory / Defeat
    this.checkGameOverlay();
  }

  public updateSelectedTowerPanel(tower: Tower | null) {
    const inspector = this.container.querySelector('#tower-inspector');
    if (!inspector) return;

    if (!tower) {
      inspector.classList.add('hidden');
      return;
    }

    inspector.classList.remove('hidden');
    const curTier = tower.currentTier;
    const nextTier = tower.nextTier;
    const canAffordUpgrade = nextTier
      ? this.game.sun >= nextTier.costSun && this.game.biomass >= nextTier.costBiomass
      : false;

    const refundSun = Math.floor(tower.totalInvestedSun * 0.7);
    const refundBio = Math.floor(tower.totalInvestedBiomass * 0.7);

    inspector.innerHTML = `
      <div class="inspector-card">
        <div class="inspector-header">
          <div class="inspector-icon" style="background: ${curTier.color}22; border-color: ${curTier.color}">
            ${curTier.icon}
          </div>
          <div class="inspector-title-wrap">
            <div class="inspector-title">${tower.config.name}</div>
            <div class="inspector-tier-name">${curTier.name}</div>
          </div>
          <button class="inspector-close" id="btn-close-inspector" title="Deselect">✕</button>
        </div>

        <div class="inspector-stats-grid">
          <div class="stat-pill"><span class="stat-lbl">Damage</span> <span class="stat-val">${curTier.damage}</span></div>
          <div class="stat-pill"><span class="stat-lbl">Range</span> <span class="stat-val">${curTier.range}</span></div>
          <div class="stat-pill"><span class="stat-lbl">Fire Rate</span> <span class="stat-val">${curTier.fireRate}/s</span></div>
          <div class="stat-pill"><span class="stat-lbl">Tier</span> <span class="stat-val">${'★'.repeat(tower.tierIndex + 1)}</span></div>
        </div>

        ${
          tower.hasMonarchBuff
            ? `<div class="synergy-tag buff">🦋 Monarch Pollination Synergy Active (+25% Speed)</div>`
            : ''
        }
        ${
          tower.isAllelopathSapped
            ? `<div class="synergy-tag debuff">☣️ Garlic Mustard Allelopathy Sapped (-35% Speed)</div>`
            : ''
        }

        <div class="targeting-section">
          <label for="select-target-priority" class="target-lbl">Target Priority:</label>
          <select id="select-target-priority" class="target-select">
            <option value="first" ${tower.targetPriority === 'first' ? 'selected' : ''}>First (Progress)</option>
            <option value="last" ${tower.targetPriority === 'last' ? 'selected' : ''}>Last</option>
            <option value="strongest" ${tower.targetPriority === 'strongest' ? 'selected' : ''}>Strongest (HP)</option>
            <option value="weakest" ${tower.targetPriority === 'weakest' ? 'selected' : ''}>Weakest</option>
            <option value="flying" ${tower.targetPriority === 'flying' ? 'selected' : ''}>Airborne Priority</option>
            <option value="closest" ${tower.targetPriority === 'closest' ? 'selected' : ''}>Closest</option>
          </select>
        </div>

        <!-- Upgrade Section -->
        <div class="upgrade-section">
          ${
            nextTier
              ? `
            <div class="next-tier-header">
              <span class="next-tier-title">Cultivate: ${nextTier.name}</span>
              <div class="next-tier-costs">
                <span>☀️ ${nextTier.costSun}</span>
                ${nextTier.costBiomass > 0 ? `<span>🍂 ${nextTier.costBiomass}</span>` : ''}
              </div>
            </div>
            <div class="next-tier-desc">${nextTier.specialDescription}</div>
            <button class="btn btn-upgrade ${canAffordUpgrade ? '' : 'disabled'}" id="btn-upgrade-tower" ${canAffordUpgrade ? '' : 'disabled'}>
              ✨ Upgrade [U]
            </button>
          `
              : `
            <div class="max-tier-banner">
              👑 Fully Cultivated Midwestern Keystone Guardian!
            </div>
          `
          }
        </div>

        <!-- Compost / Sell Section -->
        <div class="compost-section">
          <button class="btn btn-compost" id="btn-compost-tower">
            ♻️ Compost into Soil [S] (+${refundSun} ☀️, +${refundBio} 🍂)
          </button>
        </div>
      </div>
    `;

    // Hook events
    const closeBtn = inspector.querySelector('#btn-close-inspector');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.game.selectTower(null));
    }

    const prioritySelect = inspector.querySelector('#select-target-priority') as HTMLSelectElement;
    if (prioritySelect) {
      prioritySelect.addEventListener('change', () => {
        tower.targetPriority = prioritySelect.value as TargetPriority;
      });
    }

    const upgradeBtn = inspector.querySelector('#btn-upgrade-tower');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        this.game.upgradeSelectedTower();
        this.updateSelectedTowerPanel(this.game.selectedTower);
      });
    }

    const compostBtn = inspector.querySelector('#btn-compost-tower');
    if (compostBtn) {
      compostBtn.addEventListener('click', () => {
        this.game.compostSelectedTower();
      });
    }
  }

  private checkGameOverlay() {
    const overlay = this.container.querySelector('#game-overlay');
    if (!overlay) return;

    if (this.game.gameStatus === 'defeat') {
      overlay.classList.remove('hidden');
      overlay.innerHTML = `
        <div class="overlay-modal defeat">
          <div class="overlay-icon">🥀</div>
          <h2 class="overlay-title">Sanctuary Overrun!</h2>
          <p class="overlay-desc">
            Invasive species have breached the core nature reserve, choking out native prairie wildflowers and depleting biodiversity.
          </p>
          <div class="overlay-stats">
            <div>Invaders Composted: <strong>${this.game.totalInvadersDefeated}</strong></div>
            <div>Waves Cleared: <strong>${this.game.currentWaveIndex} / 15</strong></div>
            <div>Biomass Recycled: <strong>${this.game.totalBiomassCollected} 🍂</strong></div>
          </div>
          <div class="overlay-actions">
            <button class="btn btn-action" id="btn-retry-map">🔄 Restore Sanctuary (Retry)</button>
            <button class="btn btn-guide" id="btn-defeat-guide">📖 Study Field Guide</button>
          </div>
        </div>
      `;

      const retryBtn = overlay.querySelector('#btn-retry-map');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          overlay.classList.add('hidden');
          this.game.initMap(this.game.map);
        });
      }

      const guideBtn = overlay.querySelector('#btn-defeat-guide');
      if (guideBtn) {
        guideBtn.addEventListener('click', () => {
          this.fieldGuideModal.open();
        });
      }
    } else if (this.game.gameStatus === 'victory') {
      overlay.classList.remove('hidden');
      overlay.innerHTML = `
        <div class="overlay-modal victory">
          <div class="overlay-icon">🏆</div>
          <h2 class="overlay-title">Sanctuary Victorious!</h2>
          <p class="overlay-desc">
            Native guardians have successfully defended the <strong>${this.game.map.name}</strong>! Invasive weeds and destructive pests have been composted into fertile prairie soil.
          </p>
          <div class="overlay-stats">
            <div>Total Invaders Defeated: <strong>${this.game.totalInvadersDefeated}</strong></div>
            <div>Core Biodiversity Preserved: <strong>${this.game.health} / ${this.game.maxHealth} (100%)</strong></div>
            <div>Biomass Enriched: <strong>${this.game.totalBiomassCollected} 🍂</strong></div>
          </div>
          <div class="overlay-actions">
            <button class="btn btn-action" id="btn-next-biome">🌲 Advance to Next Biome</button>
            <button class="btn btn-guide" id="btn-victory-guide">📖 View Field Guide</button>
          </div>
        </div>
      `;

      const nextBiomeBtn = overlay.querySelector('#btn-next-biome');
      if (nextBiomeBtn) {
        nextBiomeBtn.addEventListener('click', () => {
          overlay.classList.add('hidden');
          const biomes = ['prairie', 'savanna', 'wetland'];
          const nextIdx = (biomes.indexOf(this.game.map.id) + 1) % biomes.length;
          const nextMap = MAPS[biomes[nextIdx]];
          const biomeSelect = this.container.querySelector('#biome-select') as HTMLSelectElement;
          if (biomeSelect) biomeSelect.value = nextMap.id;
          this.game.initMap(nextMap);
        });
      }

      const guideBtn = overlay.querySelector('#btn-victory-guide');
      if (guideBtn) {
        guideBtn.addEventListener('click', () => {
          this.fieldGuideModal.open();
        });
      }
    } else {
      overlay.classList.add('hidden');
    }
  }
}
