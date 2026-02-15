import { useState } from 'react';
import { FiUser, FiMail, FiCalendar, FiPhone, FiTarget, FiUpload } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

const Profile = () => {
  const { user, updateProfile, uploadProfilePicture } = useAuth();
  const { formatAmount, currency: activeCurrency, availableCurrencies } = useCurrency();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [profileData, setProfileData] = useState({
    name: user?.name ?? '',
    date_of_birth: user?.date_of_birth?.split('T')[0] ?? '',
    phone_number: user?.phone_number ?? '',
    monthly_income: user?.monthly_income ?? 0,
    savings_target: user?.savings_target ?? 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: name.includes('income') || name.includes('savings') 
        ? parseFloat(value) || 0 
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await updateProfile(profileData);
      
      if (result?.success) {
        setEditMode(false);
      } else {
        setError(result?.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setError(null);
        await uploadProfilePicture(file);
      } catch (err) {
        setError('Failed to upload profile picture');
      }
    }
  };

  const getCurrencySymbol = (currencyCode) => {
    return availableCurrencies?.find(c => c.code === currencyCode)?.symbol ?? currencyCode;
  };

  if (!user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not provided';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">Manage your personal information</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {user.profile_picture ? (
                    <img
                      src={user.profile_picture}
                      alt={user.name ?? 'Profile'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-gray-600">
                      {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="profile-picture"
                  className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700"
                >
                  <FiUpload className="h-4 w-4" />
                  <input
                    id="profile-picture"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </label>
              </div>
              
              <div className="mt-6 text-center">
                <h2 className="text-xl font-semibold text-gray-900">{user.name ?? 'User'}</h2>
                <p className="text-gray-600 mt-1">{user.email}</p>
                {user.age && (
                  <p className="text-gray-500 text-sm mt-1">{user.age} years old</p>
                )}
              </div>

              <div className="mt-6 w-full space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium">
                    {formatDate(user.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last login</span>
                  <span className="font-medium">
                    {user.last_login 
                      ? formatDate(user.last_login)
                      : 'Never'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email status</span>
                  <span className={`badge ${user.is_verified ? 'badge-success' : 'badge-warning'}`}>
                    {user.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Form Section */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
              <button
                onClick={() => setEditMode(!editMode)}
                className="btn-secondary"
                type="button"
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="label">
                    <div className="flex items-center">
                      <FiUser className="h-4 w-4 mr-2 text-gray-400" />
                      Full Name
                    </div>
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="input-field"
                      required
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.name ?? 'Not provided'}</p>
                  )}
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="label">
                    <div className="flex items-center">
                      <FiMail className="h-4 w-4 mr-2 text-gray-400" />
                      Email Address
                    </div>
                  </label>
                  <p className="text-gray-900 font-medium">{user.email}</p>
                  {!user.is_verified && (
                    <p className="text-sm text-warning-600 mt-1">
                      Please verify your email address
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
                  {editMode ? (
                    <input
                      type="date"
                      name="date_of_birth"
                      value={profileData.date_of_birth}
                      onChange={handleChange}
                      className="input-field"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {formatDate(user.date_of_birth)}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label className="label">
                    <div className="flex items-center">
                      <FiPhone className="h-4 w-4 mr-2 text-gray-400" />
                      Phone Number
                    </div>
                  </label>
                  {editMode ? (
                    <input
                      type="tel"
                      name="phone_number"
                      value={profileData.phone_number}
                      onChange={handleChange}
                      className="input-field"
                      placeholder="+1234567890"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {user.phone_number || 'Not provided'}
                    </p>
                  )}
                </div>

                {/* Financial Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">
                      <div className="flex items-center">
                        <span className="h-4 w-4 mr-2 text-gray-400 font-medium text-sm">
                          {getCurrencySymbol(user?.currency ?? 'USD')}
                        </span>
                        Monthly Income
                      </div>
                    </label>
                    {editMode ? (
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                          {getCurrencySymbol(user?.currency ?? 'USD')}
                        </span>
                        <input
                          type="number"
                          name="monthly_income"
                          value={profileData.monthly_income}
                          onChange={handleChange}
                          className="input-field pl-9"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {formatAmount(user.monthly_income ?? 0)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="label">
                      <div className="flex items-center">
                        <span className="h-4 w-4 mr-2 text-gray-400 font-medium text-sm">
                          {getCurrencySymbol(user?.currency ?? 'USD')}
                        </span>
                        Monthly Savings Target
                      </div>
                    </label>
                    {editMode ? (
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500 font-medium">
                          {getCurrencySymbol(user?.currency ?? 'USD')}
                        </span>
                        <input
                          type="number"
                          name="savings_target"
                          value={profileData.savings_target}
                          onChange={handleChange}
                          className="input-field pl-9"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {formatAmount(user.savings_target ?? 0)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Currency (Read-only) */}
                <div>
                  <label className="label">
                    <div className="flex items-center">
                      <span className="h-4 w-4 mr-2 text-gray-400 font-medium text-sm">
                        {getCurrencySymbol(user?.currency ?? 'USD')}
                      </span>
                      Currency
                    </div>
                  </label>
                  <p className="text-gray-900 font-medium">
                    {activeCurrency?.name} ({activeCurrency?.code ?? user?.currency ?? 'USD'})
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your preferred currency for displaying amounts
                  </p>
                </div>

                {/* Settings Preview */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Settings Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`h-10 w-10 rounded-full mx-auto ${
                        user.settings?.theme === 'dark' ? 'bg-gray-800' : 'bg-yellow-100'
                      }`} />
                      <p className="text-sm text-gray-600 mt-2">Theme</p>
                      <p className="font-medium capitalize">{user.settings?.theme ?? 'light'}</p>
                    </div>
                    <div className="text-center">
                      <div className={`h-10 w-10 rounded-full mx-auto ${
                        user.settings?.notifications ? 'bg-green-100' : 'bg-gray-100'
                      }`} />
                      <p className="text-sm text-gray-600 mt-2">Notifications</p>
                      <p className="font-medium">
                        {user.settings?.notifications ? 'On' : 'Off'}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="h-10 w-10 rounded-full mx-auto bg-blue-100" />
                      <p className="text-sm text-gray-600 mt-2">Language</p>
                      <p className="font-medium uppercase">{user.settings?.language ?? 'en'}</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                {editMode && (
                  <div className="flex justify-end space-x-4 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => {
                        setEditMode(false);
                        setError(null);
                        setProfileData({
                          name: user?.name ?? '',
                          date_of_birth: user?.date_of_birth?.split('T')[0] ?? '',
                          phone_number: user?.phone_number ?? '',
                          monthly_income: user?.monthly_income ?? 0,
                          savings_target: user?.savings_target ?? 0,
                        });
                      }}
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
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Quick Stats Preview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-linear-to-br from-primary-50 to-primary-100">
          <p className="text-sm text-primary-600 font-medium">Monthly Income</p>
          <p className="text-2xl font-bold text-primary-900 mt-1">
            {formatAmount(user.monthly_income ?? 0)}
          </p>
        </div>
        <div className="card bg-linear-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-600 font-medium">Savings Target</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {formatAmount(user.savings_target ?? 0)}
          </p>
        </div>
        <div className="card bg-linear-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-purple-600 font-medium">Savings Progress</p>
          <p className="text-2xl font-bold text-purple-900 mt-1">
            {user.monthly_income > 0 
              ? `${Math.round((user.savings_target / user.monthly_income) * 100)}%`
              : '0%'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;