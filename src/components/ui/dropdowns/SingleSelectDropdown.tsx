import React, { useState, useEffect, useRef } from 'react';
import { fuzzyMatch, type DropdownOption } from './dropdownUtils';
import { Chevron, DropdownShell, EmptyState } from './DropdownPrimitives';
import { BG_BASE, cls, FILTER_LABEL, TRIGGER_BASE } from '../ButtonConstants';
import { XMarkIcon } from '@heroicons/react/24/outline';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SingleSelectDropdownProps<T extends string | number = string> {
  /** Label rendered above the trigger button */
  label?: string;
  /** Currently selected value, or '' for none */
  value: T | '';
  onChange: (value: T | '') => void;
  /** Accept plain strings or { value, label } objects */
  options: DropdownOption[] | string[] | number[];
  /** Text shown when nothing is selected */
  placeholder?: string;
  /** Show a fuzzy-search input inside the dropdown. Default: true */
  searchable?: boolean;
  /** Allow any option, clearing all filters Default: true */
  allowClear?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SingleSelectDropdown<T extends string | number = string>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Any',
  searchable = true,
  allowClear = true,
}: SingleSelectDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalise options to { value, label }[]
  const normalised: DropdownOption[] = options.map((o) =>
    typeof o === 'object' ? o : { value: o, label: String(o) },
  );

  const filtered = normalised.filter((o) => fuzzyMatch(search, o.label));

  const select = (val: T | '') => {
    onChange(val);
    setOpen(false);
  };

  // Focus on open
  useEffect(() => {
    if (open && searchable) {
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open, searchable]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      return; // Skip effect if dropdown is closing
    }
    return () => {
      // Cleanup: reset state when dropdown closes
      setSearch('');
      setCursor(-1);
    };
  }, [open]);

  const onKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>,
  ) => {
    if (!open) return;
    const total = filtered.length;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((p) => Math.min(p + 1, total - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((p) => Math.max(p - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (cursor >= 0 && cursor < filtered.length)
        select(filtered[cursor].value as T);
    }
  };

  const displayLabel =
    value !== ''
      ? (normalised.find((o) => o.value === value)?.label ?? String(value))
      : placeholder;

  return (
    <div className="flex flex-col gap-1 shrink-0">
      {label && <span className={FILTER_LABEL}>{label}</span>}

      <div className="relative">
        {open && searchable ? (
          // Search input replacing the button when open
          <div
            className={cls(
              TRIGGER_BASE,
              ' justify-start border-blue-500/70 overflow-hidden',
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onKeyDown}
              className="bg-transparent text-white text-sm placeholder-zinc-400 focus:outline-none px-0 py-0 h-full min-w-0 w-full"
            />
            <Chevron />
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
              'justify-start',
              searchable ? 'cursor-text' : 'cursor-pointer',
              value !== ''
                ? 'border-blue-500/70 text-white'
                : open
                  ? 'border-blue-500/70 text-zinc-400'
                  : 'border-zinc-700 text-zinc-400',
            )}
          >
            <span className="truncate flex-1 text-left">{displayLabel}</span>

            {open ? (
              <Chevron />
            ) : value !== '' && allowClear ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  select('');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-[10px] cursor-pointer"
                aria-label="Clear selection"
              >
                <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <Chevron />
            )}
          </button>
        )}

        <DropdownShell open={open} onClose={() => setOpen(false)}>
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 && search && <EmptyState />}

            {filtered.map((opt, idx) => (
              <button
                key={opt.value}
                onClick={() => select(opt.value as T)}
                onMouseEnter={() => setCursor(idx)}
                className={cls(
                  'w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between',
                  cursor === idx ? BG_BASE : `hover:${BG_BASE}`,
                  value === opt.value
                    ? 'text-blue-400 font-medium'
                    : 'text-white',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </DropdownShell>
      </div>
    </div>
  );
}
