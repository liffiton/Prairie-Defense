// Interactive Midwest Biome Field Guide Modal

import { FIELD_GUIDE } from '../data/fieldGuide';
import { soundManager } from '../audio/SoundManager';

export class FieldGuideModal {
  private modalEl: HTMLElement;
  private currentTab: 'native' | 'invasive' = 'native';
  private selectedEntryId: string = 'milkweed';

  constructor() {
    this.modalEl = document.createElement('div');
    this.modalEl.id = 'field-guide-modal';
    this.modalEl.className = 'modal-backdrop hidden';
    document.body.appendChild(this.modalEl);

    this.render();
  }

  public open(defaultId?: string) {
    soundManager.ensureAudio();
    if (defaultId) {
      this.selectedEntryId = defaultId;
      const entry = FIELD_GUIDE.find((e) => e.id === defaultId);
      if (entry) {
        this.currentTab = entry.category;
      }
    }
    this.modalEl.classList.remove('hidden');
    this.render();
  }

  public close() {
    this.modalEl.classList.add('hidden');
  }

  private render() {
    const entries = FIELD_GUIDE.filter((e) => e.category === this.currentTab);
    const selectedEntry = FIELD_GUIDE.find((e) => e.id === this.selectedEntryId) || entries[0];

    this.modalEl.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <span class="modal-icon">📖</span>
            <div>
              <h2 class="modal-title">Midwest Biome Field Guide</h2>
              <p class="modal-subtitle">Ecological Bestiary & Habitat Conservation Handbook</p>
            </div>
          </div>
          <button class="close-btn" id="close-guide-btn" title="Close Field Guide">✕</button>
        </div>

        <div class="modal-tabs">
          <button class="tab-btn ${this.currentTab === 'native' ? 'active' : ''}" id="tab-native">
            🌿 Native Guardians (${FIELD_GUIDE.filter((e) => e.category === 'native').length})
          </button>
          <button class="tab-btn ${this.currentTab === 'invasive' ? 'active' : ''}" id="tab-invasive">
            ⚠️ Invasive Invaders (${FIELD_GUIDE.filter((e) => e.category === 'invasive').length})
          </button>
        </div>

        <div class="modal-content">
          <!-- Left List -->
          <div class="guide-sidebar">
            ${entries
              .map(
                (item) => `
              <div class="guide-list-item ${item.id === selectedEntry.id ? 'active' : ''}" data-id="${item.id}">
                <span class="item-icon">${item.icon}</span>
                <div class="item-meta">
                  <div class="item-name">${item.name}</div>
                  <div class="item-sciname"><em>${item.scientificName}</em></div>
                </div>
              </div>
            `
              )
              .join('')}
          </div>

          <!-- Right Details -->
          <div class="guide-detail">
            <div class="detail-hero" style="border-left-color: ${selectedEntry.color}">
              <div class="detail-icon" style="background: ${selectedEntry.color}22; border-color: ${selectedEntry.color}">
                ${selectedEntry.icon}
              </div>
              <div class="detail-header-text">
                <h3 class="detail-title">${selectedEntry.name}</h3>
                <div class="detail-sciname"><em>${selectedEntry.scientificName}</em></div>
                <div class="detail-badges">
                  <span class="badge badge-type">${selectedEntry.type}</span>
                  <span class="badge ${selectedEntry.category === 'native' ? 'badge-native' : 'badge-invasive'}">
                    ${selectedEntry.status}
                  </span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-label">📍 Midwest Habitat & Range</div>
              <div class="section-body">${selectedEntry.habitat}</div>
            </div>

            <div class="detail-section">
              <div class="section-label">🌾 Ecological Role & Food Web</div>
              <div class="section-body">${selectedEntry.ecologicalRole}</div>
            </div>

            <div class="detail-section highlight-box">
              <div class="section-label">💡 Midwestern Ecology Fact</div>
              <div class="section-body">${selectedEntry.midwestFact}</div>
            </div>

            <div class="detail-section tip-box">
              <div class="section-label">🌱 How You Can Help (Real-World Action)</div>
              <div class="section-body">${selectedEntry.conservationTip}</div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Hook up events
    const closeBtn = this.modalEl.querySelector('#close-guide-btn');
    if (closeBtn) closeBtn.addEventListener('click', () => this.close());

    this.modalEl.addEventListener('click', (e) => {
      if (e.target === this.modalEl) this.close();
    });

    const tabNative = this.modalEl.querySelector('#tab-native');
    const tabInvasive = this.modalEl.querySelector('#tab-invasive');

    if (tabNative) {
      tabNative.addEventListener('click', () => {
        this.currentTab = 'native';
        const firstNative = FIELD_GUIDE.find((e) => e.category === 'native');
        if (firstNative) this.selectedEntryId = firstNative.id;
        this.render();
      });
    }

    if (tabInvasive) {
      tabInvasive.addEventListener('click', () => {
        this.currentTab = 'invasive';
        const firstInvasive = FIELD_GUIDE.find((e) => e.category === 'invasive');
        if (firstInvasive) this.selectedEntryId = firstInvasive.id;
        this.render();
      });
    }

    const items = this.modalEl.querySelectorAll('.guide-list-item');
    items.forEach((item) => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-id');
        if (id) {
          this.selectedEntryId = id;
          this.render();
        }
      });
    });
  }
}
