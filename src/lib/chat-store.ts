import type { UIMessage } from 'ai';

/**
 * Saved chats, kept only in this visitor's browser. Nothing leaves the device.
 * A small store outside React, so components read it with useSyncExternalStore
 * and saving never sets state inside an effect.
 */
export type SavedPreset = {
  id: string;
  anchor: number;
  order: number;
  question: string;
  reply: string;
  tool: string;
};

export type SavedChat = {
  id: string;
  title: string;
  updatedAt: number;
  messages: UIMessage[];
  presets: SavedPreset[];
  stopped: string[];
};

const KEY = 'twin-chats-v1';
/** Enough history to be useful, small enough to stay well inside storage limits. */
const MAX_CHATS = 30;
const EMPTY: SavedChat[] = [];

let cache: SavedChat[] | null = null;
const listeners = new Set<() => void>();

function read(): SavedChat[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed)
      ? parsed.filter(
          (c): c is SavedChat =>
            !!c &&
            typeof c.id === 'string' &&
            typeof c.title === 'string' &&
            Array.isArray(c.messages) &&
            Array.isArray(c.presets)
        )
      : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: SavedChat[]) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage full or blocked (private mode): the chats still work for this visit.
  }
  listeners.forEach((l) => l());
}

export const chatStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    // Another tab saved or deleted a chat.
    const onStorage = (e: StorageEvent) => {
      if (e.key !== KEY) return;
      cache = null;
      listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },
  /** Most recent first. */
  list: (): SavedChat[] => (typeof window === 'undefined' ? EMPTY : read()),
  serverList: (): SavedChat[] => EMPTY,
  get: (id: string) => read().find((c) => c.id === id) ?? null,
  save(chat: SavedChat) {
    const rest = read().filter((c) => c.id !== chat.id);
    write([chat, ...rest].slice(0, MAX_CHATS));
  },
  remove(id: string) {
    write(read().filter((c) => c.id !== id));
  },
  /** Puts a deleted chat back where it was. */
  restore(chat: SavedChat) {
    write(
      [...read().filter((c) => c.id !== chat.id), chat]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, MAX_CHATS)
    );
  },
};

/** A chat is named by its first question: one line, short enough for a sidebar row. */
export function chatTitle(question: string) {
  const line = question.trim().split('\n')[0] ?? '';
  return line.length > 80 ? `${line.slice(0, 79)}…` : line;
}
