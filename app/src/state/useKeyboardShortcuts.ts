import { useEffect } from 'react';
import { useExplorer, type RenderId } from './useExplorer';

function isEditableTarget(t: EventTarget | null): boolean {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (t.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isEditableTarget(e.target)) return;

      const st = useExplorer.getState();
      const k = e.key;

      if (k === ' ') {
        e.preventDefault();
        st.setPaused(!st.paused);
        return;
      }
      if (k === 'Escape' || k === '0') {
        if (st.presenterRender !== null) {
          e.preventDefault();
          st.setPresenterRender(null);
        }
        return;
      }
      if (k >= '1' && k <= '7') {
        e.preventDefault();
        const id = Number(k) as RenderId;
        st.setPresenterRender(st.presenterRender === id ? null : id);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
