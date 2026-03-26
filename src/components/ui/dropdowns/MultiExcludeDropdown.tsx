import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fuzzyMatch } from './dropdownUtils';
import { cls, TRIGGER_BASE } from '../ButtonConstants';
import {
  Chevron,
  DropdownShell,
  EmptyState,
  ItemCheckbox,
  type ItemState,
} from './DropdownPrimitives';

// ─── Types ────────────────────────────────────────────────────────────────────

/** A flat list of strings, or a list of grouped categories */
export type MultiExcludeOptions =
  | string[]
  | { category: string; items: string[] }[];

interface MultiExcludeDropdownProps {
  /** Label rendered above the trigger button */
  label?: string;
  /** Items currently in the "include" (positive filter) set */
  included: string[];
  /** Items currently in the "exclude" (negative filter) set */
  excluded: string[];
  onIncludedChange: (included: string[]) => void;
  onExcludedChange: (excluded: string[]) => void;
  /**
   * Either a flat string[] or a { category, items }[] for grouped rendering.
   * Grouping is inferred automatically.
   */
  options: MultiExcludeOptions;
  /** Text shown when nothing is selected */
  placeholder?: string;
  /** Show fuzzy-search input. Default: true */
  searchable?: boolean;
  /**
   * Expand the dropdown panel to a wider size (useful for grouped tags).
   * Default: false
   */
  wide?: boolean;
  /** Optional hint text shown below the search bar */
  hint?: string;
}

// ─── Cycle: none → include → exclude → none ──────────────────────────────────

const CYCLE: Record<ItemState, ItemState> = {
  none: 'include',
  include: 'exclude',
  exclude: 'none',
};

const stateOf = (
  id: string,
  included: string[],
  excluded: string[],
): ItemState => {
  if (included.includes(id)) return 'include';
  if (excluded.includes(id)) return 'exclude';
  return 'none';
};

// ─── Component ────────────────────────────────────────────────────────────────

export const MultiExcludeDropdown: React.FC<MultiExcludeDropdownProps> = ({
  label,
  included,
  excluded,
  onIncludedChange,
  onExcludedChange,
  options,
  placeholder = 'Any',
  searchable = true,
  wide = false,
  hint,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);

  // ── Detect grouped vs flat ────────────────────────────────────────────────
  const isGrouped =
    options.length > 0 &&
    typeof options[0] === 'object' &&
    'category' in (options[0] as object);

  // ── Flattened list for keyboard navigation ────────────────────────────────
  const flat: string[] = isGrouped
    ? (options as { category: string; items: string[] }[]).flatMap((g) =>
        g.items.filter((item) => fuzzyMatch(search, item)),
      )
    : (options as string[]).filter((o) => fuzzyMatch(search, o));

  // Filtered groups (for grouped rendering)
  const filteredGrouped = isGrouped
    ? (options as { category: string; items: string[] }[])
        .map((g) => ({
          ...g,
          items: g.items.filter((item) => fuzzyMatch(search, item)),
        }))
        .filter((g) => g.items.length > 0)
    : null;

  // ── Toggle: cycles none → include → exclude → none ───────────────────────
  const toggle = useCallback(
    (id: string) => {
      const current = stateOf(id, included, excluded);
      const next = CYCLE[current];
      const newIncluded = included.filter((x) => x !== id);
      const newExcluded = excluded.filter((x) => x !== id);

      if (next === 'include') {
        onIncludedChange([...newIncluded, id]);
        onExcludedChange(newExcluded);
      } else if (next === 'exclude') {
        onIncludedChange(newIncluded);
        onExcludedChange([...newExcluded, id]);
      } else {
        onIncludedChange(newIncluded);
        onExcludedChange(newExcluded);
      }
    },
    [included, excluded, onIncludedChange, onExcludedChange],
  );

  // Focus on open
  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 40);
    }
  }, [open]);

  // Reset on close
  useEffect(() => {
    return () => {
      if (!open) {
        setSearch('');
        setCursor(-1);
      }
    };
  }, [open]);

  const onKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement | HTMLInputElement>,
  ) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((p) => Math.min(p + 1, flat.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((p) => Math.max(p - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' && cursor >= 0 && cursor < flat.length) {
      e.preventDefault();
      toggle(flat[cursor]);
    }
  };

  // ── Trigger label ─────────────────────────────────────────────────────────
  // Shows: first included item (or "−first excluded" if no included), then
  // +N badge for all remaining active items.
  const totalActive = included.length + excluded.length;
  const hasExcluded = excluded.length > 0;

  const triggerContent = (() => {
    if (totalActive === 0) {
      return <span className="truncate text-zinc-400">{placeholder}</span>;
    }

    const firstLabel = included.length > 0 ? included[0] : `−${excluded[0]}`;
    const rest = totalActive - 1;

    return (
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="truncate">{firstLabel}</span>
        {rest > 0 && (
          <span
            className={cls(
              'shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none border',
              hasExcluded && included.length === 0
                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                : hasExcluded
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30',
            )}
          >
            +{rest}
          </span>
        )}
      </span>
    );
  })();

  // ── Render individual item ────────────────────────────────────────────────
  const renderItem = (item: string) => {
    const state = stateOf(item, included, excluded);
    const flatIdx = flat.indexOf(item);
    const isFocused = cursor === flatIdx && flatIdx >= 0;

    return (
      <button
        key={item}
        type="button"
        onClick={() => toggle(item)}
        onMouseEnter={() => setCursor(flat.indexOf(item))}
        className={cls(
          'w-full flex items-center gap-2.5 px-4 py-2 text-xs text-left transition-colors',
          isFocused ? 'bg-zinc-800' : 'hover:bg-zinc-800',
          state === 'include' && 'text-blue-200',
          state === 'exclude' && 'text-red-200',
          state === 'none' && 'text-white',
        )}
      >
        <ItemCheckbox state={state} />
        <span className="truncate flex-1">{item}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-1 shrink-0">
      {label && (
        <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest pl-0.5">
          {label}
        </span>
      )}

      <div className="relative">
        {open ? (
          // Search input with live selection display when open
          <div
            className={cls(
              TRIGGER_BASE,
              'pl-3.5 justify-start border-blue-500/70 overflow-hidden',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Show selected item and badge while dropdown is open */}
            {totalActive > 0 && (
              <span className="flex items-center gap-1.5 min-w-0 shrink-0 pr-2">
                <span className="truncate text-sm">
                  {included.length > 0 ? included[0] : `−${excluded[0]}`}
                </span>
                {totalActive > 1 && (
                  <span
                    className={cls(
                      'shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none border',
                      hasExcluded && included.length === 0
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : hasExcluded
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    )}
                  >
                    +{totalActive - 1}
                  </span>
                )}
              </span>
            )}
            {searchable && (
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={onKeyDown}
                className="bg-transparent text-white text-sm placeholder-zinc-400 focus:outline-none px-0 py-0 h-full min-w-0 w-full"
              />
            )}
            {totalActive > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onIncludedChange([]);
                  onExcludedChange([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-[10px] cursor-pointer"
                aria-label="Clear selections"
              >
                ✕
              </button>
            ) : (
              <Chevron open={open} />
            )}
          </div>
        ) : (
          // Normal trigger button when closed
          <button
            type="button"
            onClick={() => setOpen((p) => !p)}
            onKeyDown={onKeyDown}
            aria-haspopup="listbox"
            aria-expanded={open}
            className={cls(
              TRIGGER_BASE,
              included.length > 0 &&
                excluded.length === 0 &&
                'border-blue-500/70 text-white',
              excluded.length > 0 &&
                included.length === 0 &&
                'border-red-500/70 text-white',
              included.length > 0 &&
                excluded.length > 0 &&
                'border-purple-500/70 text-white',
              totalActive === 0 && 'border-zinc-700 text-zinc-400',
            )}
          >
            {triggerContent}
            {totalActive > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onIncludedChange([]);
                  onExcludedChange([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-[10px] cursor-pointer"
                aria-label="Clear selections"
              >
                ✕
              </button>
            ) : (
              <Chevron open={open} />
            )}
          </button>
        )}

        {/* ── Dropdown panel ── */}
        <DropdownShell open={open} onClose={() => setOpen(false)} wide={wide}>
          {hint && (
            <p className="px-4 py-1.5 text-[10px] text-zinc-600 border-b border-zinc-800">
              {hint}
            </p>
          )}

          {/* ── List ── */}
          <div
            className={cls(
              'overflow-y-auto py-1',
              wide ? 'max-h-96' : 'max-h-64',
            )}
          >
            {flat.length === 0 && search ? (
              <EmptyState />
            ) : isGrouped && filteredGrouped ? (
              filteredGrouped.map((group) => {
                const activeInGroup = group.items.filter(
                  (i) => included.includes(i) || excluded.includes(i),
                ).length;
                return (
                  <div key={group.category}>
                    <div className="px-4 py-1.5 bg-zinc-800/50 border-b border-t border-zinc-800 flex items-center gap-2">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                        {group.category}
                      </span>
                      {activeInGroup > 0 && (
                        <span className="text-[9px] text-blue-400">
                          {activeInGroup} active
                        </span>
                      )}
                    </div>
                    {group.items.map((item) => renderItem(item))}
                  </div>
                );
              })
            ) : (
              flat.map((item) => renderItem(item))
            )}
          </div>
        </DropdownShell>
      </div>
    </div>
  );
};
