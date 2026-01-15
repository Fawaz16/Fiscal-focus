import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFilter, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    is_active: '',
  });

  useEffect(() => {
    fetchBudgets();
    fetchOverview();
  }, [filters]);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/budgets', { params: filters });
      if (response.data.success) {
        setBudgets(response.data.data.budgets);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const response = await api.get('/budgets/overview');
      if (response.data.success) {
        setOverview(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  const getMonthName = (month) => {
    const date = new Date(2024, month - 1, 1);
    return format(date, 'MMMM');
  };

  const calculateProgress = (spent, budget) => {
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Budgets</h1>
            <p className="text-gray-600 mt-1">Manage your monthly spending plans</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/budgets/create"
              className="btn-primary inline-flex items-center"
            >
              <FiPlus className="mr-2 h-5 w-5" />
              Create Budget
            </Link>
          </div>
        </div>
      </div>

      {/* Current Budget Overview */}
      {overview?.hasBudget && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Budget</h3>
              <p className="text-gray-600">
                {getMonthName(overview.budget.month)} {overview.budget.year}
              </p>
            </div>
            <span className={`badge ${
              overview.budget.is_active ? 'badge-success' : 'badge-warning'
            }`}>
              {overview.budget.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                ${overview.budget.total_budget.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                ${overview.budget.total_spent.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                ${overview.budget.total_income.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Savings</p>
              <p className="text-2xl font-bold text-green-600">
                +${overview.budget.savings.toFixed(2)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Budget Progress</span>
              <span className="text-gray-600">
                {overview.totals.utilization}% utilized
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColor(overview.totals.utilization)}`}
                style={{ width: `${Math.min(overview.totals.utilization, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
              className="input-field"
            >
              {[2024, 2023, 2022].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select
              value={filters.is_active}
              onChange={(e) => setFilters(prev => ({ ...prev, is_active: e.target.value }))}
              className="input-field"
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ year: new Date().getFullYear(), is_active: '' })}
              className="btn-secondary w-full"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Budgets Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : budgets.length === 0 ? (
        <div className="card text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FiCalendar className="h-12 w-12" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No budgets found</h3>
          <p className="mt-2 text-gray-500">Create your first budget to start tracking your spending.</p>
          <div className="mt-6">
            <Link to="/budgets/create" className="btn-primary">
              Create Budget
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const progress = calculateProgress(budget.total_spent, budget.total_budget);
            
            return (
              <Link
                key={budget.id}
                to={`/budgets/${budget.id}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getMonthName(budget.month)} {budget.year}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created {format(new Date(budget.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`badge ${
                    budget.is_active ? 'badge-success' : 'badge-warning'
                  }`}>
                    {budget.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Spent</span>
                      <span className="text-gray-600">
                        ${budget.total_spent.toFixed(2)} / ${budget.total_budget.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getProgressColor(progress)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {progress.toFixed(1)}%
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Income</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${budget.total_income.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Savings</p>
                      <p className="text-lg font-bold text-green-600">
                        +${budget.savings.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <FiTrendingUp className="h-4 w-4 mr-1" />
                    <span>
                      {budget.total_income > budget.total_spent ? 'Positive' : 'Negative'} cash flow
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Budgets;