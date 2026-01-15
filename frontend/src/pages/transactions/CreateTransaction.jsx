import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiDollarSign, FiCalendar, FiTag, FiMapPin, FiCreditCard } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    amount: '',
    type: 'expense',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    is_recurring: false,
    recurrence_pattern: '',
    location: '',
    payment_method: '',
    notes: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      };
      
      const response = await api.post('/transactions', transactionData);
      
      if (response.data.success) {
        toast.success('Transaction created successfully');
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'other', label: 'Other' },
  ];

  const recurrencePatterns = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Add Transaction</h1>
        <p className="text-gray-600 mt-1">Record a new income or expense</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiDollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  Amount *
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="input-field pl-7"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="label">Type *</label>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                  className={`flex-1 py-2 rounded-lg border ${
                    formData.type === 'expense'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                  className={`flex-1 py-2 rounded-lg border ${
                    formData.type === 'income'
                      ? 'border-green-300 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="label">Description *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                placeholder="What was this transaction for?"
                required
              />
            </div>

            {/* Date */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                  Date *
                </div>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiTag className="h-4 w-4 mr-2 text-gray-400" />
                  Category *
                </div>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiCreditCard className="h-4 w-4 mr-2 text-gray-400" />
                  Payment Method
                </div>
              </label>
              <select
                name="payment_method"
                value={formData.payment_method}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select method</option>
                {paymentMethods.map((method) => (
                  <option key={method.value} value={method.value}>
                    {method.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiMapPin className="h-4 w-4 mr-2 text-gray-400" />
                  Location
                </div>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="Store, address, or online"
              />
            </div>

            {/* Recurring Transaction */}
            <div className="md:col-span-2 border-t pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="is_recurring"
                  checked={formData.is_recurring}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  id="is_recurring"
                />
                <label htmlFor="is_recurring" className="ml-2 block text-sm font-medium text-gray-900">
                  This is a recurring transaction
                </label>
              </div>

              {formData.is_recurring && (
                <div>
                  <label className="label">Recurrence Pattern</label>
                  <select
                    name="recurrence_pattern"
                    value={formData.recurrence_pattern}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select pattern</option>
                    {recurrencePatterns.map((pattern) => (
                      <option key={pattern.value} value={pattern.value}>
                        {pattern.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500">
                    This transaction will be automatically duplicated based on the selected pattern.
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="input-field"
                placeholder="Any additional details about this transaction..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/transactions')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransaction;