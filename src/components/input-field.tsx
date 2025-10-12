import React from "react";

interface InputFieldProps {
  label: string;
  type?: string;
  name?: string;
  id?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
  icon?: React.ReactNode;
  readOnly?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  name,
  id,
  value,
  onChange,
  onBlur,
  error = false,
  errorMessage = "",
  icon,
  readOnly = false,
  inputMode = "text",
}) => {
  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onBlur={onBlur}
        placeholder=" "
        inputMode={inputMode}
        onChange={onChange}
        readOnly={readOnly}
        // --- PERUBAHAN DI SINI ---
        className={`peer w-full bg-transparent pl-4 pt-5 pb-2 text-gray-200 
        placeholder-transparent focus:outline-none truncate 
        ${icon ? "pr-10" : "pr-4"} {/* Memberi ruang untuk ikon */}
        ${
          error
            ? "border-b border-red-500 focus:border-red-500"
            : "border-b border-gray-500 focus:border-white"
        }`}
      />
      {error && (
        <div className="rounded px-2 py-1 text-sm text-red-500">
          {errorMessage}
        </div>
      )}

      <label
        htmlFor={name}
        className={`absolute left-4 top-0 text-sm text-gray-400 transition-all duration-200 
          peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
          peer-focus:top-0 peer-focus:text-sm peer-focus:text-white
          truncate ${icon ? "right-10" : "right-4"}`}
      >
        {label}
      </label>
      {icon && (
        <span className="absolute right-3 top-7 -translate-y-1/2 text-gray-400 pointer-events-none">
          {icon}
        </span>
      )}
    </div>
  );
};
