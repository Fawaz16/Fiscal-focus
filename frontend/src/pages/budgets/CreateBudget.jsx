import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiCalendar, FiPlus, FiMinus, FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

const CreateBudget = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { currency, formatAmount } = useCurrency();
  
  const isEditMode = !!id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    total_budget: '',
    categories: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isEditMode) {
          await fetchBudget();
        }
        await fetchCategories();
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [id]);

  const fetchBudget = async () => {
    try {
      const response = await api.get(`/budgets/${id}`);
      if (response.data.success) {
        const budget = response.data.data.budget;
        setFormData({
          month: budget.month,
          year: budget.year,
          total_budget: budget.total_budget?.toString() || '',
          categories: budget.categories || [],
        });
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      toast.error('Failed to load budget');
      navigate('/budgets');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories ?? []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2024, i, 1), 'MMMM'),
  }));

  const years = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - 1 + i);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (categoryId, value) => {
    setFormData(prev => {
      const existingIndex = prev.categories.findIndex(cat => cat.category_id === categoryId);
      
      if (existingIndex >= 0) {
        const updatedCategories = [...prev.categories];
        if (value === '' || value === '0') {
          updatedCategories.splice(existingIndex, 1);
        } else {
          updatedCategories[existingIndex] = {
            ...updatedCategories[existingIndex],
            budget: parseFloat(value) || 0,
          };
        }
        
        return {
          ...prev,
          categories: updatedCategories,
        };
      } else if (value && value !== '0') {
        return {
          ...prev,
          categories: [
            ...prev.categories,
            {
              category_id: categoryId,
              budget: parseFloat(value) || 0,
            },
          ],
        };
      }
      
      return prev;
    });
  };

  const getCategoryBudget = (categoryId) => {
    const category = formData.categories.find(cat => cat.category_id === categoryId);
    return category ? category.budget.toString() : '';
  };

  const calculateTotal = () => {
    return formData.categories.reduce((sum, cat) => sum + (cat.budget || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.total_budget) {
      toast.error('Total budget is required');
      return;
    }
    
    if (formData.categories.length === 0) {
      toast.error('Add at least one category budget');
      return;
    }
    
    const totalCategoryBudgets = calculateTotal();
    if (totalCategoryBudgets > parseFloat(formData.total_budget)) {
      toast.error('Category budgets exceed total budget');
      return;
    }
    
    setLoading(true);
    
    try {
      const budgetData = {
        month: formData.month,
        year: formData.year,
        total_budget: parseFloat(formData.total_budget) || 0,
        categories: formData.categories,
      };
      
      let response;
      
      if (isEditMode) {
        response = await api.put(`/budgets/${id}`, budgetData);
      } else {
        response = await api.post('/budgets', budgetData);
      }
      
      if (response.data?.success) {
        toast.success(isEditMode ? 'Budget updated successfully' : 'Budget created successfully');
        navigate('/budgets');
      }
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error(error.response?.data?.message || 
        (isEditMode ? 'Failed to update budget' : 'Failed to create budget'));
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => navigate('/budgets')}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="h-4 w-4 mr-2" />
          Back to Budgets
        </button>
        
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditMode ? 'Edit Budget' : 'Create Budget'}
        </h1>
        <p className="text-gray-600 mt-1">
          {isEditMode ? 'Update your budget details' : 'Plan your spending for the month'}
        </p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                  Month
                </div>
              </label>
              <select
                name="month"
                value={formData.month}
                onChange={handleChange}
                className="input-field"
                required
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                  Year
                </div>
              </label>
              <select
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="input-field"
                required
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <div className="flex items-center">
                  <FiCalendar className="h-4 w-4 mr-2 text-gray-400" />
                  Total Budget *
                </div>
              </label>
              <input
                type="number"
                name="total_budget"
                value={formData.total_budget}
                onChange={handleChange}
                className="input-field"
                placeholder={`${currency.symbol}0.00`}
                step="0.01"
                min="0"
                required
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Category Budgets</h3>
              <div className="text-sm text-gray-600">
                Total: {formatAmount(calculateTotal())} / {formatAmount(parseFloat(formData.total_budget) || 0)}
              </div>
            </div>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="h-8 w-8 rounded-lg mr-4"
                      style={{ backgroundColor: category.color + '20' }}
                    >
                      <div 
                        className="h-full w-full flex items-center justify-center"
                        style={{ color: category.color }}
                      >
                        ●
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      {category.monthly_budget && (
                        <p className="text-sm text-gray-500">
                          Previous: {formatAmount(category.monthly_budget)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      value={getCategoryBudget(category.id)}
                      onChange={(e) => handleCategoryChange(category.id, e.target.value)}
                      className="input-field w-32"
                      placeholder={`${currency.symbol}0.00`}
                      step="0.01"
                      min="0"
                    />
                    {getCategoryBudget(category.id) ? (
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(category.id, '')}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiMinus className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCategoryChange(category.id, category.monthly_budget?.toString() || '100')}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FiPlus className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {formData.categories.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500">No categories added yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click the + button next to categories to add budgets
                </p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="font-medium text-blue-900 mb-4">Budget Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-blue-600">Total Budget</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatAmount(parseFloat(formData.total_budget) || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Allocated</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatAmount(calculateTotal())}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-600">Remaining</p>
                <p className={`text-2xl font-bold ${
                  calculateTotal() > (parseFloat(formData.total_budget) || 0) 
                    ? 'text-red-600' 
                    : 'text-green-600'
                }`}>
                  {formatAmount((parseFloat(formData.total_budget) || 0) - calculateTotal())}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/budgets')}
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
                : (isEditMode ? 'Update Budget' : 'Create Budget')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBudget;