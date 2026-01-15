import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTag, FiDollarSign, FiPercent, FiDroplet } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CreateCategory = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6', // Default blue
    icon: 'tag',
    monthly_budget: '',
    budget_threshold: 80,
  });

  const colors = [
    { value: '#EF4444', label: 'Red' },
    { value: '#F59E0B', label: 'Amber' },
    { value: '#10B981', label: 'Green' },
    { value: '#3B82F6', label: 'Blue' },
    { value: '#8B5CF6', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#6B7280', label: 'Gray' },
  ];

  const icons = [
    { value: 'tag', label: 'Tag' },
    { value: 'shopping-bag', label: 'Shopping' },
    { value: 'utensils', label: 'Food' },
    { value: 'car', label: 'Transport' },
    { value: 'home', label: 'Home' },
    { value: 'film', label: 'Entertainment' },
    { value: 'heart', label: 'Health' },
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
        ...formData,
        monthly_budget: formData.monthly_budget ? parseFloat(formData.monthly_budget) : null,
        budget_threshold: parseInt(formData.budget_threshold),
      };
      
      const response = await api.post('/categories', categoryData);
      
      if (response.data.success) {
        toast.success('Category created successfully');
        navigate('/categories');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create Category</h1>
        <p className="text-gray-600 mt-1">Add a new spending category</p>
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
              <div className="flex space-x-2">
                {colors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`h-8 w-8 rounded-full border-2 ${
                      formData.color === color.value ? 'border-gray-900' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
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
                  <FiDollarSign className="h-4 w-4 mr-2 text-gray-400" />
                  Monthly Budget (Optional)
                </div>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  name="monthly_budget"
                  value={formData.monthly_budget}
                  onChange={handleChange}
                  className="input-field pl-7"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                />
              </div>
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
                  <span className="text-sm font-medium">{formData.budget_threshold}%</span>
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
                <h4 className="font-semibold text-gray-900">{formData.name || 'Category Name'}</h4>
                {formData.description && (
                  <p className="text-sm text-gray-600">{formData.description}</p>
                )}
                {formData.monthly_budget && (
                  <p className="text-sm text-gray-600">
                    Monthly Budget: ${parseFloat(formData.monthly_budget).toFixed(2)}
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
              {loading ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategory;