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

  // Kelas untuk label, menggabungkan logika agar lebih rapi
  const labelClasses = `
    absolute left-4 text-gray-400 transition-all duration-200 pointer-events-none
    truncate ${icon ? "right-16" : "right-10"} 
    ${
      value
        ? "top-0 text-sm" // Jika ada value, label naik
        : "top-3.5 text-base" // Jika tidak, label di tengah
    }
    peer-focus:top-0 peer-focus:text-sm peer-focus:text-white
  `;

  return (
    // Struktur disederhanakan, tidak perlu div bertumpuk
    <div className="relative">
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange} // Disederhanakan, tidak perlu trigger onBlur manual
        onBlur={onBlur}
        disabled={disabled}
        className={`peer w-full appearance-none bg-transparent pl-4 pt-5 pb-2 text-gray-200 
          focus:outline-none truncate
          ${
            error
              ? "border-b border-red-500 focus:border-red-500"
              : "border-b border-gray-500 focus:border-white"
          }
          ${disabled ? "cursor-not-allowed opacity-50" : ""}
          // Padding kanan ditambah untuk memberi ruang bagi ikon panah dan ikon kustom
          ${icon ? "pr-16" : "pr-10"}`}
      >
        {/* Opsi placeholder */}
        <option value="" disabled hidden></option>

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-[#1f2c44] text-gray-200"
          >
            {option.label}
          </option>
        ))}
      </select>

      <label htmlFor={selectId} className={labelClasses}>
        {label}
      </label>

      {/* Kontainer untuk ikon (panah dropdown + ikon kustom) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
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
        <div className="mt-1 rounded px-2 py-1 text-sm text-red-500">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default DropdownField;
