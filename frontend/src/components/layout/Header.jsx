import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiBell, FiSearch, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const [notifications] = useState([
    { id: 1, message: 'Budget alert: Food & Dining', type: 'warning' },
    { id: 2, message: 'Welcome to Fiscal Focus!', type: 'info' },
  ]);

  return (
    <header className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Search */}
          <div className="flex flex-1 items-center">
            <div className="w-full max-w-md">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <FiSearch className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="search"
                  className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="Search transactions, budgets..."
                />
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative">
              <button className="rounded-full p-2 text-gray-600 hover:bg-gray-100">
                <FiBell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-danger-500"></span>
                )}
              </button>
            </div>

            {/* Settings */}
            <Link
              to="/settings"
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
            >
              <FiSettings className="h-5 w-5" />
            </Link>

            {/* Logout */}
            <button
              onClick={logout}
              className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
              title="Logout"
            >
              <FiLogOut className="h-5 w-5" />
            </button>

            {/* Profile (mobile) */}
            <div className="lg:hidden">
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <span className="text-primary-600 font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;