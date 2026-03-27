import React, { useState, useEffect, useRef } from 'react';
import { fuzzyMatch } from './dropdownUtils';
import { Chevron, DropdownShell, EmptyState } from './DropdownPrimitives';
import { cls, FILTER_LABEL, TRIGGER_BASE } from '../ButtonConstants';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MultiSelectDropdownProps<T> {
  /** Label rendered above the trigger button */
  label?: string;
  /** Array of currently selected items */
  selected: T[];
  onChange: (selected: T[]) => void;
  /** Full list of options */
  options: T[];
  /** Extracts a unique key from an option — defaults to String(option) */
  getId?: (option: T) => string | number;
  /** Extracts the display string from an option — defaults to String(option) */
  getLabel?: (option: T) => string;
  /** Text shown when nothing is selected */
  placeholder?: string;
  /** Show fuzzy-search input. Default: true */
  searchable?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MultiSelectDropdown<T>({
  label,
  selected,
  onChange,
  options,
  getId = (o) => String(o),
  getLabel = (o) => String(o),
  placeholder = 'Any',
  searchable = true,
}: MultiSelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((o) => fuzzyMatch(search, getLabel(o)));

  const isSelected = (opt: T) => selected.some((s) => getId(s) === getId(opt));

  const toggle = (opt: T) => {
    onChange(
      isSelected(opt)
        ? selected.filter((s) => getId(s) !== getId(opt))
        : [...selected, opt],
    );
  };

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 40);
    }
  }, [open]);

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
      setCursor((p) => Math.min(p + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((p) => Math.max(p - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter' && cursor >= 0 && cursor < filtered.length) {
      e.preventDefault();
      toggle(filtered[cursor]);
    }
  };

  // ── Trigger label ──────────────────────────────────────────────────────────
  // Shows: "Action +3" where "Action" is the first selected item and "+3" is
  // the count of remaining selected items.
  const triggerContent = (() => {
    if (selected.length === 0) {
      return <span className="truncate text-zinc-400">{placeholder}</span>;
    }
    const first = getLabel(selected[0]);
    const rest = selected.length - 1;
    return (
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="truncate">{first}</span>
        {rest > 0 && (
          <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none bg-blue-500/20 text-blue-300 border border-blue-500/30">
            +{rest}
          </span>
        )}
      </span>
    );
  })();

  return (
    <div className="flex flex-col gap-1 shrink-0">
      {label && <span className={FILTER_LABEL}>{label}</span>}

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
            {/* Show selected items and badge while dropdown is open */}
            {selected.length > 0 && (
              <span className="flex items-center gap-1.5 min-w-0 shrink-0 pr-2">
                <span className="truncate text-sm">
                  {getLabel(selected[0])}
                </span>
                {selected.length > 1 && (
                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    +{selected.length - 1}
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
                placeholder={selected.length === 0 ? placeholder : ''}
                className="bg-transparent text-white text-sm placeholder-zinc-400 focus:outline-none px-0 py-0 h-full min-w-0 w-full"
              />
            )}
            {selected.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-[10px] cursor-pointer"
                aria-label="Clear selections"
              >
                <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <Chevron />
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
              selected.length > 0
                ? 'border-blue-500/70 text-white'
                : 'border-zinc-700 text-zinc-400',
            )}
          >
            {triggerContent}
            {selected.length > 0 ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-[10px] cursor-pointer"
                aria-label="Clear selections"
              >
                ✕
              </button>
            ) : (
              <Chevron />
            )}
          </button>
        )}

        {/* ── Dropdown panel ── */}
        <DropdownShell open={open} onClose={() => setOpen(false)}>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && search ? (
              <EmptyState />
            ) : (
              filtered.map((opt, idx) => {
                const sel = isSelected(opt);
                return (
                  <label
                    key={getId(opt)}
                    onMouseEnter={() => setCursor(idx)}
                    onClick={() => toggle(opt)}
                    className={cls(
                      'flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors',
                      cursor === idx ? 'bg-zinc-800' : 'hover:bg-zinc-800',
                    )}
                  >
                    {/* Checkbox */}
                    <span
                      className={cls(
                        'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors',
                        sel
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-zinc-600 bg-transparent',
                      )}
                    >
                      {sel && (
                        <svg
                          className="w-2 h-2 text-white"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>

                    <span
                      className={cls(
                        'text-xs',
                        sel ? 'text-blue-200' : 'text-white',
                      )}
                    >
                      {getLabel(opt)}
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </DropdownShell>
      </div>
    </div>
  );
}
