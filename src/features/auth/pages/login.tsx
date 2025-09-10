import { useState } from "react";
import Logo from "../../../assets/logo.png";
import { FaPhone } from "react-icons/fa";
import { ToastType } from "../../../enums/toast-type";
import { useToast } from "../../../contexts/toast-context";
import { AuthService } from "../services/auth.service";
import { InputFieldPhone } from "../../../components/input-field-phone";
import { InputFieldPassword } from "../../../components/input-field-password";
import { capitalizeWords } from "../../../utils/string";

interface LoginFieldState {
  phone: string;
  password: string;
}

interface LoginFieldErrors {
  phone: string;
  password: string;
}

export default function LoginPage() {
  const [field, setField] = useState<LoginFieldState>({
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginFieldErrors>({
    phone: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false); // ⬅️ Tambahkan state loading
  const [isSubmitting, setIsSubmitting] = useState(false); // ⬅️ Khusus untuk submit

  const { showToast } = useToast();

  const validateField = async () => {
    const newErrors: LoginFieldErrors = {
      phone: "",
      password: "",
    };
    if (!field.phone.trim()) {
      newErrors.phone = "Phone is required";
    }
    if (!/^\d+$/.test(field.phone)) {
      newErrors.phone = "Phone must be a number";
    }

    if (!field.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleLogin = async () => {
    if (await validateField()) {
      try {
        setIsSubmitting(true);
        const payload = {
          phone: field.phone,
          password: field.password,
        };
        await new AuthService().login(payload);
        showToast("Login Successfully", ToastType.SUCCESS);
      } catch (error: any) {
        const finalMessage = `${
          error?.response?.data?.message || error?.message || "Unknown error"
        }`;
        showToast(finalMessage, ToastType.ERROR);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: !value.trim() ? `${capitalizeWords(name)} is required` : "",
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setField((prev) => ({ ...prev, [name]: value as any }));
  };

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="flex w-full max-w-md flex-col justify-center bg-[#1f2c44] p-8 sm:w-1/3  border-r border-white">
        <div className="mx-auto w-4/5">
          <h2 className="mb-6 text-3xl font-bold text-white">LOGIN</h2>
          <div className="mb-6 relative">
            <InputFieldPhone
              label="Phone +62"
              type="text"
              name="phone"
              id="phone"
              value={field.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.phone}
              errorMessage={errors.phone}
              icon={<FaPhone className="h-5 w-5" />}
            />
            <a
              href="#"
              className="mt-1 block text-right text-xs  text-yellow-400 hover:underline"
            >
              Forgot Password?
            </a>
          </div>

          <div className="mb-6 relative">
            <InputFieldPassword
              label="Password"
              name="password"
              id="password"
              value={field.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.password}
              errorMessage={errors.password}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            className="w-full h-12 rounded-xl bg-yellow-500 font-bold text-white transition hover:bg-yellow-600"
          >
            <div className="flex justify-center items-center w-full">
              {isSubmitting ? (
                <div className="flex justify-center space-x-1">
                  <div className="h-4 w-1 bg-white animate-pulse"></div>
                  <div className="h-4 w-1 bg-white animate-pulse [animation-delay:0.2s]"></div>
                  <div className="h-4 w-1 bg-white animate-pulse [animation-delay:0.4s]"></div>
                </div>
              ) : (
                "LOGIN"
              )}
            </div>
          </button>

          {/* Signup */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Don’t have an Account?{" "}
            <a href="#" className="text-yellow-400 hover:underline">
              Sign Up Here
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-[#0d1c36] px-6 text-center sm:flex">
        <div className="mb-4 flex items-center">
          <img src={Logo} alt="Logo" className="h-40 w-40" />
          <h1 className="text-6xl font-bold text-white">AUCTION</h1>
        </div>
        <h2 className="mb-1 text-3xl font-bold text-white">
          Enter the World of Bids
        </h2>
        <p className="text-gray-400">Your dream item is just one bid away.</p>
      </div>
    </div>
  );
}
