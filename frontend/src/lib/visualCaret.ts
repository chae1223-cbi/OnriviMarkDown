import type { EditorView } from 'prosemirror-view';

/** Steady caret, updated only when selection or viewport changes. */
export function installVisualCaret(view: EditorView) {
  const caret = document.createElement('div');
  caret.className = 'visual-persistent-caret no-print';
  caret.setAttribute('aria-hidden', 'true');
  caret.style.cssText = 'position:fixed;display:none;width:5px;background:#2563eb;box-shadow:0 0 0 1px #ffffff80;pointer-events:none;z-index:40;border-radius:1px';
  document.body.appendChild(caret);
  let frame = 0;
  const update = () => {
    frame = 0;
    caret.style.display = 'none';
    const selection = document.getSelection();
    if (!view.editable || !view.hasFocus() || !selection?.isCollapsed || !selection.anchorNode
      || !view.dom.contains(selection.anchorNode) || !view.state.selection.empty) return;
    try {
      // Use DOM coordinates to follow Korean IME composition as well.
      const range = selection.getRangeAt(0);
      const domRect = range.getClientRects()[0];
      const rect = domRect && domRect.height > 0 ? domRect : view.coordsAtPos(view.state.selection.head);
      let top = Math.max(0, rect.top), bottom = Math.min(window.innerHeight, rect.bottom);
      let left = 0, right = window.innerWidth;
      for (let element: HTMLElement | null = view.dom; element; element = element.parentElement) {
        const bounds = element.getBoundingClientRect(), style = getComputedStyle(element);
        if (element === view.dom || /(auto|scroll|hidden|clip)/.test(style.overflowY)) {
          top = Math.max(top, bounds.top); bottom = Math.min(bottom, bounds.bottom);
        }
        if (element === view.dom || /(auto|scroll|hidden|clip)/.test(style.overflowX)) {
          left = Math.max(left, bounds.left); right = Math.min(right, bounds.right);
        }
      }
      if (bottom <= top || rect.left < left || rect.left >= right) return;
      Object.assign(caret.style, { display: 'block', left: `${rect.left}px`, top: `${top}px`, height: `${bottom - top}px` });
    } catch { /* Selection can disappear during a document switch. */ }
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
  const events = ['selectionchange', 'scroll', 'focusin', 'focusout', 'input', 'compositionupdate', 'compositionend'];
  events.forEach(event => document.addEventListener(event, schedule, true));
  window.addEventListener('resize', schedule);
  schedule();
  return { schedule, destroy() {
    cancelAnimationFrame(frame);
    events.forEach(event => document.removeEventListener(event, schedule, true));
    window.removeEventListener('resize', schedule);
    caret.remove();
  } };
}
