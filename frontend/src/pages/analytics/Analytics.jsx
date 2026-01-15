import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiFilter } from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useBalance } from '../../context/BalanceContext';

const Analytics = () => {
  const { getFinancialSummary, getCategoryBreakdown, getBalanceForecast } = useBalance();
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    
    try {
      const [summaryData, breakdownData, forecastData] = await Promise.all([
        getFinancialSummary(period),
        getCategoryBreakdown(dateRange.startDate, dateRange.endDate),
        getBalanceForecast(30),
      ]);
      
      setSummary(summaryData);
      setBreakdown(breakdownData);
      setForecast(forecastData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
  ];

  const quickRanges = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
  ];

  const handleQuickRange = (days) => {
    const endDate = new Date();
    const startDate = subMonths(endDate, days / 30);
    setDateRange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded"></div>
          <div className="h-80 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  // Sample data for charts
  const monthlyData = [
    { month: 'Jan', income: 4000, expenses: 2400 },
    { month: 'Feb', income: 3000, expenses: 1398 },
    { month: 'Mar', income: 2000, expenses: 9800 },
    { month: 'Apr', income: 2780, expenses: 3908 },
    { month: 'May', income: 1890, expenses: 4800 },
    { month: 'Jun', income: 2390, expenses: 3800 },
  ];

  const categoryData = breakdown?.breakdown 
    ? Object.entries(breakdown.breakdown).map(([name, data]) => ({
        name,
        value: data.amount,
        color: data.color,
      }))
    : [];

  const forecastData = [
    { day: 'Today', projected: 800 },
    { day: 'Day 7', projected: 1000 },
    { day: 'Day 14', projected: 1200 },
    { day: 'Day 21', projected: 1400 },
    { day: 'Day 30', projected: 1600 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">Gain insights into your financial patterns</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="btn-secondary inline-flex items-center">
            <FiFilter className="mr-2 h-4 w-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Time Period</label>
            <div className="flex space-x-2">
              {periods.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`flex-1 py-2 rounded-lg border ${
                    period === p.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Date Range</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                className="input-field text-sm"
              />
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                className="input-field text-sm"
              />
            </div>
          </div>

          <div>
            <label className="label">Quick Range</label>
            <div className="flex space-x-2">
              {quickRanges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => handleQuickRange(range.days)}
                  className="flex-1 btn-secondary text-sm py-2"
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Income</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ${summary.income.toFixed(2)}
                </p>
              </div>
              <FiTrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm text-blue-600 mt-2">+12.5% from last period</p>
          </div>

          <div className="bg-red-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Total Expenses</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ${summary.expenses.toFixed(2)}
                </p>
              </div>
              <FiTrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-sm text-red-600 mt-2">-5.3% from last period</p>
          </div>

          <div className="bg-green-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Net Balance</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ${summary.net.toFixed(2)}
                </p>
              </div>
              <FiTrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm text-green-600 mt-2">
              {summary.net >= 0 ? 'Positive' : 'Negative'} cash flow
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  name="Income"
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Spending Pattern</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#f59e0b" name="Daily Spending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Balance Forecast */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day Balance Forecast</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Projected Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {forecast && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  ${forecast.currentBalance?.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Projected in 30 days</p>
                <p className="text-xl font-bold text-green-600">
                  ${forecast.projectedBalance?.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Top Spending Category</h4>
            <p className="text-blue-700">
              {categoryData[0]?.name || 'No data'} - ${categoryData[0]?.value?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-blue-600 mt-2">
              Consider reviewing expenses in this category
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Savings Rate</h4>
            <p className="text-green-700">
              {summary?.net && summary?.income 
                ? ((summary.net / summary.income) * 100).toFixed(1) 
                : '0'}%
            </p>
            <p className="text-sm text-green-600 mt-2">
              {((summary?.net || 0) / (summary?.income || 1)) * 100 > 20 
                ? 'Excellent savings rate!' 
                : 'Consider increasing your savings rate'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;