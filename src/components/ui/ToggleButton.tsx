import { useRef } from 'react';
import { cls } from './ButtonConstants';
interface ToggleButtonProps {
  /** Label rendered above the button */
  label?: string;
  /** Whether the button is currently selected */
  selected: boolean;
  /** Callback when button is clicked */
  onChange: (selected: boolean) => void;
  /** Text shown on the button */
  text: string;
}

export function ToggleButton({
  label,
  selected,
  onChange,
  text,
}: ToggleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col gap-1 shrink-0">
      {label && (
        <span className="text-zinc-500 text-[10px] font-semibold uppercase tracking-widest pl-0.5">
          {label}
        </span>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => {
          onChange(!selected);
          buttonRef.current?.blur();
        }}
        className={cls(
          'px-4 py-2.5 text-sm border rounded-xl transition-all duration-200 bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-blue-500/70 cursor-pointer select-none',
          selected
            ? 'border-blue-500 text-white'
            : 'border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500',
        )}
      >
        {text}
      </button>
    </div>
  );
}
