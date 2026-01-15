// src/pages/auth/VerifyEmail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiCheck, FiX } from 'react-icons/fi';
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {verifying ? (
            <>
              <div className="mx-auto h-12 w-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                Verifying your email...
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                Please wait while we verify your email address.
              </p>
            </>
          ) : (
            <>
              <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${
                success ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {success ? (
                  <FiCheck className="h-6 w-6 text-green-600" />
                ) : (
                  <FiX className="h-6 w-6 text-red-600" />
                )}
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {success ? 'Email Verified!' : 'Verification Failed'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">{message}</p>
              
              <div className="mt-6">
                {success ? (
                  <div className="text-sm text-gray-500">
                    Redirecting to login page...
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="btn-primary inline-block"
                  >
                    Go to Login
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;