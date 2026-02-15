import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFilter, FiPieChart, FiEdit, FiTrash2 } from 'react-icons/fi';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

const Categories = () => {
  const { currency, formatAmount } = useCurrency();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    has_budget: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await Promise.all([
          fetchCategories(),
          fetchStats()
        ]);
      } catch (err) {
        setError('Failed to load categories. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories', { params: filters });
      if (response.data?.success) {
        setCategories(response.data.data.categories ?? []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/categories/stats/month');
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Don't throw error for stats - non-critical
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"? This action cannot be undone.`)) return;
    
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.data?.success) {
        toast.success('Category deleted successfully');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const getSpentPercentage = (spent = 0, budget = 0) => {
    if (!budget || budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getStatusColor = (percentage = 0) => {
    if (percentage > 100) return 'text-red-600 bg-red-50';
    if (percentage > 80) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  const getProgressBarColor = (percentage = 0) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const clearFilters = () => {
    setFilters({ search: '', has_budget: '' });
  };

  if (error) {
    return (
      <div className="card text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-500">
          <FiPieChart className="h-12 w-12" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Something went wrong</h3>
        <p className="mt-2 text-gray-500">{error}</p>
        <div className="mt-6">
          <button onClick={clearFilters} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600 mt-1">Organize and track your spending categories</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/categories/create"
              className="btn-primary inline-flex items-center"
            >
              <FiPlus className="mr-2 h-5 w-5" />
              Add Category
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats?.categories?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.categories.slice(0, 3).map((category) => {
            const spent = category.spent ?? 0;
            const budget = category.budget ?? 0;
            const percentage = category.percentage ?? 0;
            
            return (
              <div key={category.category} className="card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: (category.color ?? '#6B7280') + '20' }}
                    >
                      <div 
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: category.color ?? '#6B7280' }}
                      />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{category.category ?? 'Unknown'}</p>
                      <p className="text-sm text-gray-500">
                        {formatAmount(spent)} of {formatAmount(budget)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(percentage)}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Search Categories</label>
            <input
              type="text"
              placeholder="Search by name..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">Budget Status</label>
            <select
              value={filters.has_budget}
              onChange={(e) => setFilters(prev => ({ ...prev, has_budget: e.target.value }))}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="true">With Budget</option>
              <option value="false">Without Budget</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FiPieChart className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No categories found</h3>
          <p className="mt-2 text-gray-500">Create categories to organize your transactions.</p>
          <div className="mt-6">
            <Link to="/categories/create" className="btn-primary">
              Create Category
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            // For demo, calculate random spent amount - this should ideally come from real data
            const monthlyBudget = category.monthly_budget ?? 0;
            const spent = monthlyBudget > 0 ? (monthlyBudget * Math.random()) : 0;
            const percentage = getSpentPercentage(spent, monthlyBudget);
            
            return (
              <div key={category.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div 
                      className="h-10 w-10 rounded-lg flex items-center justify-center mr-3"
                      style={{ backgroundColor: (category.color ?? '#6B7280') + '20' }}
                    >
                      <div 
                        className="h-6 w-6 rounded-full"
                        style={{ backgroundColor: category.color ?? '#6B7280' }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name ?? 'Unnamed'}</h3>
                      {category.is_default && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/categories/edit/${category.id}`}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FiEdit className="h-4 w-4" />
                    </Link>
                    {!category.is_default && (
                      <button
                        onClick={() => handleDelete(category.id, category.name)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                )}

                {monthlyBudget > 0 ? (
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {formatAmount(spent)} of {formatAmount(monthlyBudget)}
                        </span>
                        <span className={`font-medium ${getStatusColor(percentage).split(' ')[0]}`}>
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getProgressBarColor(percentage)}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Budget</p>
                        <p className="font-medium">{formatAmount(monthlyBudget)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Threshold</p>
                        <p className="font-medium">{category.budget_threshold ?? 80}%</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No budget set</p>
                    <Link
                      to={`/categories/edit/${category.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
                    >
                      Set Budget
                    </Link>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t">
                  <Link
                    to={`/categories/${category.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Categories;