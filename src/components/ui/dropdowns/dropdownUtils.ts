// ─── Shared types ─────────────────────────────────────────────────────────────

export interface DropdownOption {
  value: string | number;
  label: string;
}

export interface GroupedOptions {
  category: string;
  items: string[];
}

// ─── Shared utilities ─────────────────────────────────────────────────────────

export const fuzzyMatch = (query: string, target: string): boolean => {
  if (!query) return true;
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) qi++;
  }
  return qi === q.length;
};
