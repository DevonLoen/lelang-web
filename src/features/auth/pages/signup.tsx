import { useState } from "react";
import Logo from "../../../assets/logo.png";
import {
  FaPhone,
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
  phone: string;
  password: string;
  gender: string;
  birth: string;
}

interface SignupFieldErrors {
  fullname: string;
  phone: string;
  password: string;
  gender: string;
  birth: string;
}

export default function SignupPage() {
  const [field, setField] = useState<SignupFieldState>({
    fullname: "",
    phone: "",
    password: "",
    gender: "",
    birth: "",
  });

  const [errors, setErrors] = useState<SignupFieldErrors>({
    fullname: "",
    phone: "",
    password: "",
    gender: "",
    birth: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false); // ⬅️ Khusus untuk submit

  const { showToast } = useToast();

  const navigate = useNavigate();

  const validateField = async () => {
    const newErrors: SignupFieldErrors = {
      fullname: "",
      phone: "",
      password: "",
      gender: "",
      birth: "",
    };
    if (!/^\d+$/.test(field.phone)) {
      newErrors.phone = "Phone must be a number";
    }

    if (!field.phone.trim()) {
      newErrors.phone = "Phone is required";
    }

    if (!field.gender.trim()) {
      newErrors.gender = "Gender is required";
    }

    if (!field.birth.trim()) {
      newErrors.birth = "Birth is required";
    }

    if (!field.fullname.trim()) {
      newErrors.fullname = "Fullname is required";
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
      phone: field.phone,
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
          phone: field.phone,
        };

        const result = await new AuthService().sendOtp(payload);
        showToast(
          result.message || 'OTP has been sent to your Phone Number',
          ToastType.SUCCESS
        );
        await saveDataToLocalStorage();
        navigate("/verify-otp");
      } catch (error: any) {
        showToast(error.message || 'Failed to send OTP', ToastType.ERROR);
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
    setField((prev) => ({ ...prev, [name]: value as any }));
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e);
  };

  const genderOptions = [
    { value: "FEMALE", label: "Female" },
    { value: "MALE", label: "Male" },
  ];

  return (
    <div className="flex h-screen">
      {/* Left Panel */}
      <div className="flex w-full max-w-md flex-col justify-start bg-gradient-to-br from-blue-950 via-blue-800 to-purple-900 p-8 sm:w-1/3 border-r border-blue-300 shadow-lg overflow-y-auto py-12 scrollbar-hide">
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
              label="Phone"
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
            <DropdownField
              label="Gender"
              name="gender"
              id="gender"
              icon={<FaIdCard className="h-5 w-5" />}
              value={field.gender} // Hubungkan ke state
              onChange={handleChange} // Hubungkan ke fungsi handler
              options={genderOptions} // Berikan daftar pilihan
              error={!!errors.gender}
              errorMessage={errors.gender}
              onBlur={handleBlur}
            />
          </div>

          <div className="mb-3 relative">
            <DatePicker
              label="Birth"
              name="birth"
              id="birth"
              value={field.birth}
              onChange={handleDateTimeChange}
              onBlur={handleBlur}
              error={!!errors.birth}
              errorMessage={errors.birth}
              icon={<FaCalendarAlt className="h-5 w-5" />}
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
      <div className="hidden flex-1 flex-col items-center justify-center bg-animated-gradient shadow-lg px-6 text-center sm:flex">
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
