import { useState } from 'react';
import { FiUser, FiMail, FiCalendar, FiPhone, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AccountSettings = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    date_of_birth: user?.date_of_birth?.split('T')[0] || '',
    phone_number: user?.phone_number || '',
    currency: user?.currency || 'USD',
    monthly_income: user?.monthly_income || 0,
    savings_target: user?.savings_target || 0,
  });

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await updateProfile(formData);
    
    if (!result.success) {
      setLoading(false);
    } else {
      setLoading(false);
      toast.success('Account settings updated');
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Implement delete account functionality
      toast.error('Account deletion is disabled in demo mode');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
        <p className="text-gray-600">Update your personal information and preferences</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiUser className="h-4 w-4 mr-2 text-gray-400" />
                  Full Name
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiMail className="h-4 w-4 mr-2 text-gray-400" />
                  Email Address
                </div>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                required
                disabled
              />
              {!user?.is_verified && (
                <p className="text-sm text-warning-600 mt-1">
                  Email not verified. Check your inbox for verification link.
                </p>
              )}
            </div>

            {/* Date of Birth */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                  Date of Birth
                </div>
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiPhone className="h-4 w-4 mr-2 text-gray-400" />
                  Phone Number
                </div>
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="input-field"
                placeholder="+1234567890"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiGlobe className="h-4 w-4 mr-2 text-gray-400" />
                  Currency
                </div>
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input-field"
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Monthly Income */}
            <div>
              <label className="label">Monthly Income</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleChange}
                  className="input-field pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Savings Target */}
            <div>
              <label className="label">Monthly Savings Target</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="savings_target"
                  value={formData.savings_target}
                  onChange={handleChange}
                  className="input-field pl-7"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete Account
              </button>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;