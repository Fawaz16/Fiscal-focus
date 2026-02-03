import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiPlus,
  FiFilter,
  FiDownload,
  FiSearch,
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown
} from 'react-icons/fi';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import api from '../../services/api';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category_id: '',
    startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
    payment_method: '',
    is_recurring: '',
  });
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1,
  });

  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, [filters, pagination.page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await api.get('/transactions', { params });

      if (response.data.success) {
        setTransactions(response.data.data.transactions);
        setPagination(response.data.data.pagination);

        // Calculate stats from transactions
        const income = response.data.data.transactions
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + t.amount, 0);

        const expenses = response.data.data.transactions
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);

        setStats({
          totalIncome: income,
          totalExpenses: expenses,
          netBalance: income - expenses
        });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleQuickFilter = (days) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    setFilters(prev => ({
      ...prev,
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportTransactions = () => {
    // Implement export functionality
    console.log('Export transactions');
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">View and manage your financial transactions</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/transactions/create"
              className="btn-primary inline-flex items-center"
            >
              <FiPlus className="mr-2 h-5 w-5" />
              Add Transaction
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="label">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Description, notes..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="label">Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="label">Category</label>
            <select
              name="category_id"
              value={filters.category_id}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="label">Payment Method</label>
            <select
              name="payment_method"
              value={filters.payment_method}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Methods</option>
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
            </select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="label">Start Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">End Date</label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div>
            <label className="label">Quick Filters</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleQuickFilter(7)}
                className="flex-1 btn-secondary text-sm py-2"
              >
                Last 7 Days
              </button>
              <button
                onClick={() => handleQuickFilter(30)}
                className="flex-1 btn-secondary text-sm py-2"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => handleQuickFilter(90)}
                className="flex-1 btn-secondary text-sm py-2"
              >
                Last 90 Days
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-6 border-t">
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchTransactions}
              className="btn-primary inline-flex items-center"
            >
              <FiFilter className="mr-2 h-4 w-4" />
              Apply Filters
            </button>
            <button
              onClick={() => setFilters({
                search: '',
                type: '',
                category_id: '',
                startDate: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
                endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
                payment_method: '',
                is_recurring: '',
              })}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
          <button
            onClick={exportTransactions}
            className="btn-secondary inline-flex items-center"
          >
            <FiDownload className="mr-2 h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Income</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${stats.totalIncome.toFixed(2)}
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-sm text-green-600 mt-2">+0.0% from last month</p>
        </div>

        <div className="bg-red-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Expenses</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${stats.totalExpenses.toFixed(2)}
              </p>
            </div>
            <FiTrendingDown className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm text-red-600 mt-2">-0.0% from last month</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Net Balance</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${stats.netBalance.toFixed(2)}
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <p className={`text-sm mt-2 ${stats.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'
            }`}>
            {stats.netBalance >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="mt-4 text-lg font-medium text-gray-900">No transactions found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your filters or add a new transaction.</p>
            <div className="mt-6">
              <Link to="/transactions/create" className="btn-primary">
                Add Transaction
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                          {transaction.type === 'income' ? (
                            <FiTrendingUp className={`h-5 w-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`} />
                          ) : (
                            <FiTrendingDown className={`h-5 w-5 ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                              }`} />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            {transaction.location || 'No location'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: transaction.Category?.color }}
                        />
                        <span className="text-sm text-gray-900">
                          {transaction.Category?.name || 'Uncategorized'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                      <div className="text-gray-500 text-xs">
                        {format(new Date(transaction.date), 'h:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                        {transaction.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        ${transaction.amount.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusColor(transaction.status)}`}>
                        {transaction.is_cleared ? 'Cleared' : 'Pending'}
                      </span>
                      {transaction.is_recurring && (
                        <span className="badge badge-info ml-2">Recurring</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/transactions/${transaction.id}`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        View
                      </Link>
                      <Link
                        to={`/transactions/edit/${transaction.id}`}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;