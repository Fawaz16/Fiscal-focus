import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiTrendingUp, FiTrendingDown, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency, formatAmount } = useCurrency();
  const [category, setCategory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/categories/${id}`);
      if (response.data?.success) {
        setCategory(response.data.data.category);
        setTransactions(response.data.data.spending?.transactions ?? []);
        setStats(response.data.data.spending ?? {});
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      setError('Category not found');
      toast.error('Category not found');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete category "${category?.name}"? This action cannot be undone.`)) return;
    
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.data?.success) {
        toast.success('Category deleted successfully');
        navigate('/categories');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(category?.id);
      toast.success('Category ID copied to clipboard');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy category ID');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category details...</p>
        </div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-500">
            <FiCalendar className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Category Not Found</h3>
          <p className="mt-2 text-gray-500">The category you're looking for doesn't exist or has been deleted.</p>
          <div className="mt-6">
            <Link to="/categories" className="btn-primary">
              Back to Categories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const monthlyBudget = category.monthly_budget ?? 0;
  const totalSpent = stats?.total ?? 0;
  const transactionCount = stats?.count ?? 0;
  
  const spentPercentage = monthlyBudget > 0 
    ? (totalSpent / monthlyBudget) * 100 
    : 0;

  const averageTransaction = transactionCount > 0 
    ? totalSpent / transactionCount 
    : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/categories" className="mr-4 text-gray-600 hover:text-gray-900">
              <FiArrowLeft className="h-5 w-5" />
            </Link>
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
                <h1 className="text-2xl font-bold text-gray-900">{category.name ?? 'Unnamed Category'}</h1>
                {category.description && (
                  <p className="text-gray-600 mt-1">{category.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex space-x-3">
            {!category.is_default && (
              <button
                onClick={() => navigate(`/categories/edit/${id}`)}
                className="btn-secondary inline-flex items-center"
              >
                <FiEdit className="mr-2 h-4 w-4" />
                Edit
              </button>
            )}
            {!category.is_default && (
              <button
                onClick={handleDelete}
                className="btn-danger inline-flex items-center"
              >
                <FiTrash2 className="mr-2 h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(totalSpent)}
                  </p>
                </div>
                <FiTrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {monthlyBudget > 0 ? formatAmount(monthlyBudget) : `${currency.symbol}0`}
                  </p>
                </div>
                <FiCalendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Utilization</p>
                  <p className={`text-2xl font-bold ${
                    spentPercentage > 100 ? 'text-red-600' :
                    spentPercentage > 80 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {spentPercentage.toFixed(1)}%
                  </p>
                </div>
                <FiTrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Budget Progress */}
          {monthlyBudget > 0 && (
            <div className="card mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      {formatAmount(totalSpent)} of {formatAmount(monthlyBudget)} spent
                    </span>
                    <span className="text-gray-600">{spentPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        spentPercentage > 100 ? 'bg-red-500' :
                        spentPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(spentPercentage, 100)}%` }}
                    />
                  </div>
                </div>
                
                {category.budget_threshold && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      Alerts will trigger at {category.budget_threshold}% utilization
                    </p>
                    <div className="h-2 bg-gray-200 rounded-full relative">
                      <div 
                        className="absolute h-full w-0.5 bg-yellow-500"
                        style={{ left: `${category.budget_threshold}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recent Transactions */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All →
              </Link>
            </div>
            
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.slice(0, 10).map((transaction) => (
                  <Link
                    key={transaction.id}
                    to={`/transactions/${transaction.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description ?? 'Untitled'}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.date ? format(new Date(transaction.date), 'MMM d, yyyy • h:mm a') : 'Unknown date'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount ?? 0)}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{transaction.type ?? 'Unknown'}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No transactions in this category yet</p>
                  <Link to="/transactions/create" className="btn-primary mt-4 inline-block">
                    Add Transaction
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Category Info */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Information</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{category.name ?? 'Unknown'}</p>
              </div>
              
              {category.description && (
                <div>
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{category.description}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Color</p>
                <div className="flex items-center">
                  <div 
                    className="h-6 w-6 rounded-full mr-2"
                    style={{ backgroundColor: category.color ?? '#6B7280' }}
                  />
                  <span className="font-medium">{category.color ?? '#6B7280'}</span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Type</p>
                <span className={`badge ${category.is_default ? 'badge-info' : 'badge-success'}`}>
                  {category.is_default ? 'Default Category' : 'Custom Category'}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-600">Created</p>
                <p className="font-medium">
                  {category.createdAt ? format(new Date(category.createdAt), 'MMM d, yyyy') : 'Unknown'}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {category.updatedAt ? format(new Date(category.updatedAt), 'MMM d, yyyy') : 'Unknown'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction Count</span>
                <span className="font-medium">{transactionCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Transaction</span>
                <span className="font-medium">
                  {formatAmount(averageTransaction)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-medium">{formatAmount(totalSpent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Month</span>
                <span className="font-medium">{formatAmount(0)}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/transactions/create"
                className="w-full btn-primary inline-flex items-center justify-center"
              >
                Add Transaction
              </Link>
              {!category.is_default && (
                <button
                  onClick={() => navigate(`/categories/edit/${id}`)}
                  className="w-full btn-secondary"
                >
                  Edit Category
                </button>
              )}
              <button
                onClick={handleCopyId}
                className="w-full btn-secondary"
              >
                Copy Category ID
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetail;