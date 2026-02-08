import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiDollarSign, 
  FiPieChart, 
  FiTag, 
  FiSettings,
  FiUser,
  FiBarChart2,
  FiFileText,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Define color schemes for different sections
  const sectionColors = {
    '/dashboard': 'bg-blue-50 border-blue-500 text-blue-700',
    '/transactions': 'bg-green-50 border-green-500 text-green-700',
    '/budgets': 'bg-purple-50 border-purple-500 text-purple-700',
    '/categories': 'bg-yellow-50 border-yellow-500 text-yellow-700',
    '/analytics': 'bg-indigo-50 border-indigo-500 text-indigo-700',
    '/analytics/reports': 'bg-indigo-50 border-indigo-500 text-indigo-700',
    '/profile': 'bg-pink-50 border-pink-500 text-pink-700',
    '/settings': 'bg-gray-50 border-gray-500 text-gray-700',
  };

  // Helper function to determine active section
  const getActiveSection = (path) => {
    // Sort paths by length to match the longest first
    const sortedPaths = Object.keys(sectionColors).sort((a, b) => b.length - a.length);
    
    for (const section of sortedPaths) {
      if (path === section || path.startsWith(section + '/')) {
        return section;
      }
    }
    return null;
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Transactions', href: '/transactions', icon: FiDollarSign },
    { name: 'Budgets', href: '/budgets', icon: FiPieChart },
    { name: 'Categories', href: '/categories', icon: FiTag },
    { name: 'Analytics', href: '/analytics', icon: FiBarChart2 },
    { name: 'Reports', href: '/analytics/reports', icon: FiFileText },
    { name: 'Profile', href: '/profile', icon: FiUser },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.href || 
                    location.pathname.startsWith(item.href + '/');
    const activeSection = getActiveSection(location.pathname);
    const isCurrentSection = activeSection === item.href;
    
    return (
      <NavLink
        to={item.href}
        className={({ isActive: navLinkActive }) => {
          const isItemActive = navLinkActive || 
                              location.pathname.startsWith(item.href + '/');
          const colors = isItemActive 
            ? sectionColors[item.href] || 'bg-primary-50 border-primary-500 text-primary-700'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900';
          
          return `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 border-l-4 ${
            isItemActive 
              ? colors 
              : 'border-l-transparent hover:border-l-gray-300'
          }`;
        }}
        onClick={() => setIsOpen(false)}
      >
        <item.icon className="mr-3 h-5 w-5 shrink-0" />
        {item.name}
        {isCurrentSection && (
          <span className="ml-auto h-2 w-2 rounded-full bg-current animate-pulse"></span>
        )}
      </NavLink>
    );
  };

  // Get current section for sidebar accent
  const currentSection = getActiveSection(location.pathname);
  const sidebarAccentColor = currentSection 
    ? sectionColors[currentSection].split(' ')[0].replace('bg-', '') 
    : 'primary';

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-lg"
      >
        {isOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-xl 
        transition-transform duration-300 ease-in-out lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        border-r-2 border-${sidebarAccentColor}-100
      `}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex h-16 shrink-0 items-center px-6 border-b border-${sidebarAccentColor}-50`}>
            <div className="flex items-center">
              <div className={`h-8 w-8 rounded-lg bg-${sidebarAccentColor}-600 flex items-center justify-center`}>
                <FiDollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">
                Fiscal Focus
              </span>
            </div>
          </div>

          {/* User profile */}
          <div className={`border-b border-${sidebarAccentColor}-50 px-6 py-4`}>
            <div className="flex items-center">
              <div className={`h-10 w-10 rounded-full bg-${sidebarAccentColor}-100 flex items-center justify-center`}>
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt={user.name}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <span className={`text-${sidebarAccentColor}-600 font-semibold`}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-4 py-6">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* Current page indicator */}
          <div className="px-4 py-2">
            <div className={`text-xs px-3 py-1 rounded-full bg-${sidebarAccentColor}-50 text-${sidebarAccentColor}-700 font-medium inline-flex items-center`}>
              <span className={`h-2 w-2 rounded-full bg-${sidebarAccentColor}-500 mr-2`}></span>
              {navigation.find(item => getActiveSection(location.pathname) === item.href)?.name || 'Dashboard'}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <div className="text-xs text-gray-500">
              <p>© {new Date().getFullYear()} Fiscal Focus</p>
              <p className="mt-1">v2.0.0</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;