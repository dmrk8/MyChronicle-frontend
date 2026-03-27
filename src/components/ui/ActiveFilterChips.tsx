// ActiveFilterChips.tsx

type ChipVariant = 'purple' | 'pink' | 'red';

export interface ActiveChip {
  key: string;
  label: string;
  onRemove: () => void;
  variant?: ChipVariant;
  isExcluded?: boolean;
  loading?: boolean; // e.g. while debounce is pending
}

interface ActiveFilterChipsProps {
  chips: ActiveChip[];
  onClearAll: () => void;
  defaultVariant?: ChipVariant;
}

const variantStyles: Record<ChipVariant, string> = {
  purple:
    'bg-purple-600/20 border-purple-500/30 text-purple-300 [&>button]:text-purple-400',
  pink: 'bg-pink-600/20 border-pink-500/30 text-pink-300 [&>button]:text-pink-400',
  red: 'bg-red-600/20 border-red-500/30 text-red-300 [&>button]:text-red-400',
};

export const ActiveFilterChips = ({
  chips,
  onClearAll,
  defaultVariant = 'purple',
}: ActiveFilterChipsProps) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-zinc-500">Active:</span>

      {chips.map((chip) => {
        const resolvedVariant = chip.isExcluded
          ? 'red'
          : (chip.variant ?? defaultVariant);

        return (
          <span
            key={chip.key}
            className={`inline-flex items-center gap-1 px-2.5 py-1 border rounded-full text-xs ${variantStyles[resolvedVariant]}`}
          >
            {chip.label}

            {chip.loading && (
              <div className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin opacity-60" />
            )}

            <button
              onClick={chip.onRemove}
              className="hover:text-white ml-0.5 transition-colors"
              aria-label={`Remove ${chip.label}`}
            >
              ✕
            </button>
          </span>
        );
      })}

      <button
        onClick={onClearAll}
        className="text-xs text-zinc-500 hover:text-white transition-colors underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  );
};
