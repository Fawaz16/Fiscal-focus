import { useState } from 'react';
import { FiUser, FiMail, FiCalendar, FiPhone, FiGlobe } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import toast from 'react-hot-toast';

const AccountSettings = () => {
  const { user, updateProfile } = useAuth();
  const { formatAmount, currency: activeCurrency, availableCurrencies } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    date_of_birth: user?.date_of_birth?.split('T')[0] ?? '',
    phone_number: user?.phone_number ?? '',
    currency: user?.currency ?? availableCurrencies?.[0]?.code ?? 'USD',
    monthly_income: user?.monthly_income ?? 0,
    savings_target: user?.savings_target ?? 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    if (error) setError(null);
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateProfile({
        ...formData,
        monthly_income: parseFloat(formData.monthly_income) || 0,
        savings_target: parseFloat(formData.savings_target) || 0,
      });
      
      if (result?.success) {
        toast.success('Account settings updated successfully');
      } else {
        throw new Error(result?.error || 'Failed to update account settings');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.error('Account deletion is disabled in demo mode');
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name ?? '',
      email: user?.email ?? '',
      date_of_birth: user?.date_of_birth?.split('T')[0] ?? '',
      phone_number: user?.phone_number ?? '',
      currency: user?.currency ?? availableCurrencies?.[0]?.code ?? 'USD',
      monthly_income: user?.monthly_income ?? 0,
      savings_target: user?.savings_target ?? 0,
    });
    setError(null);
  };

  const getCurrencySymbol = (currencyCode) => {
    return availableCurrencies?.find(c => c.code === currencyCode)?.symbol ?? currencyCode;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Account Settings</h2>
        <p className="text-gray-600">Update your personal information and preferences</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              >
                {availableCurrencies?.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Current display currency: {activeCurrency?.name} ({activeCurrency?.code})
              </p>
            </div>

            {/* Monthly Income */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <span className="h-4 w-4 mr-2 text-gray-400 font-medium text-sm">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  Monthly Income
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                  {getCurrencySymbol(formData.currency)}
                </span>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleNumberChange}
                  className="input-field pl-9"
                  min="0"
                  step="0.01"
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>
              {formData.monthly_income > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Current: {formatAmount(formData.monthly_income)}
                </p>
              )}
            </div>

            {/* Savings Target */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <span className="h-4 w-4 mr-2 text-gray-400 font-medium text-sm">
                    {getCurrencySymbol(formData.currency)}
                  </span>
                  Monthly Savings Target
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                  {getCurrencySymbol(formData.currency)}
                </span>
                <input
                  type="number"
                  name="savings_target"
                  value={formData.savings_target}
                  onChange={handleNumberChange}
                  className="input-field pl-9"
                  min="0"
                  step="0.01"
                  disabled={loading}
                  placeholder="0.00"
                />
              </div>
              {formData.savings_target > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Target: {formatAmount(formData.savings_target)}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t">
            <div>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Delete Account
              </button>
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
                disabled={loading}
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

      {/* Preview Section - Show formatted values */}
      <div className="card bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Formatted Values Preview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Monthly Income</p>
            <p className="text-sm font-medium text-gray-900">
              {formatAmount(formData.monthly_income)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Savings Target</p>
            <p className="text-sm font-medium text-gray-900">
              {formatAmount(formData.savings_target)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Selected Currency</p>
            <p className="text-sm font-medium text-gray-900">
              {formData.currency} - {availableCurrencies?.find(c => c.code === formData.currency)?.name ?? formData.currency}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Display Format</p>
            <p className="text-sm font-medium text-gray-900">
              {activeCurrency?.name} ({activeCurrency?.code})
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;