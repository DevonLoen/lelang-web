import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from "../utils/password";

interface InputFieldPasswordProps {
  label: string;
  name?: string;
  id?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: boolean;
  errorMessage?: string;
}

export const InputFieldPassword: React.FC<InputFieldPasswordProps> = ({
  label,
  name,
  id,
  value,
  onChange,
  onBlur,
  error = false,
  errorMessage = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        value={value}
        minLength={PASSWORD_MIN_LENGTH}
        maxLength={PASSWORD_MAX_LENGTH}
        onBlur={onBlur}
        placeholder=" "
        onChange={onChange}
        className={`peer h-14 w-full rounded-lg bg-white/[0.06] pl-4 pr-11 pt-5 pb-2 text-white 
        placeholder-transparent shadow-sm outline-none ring-1 ring-white/10 transition-all truncate
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
        className="absolute left-4 top-1.5 text-xs font-medium text-slate-400 transition-all duration-200 
        peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-slate-400
        peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-amber-200
        truncate right-10"
      >
        {label}
      </label>
      <button
        type="button"
        aria-label={showPassword ? "Hide password" : "Show password"}
        className="absolute right-2 top-7 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        onMouseDown={() => setShowPassword(true)}
        onMouseUp={() => setShowPassword(false)}
        onMouseLeave={() => setShowPassword(false)}
        onTouchStart={() => setShowPassword(true)}
        onTouchEnd={() => setShowPassword(false)}
      >
        {showPassword ? (
          <FaEye className="h-5 w-5" />
        ) : (
          <FaEyeSlash className="h-5 w-5" />
        )}
      </button>
    </div>
  );
};
