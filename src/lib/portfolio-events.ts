/**
 * A tiny bridge so cards rendered deep in the transcript (or on the landing
 * page) can drive the chat shell without prop-drilling: ask a question, or open
 * the hire sheet. `Chat` is the only listener.
 */
const ASK = 'portfolio:ask';
const HIRE = 'portfolio:hire';

export interface AskDetail {
  question: string;
  /** Skip the instant preset and go straight to the live model. */
  live?: boolean;
}

export function askPortfolio(question: string, live = false) {
  window.dispatchEvent(
    new CustomEvent<AskDetail>(ASK, { detail: { question, live } })
  );
}

export function openHire() {
  window.dispatchEvent(new Event(HIRE));
}

export function onAsk(handler: (detail: AskDetail) => void) {
  const listener = (e: Event) => handler((e as CustomEvent<AskDetail>).detail);
  window.addEventListener(ASK, listener);
  return () => window.removeEventListener(ASK, listener);
}

export function onHire(handler: () => void) {
  window.addEventListener(HIRE, handler);
  return () => window.removeEventListener(HIRE, handler);
}
