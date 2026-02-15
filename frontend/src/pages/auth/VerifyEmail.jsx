import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiX, FiMail } from 'react-icons/fi';
import api from '../../services/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    verifyEmail();
  }, []);

  const verifyEmail = async () => {
    try {
      const response = await api.get(`/auth/verify-email/${token}`);
      
      if (response.data.success) {
        setSuccess(true);
        setMessage('Email verified successfully! You can now log in.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      setSuccess(false);
      setMessage(error.response?.data?.message || 'Verification failed. The link may be expired or invalid.');
    } finally {
      setVerifying(false);
    }
  };

  // Loading/Verifying state
  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 md:px-6 py-6 font-sans">
        <div className="bg-white rounded-lg p-8 max-w-[440px] w-full mx-auto shadow-medium">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-lg mx-auto mb-6 flex items-center justify-center animate-pulse">
              <FiMail size={32} className="text-primary-500" />
            </div>
            <div className="mb-6">
              <div className="w-12 h-12 mx-auto border-4 border-gray-100 border-t-primary-500 rounded-full animate-spin" />
            </div>
            <h2 className="text-h2 font-bold text-gray-900 mb-2 leading-tight">
              Verifying your email...
            </h2>
            <p className="text-body text-gray-500 leading-relaxed">
              Please wait while we verify your email address.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center px-4 md:px-6 py-6 font-sans">
      <div className="bg-white rounded-lg p-8 max-w-[440px] w-full mx-auto shadow-medium">
        <div className="text-center">
          {/* Status Icon */}
          <div className={`w-16 h-16 rounded-lg mx-auto mb-6 flex items-center justify-center text-onPrimary text-h1 ${
            success ? 'bg-success-500' : 'bg-danger-500'
          }`}>
            {success ? (
              <FiCheck size={32} />
            ) : (
              <FiX size={32} />
            )}
          </div>

          {/* Status Message */}
          <h2 className="text-h2 font-bold text-gray-900 mb-2 leading-tight">
            {success ? 'Email Verified!' : 'Verification Failed'}
          </h2>
          
          <p className="text-body text-gray-500 leading-relaxed mb-10">
            {message}
          </p>

          {/* Actions */}
          {success ? (
            <>
              <div className="text-body text-gray-500 leading-relaxed mb-4">
                Redirecting to login page...
              </div>
              <div className="w-40 h-1 mx-auto bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 rounded-full animate-[progress_3s_linear_forwards]" />
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-block min-w-[160px] px-10 py-2 text-body font-semibold text-onPrimary bg-primary-500 border-none rounded-md cursor-pointer transition-all duration-200 no-underline text-center hover:bg-primaryHover hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(135,215,72,0.2)]"
            >
              Go to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;