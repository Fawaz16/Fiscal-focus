import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FiLock, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    const result = await resetPassword(token, password);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
    
    setLoading(false);
  };

  if (!token) return null;

  // Success state using Tailwind
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 md:px-6 py-6 font-sans">
        <div className="bg-white rounded-lg p-8 max-w-[440px] w-full mx-auto shadow-medium">
          <div className="text-center">
            <div className="w-16 h-16 bg-success-500 rounded-lg mx-auto mb-6 flex items-center justify-center text-onPrimary text-h1">
              <FiCheck size={32} />
            </div>
            <h2 className="text-h2 font-bold text-gray-900 mb-2 leading-tight">
              Password reset successful!
            </h2>
            <p className="text-body text-gray-500 leading-relaxed">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 md:px-6 py-6 font-sans">
      {/* Logo Section */}
      <div className="mx-auto w-full max-w-[440px] text-center mb-10">
        <div className="w-16 h-16 bg-primary-500 rounded-lg mx-auto mb-4 flex items-center justify-center text-onPrimary text-h1">
          <FiLock size={32} />
        </div>
        <h1 className="text-h1 font-bold text-gray-900 mb-1 leading-tight">
          Set new password
        </h1>
        <p className="text-body text-gray-500 leading-relaxed">
          Create a new password for your account
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-lg p-8 max-w-[440px] w-full mx-auto shadow-medium">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* New Password Field */}
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none">
                <FiLock size={20} />
              </span>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full py-2 pr-12 pl-12 text-body font-regular text-gray-900 bg-white border-2 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)] ${
                  errors.password ? 'border-danger-500' : 'border-gray-100'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none text-gray-500 cursor-pointer text-xl flex items-center justify-center p-1 transition-colors duration-200 hover:text-gray-900"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-900 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none">
                <FiLock size={20} />
              </span>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full py-2 pr-12 pl-12 text-body font-regular text-gray-900 bg-white border-2 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)] ${
                  errors.confirmPassword ? 'border-danger-500' : 'border-gray-100'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none text-gray-500 cursor-pointer text-xl flex items-center justify-center p-1 transition-colors duration-200 hover:text-gray-900"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 text-body font-semibold text-onPrimary bg-primary-500 border-none rounded-md transition-all duration-200 flex items-center justify-center gap-2 hover:bg-primaryHover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(135,215,72,0.2)] ${
              loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative text-center my-6">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100" />
          <span className="relative inline-block px-4 bg-white text-sm font-regular text-gray-500">
            Need to request a new link?
          </span>
        </div>

        {/* Secondary Action */}
        <Link
          to="/forgot-password"
          className="w-full block py-4 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-100 rounded-md cursor-pointer transition-all duration-200 no-underline text-center mt-4 hover:border-primary-500 hover:bg-gray-50"
        >
          Request new reset link
        </Link>
      </div>
    </div>
  );
};

export default ResetPassword;