// ─── Shared class strings ─────────────────────────────────────────────────────

export const BUTTON_BASE =
  'py-2.5 text-sm border rounded-xl transition-all duration-200 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/70 cursor-pointer select-none';

export const DROPDOWN_WIDTH = 'w-45';

export const TRIGGER_BASE = `relative flex items-center gap-2 pl-3.5 pr-9 ${BUTTON_BASE} ${DROPDOWN_WIDTH}`;

export const cls = (...parts: (string | false | null | undefined)[]): string =>
  parts.filter(Boolean).join(' ');
