import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiCalendar,
  FiPhone,
  FiCheck
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    date_of_birth: "",
    phone_number: "",
    terms: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!formData.date_of_birth)
      newErrors.date_of_birth = "Date of birth is required";
    if (!formData.terms)
      newErrors.terms = "You must accept the terms and conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = e => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ""
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      date_of_birth: formData.date_of_birth,
      phone_number: formData.phone_number || null
    };

    const result = await register(userData);
    if (result.success) {
      navigate("/login");
    } else {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 md:px-6 py-6 font-sans">
      {/* Logo Section */}
      <div className="mx-auto w-full max-w-[480px] text-center mb-10">
        <div className="w-16 h-16 bg-primary-500 rounded-lg mx-auto mb-4 flex items-center justify-center text-onPrimary text-h1">
          <FiUser />
        </div>
        <h1 className="text-h1 font-bold text-gray-900 mb-1 leading-tight">
          Create your account
        </h1>
        <p className="text-body text-gray-500 leading-relaxed">
          Start managing your finances effectively
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-lg p-8 max-w-[480px] w-full mx-auto shadow-medium">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`w-full py-2 pr-4 pl-12 text-body font-regular text-gray-900 bg-white border-2 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)] ${
                  errors.name ? 'border-danger-500' : 'border-gray-100'
                }`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email address
            </label>
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`w-full py-2 pr-4 pl-12 text-body font-regular text-gray-900 bg-white border-2 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)] ${
                  errors.email ? 'border-danger-500' : 'border-gray-100'
                }`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full py-2 pr-4 pl-12 text-body font-regular text-gray-900 bg-white border-2 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)] ${
                    errors.password ? 'border-danger-500' : 'border-gray-100'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full py-2 pr-4 pl-12 text-body font-regular text-gray-900 bg-white border-2 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)] ${
                    errors.confirmPassword ? 'border-danger-500' : 'border-gray-100'
                  }`}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Date & Phone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date of Birth */}
            <div>
              <label htmlFor="date_of_birth" className="block text-sm font-semibold text-gray-900 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                <input
                  id="date_of_birth"
                  name="date_of_birth"
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className={`w-full py-2 pr-4 pl-12 text-body font-regular text-gray-900 bg-white border-2 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)] ${
                    errors.date_of_birth ? 'border-danger-500' : 'border-gray-100'
                  }`}
                />
              </div>
              {errors.date_of_birth && (
                <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
                  {errors.date_of_birth}
                </p>
              )}
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label htmlFor="phone_number" className="block text-sm font-semibold text-gray-900 mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none" />
                <input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full py-2 pr-4 pl-12 text-body font-regular text-gray-900 bg-white border-2 border-gray-100 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)]"
                  placeholder="+1234567890"
                />
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-2 relative">
            <div className="relative w-5 h-6 flex-shrink-0 mt-0.5">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleChange}
                className={`appearance-none w-5 h-5 border-2 rounded-sm bg-white cursor-pointer relative transition-all duration-200 ${
                  formData.terms 
                    ? 'bg-primary-500 border-primary-500' 
                    : errors.terms 
                      ? 'border-danger-500' 
                      : 'border-gray-100'
                }`}
              />
              {formData.terms && (
                <FiCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-onPrimary text-sm pointer-events-none" />
              )}
            </div>
            <label
              htmlFor="terms"
              className="text-sm font-regular text-gray-900 cursor-pointer leading-normal"
              onClick={() =>
                setFormData({ ...formData, terms: !formData.terms })
              }
            >
              I agree to the{" "}
              <Link to="/terms" className="text-sm font-semibold text-primary-500 no-underline transition-colors duration-200 hover:text-primaryHover">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="text-sm font-semibold text-primary-500 no-underline transition-colors duration-200 hover:text-primaryHover">
                Privacy Policy
              </Link>
            </label>
          </div>
          {errors.terms && (
            <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
              {errors.terms}
            </p>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 text-body font-semibold text-onPrimary bg-primary-500 border-none rounded-md transition-all duration-200 flex items-center justify-center gap-2 hover:bg-primaryHover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(135,215,72,0.2)] ${
                loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative text-center my-6">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100" />
          <span className="relative inline-block px-4 bg-white text-sm font-regular text-gray-500">
            Already have an account?
          </span>
        </div>

        {/* Secondary Action */}
        <div>
          <Link
            to="/login"
            className="w-full block py-4 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-100 rounded-md cursor-pointer transition-all duration-200 no-underline text-center hover:border-primary-500 hover:bg-gray-50"
          >
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;