import React, { useState } from 'react';
import { FiGlobe, FiMoon, FiSun, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Preferences = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Only settings that match backend user.settings structure
  const [preferences, setPreferences] = useState({
    theme: user?.settings?.theme || 'light',
    language: user?.settings?.language || 'en',
    notifications: user?.settings?.notifications ?? true,
    profile_visibility: user?.settings?.profile_visibility || 'private',
  });

  const themes = [
    { value: 'light', label: 'Light', icon: FiSun },
    { value: 'dark', label: 'Dark', icon: FiMoon },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
  ];

  const visibilityOptions = [
    { value: 'private', label: 'Private' },
    { value: 'public', label: 'Public' },
    { value: 'friends', label: 'Friends Only' },
  ];

  const handleSavePreferences = async () => {
    setLoading(true);
    
    try {
      // Using the backend's /auth/profile PUT endpoint
      const result = await updateProfile({
        settings: {
          theme: preferences.theme,
          language: preferences.language,
          notifications: preferences.notifications,
          profile_visibility: preferences.profile_visibility,
        }
      });
      
      if (result.success) {
        toast.success('Preferences saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
        <p className="text-gray-600">Customize your application experience</p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-4">Appearance</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Theme</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  return (
                    <button
                      key={themeOption.value}
                      type="button"
                      onClick={() => handlePreferenceChange('theme', themeOption.value)}
                      className={`flex flex-col items-center p-4 rounded-lg border ${
                        preferences.theme === themeOption.value
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-6 w-6 mb-2" />
                      <span className="text-sm font-medium">{themeOption.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Language & Notifications */}
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-4">Language & Notifications</h3>
          <div className="space-y-4">
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiGlobe className="h-4 w-4 mr-2 text-gray-400" />
                  Language
                </div>
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="input-field"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Notifications</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FiBell className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-700">Receive email notifications</span>
                </div>
                <button
                  onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                    preferences.notifications ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Budget alerts and weekly summaries
              </p>
            </div>
          </div>
        </div>

        {/* Profile Visibility */}
        <div className="card">
          <h3 className="font-medium text-gray-900 mb-4">Privacy</h3>
          <div className="space-y-4">
            <div>
              <label className="label">Profile Visibility</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {visibilityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePreferenceChange('profile_visibility', option.value)}
                    className={`py-2 rounded-lg border text-sm ${
                      preferences.profile_visibility === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Controls who can see your financial statistics
              </p>
            </div>
          </div>
        </div>

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

export default Preferences;