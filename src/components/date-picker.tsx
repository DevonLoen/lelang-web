import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatDateEnUS } from "../utils/date.ts";

interface DatePickerProps {
  label: string;
  name?: string;
  id?: string;
  value: string;
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  label,
  name,
  id,
  value,
  icon,
  onChange,
  onBlur,
  error = false,
  errorMessage = "",
  disabled = false,
  readOnly = false,
}) => {
  const inputId = id || name || "date-picker";
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"days" | "months" | "years">("days");
  const [viewDate, setViewDate] = useState(
    value && !isNaN(new Date(value).getTime()) ? new Date(value) : new Date()
  );
  const [draftDate, setDraftDate] = useState(
    value && !isNaN(new Date(value).getTime()) ? new Date(value) : new Date()
  );

  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      const popoverHeight = 350;
      const spaceBelow = window.innerHeight - rect.bottom;
      const style: React.CSSProperties = {
        left: `${rect.left}px`,
        width: `${rect.width > 288 ? rect.width : 288}px`,
      };

      if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
        style.bottom = `${window.innerHeight - rect.top}px`;
        style.marginBottom = "8px";
      } else {
        style.top = `${rect.bottom}px`;
        style.marginTop = "8px";
      }
      setPopoverStyle(style);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node) &&
        !inputContainerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const newDate =
      value && !isNaN(new Date(value).getTime()) ? new Date(value) : new Date();
    setViewDate(newDate);
    setDraftDate(newDate);
    if (!isOpen) {
      setViewMode("days");
    }
  }, [value, isOpen]);

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  ).getDay();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handleMonthChange = (offset: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const handleYearChange = (offset: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(newDate.getFullYear() + offset);
      return newDate;
    });
  };

  const handleDayClick = (day: number) => {
    const newSelectedDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day
    );
    setDraftDate(newSelectedDate);
  };

  const handleMonthClick = (monthIndex: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(monthIndex);
      return newDate;
    });
    setViewMode("days");
  };

  const handleYearClick = (year: number) => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setViewMode("months");
  };

  const handleApply = () => {
    const event = {
      target: {
        name: name,
        value: formatDateEnUS(draftDate),
      },
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
    setIsOpen(false);
    setTimeout(() => inputRef.current?.blur(), 0);
  };

  const handleCancel = () => {
    setIsOpen(false);
    setTimeout(() => inputRef.current?.blur(), 0);
  };

  const isSelected = (day: number) => {
    if (!draftDate) return false;
    return (
      draftDate.getDate() === day &&
      draftDate.getMonth() === viewDate.getMonth() &&
      draftDate.getFullYear() === viewDate.getFullYear()
    );
  };
  const renderYears = () => {
    const currentYear = viewDate.getFullYear();
    const startYear = currentYear - (currentYear % 10) - 1;
    const years = Array.from({ length: 12 }, (_, i) => startYear + i);
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleYearChange(-10)}
            className="rounded-lg px-2 py-1 text-white transition-colors hover:bg-white/10"
          >
            &lt;&lt;
          </button>
          <div className="font-bold text-white">
            {startYear + 1} - {startYear + 10}
          </div>
          <button
            onClick={() => handleYearChange(10)}
            className="rounded-lg px-2 py-1 text-white transition-colors hover:bg-white/10"
          >
            &gt;&gt;
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`rounded-lg p-2 text-white transition-colors hover:bg-amber-400 hover:text-slate-950 ${
                draftDate.getFullYear() === year
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : ""
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </>
    );
  };
  const renderMonths = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleYearChange(-1)}
            className="rounded-lg px-2 py-1 text-white transition-colors hover:bg-white/10"
          >
            &lt;
          </button>
          <button
            onClick={() => setViewMode("years")}
            className="font-bold text-white transition-colors hover:text-amber-200"
          >
            {viewDate.getFullYear()}
          </button>
          <button
            onClick={() => handleYearChange(1)}
            className="rounded-lg px-2 py-1 text-white transition-colors hover:bg-white/10"
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthClick(index)}
              className={`rounded-lg p-2 text-white transition-colors hover:bg-amber-400 hover:text-slate-950 ${
                viewDate.getMonth() === index
                  ? "bg-amber-400 text-slate-950 font-bold"
                  : ""
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </>
    );
  };

  const PopoverContent = (
    <div
      ref={pickerRef}
      style={popoverStyle}
      className="fixed z-50 rounded-lg border border-white/10 bg-[#172235] p-4 shadow-xl shadow-slate-950/25"
      onMouseDown={(e) => e.preventDefault()}
    >
      {viewMode === "days" ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleMonthChange(-1)}
              className="rounded-lg px-2 py-1 text-white transition-colors hover:bg-white/10"
            >
              &lt;
            </button>
            <button
              onClick={() => setViewMode("months")}
              className="font-bold text-white transition-colors hover:text-amber-200"
            >
              {viewDate.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </button>
            <button
              onClick={() => handleMonthChange(1)}
              className="rounded-lg px-2 py-1 text-white transition-colors hover:bg-white/10"
            >
              &gt;
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm text-slate-300">
            {days.map((day) => (
              <div key={day} className="font-medium text-slate-400">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`}></div>
            ))}
            {Array.from({ length: daysInMonth }).map((_, day) => (
              <button
                key={day + 1}
                onClick={() => handleDayClick(day + 1)}
                className={`rounded-lg p-1 transition-colors hover:bg-amber-400 hover:text-slate-950 ${
                  isSelected(day + 1)
                    ? "bg-amber-400 text-slate-950 font-bold"
                    : ""
                }`}
              >
                {day + 1}
              </button>
            ))}
          </div>
        </>
      ) : viewMode === "months" ? (
        renderMonths()
      ) : (
        renderYears()
      )}
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-white/10">
        <button
          onClick={handleCancel}
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="rounded-lg bg-amber-400 px-3 py-1.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300"
        >
          Set
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <div className="relative" ref={inputContainerRef}>
        <input
          ref={inputRef}
          type="text"
          id={inputId}
          name={name}
          value={value}
          onFocus={() => !disabled && setIsOpen(true)}
          onBlur={onBlur}
          readOnly={readOnly || true}
          disabled={disabled}
          placeholder=" "
          className={`
            peer h-14 w-full cursor-pointer appearance-none rounded-lg bg-white/[0.06]
            pl-4 pt-5 pb-2 text-white truncate shadow-sm ring-1 ring-white/10 transition-all
            ${icon ? "pr-11" : "pr-4"}
            placeholder-transparent outline-none
            ${
              error
                ? "ring-red-400 focus:ring-red-400"
                : "focus:bg-white/[0.08] focus:ring-amber-400/80"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
          `}
        />
        <label
          htmlFor={inputId}
          className={`
            absolute left-4 text-slate-400 transition-all duration-200 pointer-events-none
            truncate ${icon ? "right-11" : "right-4"}
            ${value || isOpen ? "top-1.5 text-xs font-medium" : "top-4 text-sm"}
            peer-focus:top-1.5 peer-focus:text-xs peer-focus:font-medium
            ${error ? "peer-focus:text-red-300" : "peer-focus:text-amber-200"}
          `}
        >
          {label}
        </label>
        {icon && (
          <span className="absolute right-3 top-7 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </span>
        )}
      </div>

      {isOpen && createPortal(PopoverContent, document.body)}

      {error && errorMessage && (
        <div className="mt-1.5 px-1 text-sm text-red-400">{errorMessage}</div>
      )}
    </div>
  );
};
