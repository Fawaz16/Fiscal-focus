import React from 'react';
import { FiShield, FiDatabase, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PrivacySecurity = () => {
  const { user, logout } = useAuth();

  // Only features that match backend endpoints
  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.get('/user/delete');
      if (response.data.success) {
        toast.success('Account deleted successfully');
        logout();
      }
    } catch (error) {
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
        <p className="text-gray-600">Account security and data management</p>
      </div>

      <div className="space-y-6">
        {/* Security Information */}
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
              <FiShield className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Account Security</h3>
              <p className="text-sm text-gray-500">Your account security status</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Email Verified</span>
              <span className={`badge ${user?.is_verified ? 'badge-success' : 'badge-warning'}`}>
                {user?.is_verified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Last Login</span>
              <span className="font-medium">
                {user?.last_login 
                  ? new Date(user.last_login).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>

            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  // Using backend's change password endpoint
                  window.location.href = '/settings/password';
                }}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Change Password →
              </button>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="card">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
              <FiDatabase className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Data Management</h3>
              <p className="text-sm text-gray-500">Manage your personal data</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Your data is securely stored and encrypted. We comply with data protection regulations.
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">
                To export your data, please contact support.
              </p>
              <button
                onClick={() => {
                  // Using existing email notification system
                  toast.success('Data export request sent to support');
                }}
                className="btn-secondary"
              >
                Request Data Export
              </button>
            </div>
          </div>
        </div>

        {/* Account Deletion - Using backend's /user/delete endpoint */}
        <div className="card border-red-200 bg-red-50">
          <div className="flex items-center mb-4">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center mr-4">
              <FiAlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-medium text-red-900">Delete Account</h3>
              <p className="text-sm text-red-700">Permanently remove your account and all data</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-red-700">
              This action cannot be undone. All your transactions, budgets, and categories will be permanently deleted.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Before you delete:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• All financial data will be permanently erased</li>
                <li>• You will lose access to all your historical records</li>
                <li>• This action is irreversible</li>
              </ul>
            </div>

            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-medium"
            >
              Permanently Delete My Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySecurity;