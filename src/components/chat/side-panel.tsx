'use client';

import { X } from 'lucide-react';
import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { ArtifactSurfaceContext } from '@/components/artifact/artifact';
import { trapTab } from '@/lib/focus';

export const SIDE_PANEL_ID = 'side-panel';

interface PanelApi {
  /** The tool whose detail is showing, or null. */
  openTool: string | null;
  /** Which item inside the detail is showing: a project, a capability. */
  detail: number | null;
  setDetail: (detail: number | null) => void;
  /** Opens a tool's detail. Pass the control that asked, so closing can hand focus back. */
  open: (tool: string, opener?: HTMLElement | null, detail?: number | null) => void;
}

export const PanelContext = createContext<PanelApi>({
  openTool: null,
  detail: null,
  setDetail: () => {},
  open: () => {},
});

export const usePanel = () => useContext(PanelContext);

/**
 * Full detail beside the chat, like an artifact. Where the two fit it is an
 * ordinary region and the chat stays usable; where they do not it covers the
 * chat as a modal, and on a phone it is a full-screen sheet. Esc closes it from
 * anywhere unless a dialog above it has claimed the key.
 */
export function SidePanel({
  title,
  phase,
  modal,
  blocked,
  onClose,
  children,
}: {
  title: string;
  phase: 'open' | 'closing';
  modal: boolean;
  /** A dialog or menu above the panel owns Esc for now. */
  blocked: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus moves in on opening, and again when the panel swaps to another answer.
  useEffect(() => {
    if (phase !== 'open') return;
    const t = setTimeout(
      () => closeRef.current?.focus({ preventScroll: true }),
      20
    );
    return () => clearTimeout(t);
  }, [phase, title]);

  useEffect(() => {
    if (phase !== 'open' || blocked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (modal) {
        trapTab(e, panelRef.current);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, blocked, modal, onClose]);

  return (
    <>
      {modal && phase === 'open' && (
        <div aria-hidden className="panel-scrim" onClick={onClose} />
      )}
      <aside
        id={SIDE_PANEL_ID}
        ref={panelRef}
        role={modal ? 'dialog' : 'complementary'}
        aria-modal={modal || undefined}
        aria-labelledby={titleId}
        data-phase={phase}
        className="side-panel"
      >
        <div className="side-panel__head">
          <p id={titleId} className="side-panel__title">
            {title}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="icon-btn"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div key={title} className="side-panel__body scrollbar-subtle @container">
          <ArtifactSurfaceContext.Provider value={{ title }}>
            {children}
          </ArtifactSurfaceContext.Provider>
        </div>
      </aside>
    </>
  );
}
