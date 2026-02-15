import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiFilter, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';

const Budgets = () => {
  const { currency, formatAmount } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    is_active: '',
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [budgetsResponse, overviewResponse] = await Promise.all([
          api.get('/budgets', { params: filters }).catch(err => {
            console.error('Error fetching budgets:', err);
            return { data: { success: false, data: { budgets: [] } } };
          }),
          api.get('/budgets/overview').catch(err => {
            console.error('Error fetching overview:', err);
            return { data: { success: false, data: null } };
          })
        ]);

        if (budgetsResponse.data?.success) {
          setBudgets(budgetsResponse.data.data.budgets ?? []);
        }
        
        if (overviewResponse.data?.success) {
          setOverview(overviewResponse.data.data);
        }
      } catch (err) {
        setError('Failed to load budgets. Please try again.');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  const getMonthName = (month) => {
    if (!month) return 'N/A';
    const date = new Date(2024, parseInt(month) - 1, 1);
    return format(date, 'MMMM');
  };

  const calculateProgress = (spent = 0, budget = 0) => {
    if (!budget || budget === 0) return 0;
    return Math.min((spent / budget) * 100, 100);
  };

  const getProgressColor = (percentage = 0) => {
    if (percentage > 90) return 'bg-red-500';
    if (percentage > 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const clearFilters = () => {
    setFilters({ year: new Date().getFullYear(), is_active: '' });
  };

  if (error) {
    return (
      <div className="card text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-500">
          <FiCalendar className="h-12 w-12" />
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
      {overview?.hasBudget && overview?.budget && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Current Budget</h3>
              <p className="text-gray-600">
                {getMonthName(overview.budget?.month)} {overview.budget?.year ?? ''}
              </p>
            </div>
            <span className={`badge ${
              overview.budget?.is_active ? 'badge-success' : 'badge-warning'
            }`}>
              {overview.budget?.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(overview.budget?.total_budget ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(overview.budget?.total_spent ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Income</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatAmount(overview.budget?.total_income ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Savings</p>
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(overview.budget?.savings ?? 0)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Budget Progress</span>
              <span className="text-gray-600">
                {overview.totals?.utilization?.toFixed(1) ?? 0}% utilized
              </span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${getProgressColor(overview.totals?.utilization)}`}
                style={{ width: `${Math.min(overview.totals?.utilization ?? 0, 100)}%` }}
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
              onClick={clearFilters}
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
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading budgets...</p>
          </div>
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
            const progress = calculateProgress(budget?.total_spent, budget?.total_budget);
            
            return (
              <Link
                key={budget?.id ?? Math.random()}
                to={`/budgets/${budget?.id ?? ''}`}
                className="card hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getMonthName(budget?.month)} {budget?.year ?? ''}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created {budget?.createdAt ? format(new Date(budget.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <span className={`badge ${
                    budget?.is_active ? 'badge-success' : 'badge-warning'
                  }`}>
                    {budget?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Spent</span>
                      <span className="text-gray-600">
                        {formatAmount(budget?.total_spent ?? 0)} / {formatAmount(budget?.total_budget ?? 0)}
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
                        {formatAmount(budget?.total_income ?? 0)}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Savings</p>
                      <p className="text-lg font-bold text-green-600">
                        {formatAmount(budget?.savings ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <FiTrendingUp className="h-4 w-4 mr-1" />
                    <span>
                      {budget?.total_income && budget?.total_spent
                        ? budget.total_income > budget.total_spent 
                          ? 'Positive' 
                          : 'Negative'
                        : 'Unknown'} cash flow
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