import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiTag, FiPercent, FiDroplet, FiArrowLeft, FiCalendar } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

const CreateCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currency, formatAmount } = useCurrency();
  
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6', // Default blue
    icon: 'tag',
    monthly_budget: '',
    budget_threshold: 80,
  });

  // Fetch category data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      setFetching(true);
      setError(null);
      
      const response = await api.get(`/categories/${id}`);
      if (response.data?.success) {
        const category = response.data.data.category;
        setFormData({
          name: category.name || '',
          description: category.description || '',
          color: category.color || '#3B82F6',
          icon: category.icon || 'tag',
          monthly_budget: category.monthly_budget?.toString() || '',
          budget_threshold: category.budget_threshold || 80,
        });
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Failed to load category');
      toast.error('Failed to load category');
      navigate('/categories');
    } finally {
      setFetching(false);
    }
  };

  const colors = [
    { value: '#EF4444', label: 'Red' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#10B981', label: 'Green' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#6B7280', label: 'Gray' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        color: formData.color,
        icon: 'tag', // Default icon
        monthly_budget: formData.monthly_budget ? parseFloat(formData.monthly_budget) : null,
        budget_threshold: parseInt(formData.budget_threshold, 10),
      };
      
      let response;
      
      if (isEditMode) {
        response = await api.put(`/categories/${id}`, categoryData);
      } else {
        response = await api.post('/categories', categoryData);
      }
      
      if (response.data?.success) {
        toast.success(isEditMode ? 'Category updated successfully' : 'Category created successfully');
        navigate('/categories');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.response?.data?.message || 
        (isEditMode ? 'Failed to update category' : 'Failed to create category'));
    } finally {
      setLoading(false);
    }
  };

  // Show loading state when fetching data in edit mode
  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="card text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-500">
            <FiTag className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Category Not Found</h3>
          <p className="mt-2 text-gray-500">{error}</p>
          <div className="mt-6">
            <button
              onClick={() => navigate('/categories')}
              className="btn-primary"
            >
              Back to Categories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with back button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/categories')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Category' : 'Create Category'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update your category details' : 'Add a new spending category'}
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiTag className="h-4 w-4 mr-2 text-gray-400" />
                  Category Name *
                </div>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Food & Dining"
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiDroplet className="h-4 w-4 mr-2 text-gray-400" />
                  Color
                </div>
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`h-8 w-8 rounded-full border-2 ${
                      formData.color === color.value ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-300' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                    aria-label={`Select ${color.label} color`}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="input-field"
                placeholder="Optional description for this category"
              />
            </div>

            {/* Monthly Budget */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                  Monthly Budget (Optional)
                </div>
              </label>
              <input
                type="number"
                name="monthly_budget"
                value={formData.monthly_budget}
                onChange={handleChange}
                className="input-field"
                placeholder={`${currency.symbol}0.00`}
                step="0.01"
                min="0"
              />
            </div>

            {/* Budget Threshold */}
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiPercent className="h-4 w-4 mr-2 text-gray-400" />
                  Alert Threshold
                </div>
              </label>
              <div className="relative">
                <input
                  type="range"
                  name="budget_threshold"
                  min="50"
                  max="100"
                  step="5"
                  value={formData.budget_threshold}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-gray-600">50%</span>
                  <span className="text-sm font-medium text-gray-900">{formData.budget_threshold}%</span>
                  <span className="text-sm text-gray-600">100%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Receive alerts when spending reaches this percentage of budget
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div 
              className="p-4 rounded-lg flex items-center"
              style={{ backgroundColor: formData.color + '20' }}
            >
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center mr-4"
                style={{ backgroundColor: formData.color }}
              >
                <div className="h-6 w-6 rounded-full bg-white opacity-80" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{formData.name.trim() || 'Category Name'}</h4>
                {formData.description && (
                  <p className="text-sm text-gray-600">{formData.description}</p>
                )}
                {formData.monthly_budget && (
                  <p className="text-sm text-gray-600">
                    Monthly Budget: {formatAmount(parseFloat(formData.monthly_budget) || 0)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate('/categories')}
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
                : (isEditMode ? 'Update Category' : 'Create Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategory;