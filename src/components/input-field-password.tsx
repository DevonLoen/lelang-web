import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

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
    <div>
      <input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        value={value}
        onBlur={onBlur}
        // placeholder="Password"
        onChange={onChange}
        className={`peer w-full bg-transparent px-4 pt-5 pb-2 text-gray-200 
      placeholder-transparent focus:outline-none
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
        htmlFor="password"
        className="absolute left-4 top-0 text-sm text-gray-400 transition-all duration-200 
       peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400
       peer-focus:top-0 peer-focus:text-sm peer-focus:text-white"
      >
        {label}
      </label>
      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
        onMouseDown={() => setShowPassword(true)}
        onMouseUp={() => setShowPassword(false)}
        onMouseLeave={() => setShowPassword(false)} // kalau mouse geser keluar icon
        onTouchStart={() => setShowPassword(true)} // support mobile
        onTouchEnd={() => setShowPassword(false)}
      >
        {showPassword ? (
          <FaEye className="h-5 w-5" />
        ) : (
          <FaEyeSlash className="h-5 w-5" />
        )}
      </span>
    </div>
  );
};
