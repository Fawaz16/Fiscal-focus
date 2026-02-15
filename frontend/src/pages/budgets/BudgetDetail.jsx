import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiTrendingUp, FiTrendingDown, FiPieChart } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

const BudgetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency, formatAmount } = useCurrency();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categorySpending, setCategorySpending] = useState([]);
  const [error, setError] = useState(null);

  // Safe date formatting helper
  const safeFormat = (dateString, formatStr) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, formatStr);
  };

  // Get month name safely
  const getMonthName = (month) => {
    if (!month || !budget?.year) return 'Invalid month';
    const date = new Date(budget.year, month - 1, 1);
    if (isNaN(date.getTime())) return 'Invalid date';
    return format(date, 'MMMM');
  };

  useEffect(() => {
    fetchBudgetDetails();
  }, [id]);

  const fetchBudgetDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/budgets/${id}`);
      
      if (response.data.success) {
        setBudget(response.data.data.budget);
        setCategorySpending(response.data.data.categorySpending ?? []);
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
      setError('Budget not found');
      toast.error('Budget not found');
      navigate('/budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) return;
    
    try {
      const response = await api.delete(`/budgets/${id}`);
      if (response.data?.success) {
        toast.success('Budget deleted successfully');
        navigate('/budgets');
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading budget details...</p>
        </div>
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="card text-center py-12">
          <div className="mx-auto h-12 w-12 text-red-500">
            <FiPieChart className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Budget Not Found</h3>
          <p className="mt-2 text-gray-500">The budget you're looking for doesn't exist or has been deleted.</p>
          <div className="mt-6">
            <Link to="/budgets" className="btn-primary">
              Back to Budgets
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalBudget = budget.total_budget ?? 0;
  const totalSpent = budget.total_spent ?? 0;
  const totalIncome = budget.total_income ?? 0;
  const savings = budget.savings ?? 0;
  
  const progress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const remaining = totalBudget - totalSpent;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/budgets" className="mr-4 text-gray-600 hover:text-gray-900">
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getMonthName(budget.month)} {budget.year ?? ''} Budget
              </h1>
              <p className="text-gray-600 mt-1">
                Created {safeFormat(budget.createdAt, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <span className={`badge ${budget.is_active ? 'badge-success' : 'badge-warning'}`}>
              {budget.is_active ? 'Active' : 'Inactive'}
            </span>
            <button
              onClick={() => navigate(`/budgets/edit/${id}`)}
              className="btn-secondary inline-flex items-center"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="btn-danger inline-flex items-center"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatAmount(totalBudget)}
                  </p>
                </div>
                <FiPieChart className="h-8 w-8 text-blue-500" />
              </div>
            </div>

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
                  <p className="text-sm text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatAmount(remaining)}
                  </p>
                </div>
                <FiTrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="card mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {formatAmount(totalSpent)} of {formatAmount(totalBudget)} spent
                  </span>
                  <span className="text-gray-600">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      progress > 90 ? 'bg-red-500' :
                      progress > 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
            <div className="space-y-4">
              {categorySpending.length > 0 ? (
                categorySpending.map((item) => {
                  const categoryBudget = item.Category?.monthly_budget ?? 1;
                  const spent = item.total_spent ?? 0;
                  const catProgress = categoryBudget > 0 ? (spent / categoryBudget) * 100 : 0;
                  const remaining = categoryBudget - spent;
                  
                  return (
                    <div key={item.category_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-3"
                            style={{ backgroundColor: item.Category?.color ?? '#6B7280' }}
                          />
                          <span className="font-medium">{item.Category?.name ?? 'Unknown Category'}</span>
                        </div>
                        <span className={`badge ${
                          catProgress > 90 ? 'badge-danger' :
                          catProgress > 75 ? 'badge-warning' : 'badge-success'
                        }`}>
                          {catProgress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          {formatAmount(spent)} / {formatAmount(categoryBudget)}
                        </span>
                        <span className="text-gray-600">
                          {formatAmount(remaining)} remaining
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            catProgress > 90 ? 'bg-red-500' :
                            catProgress > 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(catProgress, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">No category data available</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Income & Savings */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income & Savings</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatAmount(totalIncome)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Savings</p>
                <p className="text-xl font-bold text-green-600">
                  {formatAmount(savings)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Savings Rate</p>
                <p className="text-xl font-bold text-blue-600">
                  {savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
            <div className="space-y-3">
              {budget.Transactions?.slice(0, 5).map((transaction) => (
                <Link
                  key={transaction.id}
                  to={`/transactions/${transaction.id}`}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description ?? 'Untitled'}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.Category?.name ?? 'Uncategorized'} • {safeFormat(transaction.date, 'MMM d')}
                    </p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatAmount(transaction.amount ?? 0)}
                  </span>
                </Link>
              ))}
              {(!budget.Transactions || budget.Transactions.length === 0) && (
                <p className="text-gray-500 text-center py-2">No transactions</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View all transactions →
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Average</span>
                <span className="font-medium">
                  {formatAmount(new Date().getDate() > 0 ? (totalSpent / new Date().getDate()) : 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions</span>
                <span className="font-medium">{budget.Transactions?.length ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Updated</span>
                <span className="font-medium">
                  {safeFormat(budget.updatedAt, 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetDetail;