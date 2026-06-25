import React from "react";

interface DropdownOption {
  value: string | number;
  label: string;
}

interface DropdownFieldProps {
  label: string;
  name?: string;
  id?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void;
  options: DropdownOption[];
  error?: boolean;
  errorMessage?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  name,
  id,
  value,
  onChange,
  onBlur,
  options,
  error = false,
  errorMessage = "",
  icon,
  disabled = false,
}) => {
  const selectId = id || name || "dropdown-field";

  const labelClasses = `
    absolute left-4 text-slate-400 transition-all duration-200 pointer-events-none
    truncate ${icon ? "right-16" : "right-10"}
    ${
      value
        ? "top-1.5 text-xs font-medium"
        : "top-4 text-sm"
    }
    peer-focus:top-1.5 peer-focus:text-xs peer-focus:font-medium peer-focus:text-amber-200
  `;

  return (
    <div className="relative">
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`peer h-14 w-full appearance-none rounded-lg bg-white/[0.06] pl-4 pt-5 pb-2 text-white
          shadow-sm outline-none ring-1 ring-white/10 transition-all truncate
          ${
            error
              ? "ring-red-400 focus:ring-red-400"
              : "focus:bg-white/[0.08] focus:ring-amber-400/80"
          }
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          ${icon ? "pr-16" : "pr-10"}`}
      >
        <option value="" disabled hidden></option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#172235] text-white"
          >
            {option.label}
          </option>
        ))}
      </select>

      <label htmlFor={selectId} className={labelClasses}>
        {label}
      </label>

      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
        {icon && <span className="mr-2">{icon}</span>}
        <svg
          className="h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {error && errorMessage && (
        <div className="mt-1.5 rounded px-1 text-sm text-red-300">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DropdownField;
