import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { FiDollarSign, FiCalendar, FiTag, FiMapPin, FiCreditCard, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateTransaction = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Check URL for duplicate parameter
  const queryParams = new URLSearchParams(location.search);
  const duplicateId = queryParams.get('duplicate');
  const isEditMode = !!id;
  const isDuplicateMode = !!duplicateId;
  const transactionId = isDuplicateMode ? duplicateId : id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode || isDuplicateMode);
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
    if (isEditMode || isDuplicateMode) {
      fetchTransaction();
    }
    fetchCategories();
  }, [transactionId]);

  const fetchTransaction = async () => {
    try {
      const response = await api.get(`/transactions/${transactionId}`);
      if (response.data.success) {
        const transaction = response.data.data.transaction;
        
        // For duplicate mode: use today's date
        // For edit mode: use original date
        const transactionDate = isDuplicateMode ? 
          new Date() : // Today's date for duplicates
          new Date(transaction.date); // Original date for edits
        
        const formattedDate = format(transactionDate, 'yyyy-MM-dd');

        setFormData({
          amount: transaction.amount?.toString() || '',
          type: transaction.type || 'expense',
          description: transaction.description || '',
          date: formattedDate,
          category_id: transaction.category_id || '',
          is_recurring: transaction.is_recurring || false,
          recurrence_pattern: transaction.recurrence_pattern || '',
          location: transaction.location || '',
          payment_method: transaction.payment_method || '',
          notes: transaction.notes || '',
        });
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast.error('Failed to load transaction');
      navigate('/transactions');
    } finally {
      setFetching(false);
    }
  };

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
    
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
      
      // If is_recurring is unchecked, clear recurrence_pattern
      if (name === 'is_recurring' && !checked) {
        newFormData.recurrence_pattern = '';
      }
      
      return newFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.category_id) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const transactionDate = new Date(formData.date);
      
      // Build the transaction data object
      const transactionData = {};
      
      // Required fields
      transactionData.amount = parseFloat(formData.amount);
      transactionData.type = formData.type;
      transactionData.description = formData.description.trim();
      transactionData.date = transactionDate.toISOString();
      transactionData.category_id = formData.category_id;
      transactionData.is_recurring = formData.is_recurring;
      
      // Optional fields - only include if they have values
      if (formData.location) transactionData.location = formData.location;
      if (formData.payment_method) transactionData.payment_method = formData.payment_method;
      if (formData.notes) transactionData.notes = formData.notes;
      
      // Only include recurrence_pattern if is_recurring is true AND pattern is selected
      if (formData.is_recurring && formData.recurrence_pattern) {
        transactionData.recurrence_pattern = formData.recurrence_pattern;
      }
      
      console.log('Sending transaction data:', JSON.stringify(transactionData, null, 2));
      
      let response;
      
      if (isEditMode) {
        response = await api.put(`/transactions/${id}`, transactionData);
      } else {
        response = await api.post('/transactions', transactionData);
      }
      
      if (response.data.success) {
        const successMessage = isEditMode 
          ? 'Transaction updated successfully' 
          : isDuplicateMode 
            ? 'Transaction duplicated successfully' 
            : 'Transaction created successfully';
        
        toast.success(successMessage);
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Full error object:', error);
      console.error('Error response data:', error.response?.data);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(`Validation errors: ${errorMessages}`);
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        const action = isEditMode ? 'update' : isDuplicateMode ? 'duplicate' : 'create';
        toast.error(`Failed to ${action} transaction`);
      }
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

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => navigate('/transactions')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="h-4 w-4 mr-2" />
          Back to Transactions
        </button>

        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Transaction' : 
           isDuplicateMode ? 'Add Similar Transaction' : 'Add Transaction'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update transaction details' : 
           isDuplicateMode ? 'Create a new transaction based on an existing one' : 
           'Record a new income or expense'}
        </p>
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
                  className={`flex-1 py-2 rounded-lg border ${formData.type === 'expense'
                      ? 'border-red-300 bg-red-50 text-red-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                  className={`flex-1 py-2 rounded-lg border ${formData.type === 'income'
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
              {loading
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update Transaction' : 
                   isDuplicateMode ? 'Create Similar Transaction' : 'Create Transaction')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransaction;