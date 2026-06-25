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
        className={`peer h-14 w-full rounded-lg bg-white/[0.06] pl-4 pt-5 pb-2 text-white 
        placeholder-transparent shadow-sm outline-none ring-1 ring-white/10 transition-all truncate
        ${icon ? "pr-11" : "pr-4"}
        ${
          error
            ? "ring-red-400 focus:ring-red-400"
            : "focus:bg-white/[0.08] focus:ring-amber-400/80"
        }`}
      />
      {error && (
        <div className="mt-1.5 rounded px-1 text-sm text-red-300">
          {errorMessage}
        </div>
      )}

      <label
        htmlFor={name}
        className={`absolute left-4 top-1.5 text-xs font-medium text-slate-400 transition-all duration-200 
          peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-amber-200
          truncate ${icon ? "right-11" : "right-4"}`}
      >
        {label}
      </label>
      {icon && (
        <span className="absolute right-3 top-7 -translate-y-1/2 text-slate-400 pointer-events-none peer-focus:text-amber-200">
          {icon}
        </span>
      )}
    </div>
  );
};
