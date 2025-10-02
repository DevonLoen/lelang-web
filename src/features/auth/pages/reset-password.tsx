import { useState } from "react";
import Logo from "../../../assets/logo.png";
import { FaPhone, FaIdCard, FaUser } from "react-icons/fa";
import { ToastType } from "../../../enums/toast-type";
import { useToast } from "../../../contexts/toast-context";
import { AuthService } from "../services/auth.service";
import { InputField } from "../../../components/input-field";
import { InputFieldPassword } from "../../../components/input-field-password";
import { capitalizeWords } from "../../../utils/string";
import { useSearchParams } from "react-router";

interface ResetPasswordFieldState {
  // phone: string;
  password: string;
  confirmPassword: string;
}

interface ResetPasswordFieldErrors {
  // phone: string;
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  // const phoneParam = searchParams.get("phone") || "";
  const tokenParam = searchParams.get("token");
  if (!tokenParam) {
    throw new Error("Token not found in reset password link.");
  }

  const [field, setField] = useState<ResetPasswordFieldState>({
    // phone: phoneParam,
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<ResetPasswordFieldErrors>({
    // phone: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false); // ⬅️ Tambahkan state loading
  const [isSubmitting, setIsSubmitting] = useState(false); // ⬅️ Khusus untuk submit

  const { showToast } = useToast();

  const validateField = async () => {
    const newErrors: ResetPasswordFieldErrors = {
      // phone: "",
      password: "",
      confirmPassword: "",
    };

    // if (!/^\d+$/.test(field.phone)) {
    //   newErrors.phone = "Phone must be a number";
    // }

    // if (!field.phone.trim()) {
    //   newErrors.phone = "Phone is required";
    // }

    if (!field.password.trim()) {
      newErrors.password = "Password is required";
    }

    if (!field.confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    }

    if (field.password != field.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password must match Password";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const handleResetPassword = async () => {
    if (await validateField()) {
      try {
        setIsSubmitting(true);
        const payload = {
          // phone: field.phone,
          token: tokenParam,
          password: field.password,
        };
        await new AuthService().resetPassword(payload);
        showToast("Reset Password Successfully", ToastType.SUCCESS);
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
      <div className="flex w-full max-w-md flex-col justify-center bg-gradient-to-br from-blue-950 via-blue-800 to-purple-900 p-8 sm:w-1/3 border-r border-blue-300 shadow-lg">
        <div className="mx-auto w-4/5">
          <h2 className="mb-3 text-3xl font-bold text-white">RESET PASSWORD</h2>

          {/* <div className="mb-3 relative">
            <InputField
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
              inputMode="decimal"
              readOnly
            />
          </div> */}

          <div className="mb-3 relative">
            <InputFieldPassword
              label="New Password"
              name="password"
              id="password"
              value={field.password}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.password}
              errorMessage={errors.password}
            />
          </div>

          <div className="mb-3 relative">
            <InputFieldPassword
              label="Confirm Password"
              name="confirmPassword"
              id="confirmPassword"
              value={field.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
            />
          </div>

          {/* Login Button */}
          <button
            onClick={handleResetPassword}
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
                "RESET PASSWORD"
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-animated-gradient shadow-lg px-6 text-center sm:flex">
        {/* <div className="flex w-full max-w-md flex-col justify-center bg-animated-gradient p-8 sm:w-1/3 border-r border-blue-300 shadow-lg"> */}
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
