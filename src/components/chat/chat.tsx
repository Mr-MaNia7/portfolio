'use client';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, getToolName, isToolUIPart, type UIMessage } from 'ai';
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { useTheme } from 'next-themes';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { toast } from 'sonner';

import dynamic from 'next/dynamic';

import ChatBottombar from '@/components/chat/chat-bottombar';
import ChatLanding from '@/components/chat/chat-landing';
import { TopBar } from '@/components/chat/top-bar';
import { FollowUps } from '@/components/chat/follow-ups';
import { MessageActions } from '@/components/chat/message-actions';
import { PanelContext, SidePanel } from '@/components/chat/side-panel';
import {
  SidebarCollapse,
  SidebarContent,
  SidebarFloat,
  SidebarRail,
} from '@/components/chat/sidebar';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PANEL_TITLES, TOOL_LABELS, suggestQuestions } from '@/lib/answers';
import { presetReplies, getConfig } from '@/lib/config-loader';
import { buildCommands, type Command } from '@/lib/commands';
import { ICONS } from '@/components/chat/command-icons';
import { hasContent, textOf } from '@/lib/message-text';
import { onAsk, onHire } from '@/lib/portfolio-events';
import { chatStore, chatTitle, type SavedChat } from '@/lib/chat-store';

// The conversation, the dialogs and the panel details are not part of the landing
// page's first load. They are fetched once the browser is idle, ahead of first use.
const loadChatView = () => import('@/components/chat/simple-chat-view');
const loadPresetReply = () => import('@/components/chat/preset-reply');
const loadToolArtifact = () => import('@/components/chat/tool-renderer');
const loadCommandPalette = () => import('@/components/chat/command-palette');
const loadHireSheet = () => import('@/components/chat/hire-sheet');

const AssistantTurn = dynamic(() => loadChatView().then((m) => m.AssistantTurn));
const StoppedTurn = dynamic(() => loadChatView().then((m) => m.StoppedTurn));
const Thinking = dynamic(() => loadChatView().then((m) => m.Thinking));
const PresetReply = dynamic(() => loadPresetReply().then((m) => m.PresetReply));
const ToolArtifact = dynamic(() => loadToolArtifact().then((m) => m.ToolArtifact));
const CommandPalette = dynamic(
  () => loadCommandPalette().then((m) => m.CommandPalette),
  { ssr: false }
);
const HireSheet = dynamic(() => loadHireSheet().then((m) => m.HireSheet), {
  ssr: false,
});

function preloadLater() {
  const run = () => {
    void loadChatView();
    void loadPresetReply();
    void loadCommandPalette();
    void loadHireSheet();
    void loadToolArtifact();
  };
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(run, { timeout: 4000 });
    return () => window.cancelIdleCallback(id);
  }
  const t = setTimeout(run, 2000);
  return () => clearTimeout(t);
}

type PresetItem = {
  id: string;
  // # of chat messages that existed when this was created — used to interleave
  // instant preset answers with the AI conversation chronologically.
  anchor: number;
  order: number;
  question: string;
  reply: string;
  tool: string;
};

type FailureKind = 'rate' | 'network' | 'server' | 'empty';
type ErrorItem = { anchor: number; order: number; kind: FailureKind };

// A single entry in the rendered transcript.
type TimelineItem =
  | { key: string; kind: 'msg'; message: UIMessage; userId: string | null }
  | { key: string; kind: 'preset'; item: PresetItem }
  | { key: string; kind: 'error'; failure: FailureKind }
  | { key: string; kind: 'pending' }
  | { key: string; kind: 'stopped'; userId: string };

/** Space kept above a pinned question: the thread's own top padding. */
const PIN_GAP = 32;

type PanelState = { tool: string; phase: 'open' | 'closing'; detail: number | null };

/** How long the panel's exit runs before it is removed. */
const PANEL_EXIT_MS = 160;

/** Which failure this is, from what the transport or the stream reported. */
function classifyFailure(error: Error): FailureKind {
  const message = error.message ?? '';
  if (/quota|exceeded|exhausted|rate.?limit|429|API key/i.test(message)) return 'rate';
  if (
    error.name === 'TypeError' ||
    /network|failed to fetch|fetch failed|terminated|load failed/i.test(message)
  ) {
    return 'network';
  }
  return 'server';
}

/** Whether the docked sidebar is open, kept in the visitor's browser. */
const sidebarPref = (() => {
  const KEY = 'sidebar';
  const listeners = new Set<() => void>();
  let open: boolean | null = null;
  return {
    get: () => {
      if (open === null) {
        try {
          open = window.localStorage.getItem(KEY) !== 'closed';
        } catch {
          open = true;
        }
      }
      return open;
    },
    set: (next: boolean) => {
      open = next;
      try {
        window.localStorage.setItem(KEY, next ? 'open' : 'closed');
      } catch {
        // Storage can be off (private mode); the choice lasts this visit only.
      }
      listeners.forEach((l) => l());
    },
    subscribe: (l: () => void) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
})();

/** One transport for the page's life: it holds no per-render state. */
const chatTransport = new DefaultChatTransport({ api: '/api/chat' });

const Chat = () => {
  const { setTheme, resolvedTheme } = useTheme();

  const config = useMemo(() => getConfig(), []);
  const commands = useMemo(() => buildCommands(config), [config]);

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [hireOpen, setHireOpen] = useState(false);
  // Mounted from the first open on, so their exit animations still run.
  const [paletteMounted, setPaletteMounted] = useState(false);
  const [hireMounted, setHireMounted] = useState(false);
  if (paletteOpen && !paletteMounted) setPaletteMounted(true);
  if (hireOpen && !hireMounted) setHireMounted(true);
  const [input, setInput] = useState('');
  const [heroComposerVisible, setHeroComposerVisible] = useState(true);
  const [presetItems, setPresetItems] = useState<PresetItem[]>([]);
  const [errorItem, setErrorItem] = useState<ErrorItem | null>(null);
  const [panel, setPanel] = useState<PanelState | null>(null);
  // The visitor's choice to keep the sidebar collapsed outlasts the visit.
  const sidebarOpen = useSyncExternalStore(
    sidebarPref.subscribe,
    sidebarPref.get,
    () => true
  );
  const [sidebarFloating, setSidebarFloating] = useState(false);
  // New chat stays in the conversation view with an empty chat, as in ChatGPT.
  // Back to portfolio leaves it for the landing page.
  const [inShell, setInShell] = useState(false);
  // The saved chat on screen. Null until the first question of a new chat.
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const savedChats = useSyncExternalStore(
    chatStore.subscribe,
    chatStore.list,
    chatStore.serverList
  );
  // Questions the visitor pressed stop on.
  const [stoppedIds, setStoppedIds] = useState<ReadonlySet<string>>(new Set());
  const [hasNewerBelow, setHasNewerBelow] = useState(false);
  const [instantAnnouncement, setInstantAnnouncement] = useState('');

  // Below 1024 the sidebar is a drawer. Below 1280 the panel covers the chat.
  const sidebarDocks = useMediaQuery('(min-width: 1024px)');
  const panelBeside = useMediaQuery('(min-width: 1280px)');

  // Monotonic tie-break for entries sharing an anchor. Only ever touched inside
  // event handlers / callbacks, never during render.
  const orderRef = useRef(0);
  const nextOrder = () => orderRef.current++;
  // True from the moment a message is sent until its request ends, so a second click
  // or Enter in the same tick cannot send twice before the status updates.
  const sendingRef = useRef(false);
  // Changes whenever the conversation moves on, so a stale Undo cannot overwrite newer turns.
  const historyRef = useRef(0);
  const autoSubmittedRef = useRef(false);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const composerColRef = useRef<HTMLDivElement>(null);
  const panelOpenerRef = useRef<HTMLElement | null>(null);
  const floatOpenerRef = useRef<HTMLElement | null>(null);
  const panelExitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Where the hero's composer was when the first message left it.
  const heroComposerRect = useRef<DOMRect | null>(null);
  // Where things were before the column moved, so it can glide and the reader keeps their place.
  const flipRef = useRef<{
    left: number;
    anchor: HTMLElement | null;
    anchorTop: number;
  } | null>(null);
  const reduceMotion = useReducedMotion();
  const activeChatIdRef = useRef<string | null>(null);
  // What was last written for this chat, so opening a chat does not count as a change.
  const lastSavedRef = useRef('');
  // Opening a saved chat lands on its last question at once, without a glide.
  const instantPinRef = useRef(false);

  const { messages, status, stop, regenerate, sendMessage, setMessages } =
    useChat({
      transport: chatTransport,
      // Words arrive evenly from the server; rendering them in small batches keeps the page calm.
      throttle: 40,
      onFinish: ({ message, isAbort, isError, isDisconnect }) => {
        sendingRef.current = false;
        if (isAbort || isError || isDisconnect) return;
        if (!hasContent(message)) {
          setErrorItem({
            anchor: messagesRef.current.length,
            order: nextOrder(),
            kind: 'empty',
          });
        }
      },
      onError: (error) => {
        sendingRef.current = false;
        console.warn('Chat error:', error.message);
        setErrorItem({
          anchor: messagesRef.current.length,
          order: nextOrder(),
          kind: classifyFailure(error),
        });
      },
    });

  useEffect(() => preloadLater(), []);

  // Latest messages, readable from event handlers without re-creating callbacks.
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const isLoading = status === 'submitted' || status === 'streaming';
  const isLoadingRef = useRef(isLoading);
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) =>
    setInput(e.target.value);

  // Merge messages + presets + error into one ordered transcript. A preset (or
  // the error notice) anchored at N renders right after the Nth chat message,
  // so instant answers and AI turns stay in the order they happened.
  const timeline = useMemo<TimelineItem[]>(() => {
    const extras: Array<{ anchor: number; order: number; node: TimelineItem }> =
      [];
    for (const p of presetItems) {
      extras.push({
        anchor: p.anchor,
        order: p.order,
        node: { key: `preset-${p.id}`, kind: 'preset', item: p },
      });
    }
    if (errorItem) {
      extras.push({
        anchor: errorItem.anchor,
        order: errorItem.order,
        node: { key: 'error', kind: 'error', failure: errorItem.kind },
      });
    }
    extras.sort((a, b) => a.order - b.order);

    const count = messages.length;
    const items: TimelineItem[] = [];
    let userId: string | null = null;
    for (let i = 0; i <= count; i++) {
      for (const e of extras) {
        // An anchor past the end belongs to an answer that never arrived.
        if (e.anchor === i || (i === count && e.anchor > count)) items.push(e.node);
      }
      if (i === count) break;
      const m = messages[i];
      const isLast = i === count - 1;
      if (m.role === 'user') {
        userId = m.id;
        items.push({ key: `msg-${m.id}`, kind: 'msg', message: m, userId });
        if (isLast && isLoading) items.push({ key: 'pending', kind: 'pending' });
        else if (isLast && stoppedIds.has(m.id)) {
          items.push({ key: `stopped-${m.id}`, kind: 'stopped', userId: m.id });
        }
      } else if (hasContent(m)) {
        items.push({ key: `msg-${m.id}`, kind: 'msg', message: m, userId });
      } else if (isLast && isLoading) {
        // The answer has begun but has no words yet. Same entry as before, so the
        // indicator keeps running rather than starting over.
        items.push({ key: 'pending', kind: 'pending' });
      } else if (userId && stoppedIds.has(userId)) {
        items.push({ key: `stopped-${userId}`, kind: 'stopped', userId });
      }
    }
    return items;
  }, [messages, presetItems, errorItem, isLoading, stoppedIds]);

  const isEmptyState = timeline.length === 0;

  // Only the most recent turn offers follow-ups and "Ask my AI twin live". Older
  // answers are settled history.
  const lastEntry = timeline[timeline.length - 1];
  const latestKey = !isLoading ? lastEntry?.key : null;

  const allQuestions = useMemo(
    () =>
      commands
        .filter((c) => c.group === 'Ask')
        .map((c) => c.payload || c.label),
    [commands]
  );

  // What has been asked, for "This chat" and for not offering it twice.
  const turns = useMemo(
    () =>
      timeline.flatMap((e) =>
        e.kind === 'preset'
          ? [{ key: e.key, question: e.item.question }]
          : e.kind === 'msg' && e.message.role === 'user'
            ? [{ key: e.key, question: textOf(e.message) }]
            : []
      ),
    [timeline]
  );

  const latestTool =
    lastEntry?.kind === 'preset'
      ? lastEntry.item.tool
      : lastEntry?.kind === 'msg'
        ? (() => {
            const part = lastEntry.message.parts?.find(isToolUIPart);
            return part ? getToolName(part) : undefined;
          })()
        : undefined;

  const { chips, askNext } = useMemo(
    () =>
      suggestQuestions(
        allQuestions,
        new Set(turns.map((t) => t.question)),
        latestTool
      ),
    [allQuestions, turns, latestTool]
  );

  // What a screen reader hears: state changes, never each word. A failure speaks for
  // itself through its alert, and an instant answer through its own words.
  const liveStatus = (() => {
    if (lastEntry?.kind === 'preset' && !isLoading) return instantAnnouncement;
    if (errorItem) return '';
    const last = messages[messages.length - 1];
    if (isLoading) {
      if (!last || last.role === 'user' || !hasContent(last)) return 'Thinking';
      const running = (last.parts ?? [])
        .filter(isToolUIPart)
        .find((p) => p.state === 'input-streaming' || p.state === 'input-available');
      if (running) return TOOL_LABELS[getToolName(running)]?.running ?? 'Thinking';
      return 'Answering';
    }
    if (last) {
      const userMessage = [...messages].reverse().find((m) => m.role === 'user');
      if (userMessage && stoppedIds.has(userMessage.id)) return 'Stopped';
      if (last.role === 'assistant' && hasContent(last)) return 'Answer ready';
    }
    return '';
  })();

  // The question that started the newest turn. Answers are taller than the screen,
  // so a new turn pins this to the top of the transcript and reads downward.
  const lastTurnKey = useMemo(() => {
    for (let i = timeline.length - 1; i >= 0; i--) {
      const e = timeline[i];
      if (e.kind === 'preset' || (e.kind === 'msg' && e.message.role === 'user')) return e.key;
    }
    return null;
  }, [timeline]);

  // How far the newest question sits below the top of the thread, ignoring its entrance rise.
  const lastTurnOffset = useCallback(() => {
    const thread = threadRef.current;
    const starts = thread?.querySelectorAll<HTMLElement>('[data-turn-start]');
    const last = starts?.[starts.length - 1];
    if (!thread || !last) return null;
    const rise = new DOMMatrixReadOnly(getComputedStyle(last).transform).m42;
    return last.getBoundingClientRect().top - rise - thread.getBoundingClientRect().top;
  }, []);

  // A short answer needs room under it, or the transcript cannot scroll far enough to pin it.
  const syncSpacer = useCallback(() => {
    const scroller = scrollerRef.current;
    const thread = threadRef.current;
    const bottom = bottomRef.current;
    const spacer = spacerRef.current;
    const offset = lastTurnOffset();
    if (!scroller || !thread || !bottom || !spacer || offset === null) return;
    const tail = bottom.getBoundingClientRect().bottom - thread.getBoundingClientRect().top - offset;
    const below = thread.getBoundingClientRect().bottom - bottom.getBoundingClientRect().bottom;
    const room = Math.max(0, scroller.clientHeight - PIN_GAP - tail - below);
    spacer.style.height = `${room}px`;
  }, [lastTurnOffset]);

  // Is the end of the conversation below what the reader can see?
  const syncNewerBelow = useCallback(() => {
    const scroller = scrollerRef.current;
    const bottom = bottomRef.current;
    if (!scroller || !bottom) return;
    setHasNewerBelow(
      bottom.getBoundingClientRect().top >
        scroller.getBoundingClientRect().bottom + 24
    );
  }, []);

  const hasTurns = !isEmptyState;
  useEffect(() => {
    const scroller = scrollerRef.current;
    const thread = threadRef.current;
    if (!hasTurns || !scroller || !thread) return;
    const ro = new ResizeObserver(() => {
      syncSpacer();
      syncNewerBelow();
    });
    ro.observe(scroller);
    ro.observe(thread);
    scroller.addEventListener('scroll', syncNewerBelow, { passive: true });
    return () => {
      ro.disconnect();
      scroller.removeEventListener('scroll', syncNewerBelow);
    };
  }, [hasTurns, syncSpacer, syncNewerBelow]);

  useEffect(() => {
    if (!lastTurnKey) return;
    syncSpacer();
    const offset = lastTurnOffset();
    if (offset === null) return;
    scrollerRef.current?.scrollTo({
      top: Math.max(0, offset - PIN_GAP),
      behavior: reduceMotion || instantPinRef.current ? 'auto' : 'smooth',
    });
    instantPinRef.current = false;
    // The chip or row that asked this is gone. Focus takes the question, not the page's top.
    if (document.activeElement === document.body) {
      const starts = threadRef.current?.querySelectorAll<HTMLElement>('[data-turn-start]');
      starts?.[starts.length - 1]?.focus({ preventScroll: true });
    }
  }, [lastTurnKey, reduceMotion, syncSpacer, lastTurnOffset]);

  const scrollToLatest = () => {
    const scroller = scrollerRef.current;
    const bottom = bottomRef.current;
    if (!scroller || !bottom) return;
    scroller.scrollTo({
      top:
        scroller.scrollTop +
        bottom.getBoundingClientRect().bottom -
        scroller.getBoundingClientRect().bottom +
        16,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
    // The button goes away once it has done its job. Focus must not go with it.
    document
      .querySelector<HTMLElement>('.shell__composer textarea')
      ?.focus({ preventScroll: true });
  };

  // Measure the column before a layout change; the layout effect below glides it.
  const captureFlip = (anchor: HTMLElement | null) => {
    const col = threadRef.current;
    if (!col) return;
    const held = anchor && scrollerRef.current?.contains(anchor) ? anchor : null;
    flipRef.current = {
      left: col.getBoundingClientRect().left,
      anchor: held,
      anchorTop: held?.getBoundingClientRect().top ?? 0,
    };
  };

  const panelInFlow = panel?.phase === 'open' && panelBeside;
  // The sidebar steps aside for the panel, so the reading column keeps its width.
  const sidebarRailed = !sidebarOpen || panelInFlow;

  useLayoutEffect(() => {
    const flip = flipRef.current;
    const col = threadRef.current;
    if (!flip || !col) return;
    flipRef.current = null;
    // The text has rewrapped: put what the reader was looking at back where it was.
    if (flip.anchor?.isConnected && scrollerRef.current) {
      scrollerRef.current.scrollTop +=
        flip.anchor.getBoundingClientRect().top - flip.anchorTop;
    }
    if (reduceMotion) return;
    const dx = flip.left - col.getBoundingClientRect().left;
    if (Math.abs(dx) < 1) return;
    for (const el of [col, composerColRef.current]) {
      el?.animate(
        [{ transform: `translateX(${dx}px)` }, { transform: 'none' }],
        { duration: 220, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
      );
    }
  }, [panelInFlow, sidebarRailed, reduceMotion]);

  // The first message: the hero's composer travels to the bottom of the conversation.
  useLayoutEffect(() => {
    const from = heroComposerRect.current;
    if (isEmptyState || !from) return;
    heroComposerRect.current = null;
    const composer = composerColRef.current?.querySelector<HTMLElement>('.composer');
    if (!composer || reduceMotion) return;
    const to = composer.getBoundingClientRect();
    composer.animate(
      [
        {
          transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`,
          width: `${from.width}px`,
        },
        { transform: 'none', width: `${to.width}px` },
      ],
      { duration: 240, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
    );
  }, [isEmptyState, reduceMotion]);

  const openPanel = useCallback(
    (tool: string, opener?: HTMLElement | null, detail?: number | null) => {
      if (panelExitRef.current) clearTimeout(panelExitRef.current);
      panelOpenerRef.current = opener ?? null;
      captureFlip(opener ?? null);
      setPanel({ tool, phase: 'open', detail: detail ?? null });
    },
    []
  );

  const closePanel = useCallback(() => {
    const opener = panelOpenerRef.current;
    captureFlip(opener);
    setPanel((p) => (p ? { ...p, phase: 'closing' } : p));
    panelExitRef.current = setTimeout(
      () => setPanel((p) => (p?.phase === 'closing' ? null : p)),
      reduceMotion ? 0 : PANEL_EXIT_MS
    );
    // Focus goes back to what opened it, or to the composer on a desktop if that turn
    // is gone. After the render: below 1280 the chat is inert until the panel lets go.
    requestAnimationFrame(() => {
      if (opener?.isConnected) {
        opener.focus({ preventScroll: true });
      } else if (window.matchMedia('(pointer: fine)').matches) {
        document
          .querySelector<HTMLElement>('.shell__composer textarea')
          ?.focus({ preventScroll: true });
      }
    });
  }, [reduceMotion]);

  const setPanelDetail = useCallback((detail: number | null) => {
    setPanel((p) => (p ? { ...p, detail } : p));
  }, []);

  const panelApi = useMemo(
    () => ({
      openTool: panel?.phase === 'open' ? panel.tool : null,
      detail: panel?.detail ?? null,
      setDetail: setPanelDetail,
      open: openPanel,
    }),
    [panel, openPanel, setPanelDetail]
  );

  const closeHire = useCallback(() => setHireOpen(false), []);

  const closeFloat = useCallback(() => {
    setSidebarFloating(false);
    floatOpenerRef.current?.focus({ preventScroll: true });
  }, []);

  const openFloat = (opener?: HTMLElement | null) => {
    floatOpenerRef.current = opener ?? null;
    setSidebarFloating(true);
  };

  const collapseSidebar = () => {
    captureFlip(null);
    sidebarPref.set(false);
  };

  const expandSidebar = (opener: HTMLElement) => {
    // Beside an open panel there is no room to dock, so it floats over the chat.
    if (panelInFlow) {
      openFloat(opener);
      return;
    }
    captureFlip(null);
    sidebarPref.set(true);
  };

  // ⇧⌘S / Ctrl+Shift+S opens and closes the sidebar, as in ChatGPT.
  const toggleSidebarRef = useRef<() => void>(() => {});
  useEffect(() => {
    toggleSidebarRef.current = () => {
      const opener = document.activeElement as HTMLElement | null;
      if (sidebarFloating) closeFloat();
      else if (!sidebarDocks) openFloat(opener);
      else if (sidebarRailed) expandSidebar(opener ?? document.body);
      else collapseSidebar();
    };
  });

  /** The first question of a new chat gives it an identity, so it can be saved. */
  const ensureChat = () => {
    if (activeChatIdRef.current) return;
    const id = crypto.randomUUID();
    activeChatIdRef.current = id;
    lastSavedRef.current = '';
    setActiveChatId(id);
  };

  const addPreset = useCallback(
    (question: string, reply: string, tool: string) => {
      historyRef.current++;
      ensureChat();
      setErrorItem(null);
      setInstantAnnouncement(reply);
      // A question still waiting for its answer keeps that answer directly under it.
      const current = messagesRef.current;
      const awaitingAnswer =
        isLoadingRef.current && current[current.length - 1]?.role === 'user';
      setPresetItems((prev) => [
        ...prev,
        {
          id: `${Date.now()}-${prev.length}`,
          anchor: current.length + (awaitingAnswer ? 1 : 0),
          order: nextOrder(),
          question,
          reply,
          tool,
        },
      ]);
    },
    []
  );

  /** Sends to the live model. Only one answer at a time: a second send is refused, not queued. */
  const sendLive = useCallback(
    (text: string) => {
      if (sendingRef.current || isLoadingRef.current) return false;
      sendingRef.current = true;
      historyRef.current++;
      ensureChat();
      setErrorItem(null);
      const count = messagesRef.current.length;
      // An answer stopped before it began left its anchor one past the end.
      setPresetItems((prev) =>
        prev.map((p) => (p.anchor > count ? { ...p, anchor: count } : p))
      );
      sendMessage({ text });
      return true;
    },
    [sendMessage]
  );

  const submitQuery = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      if (presetReplies[query]) {
        const preset = presetReplies[query];
        addPreset(query, preset.reply, preset.tool);
        return;
      }
      if (!sendLive(query)) toast('Wait for this answer to finish, or stop it.');
    },
    [addPreset, sendLive]
  );

  const submitQueryToAI = useCallback(
    (query: string) => {
      if (!query.trim()) return;
      if (!sendLive(query)) toast('Wait for this answer to finish, or stop it.');
    },
    [sendLive]
  );

  const handlePresetReply = useCallback(
    (question: string, reply: string, tool: string, showDetail = false) => {
      addPreset(question, reply, tool);
      if (showDetail && tool in PANEL_TITLES) {
        panelOpenerRef.current = null;
        setPanel({ tool, phase: 'open', detail: null });
      }
    },
    [addPreset]
  );

  // The conversation as it would be saved, readable from handlers.
  const snapshot = useRef<SavedChat | null>(null);
  useEffect(() => {
    const id = activeChatId;
    const title = turns[0] ? chatTitle(turns[0].question) : '';
    snapshot.current =
      id && title
        ? {
            id,
            title,
            updatedAt: 0,
            messages,
            presets: presetItems,
            stopped: [...stoppedIds],
          }
        : null;
    // Save once an answer has settled, and only when something changed.
    if (isLoading || !snapshot.current) return;
    const body = JSON.stringify([messages, presetItems, [...stoppedIds]]);
    if (body === lastSavedRef.current) return;
    lastSavedRef.current = body;
    chatStore.save({ ...snapshot.current, updatedAt: Date.now() });
  }, [activeChatId, turns, messages, presetItems, stoppedIds, isLoading]);

  /** Leaving a chat mid-answer keeps what arrived, marked stopped. */
  const leaveCurrentChat = () => {
    const current = snapshot.current;
    if (isLoadingRef.current) {
      stop();
      if (current) {
        const lastUser = [...current.messages].reverse().find((m) => m.role === 'user');
        chatStore.save({
          ...current,
          stopped: lastUser ? [...current.stopped, lastUser.id] : current.stopped,
          updatedAt: Date.now(),
        });
      }
    }
    sendingRef.current = false;
  };

  const resetConversation = (next: SavedChat | null) => {
    historyRef.current++;
    setMessages(next?.messages ?? []);
    setPresetItems(next?.presets ?? []);
    setStoppedIds(new Set(next?.stopped ?? []));
    setErrorItem(null);
    setInstantAnnouncement('');
    orderRef.current = next ? Math.max(0, ...next.presets.map((p) => p.order + 1)) : 0;
    activeChatIdRef.current = next?.id ?? null;
    lastSavedRef.current = next
      ? JSON.stringify([next.messages, next.presets, next.stopped])
      : '';
    setActiveChatId(next?.id ?? null);
    setPanel(null);
    setSidebarFloating(false);
  };

  const openChat = (id: string) => {
    if (id === activeChatIdRef.current) {
      setSidebarFloating(false);
      return;
    }
    leaveCurrentChat();
    const chat = chatStore.get(id);
    if (!chat) return;
    instantPinRef.current = true;
    resetConversation(chat);
  };

  const deleteChat = (id: string) => {
    const chat = chatStore.get(id);
    if (!chat) return;
    if (id === activeChatIdRef.current) {
      leaveCurrentChat();
      resetConversation(null);
      window.history.replaceState(null, '', '/');
    }
    chatStore.remove(id);
    toast('Chat deleted', {
      action: { label: 'Undo', onClick: () => chatStore.restore(chat) },
    });
  };

  // Reset the conversation in place — no full-page reload. The chat stays saved.
  const goHome = useCallback(() => {
    historyRef.current++;
    leaveCurrentChat();
    stop();
    sendingRef.current = false;
    setMessages([]);
    setPresetItems([]);
    setErrorItem(null);
    setStoppedIds(new Set());
    setInstantAnnouncement('');
    orderRef.current = 0;
    setInput('');
    setPanel(null);
    setSidebarFloating(false);
    activeChatIdRef.current = null;
    lastSavedRef.current = '';
    setActiveChatId(null);
    setInShell(false);
    window.history.replaceState(null, '', '/');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- leaveCurrentChat reads refs only
  }, [stop, setMessages]);

  /** A fresh, empty chat in the conversation view: the prompt sits mid-screen. */
  const newChat = useCallback(() => {
    goHome();
    setInShell(true);
    setTimeout(() => {
      if (window.matchMedia('(pointer: fine)').matches) {
        document
          .querySelector<HTMLTextAreaElement>('.shell__composer textarea')
          ?.focus({ preventScroll: true });
      }
    }, 30);
  }, [goHome]);

  // The first questions a new chat offers, with the icons the palette uses.
  const starters = useMemo(
    () => commands.filter((c) => c.kind === 'ask').slice(0, 4),
    [commands]
  );

  const runCommand = useCallback(
    (cmd: Command) => {
      setPaletteOpen(false);
      switch (cmd.kind) {
        case 'ask':
          submitQuery(cmd.payload || cmd.label);
          break;
        case 'link':
          if (cmd.payload) window.open(cmd.payload, '_blank', 'noopener');
          break;
        case 'copy':
          if (cmd.payload) {
            navigator.clipboard
              ?.writeText(cmd.payload)
              .then(() => toast.success(`Copied ${cmd.payload}`))
              .catch(() => toast.error('Could not copy'));
          }
          break;
        case 'resume':
          window.open(config.resume.downloadUrl, '_blank', 'noopener');
          break;
        case 'theme':
          setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
          break;
        case 'hire':
          setHireOpen(true);
          break;
        case 'chat':
          if (cmd.payload) openChat(cmd.payload);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- openChat reads refs and the store
    [submitQuery, config.resume.downloadUrl, setTheme, resolvedTheme]
  );

  // The palette reaches saved chats from anywhere, the landing page included.
  const paletteCommands = useMemo<Command[]>(
    () => [
      ...commands,
      ...savedChats.slice(0, 5).map((c) => ({
        id: `chat-${c.id}`,
        label: c.title,
        keywords: ['chat', 'continue', 'history'],
        group: 'Your chats' as const,
        kind: 'chat' as const,
        payload: c.id,
        icon: 'chat',
      })),
    ],
    [commands, savedChats]
  );

  // Cards and landing sections ask questions / open the hire sheet via events.
  useEffect(
    () =>
      onAsk(({ question, live }) => {
        // Where the panel covers the chat, get it out of the way of the answer.
        if (!window.matchMedia('(min-width: 1280px)').matches) setPanel(null);
        if (live) submitQueryToAI(question);
        else submitQuery(question);
      }),
    [submitQuery, submitQueryToAI]
  );
  useEffect(() => onHire(() => setHireOpen(true)), []);

  // ⌘K / Ctrl+K to open the command palette, ⇧⌘S / Ctrl+Shift+S for the sidebar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const key = e.key.toLowerCase();
      if (key === 'k' && !e.shiftKey) {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      } else if (key === 's' && e.shiftKey && !e.altKey) {
        e.preventDefault();
        toggleSidebarRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // A ?query= link asks once. The address is cleaned, so a reload does not spend another answer.
  // Read from the address after mounting rather than useSearchParams, which would
  // stop the landing page from being prerendered.
  useEffect(() => {
    if (autoSubmittedRef.current) return;
    // A task, not this effect's body: asking sets state. The guard is set when it
    // runs, so StrictMode's discarded first mount cannot swallow the question.
    const t = setTimeout(() => {
      if (autoSubmittedRef.current) return;
      autoSubmittedRef.current = true;
      const initialQuery = new URLSearchParams(window.location.search).get('query');
      if (!initialQuery) return;
      submitQuery(initialQuery);
      window.history.replaceState(null, '', '/');
    }, 0);
    return () => clearTimeout(t);
  }, [submitQuery]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (isEmptyState && heroComposerVisible) {
      heroComposerRect.current =
        document.querySelector('.twin .composer')?.getBoundingClientRect() ?? null;
    }
    // While an answer is arriving the draft stays in the field.
    if (sendLive(input)) setInput('');
  };

  const handleStop = () => {
    const lastUser = [...messagesRef.current]
      .reverse()
      .find((m) => m.role === 'user');
    if (lastUser) setStoppedIds((prev) => new Set(prev).add(lastUser.id));
    stop();
    sendingRef.current = false;
  };

  // Removing the last turn returns to the landing page, so the panel goes with it.
  const closePanelIfEmpty = (remaining: number) => {
    if (remaining === 0) {
      setPanel(null);
      setSidebarFloating(false);
      setInstantAnnouncement('');
      // Every turn removed: there is no chat left to keep.
      if (activeChatIdRef.current) chatStore.remove(activeChatIdRef.current);
      activeChatIdRef.current = null;
      lastSavedRef.current = '';
      setActiveChatId(null);
    }
  };

  /**
   * Removing a turn can be undone for a few seconds, as deleting a chat can. Undo
   * puts back the conversation exactly as it was, unless something has changed since.
   */
  const offerUndo = () => {
    const chatId = activeChatIdRef.current;
    const before = {
      messages: messagesRef.current,
      presets: presetItems,
      stopped: stoppedIds,
      chatId,
      saved: chatId ? chatStore.get(chatId) : null,
      wasLoading: isLoadingRef.current,
    };
    const version = ++historyRef.current;
    toast('Removed from this chat', {
      action: {
        label: 'Undo',
        onClick: () => {
          if (historyRef.current !== version) return;
          historyRef.current++;
          let stopped = before.stopped;
          // Removing the turn stopped its answer: it comes back marked stopped.
          if (before.wasLoading) {
            const lastUser = [...before.messages].reverse().find((m) => m.role === 'user');
            if (lastUser) stopped = new Set(stopped).add(lastUser.id);
          }
          setMessages(before.messages);
          setPresetItems(before.presets);
          setStoppedIds(stopped);
          setErrorItem(null);
          activeChatIdRef.current = before.chatId;
          setActiveChatId(before.chatId);
          // The saved copy goes back where it was in the list, not to the top.
          if (before.saved && !before.wasLoading) {
            chatStore.restore(before.saved);
            lastSavedRef.current = JSON.stringify([
              before.saved.messages,
              before.saved.presets,
              before.saved.stopped,
            ]);
          } else {
            lastSavedRef.current = '';
          }
        },
      },
    });
  };

  const removePreset = (id: string) => {
    offerUndo();
    setPresetItems((prev) => prev.filter((p) => p.id !== id));
    closePanelIfEmpty(turns.filter((t) => t.key !== `preset-${id}`).length);
  };

  /** Removes a live question and its answer, stopping the answer if it is still arriving. */
  const removeLiveTurn = (messageId: string) => {
    const i = messages.findIndex((m) => m.id === messageId);
    if (i < 0) return;
    const start = messages[i].role === 'user' ? i : i - 1;
    if (start < 0) return;
    const count = messages[start + 1]?.role === 'assistant' ? 2 : 1;
    const isCurrent = start + count >= messages.length;
    offerUndo();
    if (isCurrent && isLoading) {
      stop();
      sendingRef.current = false;
    }
    const shift = (anchor: number) =>
      anchor > start ? anchor - Math.min(count, anchor - start) : anchor;
    setMessages(messages.filter((_, n) => n < start || n >= start + count));
    setPresetItems((prev) =>
      prev.map((p) => ({ ...p, anchor: shift(p.anchor) }))
    );
    // A failure notice belongs to the turn it interrupted.
    setErrorItem((e) => (e && isCurrent ? null : e ? { ...e, anchor: shift(e.anchor) } : e));
    closePanelIfEmpty(
      turns.filter((t) => t.key !== `msg-${messages[start].id}`).length
    );
  };

  const retry = () => {
    setErrorItem(null);
    sendingRef.current = true;
    regenerate();
  };

  const composerProps = {
    input,
    handleInputChange,
    handleSubmit: onSubmit,
    isLoading,
    stop: handleStop,
    commands,
    onRunCommand: runCommand,
    onOpenCommand: () => setPaletteOpen(true),
  };

  // The panel covers the chat below 1280; while it does, nothing behind it takes focus.
  const panelIsModal = panel?.phase === 'open' && !panelBeside;

  const sidebarProps = {
    chats: savedChats,
    activeChatId,
    askNext,
    onBack: goHome,
    onNewChat: newChat,
    onSearch: () => {
      setSidebarFloating(false);
      setPaletteOpen(true);
    },
    onOpenChat: openChat,
    onDeleteChat: deleteChat,
    onAsk: (q: string) => {
      setSidebarFloating(false);
      submitQuery(q);
    },
  };

  return (
    <MotionConfig reducedMotion="user">
      {paletteMounted && (
        <CommandPalette
          commands={paletteCommands}
          open={paletteOpen}
          onOpenChange={setPaletteOpen}
          onRun={runCommand}
        />
      )}

      {hireMounted && <HireSheet open={hireOpen} onClose={closeHire} />}

      {isEmptyState && !inShell ? (
        <>
          <TopBar
            onOpenCommand={() => setPaletteOpen(true)}
            onHome={goHome}
            onHire={() => setHireOpen(true)}
          />
          <ChatLanding
            submitQuery={submitQuery}
            handlePresetReply={handlePresetReply}
            onOpenCommand={() => setPaletteOpen(true)}
            onHire={() => setHireOpen(true)}
            commands={commands}
            onComposerVisible={setHeroComposerVisible}
            composer={
              <ChatBottombar
                {...composerProps}
                variant="window"
                menuEnabled={heroComposerVisible}
                focusOnMount
              />
            }
          />
          {/* Once the hero scrolls off, the twin stays one tap away. */}
          {!heroComposerVisible && (
            <div className="dock">
              <div className="wrap">
                <ChatBottombar {...composerProps} variant="dock" />
              </div>
            </div>
          )}
        </>
      ) : (
        <PanelContext.Provider value={panelApi}>
          <div className="shell">
            <div inert={panelIsModal}>
              <TopBar
                conversation
                onOpenCommand={() => setPaletteOpen(true)}
                onHome={goHome}
                onHire={() => setHireOpen(true)}
                onOpenSidebar={() => openFloat(document.activeElement as HTMLElement)}
                sidebarOpen={sidebarFloating}
              />
            </div>

            {/* What a screen reader hears: state changes, never each word. */}
            <div role="status" aria-live="polite" className="sr-only">
              {liveStatus}
            </div>

            <div className="wrap shell__body">
              {sidebarRailed ? (
                <SidebarRail
                  chats={savedChats}
                  activeChatId={activeChatId}
                  onExpand={expandSidebar}
                  onNewChat={newChat}
                  onBack={goHome}
                  onSearch={sidebarProps.onSearch}
                  onOpenChat={openChat}
                />
              ) : (
                <aside aria-label="Sidebar" inert={panelIsModal} className="side scrollbar-subtle">
                  <SidebarContent
                    {...sidebarProps}
                    closeControl={<SidebarCollapse onCollapse={collapseSidebar} />}
                  />
                </aside>
              )}

              <main
                id="main"
                tabIndex={-1}
                inert={panelIsModal}
                className={`shell__main${isEmptyState ? ' shell__main--new' : ''}`}
              >
                <div ref={scrollerRef} className="shell__scroller scrollbar-subtle">
                  <div ref={threadRef} className="shell__col thread">
                    {isEmptyState && (
                      <h1 className="new-chat__title fade-in">
                        What would you like to know?
                      </h1>
                    )}
                    <AnimatePresence initial={false}>
                      {timeline.map((entry) => {
                        if (entry.kind === 'pending') {
                          return <Thinking key={entry.key} />;
                        }

                        if (entry.kind === 'error') {
                          return entry.failure === 'rate' ? (
                            <QuotaNotice
                              key={entry.key}
                              onQuick={() => {
                                setErrorItem(null);
                                const preset =
                                  presetReplies['How do we get started?'];
                                if (preset)
                                  addPreset(
                                    'How do we get started?',
                                    preset.reply,
                                    preset.tool
                                  );
                              }}
                              onCommand={() => {
                                setErrorItem(null);
                                setPaletteOpen(true);
                              }}
                            />
                          ) : (
                            <FailureNotice
                              key={entry.key}
                              kind={entry.failure}
                              onRetry={retry}
                            />
                          );
                        }

                        if (entry.kind === 'stopped') {
                          return (
                            <StoppedTurn
                              key={entry.key}
                              onRemove={() => removeLiveTurn(entry.userId)}
                              footer={
                                entry.key === latestKey ? (
                                  <FollowUps questions={chips} onAsk={submitQuery} />
                                ) : undefined
                              }
                            />
                          );
                        }

                        if (entry.kind === 'preset') {
                          const p = entry.item;
                          return (
                            <motion.div
                              key={entry.key}
                              className="flex flex-col"
                              initial={false}
                              exit={{
                                opacity: 0,
                                y: -4,
                                transition: { duration: 0.15 },
                              }}
                            >
                              <UserBubble
                                turnKey={entry.key}
                                text={p.question}
                                onRemove={() => removePreset(p.id)}
                              />
                              <PresetReply
                                reply={p.reply}
                                tool={p.tool}
                                onRemove={() => removePreset(p.id)}
                                footer={
                                  entry.key === latestKey ? (
                                    <FollowUps
                                      questions={chips}
                                      onAsk={submitQuery}
                                      onAskLive={() => {
                                        // Escalating replaces the instant card with the
                                        // live answer. Otherwise the AI re-renders the same
                                        // tool card and shows it twice.
                                        if (sendLive(p.question)) removePreset(p.id);
                                      }}
                                    />
                                  ) : undefined
                                }
                              />
                            </motion.div>
                          );
                        }

                        // Chat message
                        const m = entry.message;
                        if (m.role === 'user') {
                          return (
                            <UserBubble
                              key={entry.key}
                              turnKey={entry.key}
                              text={textOf(m)}
                              onRemove={() => removeLiveTurn(m.id)}
                            />
                          );
                        }
                        return (
                          <AssistantTurn
                            key={entry.key}
                            message={m}
                            isStreaming={isLoading && m.id === messages[messages.length - 1]?.id}
                            stopped={!!entry.userId && stoppedIds.has(entry.userId)}
                            onRemove={() => removeLiveTurn(m.id)}
                            footer={
                              entry.key === latestKey ? (
                                <FollowUps questions={chips} onAsk={submitQuery} />
                              ) : undefined
                            }
                          />
                        );
                      })}
                    </AnimatePresence>

                    <div ref={bottomRef} className="h-px w-full" />
                  </div>
                  <div ref={spacerRef} aria-hidden />
                </div>

                <div className="shell__composer">
                  <div ref={composerColRef} className="shell__col relative">
                    {hasNewerBelow && (
                      <button
                        type="button"
                        onClick={scrollToLatest}
                        aria-label="Scroll to latest"
                        title="Scroll to latest"
                        className="scroll-latest fade-in"
                      >
                        <ArrowDown className="h-4 w-4" aria-hidden />
                      </button>
                    )}
                    <ChatBottombar {...composerProps} variant="shell" focusOnMount />
                    {isEmptyState && (
                      <ul aria-label="Suggested questions" className="new-chat__starters fade-in">
                        {starters.map((c) => {
                          const Icon = ICONS[c.icon];
                          return (
                            <li key={c.id}>
                              <button
                                type="button"
                                onClick={() => submitQuery(c.payload ?? c.label)}
                                className="new-chat__starter"
                              >
                                {Icon && <Icon className="h-[18px] w-[18px] shrink-0" />}
                                {c.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </main>

              {panel && PANEL_TITLES[panel.tool] && (
                <SidePanel
                  title={PANEL_TITLES[panel.tool]}
                  phase={panel.phase}
                  modal={panelIsModal}
                  blocked={hireOpen || paletteOpen || sidebarFloating}
                  onClose={closePanel}
                >
                  {/* Skills opens on the capability that was picked. Projects move inside the panel. */}
                  <div key={panel.tool === 'getSkills' ? (panel.detail ?? 0) : 0}>
                    <ToolArtifact tool={panel.tool} />
                  </div>
                </SidePanel>
              )}
            </div>

            {sidebarFloating && (
              <SidebarFloat
                {...sidebarProps}
                onClose={closeFloat}
                blocked={hireOpen || paletteOpen}
                showAppearance={!sidebarDocks}
              />
            )}
          </div>
        </PanelContext.Provider>
      )}
    </MotionConfig>
  );
};

/** Past this a paste folds, so it stays a message rather than a wall. */
const LONG_TEXT = 700;
const LONG_LINES = 10;

function UserBubble({
  turnKey,
  text,
  onRemove,
}: {
  turnKey: string;
  text: string;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  if (!text.trim()) return null;
  const long = text.length > LONG_TEXT || text.split('\n').length > LONG_LINES;
  return (
    <div
      data-turn-start
      data-turn-key={turnKey}
      tabIndex={-1}
      className="msg msg--user fade-in"
    >
      <p className="bubble">
        <span className={long && !expanded ? 'bubble__clamp' : undefined}>
          <span className="sr-only">You asked: </span>
          {text}
        </span>
      </p>
      <div className="flex items-center justify-end gap-0.5">
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="msg-action"
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
        <MessageActions
          align="end"
          getText={() => text}
          onRemove={onRemove}
          removeLabel="Remove this question and its answer"
        />
      </div>
    </div>
  );
}

function QuotaNotice({
  onQuick,
  onCommand,
}: {
  onQuick: () => void;
  onCommand: () => void;
}) {
  return (
    <div className="notice fade-in" role="alert">
      <p className="notice__label">Live answers paused</p>
      <div>
        <h3 className="notice__title">Live answers are paused for a moment</h3>
        <p className="mt-1">
          The AI model hit its rate limit. Everything else still works: the
          instant answers and the search menu are pre-written and need no AI call.
        </p>
      </div>
      <div className="notice__actions">
        <button onClick={onQuick} className="btn btn--secondary btn--sm">
          How to reach me
        </button>
        <button onClick={onCommand} className="btn btn--secondary btn--sm">
          Open the search menu
        </button>
      </div>
    </div>
  );
}

const FAILURE_COPY: Record<Exclude<FailureKind, 'rate'>, string> = {
  network: 'The connection dropped before the answer finished.',
  server: 'Something went wrong on my end, so this answer didn’t finish.',
  empty: 'The model came back with an empty answer.',
};

function FailureNotice({
  kind,
  onRetry,
}: {
  kind: Exclude<FailureKind, 'rate'>;
  onRetry: () => void;
}) {
  return (
    <div className="notice fade-in" role="alert">
      <p className="notice__label">{FAILURE_COPY[kind]}</p>
      <div className="notice__actions">
        <button onClick={onRetry} className="btn btn--secondary btn--sm">
          Retry
        </button>
      </div>
    </div>
  );
}

export default Chat;
