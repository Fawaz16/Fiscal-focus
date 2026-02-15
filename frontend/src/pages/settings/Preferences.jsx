import { useState, useEffect } from 'react';
import { FiGlobe, FiMoon, FiSun, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext'; // Import this
import toast from 'react-hot-toast';

const Preferences = () => {
  const { user, updateProfile } = useAuth();
  const { theme: currentTheme, setTheme } = useTheme(); // Add this
  const [loading, setLoading] = useState(false);
  
  // Only settings that match backend user.settings structure
  const [preferences, setPreferences] = useState({
    theme: user?.settings?.theme || currentTheme || 'light',
    language: user?.settings?.language || 'en',
    notifications: user?.settings?.notifications ?? true,
    profile_visibility: user?.settings?.profile_visibility || 'private',
  });

  // Sync with context theme when it changes
  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      theme: currentTheme
    }));
  }, [currentTheme]);

  const themes = [
    { value: 'light', label: 'Light', icon: FiSun },
    { value: 'dark', label: 'Dark', icon: FiMoon },
  ];

  const languages = [
    { code: 'en', name: 'English' }
  ];

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));

    // Immediately change theme when theme button is clicked
    if (key === 'theme') {
      setTheme(value); // This updates the context, localStorage, and document class
    }
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-gray-900)' }}>
          Preferences
        </h2>
        <p style={{ color: 'var(--color-gray-500)' }}>
          Customize your application experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme */}
        <div className="card">
          <h3 className="font-medium mb-4" style={{ color: 'var(--color-gray-900)' }}>
            Appearance
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">Theme</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {themes.map((themeOption) => {
                  const Icon = themeOption.icon;
                  const isActive = preferences.theme === themeOption.value;
                  
                  return (
                    <button
                      key={themeOption.value}
                      type="button"
                      onClick={() => handlePreferenceChange('theme', themeOption.value)}
                      className="flex flex-col items-center p-4 rounded-lg border transition-all"
                      style={{
                        borderColor: isActive ? 'var(--color-primary-500)' : 'var(--color-gray-300)',
                        backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                        color: isActive ? 'var(--color-primary-700)' : 'var(--color-gray-700)'
                      }}
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
          <h3 className="font-medium mb-4" style={{ color: 'var(--color-gray-900)' }}>
            Language & Notifications
          </h3>
          <div className="space-y-4">
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiGlobe className="h-4 w-4 mr-2" style={{ color: 'var(--color-gray-400)' }} />
                  Language
                </div>
              </label>
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="input-field"
                style={{
                  backgroundColor: 'var(--color-white)',
                  color: 'var(--color-gray-900)',
                  borderColor: 'var(--color-gray-300)'
                }}
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
                  <FiBell className="h-4 w-4 mr-2" style={{ color: 'var(--color-gray-400)' }} />
                  <span style={{ color: 'var(--color-gray-700)' }}>
                    Receive email notifications
                  </span>
                </div>
                <button
                  onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                  style={{
                    backgroundColor: preferences.notifications 
                      ? 'var(--color-primary-500)' 
                      : 'var(--color-gray-300)'
                  }}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    style={{
                      transform: preferences.notifications ? 'translateX(1.5rem)' : 'translateX(0.25rem)'
                    }}
                  />
                </button>
              </div>
              <p className="text-sm mt-1" style={{ color: 'var(--color-gray-500)' }}>
                Budget alerts and weekly summaries
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