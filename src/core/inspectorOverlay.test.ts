import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InspectorOverlay } from './inspectorOverlay';
import { CustomRule } from './types';

describe('InspectorOverlay Interactive Lifecycle', () => {
  let doc: Document;
  let savedRule: CustomRule | null = null;
  let overlay: InspectorOverlay;

  beforeEach(() => {
    savedRule = null;
    const parser = new DOMParser();
    doc = parser.parseFromString(
      `<!DOCTYPE html>
      <html>
        <body>
          <div id="target-widget" aria-label="Sponsor Card">
            <button id="cta-btn">Click Me</button>
          </div>
        </body>
      </html>`,
      'text/html'
    );

    overlay = new InspectorOverlay(doc, {
      onSaveRule: (rule) => {
        savedRule = rule;
      },
      onCancel: () => {},
      onPreviewToggle: () => {},
    });
  });

  it('initializes in inactive state and creates DOM elements on start()', () => {
    expect(overlay.getState()).toBe('inactive');
    expect(doc.getElementById('clearframe-inspector-root')).toBeNull();

    overlay.start();

    expect(overlay.getState()).toBe('selecting');
    expect(doc.getElementById('clearframe-inspector-root')).not.toBeNull();
  });

  it('stops cleanly and removes all overlay DOM elements on stop()', () => {
    overlay.start();
    expect(doc.getElementById('clearframe-inspector-root')).not.toBeNull();

    overlay.stop();
    expect(overlay.getState()).toBe('inactive');
    expect(doc.getElementById('clearframe-inspector-root')).toBeNull();
  });

  it('stops and cleans up on Escape key', () => {
    overlay.start();
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    doc.dispatchEvent(event);

    expect(overlay.getState()).toBe('inactive');
    expect(doc.getElementById('clearframe-inspector-root')).toBeNull();
  });

  it('renders confirmation dialog upon element click and cancels native action', () => {
    overlay.start();

    const target = doc.getElementById('target-widget')!;
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: 50,
      clientY: 50,
    });

    // Mock elementFromPoint
    doc.elementFromPoint = vi.fn().mockReturnValue(target);

    target.dispatchEvent(clickEvent);

    expect(clickEvent.defaultPrevented).toBe(true);
    expect(overlay.getState()).toBe('selected');

    // Dialog should be present
    const dialog = doc.querySelector('[data-testid="inspector-dialog"]');
    expect(dialog).not.toBeNull();
  });

  it('applies reversible preview style tag without altering original node properties', () => {
    overlay.start();

    const target = doc.getElementById('target-widget')!;
    doc.elementFromPoint = vi.fn().mockReturnValue(target);
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const previewBtn = doc.getElementById('cf-preview-btn') as HTMLButtonElement;
    expect(previewBtn).not.toBeNull();

    // Toggle Preview ON
    previewBtn.click();
    expect(overlay.getState()).toBe('previewing');
    const previewStyle = doc.getElementById('clearframe-inspector-preview');
    expect(previewStyle).not.toBeNull();
    expect(previewStyle!.textContent).toContain('display: none !important');

    // Toggle Preview OFF (Restore)
    previewBtn.click();
    expect(doc.getElementById('clearframe-inspector-preview')).toBeNull();
  });
});

