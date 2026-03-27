import { useRef } from 'react';
import {
  ArrowLongRightIcon,
  CalendarIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { BG_BASE, cls, FILTER_LABEL } from './ButtonConstants';

interface DateRangeFilterProps {
  label: string;
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  disabled?: boolean;
  disabledTitle?: string;
}

function DateInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isActive = !!value;

  return (
    <div
      className={cls(
        'relative flex items-center gap-2 pl-3 pr-2 py-2 rounded-xl border text-sm transition-all duration-200',
        BG_BASE,
        isActive ? 'border-blue-500/70' : 'border-zinc-800',
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
      )}
      onClick={() => !disabled && inputRef.current?.showPicker?.()}
    >
      <CalendarIcon
        className={cls(
          'w-3.5 h-3.5 shrink-0 transition-colors',
          isActive ? 'text-blue-400' : 'text-zinc-500',
        )}
      />
      <span className={cls('text-xs min-w-19')}>
        {value
          ? new Date(value + 'T00:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : placeholder}
      </span>
      {isActive && !disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange('');
          }}
          className="ml-0.5 rounded-full p-0.5 text-zinc-400 hover:text-white  transition-colors"
        >
          <XMarkIcon className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
      <input
        ref={inputRef}
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed pointer-events-none"
        tabIndex={-1}
      />
    </div>
  );
}

export function DateRangeFilter({
  label,
  from,
  to,
  onFromChange,
  onToChange,
  disabled,
  disabledTitle,
}: DateRangeFilterProps) {
  return (
    <div
      className="flex flex-col gap-1.5 shrink-0"
      title={disabled ? disabledTitle : undefined}
    >
      <label className={FILTER_LABEL}>{label}</label>
      <div className="flex items-center gap-2">
        <DateInput
          value={from}
          onChange={onFromChange}
          placeholder="From"
          disabled={disabled}
        />
        <ArrowLongRightIcon
          className="w-3.5 h-3.5 text-zinc-600"
          aria-hidden="true"
        />
        <DateInput
          value={to}
          onChange={onToChange}
          placeholder="To"
          disabled={disabled}
        />
      </div>
    </div>
  );
}
