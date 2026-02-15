import React, { useState } from 'react';
import { FiMail, FiBell, FiCheck } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EmailSettings = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Only using notification settings from backend
  const [emailPreferences, setEmailPreferences] = useState({
    notifications: user?.settings?.notifications ?? true,
  });

  // Email types from backend
  const emailTypes = [
    {
      id: 'budget_alerts',
      label: 'Budget Alerts',
      description: 'Alerts when spending reaches 80% of budget',
      supported: true,
    },
    {
      id: 'weekly_summary',
      label: 'Weekly Summary',
      description: 'Weekly financial summary email',
      supported: true,
    },
  ];

  const handleSavePreferences = async () => {
    setLoading(true);
    
    try {
      // Using the /auth/profile endpoint
      const result = await updateProfile({
        settings: {
          ...user?.settings,
          notifications: emailPreferences.notifications,
        }
      });
      
      if (result.success) {
        toast.success('Email preferences saved');
      }
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotifications = () => {
    setEmailPreferences(prev => ({
      ...prev,
      notifications: !prev.notifications,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
        <p className="text-gray-600">Manage your email notification preferences</p>
      </div>

      <div className="space-y-6">
        {/* Global Toggle */}
        <div className="card">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                <FiMail className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Email Notifications</h3>
                <p className="text-sm text-gray-500">Enable or disable all email notifications</p>
              </div>
            </div>
            <button
                onClick={handleToggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    emailPreferences.notifications ? 'bg-green-500' : 'bg-black'
                }`}
                >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    emailPreferences.notifications ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
          </div>
        </div>

        {/* Available Email Types */}
        {emailPreferences.notifications && (
          <div className="card">
            <h3 className="font-medium text-gray-900 mb-4">Available Notifications</h3>
            <p className="text-sm text-gray-600 mb-4">These emails are sent based on your activity</p>
            
            <div className="space-y-4">
              {emailTypes.map((emailType) => (
                <div key={emailType.id} className="flex items-start justify-between p-4 border rounded-lg">
                  <div className="flex items-start">
                    <FiCheck className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">{emailType.label}</p>
                      <p className="text-sm text-gray-500">{emailType.description}</p>
                    </div>
                  </div>
                  <span className="badge badge-success">Active</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSavePreferences}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSettings;