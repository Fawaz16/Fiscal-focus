import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiTrendingUp, FiTrendingDown, FiCalendar } from 'react-icons/fi';
import { format, subDays } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const fetchCategoryDetails = async () => {
    try {
      const response = await api.get(`/categories/${id}`);
      if (response.data.success) {
        setCategory(response.data.data.category);
        setTransactions(response.data.data.spending?.transactions || []);
        setStats(response.data.data.spending || {});
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Category not found');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this category?')) return;
    
    try {
      const response = await api.delete(`/categories/${id}`);
      if (response.data.success) {
        toast.success('Category deleted');
        navigate('/categories');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!category) return null;

  const spentPercentage = category.monthly_budget 
    ? ((stats?.total || 0) / category.monthly_budget) * 100 
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
                style={{ backgroundColor: category.color + '20' }}
              >
                <div 
                  className="h-6 w-6 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
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
                    ${(stats?.total || 0).toFixed(2)}
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
                    ${category.monthly_budget?.toFixed(2) || '0.00'}
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
          {category.monthly_budget && (
            <div className="card mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">
                      ${(stats?.total || 0).toFixed(2)} of ${category.monthly_budget.toFixed(2)} spent
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
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(transaction.date), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">{transaction.type}</p>
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
                <p className="font-medium">{category.name}</p>
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
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium">{category.color}</span>
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
                  {format(new Date(category.created_at), 'MMM d, yyyy')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="font-medium">
                  {format(new Date(category.updated_at), 'MMM d, yyyy')}
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
                <span className="font-medium">{stats?.count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Transaction</span>
                <span className="font-medium">
                  ${(stats?.total / (stats?.count || 1)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-medium">${(stats?.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Month</span>
                <span className="font-medium">$0.00</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                to="/transactions/create"
                className="w-full btn-primary"
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
                onClick={() => {
                  navigator.clipboard.writeText(category.id);
                  toast.success('Category ID copied');
                }}
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