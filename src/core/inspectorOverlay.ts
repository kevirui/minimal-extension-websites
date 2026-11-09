import { CustomRule, InspectorState, SelectedElementAnalysis } from './types';
import { analyzeElement, isCriticalElement } from './inspectorAnalyzer';

export interface InspectorOverlayCallbacks {
  onSaveRule: (rule: CustomRule) => Promise<void> | void;
  onCancel: () => void;
  onPreviewToggle: (selector: string, hidden: boolean) => void;
}

/**
 * InspectorOverlay manages:
 * 1. Visual hovering highlight and status pill.
 * 2. Click interception (capturing click, stopping propagation, preventing default).
 * 3. Element analysis dialog with selector options and confidence.
 * 4. Reversible preview toggling without altering page structure.
 * 5. Complete cleanup upon exit or Escape.
 */
export class InspectorOverlay {
  private doc: Document;
  private state: InspectorState = 'inactive';
  private callbacks: InspectorOverlayCallbacks;

  // DOM elements created by Inspector (isolated from page and target picking)
  private containerEl: HTMLElement | null = null;
  private highlightBox: HTMLElement | null = null;
  private statusPill: HTMLElement | null = null;
  private dialogEl: HTMLElement | null = null;
  private previewStyleEl: HTMLStyleElement | null = null;

  // Current inspected target
  private currentHoverTarget: Element | null = null;
  private currentAnalysis: SelectedElementAnalysis | null = null;
  private isPreviewActive = false;

  constructor(doc: Document = window.document, callbacks: InspectorOverlayCallbacks) {
    this.doc = doc;
    this.callbacks = callbacks;
  }

  public getState(): InspectorState {
    return this.state;
  }

  /**
   * Activates inspector in 'selecting' mode.
   */
  public start(): void {
    if (this.state !== 'inactive') {
      return;
    }
    this.state = 'selecting';
    this.createDomNodes();
    this.attachEventListeners();
    this.updateStatusPill('Inspector Mode active. Hover and click any component to hide.');
  }

  /**
   * Cancels and removes all inspector artifacts.
   */
  public stop(): void {
    if (this.state === 'inactive') {
      return;
    }
    this.clearPreview();
    this.detachEventListeners();
    this.removeDomNodes();
    this.state = 'inactive';
    this.currentHoverTarget = null;
    this.currentAnalysis = null;
    this.callbacks.onCancel();
  }

  private createDomNodes(): void {
    this.containerEl = this.doc.createElement('div');
    this.containerEl.id = 'clearframe-inspector-root';
    this.containerEl.setAttribute('data-clearframe-inspector', 'true');

    // Injected styles for overlay
    const style = this.doc.createElement('style');
    style.id = 'clearframe-inspector-styles';
    style.textContent = `
#clearframe-inspector-root * {
  box-sizing: border-box !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
}

.cf-inspect-pill {
  position: fixed !important;
  top: 16px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  background: #0a66c2 !important;
  color: #ffffff !important;
  padding: 8px 16px !important;
  border-radius: 24px !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  box-shadow: 0 4px 16px rgba(10, 102, 194, 0.4) !important;
  z-index: 2147483647 !important;
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  pointer-events: auto !important;
}

.cf-inspect-pill button {
  background: rgba(255, 255, 255, 0.25) !important;
  border: none !important;
  color: #ffffff !important;
  padding: 3px 10px !important;
  border-radius: 12px !important;
  font-size: 11px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
  transition: background 0.15s !important;
}

.cf-inspect-pill button:hover {
  background: rgba(255, 255, 255, 0.4) !important;
}

.cf-inspect-highlight {
  position: fixed !important;
  pointer-events: none !important;
  border: 2px solid #0a66c2 !important;
  background: rgba(10, 102, 194, 0.15) !important;
  border-radius: 4px !important;
  z-index: 2147483646 !important;
  transition: all 0.05s ease-out !important;
  display: none;
}

.cf-inspect-dialog {
  position: fixed !important;
  bottom: 24px !important;
  right: 24px !important;
  width: 360px !important;
  background: #ffffff !important;
  color: #1f2328 !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0, 0, 0, 0.08) !important;
  padding: 16px !important;
  z-index: 2147483647 !important;
  pointer-events: auto !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 12px !important;
}

.cf-inspect-dialog-header {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  border-bottom: 1px solid #e5e7eb !important;
  padding-bottom: 8px !important;
}

.cf-inspect-title {
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #0a66c2 !important;
}

.cf-inspect-badge {
  font-size: 11px !important;
  background: #f3f4f6 !important;
  color: #4b5563 !important;
  padding: 2px 8px !important;
  border-radius: 10px !important;
  font-weight: 500 !important;
}

.cf-inspect-field {
  display: flex !important;
  flex-direction: column !important;
  gap: 4px !important;
}

.cf-inspect-field label {
  font-size: 11.5px !important;
  font-weight: 500 !important;
  color: #6b7280 !important;
}

.cf-inspect-input, .cf-inspect-select {
  border: 1px solid #d1d5db !important;
  border-radius: 6px !important;
  padding: 6px 10px !important;
  font-size: 12.5px !important;
  color: #1f2328 !important;
  background: #ffffff !important;
}

.cf-inspect-meta-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 8px !important;
  background: #f9fafb !important;
  padding: 8px 10px !important;
  border-radius: 6px !important;
  font-size: 11.5px !important;
  color: #4b5563 !important;
}

.cf-inspect-actions {
  display: flex !important;
  gap: 8px !important;
  margin-top: 4px !important;
}

.cf-btn-primary {
  flex: 1 !important;
  background: #0a66c2 !important;
  color: #ffffff !important;
  border: none !important;
  padding: 8px !important;
  border-radius: 6px !important;
  font-size: 12.5px !important;
  font-weight: 600 !important;
  cursor: pointer !important;
}

.cf-btn-secondary {
  background: #f3f4f6 !important;
  color: #374151 !important;
  border: 1px solid #d1d5db !important;
  padding: 8px 12px !important;
  border-radius: 6px !important;
  font-size: 12.5px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
}
`;
    this.containerEl.appendChild(style);

    // Highlight bounding box
    this.highlightBox = this.doc.createElement('div');
    this.highlightBox.className = 'cf-inspect-highlight';
    this.containerEl.appendChild(this.highlightBox);

    // Floating status pill
    this.statusPill = this.doc.createElement('div');
    this.statusPill.className = 'cf-inspect-pill';
    this.containerEl.appendChild(this.statusPill);

    (this.doc.body || this.doc.documentElement).appendChild(this.containerEl);
  }

  private removeDomNodes(): void {
    if (this.containerEl && this.containerEl.parentNode) {
      this.containerEl.parentNode.removeChild(this.containerEl);
    }
    this.containerEl = null;
    this.highlightBox = null;
    this.statusPill = null;
    this.dialogEl = null;
  }

  private updateStatusPill(text: string): void {
    if (!this.statusPill) return;
    this.statusPill.innerHTML = `
      <span>🎯 <strong>ClearFrame</strong> — ${text}</span>
      <button id="cf-inspect-exit-btn">Exit (Esc)</button>
    `;
    const exitBtn = this.statusPill.querySelector('#cf-inspect-exit-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.stop();
      });
    }
  }

  private attachEventListeners(): void {
    this.doc.addEventListener('mousemove', this.handleMouseMove, true);
    this.doc.addEventListener('click', this.handleClick, true);
    this.doc.addEventListener('keydown', this.handleKeyDown, true);
  }

  private detachEventListeners(): void {
    this.doc.removeEventListener('mousemove', this.handleMouseMove, true);
    this.doc.removeEventListener('click', this.handleClick, true);
    this.doc.removeEventListener('keydown', this.handleKeyDown, true);
  }

  private handleMouseMove = (e: MouseEvent) => {
    if (this.state !== 'selecting') return;

    const target = this.doc.elementFromPoint(e.clientX, e.clientY);
    if (!target || this.isInspectorOwnElement(target) || isCriticalElement(target)) {
      if (this.highlightBox) this.highlightBox.style.display = 'none';
      return;
    }

    this.currentHoverTarget = target;
    const rect = target.getBoundingClientRect();
    if (this.highlightBox) {
      this.highlightBox.style.display = 'block';
      this.highlightBox.style.top = `${rect.top}px`;
      this.highlightBox.style.left = `${rect.left}px`;
      this.highlightBox.style.width = `${rect.width}px`;
      this.highlightBox.style.height = `${rect.height}px`;
    }
  };

  private handleClick = (e: MouseEvent) => {
    if (this.state !== 'selecting') return;

    const target = this.currentHoverTarget || this.doc.elementFromPoint(e.clientX, e.clientY);
    if (!target || this.isInspectorOwnElement(target) || isCriticalElement(target)) {
      return;
    }

    // Suppress native click (prevent link clicks, buttons, navigations)
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    this.state = 'selected';
    if (this.highlightBox) this.highlightBox.style.display = 'none';
    this.currentAnalysis = analyzeElement(target, this.doc);
    this.showConfirmationDialog(this.currentAnalysis);
  };

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      this.stop();
    }
  };

  private isInspectorOwnElement(el: Element): boolean {
    if (this.containerEl && (el === this.containerEl || this.containerEl.contains(el))) {
      return true;
    }
    return Boolean(el.closest?.('#clearframe-inspector-root'));
  }

  private showConfirmationDialog(analysis: SelectedElementAnalysis): void {
    if (this.dialogEl && this.dialogEl.parentNode) {
      this.dialogEl.parentNode.removeChild(this.dialogEl);
    }

    this.dialogEl = this.doc.createElement('div');
    this.dialogEl.className = 'cf-inspect-dialog';
    this.dialogEl.setAttribute('data-testid', 'inspector-dialog');

    let currentSelectedSelector = analysis.bestSelector;
    const initialCandidate = analysis.candidates.find((c) => c.selector === currentSelectedSelector) || analysis.candidates[0];

    const renderDialog = () => {
      const activeCandidate = analysis.candidates.find((c) => c.selector === currentSelectedSelector) || {
        matchCount: 1,
        confidence: 'high' as const,
      };

      this.dialogEl!.innerHTML = `
        <div class="cf-inspect-dialog-header">
          <div class="cf-inspect-title">Create Custom Rule</div>
          <span class="cf-inspect-badge">${analysis.componentType}</span>
        </div>

        <div class="cf-inspect-field">
          <label>Rule Name</label>
          <input type="text" id="cf-rule-name" class="cf-inspect-input" value="${this.escapeHtml(analysis.suggestedName)}" />
        </div>

        <div class="cf-inspect-field">
          <label>Target Selector (${analysis.candidates.length} options)</label>
          <select id="cf-rule-selector" class="cf-inspect-select">
            ${analysis.candidates
              .map(
                (c) =>
                  `<option value="${this.escapeHtml(c.selector)}" ${c.selector === currentSelectedSelector ? 'selected' : ''}>
                    ${this.escapeHtml(c.selector)} (${c.matchCount} match${c.matchCount === 1 ? '' : 'es'} • ${c.confidence})
                  </option>`
              )
              .join('')}
          </select>
        </div>

        <div class="cf-inspect-meta-grid">
          <div>Matches: <strong>${activeCandidate.matchCount} element${activeCandidate.matchCount === 1 ? '' : 's'}</strong></div>
          <div>Confidence: <strong>${activeCandidate.confidence.toUpperCase()}</strong></div>
          <div>Size: <strong>${analysis.dimensions.width}×${analysis.dimensions.height}px</strong></div>
          <div>Scope: <strong>${window.location.hostname}</strong></div>
        </div>

        <div class="cf-inspect-actions">
          <button id="cf-preview-btn" class="cf-btn-secondary" type="button">
            ${this.isPreviewActive ? 'Restore' : 'Preview'}
          </button>
          <button id="cf-cancel-btn" class="cf-btn-secondary" type="button">Cancel</button>
          <button id="cf-save-btn" class="cf-btn-primary" type="button">Save Rule</button>
        </div>
      `;

      // Event bindings
      const nameInput = this.dialogEl!.querySelector('#cf-rule-name') as HTMLInputElement;
      const selectorSelect = this.dialogEl!.querySelector('#cf-rule-selector') as HTMLSelectElement;
      const previewBtn = this.dialogEl!.querySelector('#cf-preview-btn') as HTMLButtonElement;
      const cancelBtn = this.dialogEl!.querySelector('#cf-cancel-btn') as HTMLButtonElement;
      const saveBtn = this.dialogEl!.querySelector('#cf-save-btn') as HTMLButtonElement;

      selectorSelect.addEventListener('change', () => {
        currentSelectedSelector = selectorSelect.value;
        if (this.isPreviewActive) {
          this.applyPreview(currentSelectedSelector);
        }
        renderDialog();
      });

      previewBtn.addEventListener('click', () => {
        this.isPreviewActive = !this.isPreviewActive;
        if (this.isPreviewActive) {
          this.state = 'previewing';
          this.applyPreview(currentSelectedSelector);
        } else {
          this.state = 'selected';
          this.clearPreview();
        }
        renderDialog();
      });

      cancelBtn.addEventListener('click', () => {
        this.stop();
      });

      saveBtn.addEventListener('click', async () => {
        this.state = 'saving';
        const finalName = nameInput.value.trim() || analysis.suggestedName;
        const newRule: CustomRule = {
          id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: finalName,
          hostname: window.location.hostname.toLowerCase(),
          selector: currentSelectedSelector,
          enabled: true,
          createdAt: Date.now(),
          strategy: 'hide',
          targetMode: activeCandidate.matchCount > 1 ? 'all' : 'single',
          version: 1,
        };

        this.clearPreview();
        await this.callbacks.onSaveRule(newRule);
        this.stop();
      });
    };

    renderDialog();
    this.containerEl!.appendChild(this.dialogEl);
  }

  private applyPreview(selector: string): void {
    if (!this.previewStyleEl) {
      this.previewStyleEl = this.doc.createElement('style');
      this.previewStyleEl.id = 'clearframe-inspector-preview';
      (this.doc.head || this.doc.documentElement).appendChild(this.previewStyleEl);
    }
    this.previewStyleEl.textContent = `${selector} { display: none !important; opacity: 0 !important; }`;
    this.callbacks.onPreviewToggle(selector, true);
  }

  private clearPreview(): void {
    if (this.previewStyleEl && this.previewStyleEl.parentNode) {
      this.previewStyleEl.parentNode.removeChild(this.previewStyleEl);
    }
    this.previewStyleEl = null;
    this.isPreviewActive = false;
    this.callbacks.onPreviewToggle('', false);
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

