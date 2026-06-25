import { CalendarDays, ChevronDown, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minValue?: string;
  helperText?: string;
  error?: string;
}

const pad = (value: number) => String(value).padStart(2, '0');

// eslint-disable-next-line react-refresh/only-export-components
export const toLocalDateTimeInputValue = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;

const parseValue = (value: string) => {
  const [date = '', time = ''] = value.split('T');
  return { date, time };
};

const parseClock = (time: string) => {
  const [hourText = '09', minuteText = '00'] = time.split(':');
  const hour24 = Number(hourText);
  const minute = Number(minuteText);
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 || 12;

  return {
    hour: pad(Number.isFinite(hour12) ? hour12 : 9),
    minute: pad(Number.isFinite(minute) ? minute : 0),
    period,
  };
};

const to24HourTime = (hour: string, minute: string, period: string) => {
  const parsedHour = Number(hour);
  const hour24 = period === 'PM'
    ? (parsedHour === 12 ? 12 : parsedHour + 12)
    : (parsedHour === 12 ? 0 : parsedHour);

  return `${pad(hour24)}:${minute}`;
};

const combineValue = (date: string, time: string) => {
  if (!date && !time) return '';
  return `${date || new Date().toISOString().slice(0, 10)}T${time || '09:00'}`;
};

const formatSummary = (value: string) => {
  if (!value) return 'Select date and time';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Invalid date and time';
  return parsed.toLocaleString('en-US', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export function DateTimePicker({
  label,
  value,
  onChange,
  minValue,
  helperText,
  error,
}: DateTimePickerProps) {
  const { date, time } = parseValue(value);
  const min = minValue ? parseValue(minValue) : null;
  const clock = parseClock(time);
  const timeDisabled = !date;
  const hourOptions = Array.from({ length: 12 }, (_, index) => pad(index + 1));
  const minuteOptions = Array.from({ length: 60 }, (_, index) => pad(index));
  const updateTime = (next: Partial<typeof clock>) => {
    const nextClock = { ...clock, ...next };
    onChange(combineValue(date, to24HourTime(nextClock.hour, nextClock.minute, nextClock.period)));
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      <div
        className={cn(
          'rounded-lg border bg-white p-3 shadow-sm transition-all focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-400/20',
          error ? 'border-red-300' : 'border-slate-200 hover:border-amber-300',
        )}
      >
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <CalendarDays className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className={cn('truncate text-sm font-bold', value ? 'text-slate-950' : 'text-slate-400')}>
              {formatSummary(value)}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Choose date, then exact time</p>
          </div>
        </div>

        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="group relative block">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-600">
              <CalendarDays className="h-4 w-4" />
            </span>
            <input
              type="date"
              value={date}
              min={min?.date}
              onChange={(event) => onChange(combineValue(event.target.value, time))}
              className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-9 text-sm font-semibold text-slate-900 outline-none transition-all hover:bg-white focus:border-amber-400 focus:bg-white"
            />
          </label>

          <div className="group relative">
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-amber-600">
              <Clock className="h-4 w-4" />
            </span>
            <div className={cn(
              'grid h-11 grid-cols-[1fr_1fr_1.1fr] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 pl-8 transition-all group-focus-within:border-amber-400 group-focus-within:bg-white',
              timeDisabled && 'opacity-60',
            )}>
              <TimeSelect
                ariaLabel="Hour"
                value={clock.hour}
                options={hourOptions}
                disabled={timeDisabled}
                onChange={(hour) => updateTime({ hour })}
              />
              <TimeSelect
                ariaLabel="Minute"
                value={clock.minute}
                options={minuteOptions}
                disabled={timeDisabled}
                onChange={(minute) => updateTime({ minute })}
              />
              <TimeSelect
                ariaLabel="AM or PM"
                value={clock.period}
                options={['AM', 'PM']}
                disabled={timeDisabled}
                onChange={(period) => updateTime({ period })}
              />
            </div>
          </div>
        </div>
      </div>
      {(error || helperText) && (
        <p className={cn('mt-1.5 text-xs leading-5', error ? 'font-medium text-red-600' : 'text-slate-500')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
}

function TimeSelect({
  ariaLabel,
  value,
  options,
  disabled,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  options: string[];
  disabled: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="relative min-w-0 border-l border-slate-200 first:border-l-0">
      <select
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        className="h-full w-full appearance-none bg-transparent py-0 pl-2 pr-5 text-center text-[13px] font-bold text-slate-900 outline-none transition-colors hover:bg-white disabled:cursor-not-allowed"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />
    </label>
  );
}
