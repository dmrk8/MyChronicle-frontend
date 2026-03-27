import { useRef, useState, useEffect, useCallback } from 'react';
import { TagIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { cls, FILTER_LABEL } from './ButtonConstants';

interface Keyword {
  id: number;
  name: string;
}

interface KeywordsFilterProps {
  selected: Keyword[];
  suggestions: Keyword[];
  isFetching: boolean;
  inputValue: string;
  onInputChange: (value: string) => void;
  onAdd: (kw: Keyword) => void;
  onRemove: (id: number) => void;
}

export function KeywordsFilter({
  suggestions,
  isFetching,
  inputValue,
  onInputChange,
  onAdd,
}: KeywordsFilterProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const showDropdown = open && inputValue.trim().length > 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current !== e.target
      ) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showDropdown && e.key !== 'ArrowDown') return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
        setActiveIndex((p) => Math.min(p + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((p) => Math.max(p - 1, 0));
      } else if (e.key === 'Escape') {
        setOpen(false);
        setActiveIndex(-1);
      } else if (
        e.key === 'Enter' &&
        activeIndex >= 0 &&
        suggestions[activeIndex]
      ) {
        e.preventDefault();
        onAdd(suggestions[activeIndex]);
        setOpen(false);
        setActiveIndex(-1);
      }
    },
    [showDropdown, suggestions, activeIndex, onAdd],
  );

  return (
    <div className="flex flex-col gap-1.5 shrink-0">
      <label className={FILTER_LABEL}>Keywords</label>

      <div className="flex flex-col gap-2">
        {/* Input */}
        <div className="relative">
          <div
            className={cls(
              'flex items-center gap-2 pl-3 pr-3 py-2 rounded-xl border border-zinc-800 bg-zinc-950 transition-all duration-200',
              'focus-within:ring-2 focus-within:ring-blue-500/60',
            )}
          >
            {isFetching ? (
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <MagnifyingGlassIcon
                className={cls(
                  'w-3.5 h-3.5 shrink-0 transition-colors',
                  inputValue ? 'text-blue-400' : 'text-zinc-500',
                )}
              />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. time travel…"
              value={inputValue}
              onChange={(e) => {
                onInputChange(e.target.value);
                setOpen(true);
              }}
              onFocus={() => {
                if (inputValue.trim()) setOpen(true);
              }}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none w-40 min-w-0"
            />
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              className="absolute top-full mt-1.5 left-0 right-0 z-50 bg-zinc-950 backdrop-blur-xl border border-zinc-700 rounded-xl shadow-2xl overflow-hidden"
            >
              {isFetching ? (
                <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-zinc-400">
                  <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Searching…
                </div>
              ) : suggestions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-zinc-500">
                  No keywords found
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto py-1">
                  {suggestions.map((kw, idx) => (
                    <button
                      key={kw.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        onAdd(kw);
                        setOpen(false);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cls(
                        'w-full text-left px-3.5 py-2.5 text-sm text-white flex items-center gap-2.5 transition-colors',
                        activeIndex === idx
                          ? 'bg-blue-600/30'
                          : 'hover:bg-zinc-700/60',
                      )}
                    >
                      <TagIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{kw.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
