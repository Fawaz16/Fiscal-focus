import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  FiUser, 
  FiBell, 
  FiShield, 
  FiCreditCard, 
  FiGlobe,
  FiMail,
  FiLock
} from 'react-icons/fi';

const Settings = () => {
  const location = useLocation();
  
  const settingsMenu = [
    {
      name: 'Account',
      href: '/settings/account',
      icon: FiUser,
      description: 'Personal information and security',
    },
    {
      name: 'Notifications',
      href: '/settings/notifications',
      icon: FiBell,
      description: 'Email and push notifications',
    },
    {
      name: 'Privacy & Security',
      href: '/settings/privacy',
      icon: FiShield,
      description: 'Data privacy and security settings',
    },
    {
      name: 'Billing & Subscription',
      href: '/settings/billing',
      icon: FiCreditCard,
      description: 'Payment methods and subscription',
    },
    {
      name: 'Preferences',
      href: '/settings/preferences',
      icon: FiGlobe,
      description: 'Language, theme, and display',
    },
    {
      name: 'Email Settings',
      href: '/settings/email',
      icon: FiMail,
      description: 'Email preferences and templates',
    },
    {
      name: 'Change Password',
      href: '/settings/password',
      icon: FiLock,
      description: 'Update your password',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <nav className="space-y-1">
              {settingsMenu.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-xs text-gray-500">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Stats */}
          <div className="card mt-6">
            <h3 className="font-medium text-gray-900 mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium">Jan 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Login</span>
                <span className="font-medium">Today, 10:30 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email Verified</span>
                <span className="badge badge-success">Yes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">2FA Enabled</span>
                <span className="badge badge-warning">No</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Settings;