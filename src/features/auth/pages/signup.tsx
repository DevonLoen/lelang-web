import { useState } from "react";
import Logo from "../../../assets/logo.png";
import {
  FaEnvelope,
  FaIdCard,
  FaUser,
  FaCalendarAlt,
} from "react-icons/fa";
import { ToastType } from "../../../enums/toast-type";
import { useToast } from "../../../contexts/toast-context";
import { AuthService } from "../services/auth.service";
import { InputField } from "../../../components/input-field";
import { InputFieldPassword } from "../../../components/input-field-password";
import { capitalizeWords } from "../../../utils/string";
import DropdownField from "../../../components/dropdown";
import { DatePicker } from "../../../components/date-picker";
import { useNavigate } from "react-router";
import { formatDateReq } from "../../../utils/date";

interface SignupFieldState {
  fullname: string;
  email: string;
  password: string;
  gender: string;
  birth: string;
}

interface SignupFieldErrors {
  fullname: string;
  email: string;
  password: string;
  gender: string;
  birth: string;
}

const getErrorMessage = (error: unknown, fallback: string) => (error instanceof Error ? error.message : fallback);

export default function SignupPage() {
  const [field, setField] = useState<SignupFieldState>({
    fullname: "",
    email: "",
    password: "",
    gender: "",
    birth: "",
  });

  const [errors, setErrors] = useState<SignupFieldErrors>({
    fullname: "",
    email: "",
    password: "",
    gender: "",
    birth: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateField = async () => {
    const newErrors: SignupFieldErrors = {
      fullname: "",
      email: "",
      password: "",
      gender: "",
      birth: "",
    };

    if (!field.fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }

    if (!field.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!field.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    if (!field.birth.trim()) {
      newErrors.birth = "Birth date is required";
    }

    if (!field.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error);
  };

  const saveDataToLocalStorage = async () => {
    const payloadSignup = {
      fullname: field.fullname,
      email: field.email,
      birth: formatDateReq(field.birth),
      gender: field.gender,
      password: field.password,
    };
    localStorage.setItem("signupPayload", JSON.stringify(payloadSignup));
  };

  const handleSignup = async () => {
    if (await validateField()) {
      try {
        setIsSubmitting(true);

        const payload = {
          email: field.email,
        };

        const result = await new AuthService().sendOtp(payload);
        showToast(
          result.message || 'OTP has been sent to your email',
          ToastType.SUCCESS
        );
        await saveDataToLocalStorage();
        navigate("/verify-otp");
      } catch (error: unknown) {
        showToast(getErrorMessage(error, 'Failed to send OTP'), ToastType.ERROR);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement> | React.FocusEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: !value.trim() ? `${capitalizeWords(name)} is required` : "",
    }));
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setField((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleSignup();
    }
  };

  const genderOptions = [
    { value: "FEMALE", label: "Female" },
    { value: "MALE", label: "Male" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-900">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-center gap-3 py-6 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <img src={Logo} alt="Auction Logo" className="h-10 w-10" />
        <h1 className="text-xl font-bold text-white">AUCTION</h1>
      </div>

      {/* Left Panel - Form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-6 lg:p-12 bg-slate-900 overflow-y-auto">
        <div className="w-full max-w-md py-4" onKeyDown={handleKeyDown}>
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
            <p className="text-slate-400">Join our auction community today</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <InputField
              label="Full Name"
              type="text"
              name="fullname"
              id="fullname"
              value={field.fullname}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.fullname}
              errorMessage={errors.fullname}
              icon={<FaUser className="h-4 w-4" />}
            />

            <InputField
              label="Email"
              type="email"
              name="email"
              id="email"
              value={field.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={!!errors.email}
              errorMessage={errors.email}
              icon={<FaEnvelope className="h-4 w-4" />}
            />

            <DropdownField
              label="Gender"
              name="gender"
              id="gender"
              icon={<FaIdCard className="h-4 w-4" />}
              value={field.gender}
              onChange={handleChange}
              options={genderOptions}
              error={!!errors.gender}
              errorMessage={errors.gender}
              onBlur={handleBlur}
            />

            <DatePicker
              label="Date of Birth"
              name="birth"
              id="birth"
              value={field.birth}
              onChange={handleDateTimeChange}
              onBlur={handleBlur}
              error={!!errors.birth}
              errorMessage={errors.birth}
              icon={<FaCalendarAlt className="h-4 w-4" />}
            />

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

            <p className="text-xs text-slate-500 leading-relaxed">
              By selecting <span className="font-medium text-slate-300">Sign Up</span>,
              you agree to our{" "}
              <a href="/user-agreement" className="text-amber-500 hover:text-amber-400">
                User Agreement
              </a>{" "}
              and acknowledge reading our{" "}
              <a href="/privacy-notice" className="text-amber-500 hover:text-amber-400">
                Privacy Notice
              </a>.
            </p>

            {/* Signup Button */}
            <button
              onClick={handleSignup}
              disabled={isSubmitting}
              className="w-full h-12 rounded-lg bg-amber-500 font-semibold text-white transition-all hover:bg-amber-600 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              {isSubmitting ? (
                <div className="flex justify-center items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="h-2 w-2 rounded-full bg-white animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="h-2 w-2 rounded-full bg-white animate-bounce"></div>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </div>

          {/* Login Link */}
          <p className="mt-6 text-center text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>

      {/* Right Panel - Branding (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src={Logo} alt="Auction Logo" className="h-20 w-20 drop-shadow-lg" />
            <h1 className="text-5xl font-bold text-white drop-shadow-lg">AUCTION</h1>
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Your Bidding Journey
          </h2>
          <p className="text-amber-100 text-lg">
            Create an account and discover unique items from sellers around the world.
          </p>
        </div>
      </div>
    </div>
  );
}
