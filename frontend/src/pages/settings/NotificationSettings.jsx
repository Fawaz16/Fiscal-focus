import React, { useState, useEffect } from 'react';
import { FiBell, FiMail, FiAlertCircle, FiCreditCard } from 'react-icons/fi';
import api from '../../services/api';

const NotificationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    budgetAlerts: true,
    weeklySummary: true,
    monthlyReport: true,
    transactionAlerts: true,
    lowBalanceAlert: true,
    securityAlerts: true,
    budgetThreshold: 80,
    alertFrequency: 'immediate',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      // This would fetch from /user/settings/notifications
      // For demo, we'll use local state
      setLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleToggle = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // This would post to /user/settings/notifications
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const notificationCategories = [
    {
      title: 'Email Notifications',
      icon: FiMail,
      description: 'Receive notifications via email',
      settings: ['emailNotifications'],
    },
    {
      title: 'Budget Alerts',
      icon: FiBell,
      description: 'Get alerted when approaching budget limits',
      settings: ['budgetAlerts'],
    },
    {
      title: 'Transaction Alerts',
      icon: FiCreditCard,
      description: 'Notifications for transactions',
      settings: ['transactionAlerts'],
    },
    {
      title: 'Security Alerts',
      icon: FiAlertCircle,
      description: 'Important security notifications',
      settings: ['securityAlerts'],
    },
  ];

  const reports = [
    {
      title: 'Weekly Summary',
      description: 'Receive a weekly summary of your finances every Monday',
      setting: 'weeklySummary',
    },
    {
      title: 'Monthly Report',
      description: 'Get a detailed monthly report on the 1st of each month',
      setting: 'monthlyReport',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Notification Settings</h2>
        <p className="text-gray-600">Configure how and when you receive notifications</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Notification Categories */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Categories</h3>
          <div className="space-y-4">
            {notificationCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.title} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center mr-4">
                      <Icon className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{category.title}</h4>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {category.settings.map((setting) => (
                      <div key={setting} className="flex items-center">
                        <input
                          type="checkbox"
                          id={setting}
                          checked={settings[setting]}
                          onChange={() => handleToggle(setting)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={setting} className="ml-2 text-sm text-gray-700">
                          {setting.includes('email') ? 'Email' : 'Push'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Budget Settings */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Alert Settings</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label">Budget Alert Threshold</label>
                <span className="text-lg font-semibold text-primary-600">
                  {settings.budgetThreshold}%
                </span>
              </div>
              <input
                type="range"
                name="budgetThreshold"
                min="50"
                max="100"
                step="5"
                value={settings.budgetThreshold}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>50%</span>
                <span>Alert when budget reaches this percentage</span>
                <span>100%</span>
              </div>
            </div>

            <div>
              <label className="label mb-2">Alert Frequency</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {['immediate', 'daily', 'weekly'].map((frequency) => (
                  <button
                    key={frequency}
                    type="button"
                    onClick={() => setSettings(prev => ({ ...prev, alertFrequency: frequency }))}
                    className={`py-3 rounded-lg border ${
                      settings.alertFrequency === frequency
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Reports */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Automatic Reports</h3>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.title} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{report.title}</h4>
                  <p className="text-sm text-gray-500">{report.description}</p>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={report.setting}
                    checked={settings[report.setting]}
                    onChange={() => handleToggle(report.setting)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor={report.setting} className="ml-2 text-sm text-gray-700">
                    Enable
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Balance Alert */}
        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Low Balance Alert</h3>
              <p className="text-sm text-gray-500">Get notified when your balance is low</p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="lowBalanceAlert"
                checked={settings.lowBalanceAlert}
                onChange={() => handleToggle('lowBalanceAlert')}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="lowBalanceAlert" className="ml-2 text-sm text-gray-700">
                Enable
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Save Notification Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NotificationSettings;