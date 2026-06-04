import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // <-- 1. Import createPortal
import { formatDateEnUS } from "../utils/date.ts";

// ... (interface DatePickerProps tetap sama)
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
  onBlur: _onBlur,
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

  // Efek untuk mengatur posisi popover
  useEffect(() => {
    if (isOpen && inputContainerRef.current) {
      const rect = inputContainerRef.current.getBoundingClientRect();
      const popoverHeight = 350; // Perkiraan tinggi popover
      const spaceBelow = window.innerHeight - rect.bottom;
      let style: React.CSSProperties = {
        left: `${rect.left}px`,
        width: `${rect.width > 288 ? rect.width : 288}px`, // Lebar minimal 72 (w-72)
      };

      if (spaceBelow < popoverHeight && rect.top > popoverHeight) {
        // Tampilkan di atas
        style.bottom = `${window.innerHeight - rect.top}px`;
        style.marginBottom = "8px";
      } else {
        // Tampilkan di bawah
        style.top = `${rect.bottom}px`;
        style.marginTop = "8px";
      }
      setPopoverStyle(style);
    }
  }, [isOpen]);

  // ... (sisa useEffect dan functions lainnya tetap sama)
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
            className="p-1 rounded-full text-white hover:bg-gray-600"
          >
            &lt;&lt;
          </button>
          <div className="font-bold text-white">
            {startYear + 1} - {startYear + 10}
          </div>
          <button
            onClick={() => handleYearChange(10)}
            className="p-1 rounded-full text-white hover:bg-gray-600"
          >
            &gt;&gt;
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {years.map((year) => (
            <button
              key={year}
              onClick={() => handleYearClick(year)}
              className={`p-2 rounded-md text-white hover:bg-yellow-500 hover:text-white ${
                draftDate.getFullYear() === year
                  ? "bg-yellow-500 text-white font-bold"
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
      "Des",
    ];
    return (
      <>
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => handleYearChange(-1)}
            className="p-1 rounded-full text-white hover:bg-gray-600"
          >
            &lt;
          </button>
          <button
            onClick={() => setViewMode("years")}
            className="font-bold text-white hover:text-yellow-400"
          >
            {viewDate.getFullYear()}
          </button>
          <button
            onClick={() => handleYearChange(1)}
            className="p-1 rounded-full text-white hover:bg-gray-600"
          >
            &gt;
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2 text-center">
          {months.map((month, index) => (
            <button
              key={month}
              onClick={() => handleMonthClick(index)}
              className={`p-2 rounded-md text-white hover:bg-yellow-500 hover:text-white ${
                viewDate.getMonth() === index
                  ? "bg-yellow-500 text-white font-bold"
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

  // Komponen Popover yang akan di-portal
  const PopoverContent = (
    <div
      ref={pickerRef}
      style={popoverStyle}
      className="fixed z-50 rounded-lg bg-[#1f2c44] p-4 shadow-lg border border-gray-700" // <-- Gunakan `fixed` dan z-index tinggi
      onMouseDown={(e) => e.preventDefault()}
    >
      {viewMode === "days" ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => handleMonthChange(-1)}
              className="p-1 rounded-full text-white hover:bg-gray-600"
            >
              &lt;
            </button>
            <button
              onClick={() => setViewMode("months")}
              className="font-bold text-white hover:text-yellow-400"
            >
              {viewDate.toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </button>
            <button
              onClick={() => handleMonthChange(1)}
              className="p-1 rounded-full text-white hover:bg-gray-600"
            >
              &gt;
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-sm text-gray-300">
            {days.map((day) => (
              <div key={day} className="font-medium text-gray-400">
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
                className={`p-1 rounded-full hover:bg-yellow-500 hover:text-white ${
                  isSelected(day + 1)
                    ? "bg-yellow-500 text-white font-bold"
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
      <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-700">
        <button
          onClick={handleCancel}
          className="px-3 py-1 rounded-md text-sm text-gray-300 hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleApply}
          className="px-3 py-1 rounded-md text-sm bg-yellow-500 text-white hover:bg-yellow-600"
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
          readOnly={readOnly || true}
          disabled={disabled}
          placeholder=" "
          // <-- 2. Perbaikan layout input
          className={`
            peer w-full cursor-pointer appearance-none bg-transparent 
            pl-4 pt-5 pb-2 text-gray-200 truncate
            ${icon ? "pr-10" : "pr-4"} 
            placeholder-transparent focus:outline-none
            ${
              error
                ? "border-b border-red-500 focus:border-red-500"
                : "border-b border-gray-500 focus:border-white"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : ""}
          `}
        />
        <label
          htmlFor={inputId}
          // <-- 3. Perbaikan layout label
          className={`
            absolute left-4 text-gray-400 transition-all duration-200 pointer-events-none
            truncate ${icon ? "right-10" : "right-4"}
            ${value || isOpen ? "top-0 text-sm" : "top-3.5 text-base"}
            peer-focus:top-0 peer-focus:text-sm 
            ${error ? "peer-focus:text-red-400" : "peer-focus:text-white"}
          `}
        >
          {label}
        </label>
        {icon && ( // <-- Ikon kini menggunakan posisi yang sama dengan input field lain
          <span className="absolute right-3 top-7 -translate-y-1/2 text-gray-400 pointer-events-none">
            {icon}
          </span>
        )}
      </div>

      {/* 4. Render Popover menggunakan Portal */}
      {isOpen && createPortal(PopoverContent, document.body)}

      {error && errorMessage && (
        <div className="mt-1.5 px-1 text-sm text-red-400">{errorMessage}</div>
      )}
    </div>
  );
};
