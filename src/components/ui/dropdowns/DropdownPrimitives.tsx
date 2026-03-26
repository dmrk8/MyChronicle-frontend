import React from 'react';
import { cls, DROPDOWN_WIDTH } from '../ButtonConstants';

// ─── Chevron ──────────────────────────────────────────────────────────────────

interface ChevronProps {
  open: boolean;
}

export const Chevron: React.FC<ChevronProps> = ({ open }) => (
  <span
    className={cls(
      'absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none transition-transform duration-200 text-[10px]',
      open && 'rotate-180',
    )}
  >
    ▼
  </span>
);

// ─── SearchInput ──────────────────────────────────────────────────────────────

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (val: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  inputRef,
  value,
  onChange,
  onKeyDown,
  placeholder = 'Search...',
}) => (
  <div className="p-2 border-b border-zinc-800">
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
    />
  </div>
);

// ─── DropdownShell ────────────────────────────────────────────────────────────

interface DropdownShellProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}

export const DropdownShell: React.FC<DropdownShellProps> = ({
  open,
  onClose,
  children,
  wide = false,
}) => {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className={cls(
          'absolute top-full mt-2 left-0 z-50 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden',
          wide ? 'w-[min(92vw,640px)]' : DROPDOWN_WIDTH,
        )}
        style={{ backdropFilter: 'blur(12px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  text?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  text = 'No matches',
}) => <p className="px-4 py-3 text-xs text-zinc-500 text-center">{text}</p>;

// ─── ClearFooter ──────────────────────────────────────────────────────────────

interface ClearFooterProps {
  count: number;
  onClear: () => void;
  label?: string;
}

export const ClearFooter: React.FC<ClearFooterProps> = ({
  count,
  onClear,
  label,
}) => {
  if (!count) return null;
  return (
    <div className="px-3 py-2 border-t border-zinc-800">
      <button
        onClick={onClear}
        className="w-full text-xs text-zinc-500 hover:text-white transition-colors py-0.5"
      >
        Clear {count} {label ?? 'selected'}
      </button>
    </div>
  );
};

// ─── ItemCheckbox (for multi-exclude) ────────────────────────────────────────

export type ItemState = 'none' | 'include' | 'exclude';

interface ItemCheckboxProps {
  state: ItemState;
}

export const ItemCheckbox: React.FC<ItemCheckboxProps> = ({ state }) => (
  <span
    className={cls(
      'w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors',
      state === 'include' && 'bg-blue-500 border-blue-500',
      state === 'exclude' && 'bg-red-500 border-red-500',
      state === 'none' && 'border-zinc-600 bg-transparent',
    )}
  >
    {state === 'include' && (
      <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6l3 3 5-5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
    {state === 'exclude' && (
      <svg className="w-2 h-2 text-white" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )}
  </span>
);
