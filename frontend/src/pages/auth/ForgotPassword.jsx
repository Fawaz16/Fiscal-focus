import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await forgotPassword(email);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error || 'Failed to send reset link. Please try again.');
    }
    
    setLoading(false);
  };

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
              Check your email
            </h2>
            <p className="text-body text-gray-500 leading-relaxed mb-6">
              We've sent a password reset link to{' '}
              <strong className="text-gray-900">{email}</strong>
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-100 rounded-md cursor-pointer transition-all duration-200 no-underline hover:border-primary-500 hover:bg-gray-50 w-auto"
            >
              <FiArrowLeft size={18} />
              Back to login
            </Link>
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
          <FiMail size={32} />
        </div>
        <h1 className="text-h1 font-bold text-gray-900 mb-1 leading-tight">
          Reset your password
        </h1>
        <p className="text-body text-gray-500 leading-relaxed">
          Enter your email and we'll send you a reset link
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-lg p-8 max-w-[440px] w-full mx-auto shadow-medium">
        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email address
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xl pointer-events-none">
                <FiMail size={20} />
              </span>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full py-2 pr-4 pl-12 text-body font-regular text-gray-900 bg-white border-2 rounded-md outline-2 outline-primary-500 transition-all duration-200 focus:border-primary-500 focus:shadow-[0_0_0_3px_rgba(135,215,72,0.1)] ${
                  error ? 'border-danger-500' : 'border-gray-100'
                }`}
                placeholder="you@example.com"
              />
            </div>
            {error && (
              <p className="text-sm font-regular text-danger-500 mt-1 ml-1">
                {error}
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
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative text-center my-6">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100" />
          <span className="relative inline-block px-4 bg-white text-sm font-regular text-gray-500">
            Remember your password?
          </span>
        </div>

        {/* Secondary Action */}
        <Link
          to="/login"
          className="w-full block py-4 text-sm font-semibold text-gray-900 bg-white border-2 border-gray-100 rounded-md cursor-pointer transition-all duration-200 no-underline text-center mt-4 hover:border-primary-500 hover:bg-gray-50"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;