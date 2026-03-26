// TagsDropdown.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { fuzzyMatch } from './dropdownUtils';
import { Chevron, ItemCheckbox, type ItemState } from './DropdownPrimitives';
import { cls } from '../ButtonConstants';
export interface Tag {
  id: string;
  name: string;
  description?: string;
  isAdult?: boolean;
}

export interface TagCategory {
  category: string;
  cols?: number;
  isAdult?: boolean;
  tags: Tag[];
}

interface TagsDropdownProps {
  label?: string;
  categories: TagCategory[];
  included: string[];
  excluded: string[];
  onIncludedChange: (v: string[]) => void;
  onExcludedChange: (v: string[]) => void;
  placeholder?: string;
}

const CYCLE: Record<ItemState, ItemState> = {
  none: 'include',
  include: 'exclude',
  exclude: 'none',
};

const stateOf = (name: string, inc: string[], exc: string[]): ItemState =>
  inc.includes(name) ? 'include' : exc.includes(name) ? 'exclude' : 'none';

export const TagsDropdown: React.FC<TagsDropdownProps> = ({
  label,
  categories,
  included,
  excluded,
  onIncludedChange,
  onExcludedChange,
  placeholder = 'Any',
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [showAdult, setShowAdult] = useState(false);
  const [panelPosition, setPanelPosition] = useState<{
    top: number;
    left: number;
  }>({
    top: 0,
    left: 0,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPanelPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
      setTimeout(() => searchRef.current?.focus(), 40);
    } else {
      setSearch('');
    }
  }, [open]);

  const toggle = useCallback(
    (name: string) => {
      const cur = stateOf(name, included, excluded);
      const next = CYCLE[cur];
      const newInc = included.filter((x) => x !== name);
      const newExc = excluded.filter((x) => x !== name);
      if (next === 'include') onIncludedChange([...newInc, name]);
      else if (next === 'exclude') {
        onIncludedChange(newInc);
        onExcludedChange([...newExc, name]);
      } else {
        onIncludedChange(newInc);
        onExcludedChange(newExc);
      }
    },
    [included, excluded, onIncludedChange, onExcludedChange],
  );

  const clearAll = () => {
    onIncludedChange([]);
    onExcludedChange([]);
  };

  const total = included.length + excluded.length;
  const hasMix = included.length > 0 && excluded.length > 0;
  const borderColor =
    total === 0
      ? 'border-zinc-700'
      : hasMix
        ? 'border-purple-500/60'
        : included.length
          ? 'border-blue-500/60'
          : 'border-red-500/60';

  const triggerLabel =
    total === 0 ? (
      <span className="text-zinc-500 truncate">{placeholder}</span>
    ) : (
      <span className="flex items-center gap-1.5 min-w-0">
        <span className="truncate">{included[0] ?? `−${excluded[0]}`}</span>
        {total > 1 && (
          <span
            className={cls(
              'shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border leading-none',
              hasMix
                ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                : included.length
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-red-500/20 text-red-300 border-red-500/30',
            )}
          >
            +{total - 1}
          </span>
        )}
      </span>
    );

  const visibleCats = categories.filter((c) => showAdult || !c.isAdult);

  return (
    <div className="flex flex-col gap-1 shrink-0">
      {label && (
        <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest pl-0.5">
          {label}
        </span>
      )}

      {/* Trigger */}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((p) => !p)}
          className={cls(
            'relative flex items-center gap-2 pl-3.5 pr-9 py-2.5 bg-zinc-900 border rounded-xl text-sm cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-blue-500/70 transition-all w-45',
            borderColor,
          )}
        >
          {triggerLabel}
          {total > 0 ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-[10px] cursor-pointer"
            >
              ✕
            </button>
          ) : (
            <Chevron open={open} />
          )}
        </button>

        {/* Panel — fixed window below trigger */}
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed z-50 w-[min(96vw,600px)] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[75vh]"
              style={{
                top: `${panelPosition.top}px`,
                left: `${panelPosition.left}px`,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
                <span className="text-sm font-semibold text-white">
                  Select Tags
                </span>
                {total > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    Clear {total} active
                  </button>
                )}
              </div>

              {/* Search + adult toggle */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800 shrink-0">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tags…"
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <label className="flex items-center gap-2 cursor-pointer select-none shrink-0">
                  <input
                    type="checkbox"
                    checked={showAdult}
                    onChange={(e) => setShowAdult(e.target.checked)}
                    className="accent-blue-500 w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-zinc-500 whitespace-nowrap">
                    Show 18+ tags
                  </span>
                </label>
              </div>

              {/* Chips */}
              {total > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 py-2.5 border-b border-zinc-800 shrink-0">
                  {included.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/15 border border-blue-500/35 text-blue-300 text-[11px] rounded-lg"
                    >
                      {t}
                      <button
                        onClick={() => toggle(t)}
                        className="text-blue-400 hover:text-white transition-colors ml-0.5 leading-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {excluded.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500/15 border border-red-500/35 text-red-300 text-[11px] rounded-lg"
                    >
                      <span className="text-red-400 font-bold mr-0.5">−</span>
                      {t}
                      <button
                        onClick={() => toggle(t)}
                        className="text-red-400 hover:text-white transition-colors ml-0.5 leading-none"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Hint */}
              <p className="px-4 pt-2 text-[10px] text-zinc-700 shrink-0">
                Click to include · again to exclude · again to clear
              </p>

              {/* Categories */}
              <div className="flex-1 overflow-y-scroll p-4 flex flex-col gap-3 min-h-0">
                {visibleCats.map((cat) => {
                  const filtered = cat.tags.filter((t) =>
                    fuzzyMatch(search, t.name),
                  );
                  if (!filtered.length) return null;
                  const activeInCat = filtered.filter(
                    (t) =>
                      included.includes(t.name) || excluded.includes(t.name),
                  ).length;
                  const cols = cat.cols ?? 5;

                  return (
                    <div
                      key={cat.category}
                      className="border border-zinc-800 rounded-xl overflow-hidden"
                    >
                      {/* Category header */}
                      <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/60 border-b border-zinc-800">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          {cat.category}
                        </span>
                        {activeInCat > 0 && (
                          <span className="text-[10px] text-blue-400">
                            {activeInCat} active
                          </span>
                        )}
                        {cat.isAdult && (
                          <span className="text-[9px] px-1.5 py-0.5 bg-red-500/15 text-red-400 border border-red-500/25 rounded">
                            18+
                          </span>
                        )}
                      </div>

                      {/* Tag grid */}
                      <div
                        className="p-2"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${cols}, 1fr)`,
                          gap: 4,
                        }}
                      >
                        {filtered.map((tag) => {
                          const st = stateOf(tag.name, included, excluded);
                          return (
                            <div key={tag.id} className="relative group">
                              <button
                                type="button"
                                onClick={() => toggle(tag.name)}
                                className={cls(
                                  'w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-left text-[11px] border transition-all duration-150',
                                  st === 'include'
                                    ? 'bg-blue-500/10 border-blue-500/45 text-blue-300'
                                    : st === 'exclude'
                                      ? 'bg-red-500/10 border-red-500/45 text-red-300'
                                      : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-500 hover:bg-zinc-700/60 hover:text-white hover:border-zinc-600',
                                )}
                              >
                                <ItemCheckbox state={st} />
                                <span className="truncate flex-1">
                                  {tag.name}
                                </span>
                                {tag.isAdult && (
                                  <span className="text-red-500 text-[9px] shrink-0">
                                    18+
                                  </span>
                                )}
                              </button>

                              {/* Tooltip */}
                              {tag.description && (
                                <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 w-48 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2.5 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                  <p className="text-[11px] font-medium text-white mb-1">
                                    {tag.name}
                                  </p>
                                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                                    {tag.description}
                                  </p>
                                  <div className="absolute -bottom-1.25 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-950 border-r border-b border-zinc-700 rotate-45" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 shrink-0">
                <span className="text-xs text-zinc-600">
                  {included.length > 0
                    ? `${included.length} included`
                    : total > 0
                      ? `${excluded.length} excluded`
                      : 'No tags selected'}
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
