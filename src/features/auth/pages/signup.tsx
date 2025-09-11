import { useState } from "react";
import Logo from "../../../assets/logo.png";
import { FaPhone, FaIdCard, FaUser } from "react-icons/fa";
import { ToastType } from "../../../enums/toast-type";
import { useToast } from "../../../contexts/toast-context";
import { AuthService } from "../services/auth.service";
import { InputField } from "../../../components/input-field";
import { InputFieldPassword } from "../../../components/input-field-password";
import { capitalizeWords } from "../../../utils/string";

interface SignupFieldState {
  fullname: string;
  phone: string;
  nik: string;
  password: string;
  confirmPassword: string;
}

interface SignupFieldErrors {
  fullname: string;
  phone: string;
  nik: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const [field, setField] = useState<SignupFieldState>({
    fullname: "",
    phone: "",
    nik: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<SignupFieldErrors>({
    fullname: "",
    phone: "",
    nik: "",
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState(false); // ⬅️ Tambahkan state loading
  const [isSubmitting, setIsSubmitting] = useState(false); // ⬅️ Khusus untuk submit

  const { showToast } = useToast();

  const validateField = async () => {
    const newErrors: SignupFieldErrors = {
      fullname: "",
      phone: "",
      nik: "",
      password: "",
      confirmPassword: "",
    };

    if (!/^\d+$/.test(field.phone)) {
      newErrors.phone = "Phone must be a number";
    }

    if (!field.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!/^\d+$/.test(field.phone)) {
      newErrors.nik = "Nik must be a number";
    }

    if (!field.nik.trim()) {
      newErrors.nik = "Nik is required";
    }

    if (!field.fullname.trim()) {
      newErrors.fullname = "Fullname is required";
    }

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

  const handleSignup = async () => {
    if (await validateField()) {
      try {
        setIsSubmitting(true);
        const payload = {
          fullname: field.fullname,
          phone: field.phone,
          nik: field.nik,
          password: field.password,
        };
        await new AuthService().signup(payload);
        showToast("Sign Up Successfully", ToastType.SUCCESS);
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
          <h2 className="mb-3 text-3xl font-bold text-white">SIGN UP</h2>

          <div className="mb-3 relative">
            <InputField
              label="Fullname"
              type="text"
              name="fullname"
              id="fullname"
              value={field.fullname}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.fullname}
              errorMessage={errors.fullname}
              icon={<FaUser className="h-5 w-5" />}
              inputMode="decimal"
            />
          </div>

          <div className="mb-3 relative">
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
            />
          </div>

          <div className="mb-3 relative">
            <InputField
              label="Nik"
              type="text"
              name="nik"
              id="nik"
              value={field.nik}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.nik}
              errorMessage={errors.nik}
              icon={<FaIdCard className="h-5 w-5" />}
              inputMode="decimal"
            />
          </div>

          <div className="mb-3 relative">
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

          <p className="mb-3 text-center text-xs text-gray-400 leading-relaxed">
            By selecting <span className="font-medium text-white">Sign Up</span>
            , you agree to our{" "}
            <a
              href="/user-agreement"
              style={{ color: "#1A73E8" }}
              className="hover:underline"
            >
              User Agreement
            </a>{" "}
            and acknowledge reading our{" "}
            <a
              href="/privacy-notice"
              style={{ color: "#1A73E8" }}
              className="hover:underline"
            >
              User Privacy Notice
            </a>
            .
          </p>

          {/* Login Button */}
          <button
            onClick={handleSignup}
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
                "SIGN UP"
              )}
            </div>
          </button>

          {/* Signup */}
          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an Account?{" "}
            <a href="/login" className="text-yellow-400 hover:underline">
              Log In Here
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
