import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit, FiTrash2, FiTrendingUp, FiTrendingDown, FiPieChart } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BudgetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categorySpending, setCategorySpending] = useState([]);

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
      const response = await api.get(`/budgets/${id}`);
      
      if (response.data.success) {
        setBudget(response.data.data.budget);
        setCategorySpending(response.data.data.categorySpending || []);
      }
    } catch (error) {
      toast.error('Budget not found');
      navigate('/budgets');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this budget?')) return;
    
    try {
      const response = await api.delete(`/budgets/${id}`);
      if (response.data.success) {
        toast.success('Budget deleted');
        navigate('/budgets');
      }
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 w-full h-100 flex items-center justify-center">
        <div className="flex items-center justify-center">
          Loading Budget Details...
        </div>
      </div>
    );
  }

  if (!budget) return null;

  const progress = (budget.total_spent / budget.total_budget) * 100;
  const remaining = budget.total_budget - budget.total_spent;
  const savingsRate = budget.total_income > 0 
    ? ((budget.savings / budget.total_income) * 100) 
    : 0;

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
                {getMonthName(budget.month)} {budget.year} Budget
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
                    ${budget.total_budget.toFixed(2)}
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
                    ${budget.total_spent.toFixed(2)}
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
                    ${remaining.toFixed(2)}
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
                    ${budget.total_spent.toFixed(2)} of ${budget.total_budget.toFixed(2)} spent
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
                  const categoryBudget = item.Category?.monthly_budget || 1;
                  const catProgress = (item.total_spent / categoryBudget) * 100;
                  return (
                    <div key={item.category_id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-3"
                            style={{ backgroundColor: item.Category?.color }}
                          />
                          <span className="font-medium">{item.Category?.name}</span>
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
                          ${item.total_spent?.toFixed(2)} / ${categoryBudget.toFixed(2)}
                        </span>
                        <span className="text-gray-600">
                          ${(categoryBudget - item.total_spent).toFixed(2)} remaining
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
                  ${budget.total_income.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Savings</p>
                <p className="text-xl font-bold text-green-600">
                  +${budget.savings.toFixed(2)}
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
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {transaction.Category?.name} • {safeFormat(transaction.date, 'MMM d')}
                    </p>
                  </div>
                  <span className={`font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ${transaction.amount.toFixed(2)}
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
                  ${new Date().getDate() > 0 ? (budget.total_spent / new Date().getDate()).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transactions</span>
                <span className="font-medium">{budget.Transactions?.length || 0}</span>
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