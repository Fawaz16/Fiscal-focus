import { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCalendar, 
  FiFilter,
  FiDownload,
  FiAlertCircle,
  FiPieChart,
  FiRefreshCw,
  FiBarChart2,
  FiFileText
} from 'react-icons/fi';
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
  Legend,
  AreaChart,
  Area,
  ResponsiveContainer
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, subDays, eachMonthOfInterval } from 'date-fns';
import { useBalance } from '../../context/BalanceContext';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { getFinancialSummary, getCategoryBreakdown, getBalanceForecast, getSavingsProgress } = useBalance();
  const { currency, formatAmount } = useCurrency();
  const [period, setPeriod] = useState('month');
  const [summary, setSummary] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [savingsProgress, setSavingsProgress] = useState(null);
  const [transactionStats, setTransactionStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, dateRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [
        summaryData, 
        breakdownData, 
        forecastData, 
        savingsProgressData,
        dashboardData
      ] = await Promise.allSettled([
        getFinancialSummary(period),
        getCategoryBreakdown(dateRange.startDate, dateRange.endDate),
        getBalanceForecast(30),
        getSavingsProgress(),
        fetchDashboardData(),
      ]);
      
      setSummary(summaryData.status === 'fulfilled' ? summaryData.value : null);
      setBreakdown(breakdownData.status === 'fulfilled' ? breakdownData.value : null);
      setForecast(forecastData.status === 'fulfilled' ? forecastData.value : null);
      setSavingsProgress(savingsProgressData.status === 'fulfilled' ? savingsProgressData.value : null);
      setDashboard(dashboardData.status === 'fulfilled' ? dashboardData.value : null);
      
      const transactionStatsData = await fetchTransactionStats(period);
      setTransactionStats(transactionStatsData);
      
      const categoryStatsData = await fetchCategoryStats('month');
      setCategoryStats(categoryStatsData);
      
      const summaryDataValue = summaryData.status === 'fulfilled' ? summaryData.value : null;
      const transactionStatsValue = transactionStatsData;
      
      if (summaryDataValue?.dailyData) {
        const trend = generateMonthlyTrendData(summaryDataValue.dailyData, summaryDataValue);
        setMonthlyTrend(trend);
      } else if (transactionStatsValue?.dailyData) {
        const trend = generateMonthlyTrendData(transactionStatsValue.dailyData);
        setMonthlyTrend(trend);
      }
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setError('Failed to load analytics data. Please try again.');
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/user/dashboard');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      return null;
    }
  };

  const fetchTransactionStats = async (statsPeriod) => {
    try {
      const response = await api.get(`/transactions/stats/${statsPeriod}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching transaction stats:', error);
      return null;
    }
  };

  const fetchCategoryStats = async (statsPeriod) => {
    try {
      const response = await api.get(`/categories/stats/${statsPeriod}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return null;
    }
  };

  const generateMonthlyTrendData = (dailyData, summaryData = null) => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return months.map((month, index) => {
      const monthStr = format(month, 'MMM');
      
      if (!dailyData || !Array.isArray(dailyData) || dailyData.length === 0) {
        if (summaryData?.categoryBreakdown && Object.keys(summaryData.categoryBreakdown).length > 0) {
          const expenses = Object.values(summaryData.categoryBreakdown).reduce((sum, val) => sum + (val || 0), 0);
          const income = summaryData.income || 0;
          
          return {
            month: monthStr,
            income: income / 6,
            expenses: expenses / 6,
            net: (income - expenses) / 6
          };
        }
        
        return {
          month: monthStr,
          income: 0,
          expenses: 0,
          net: 0
        };
      }
      
      const monthKey = format(month, 'yyyy-MM');
      const monthData = dailyData.filter(d => {
        if (!d || !d.date) return false;
        const dateStr = typeof d.date === 'string' ? d.date : d.date.toString();
        return dateStr.includes(monthKey);
      });
      
      const income = monthData.reduce((sum, d) => sum + (d.income || 0), 0);
      const expenses = monthData.reduce((sum, d) => sum + (d.expenses || 0), 0);
      
      return {
        month: monthStr,
        income: income || (summaryData?.income ? summaryData.income / 6 : 0),
        expenses: expenses || (summaryData?.expenses ? summaryData.expenses / 6 : 0),
        net: (income || expenses) ? income - expenses : 0
      };
    });
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
    const startDate = subDays(endDate, days);
    setDateRange({
      startDate: format(startDate, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
    });
  };

  const handleExportReport = () => {
    try {
      toast.loading('Generating CSV report...');
      
      const csvData = prepareCSVData();
      const csv = convertToCSV(csvData);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `financial-report-${dateRange.startDate}-to-${dateRange.endDate}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV report downloaded!');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const prepareCSVData = () => {
    const csvData = [];
    
    csvData.push(['FINANCIAL SUMMARY']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Period', summary?.period || 'N/A']);
    csvData.push(['Date Range', `${dateRange.startDate} to ${dateRange.endDate}`]);
    csvData.push(['Total Income', formatAmount(summary?.income || 0)]);
    csvData.push(['Total Expenses', formatAmount(summary?.expenses || 0)]);
    csvData.push(['Net Balance', formatAmount(summary?.net || 0)]);
    csvData.push(['Transaction Count', summary?.transactionCount || 0]);
    csvData.push(['Average Daily Spending', formatAmount(summary?.avgDailySpending || 0)]);
    csvData.push([]);
    
    csvData.push(['CATEGORY BREAKDOWN']);
    csvData.push(['Category', 'Amount', 'Percentage']);
    
    if (breakdown?.breakdown) {
      Object.entries(breakdown.breakdown).forEach(([category, data]) => {
        csvData.push([category, formatAmount(data.amount), `${data.percentage || 0}%`]);
      });
    } else if (dashboard?.categorySpending) {
      Object.entries(dashboard.categorySpending).forEach(([category, data]) => {
        csvData.push([category, formatAmount(data.amount), `${data.percentage || 0}%`]);
      });
    }
    csvData.push([]);
    
    csvData.push(['CATEGORY PERFORMANCE']);
    csvData.push(['Category', 'Budget', 'Spent', 'Utilization', 'Status']);
    
    if (categoryStats?.categories) {
      categoryStats.categories.forEach(category => {
        const status = category.percentage > 100 ? 'Over Budget' :
                      category.percentage > 80 ? 'Near Limit' : 'On Track';
        csvData.push([
          category.category,
          formatAmount(category.budget || 0),
          formatAmount(category.spent || 0),
          `${category.percentage || 0}%`,
          status
        ]);
      });
    }
    csvData.push([]);
    
    csvData.push(['MONTHLY TREND (Last 6 Months)']);
    csvData.push(['Month', 'Income', 'Expenses', 'Net']);
    
    monthlyTrend.forEach(month => {
      csvData.push([
        month.month,
        formatAmount(month.income),
        formatAmount(month.expenses),
        formatAmount(month.net)
      ]);
    });
    csvData.push([]);
    
    csvData.push(['BALANCE FORECAST (30 Days)']);
    csvData.push(['Day', 'Projected Balance']);
    
    const forecastData = generateForecastData();
    forecastData.forEach(day => {
      csvData.push([day.day, formatAmount(day.projected)]);
    });
    if (forecast) {
      csvData.push(['Accuracy', `${forecast.accuracy || 0}%`]);
    }
    csvData.push([]);
    
    csvData.push(['SAVINGS PROGRESS']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Target', formatAmount(savingsProgress?.target || 0)]);
    csvData.push(['Current', formatAmount(savingsProgress?.current || 0)]);
    csvData.push(['Progress', `${savingsProgress?.progress || 0}%`]);
    csvData.push(['Remaining', formatAmount(savingsProgress?.remaining || 0)]);
    csvData.push(['On Track', savingsProgress?.is_on_track ? 'Yes' : 'No']);
    csvData.push([]);
    
    if (summary?.dailyData && summary.dailyData.length > 0) {
      csvData.push(['DAILY SPENDING']);
      csvData.push(['Date', 'Amount']);
      
      summary.dailyData.forEach(day => {
        csvData.push([day.date, formatAmount(day.amount || 0)]);
      });
    }
    
    return csvData;
  };

  const handleRefreshData = () => {
    fetchAnalyticsData();
    toast.success('Analytics data refreshed!');
  };

  const convertToCSV = (data) => {
    const csvRows = [];
    
    const escapeCSV = (value) => {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    data.forEach(row => {
      if (Array.isArray(row)) {
        csvRows.push(row.map(cell => escapeCSV(cell)).join(','));
      } else {
        const values = Object.values(row).map(val => escapeCSV(val));
        csvRows.push(values.join(','));
      }
    });

    return csvRows.join('\n');
  };

  const generateForecastData = () => {
    if (!forecast) {
      return [
        { day: 'Today', projected: 0 },
        { day: 'Day 7', projected: 0 },
        { day: 'Day 14', projected: 0 },
        { day: 'Day 21', projected: 0 },
        { day: 'Day 30', projected: 0 }
      ];
    }
    
    const days = ['Today', 'Day 7', 'Day 14', 'Day 21', 'Day 30'];
    const currentBalance = forecast.currentBalance || 0;
    const projectedBalance = forecast.projectedBalance || 0;
    const increment = projectedBalance - currentBalance;
    
    return days.map((day, index) => ({
      day,
      projected: currentBalance + (increment * (index / 4))
    }));
  };

  // Prepare category data for pie chart
  const categoryData = breakdown?.breakdown 
    ? Object.entries(breakdown.breakdown).map(([name, data]) => ({
        name,
        value: data.amount || 0,
        color: data.color || '#EF4444',
      }))
    : dashboard?.categorySpending
    ? Object.entries(dashboard.categorySpending).map(([name, data]) => ({
        name,
        value: data.amount || 0,
        color: data.color || '#EF4444',
      }))
    : [];

  // Get category colors
  const getCategoryColors = () => {
    return [
      '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
    ];
  };

  // Get top spending category
  const getTopSpendingCategory = () => {
    if (breakdown?.breakdown && Object.keys(breakdown.breakdown).length > 0) {
      const entries = Object.entries(breakdown.breakdown);
      return entries.reduce((max, current) => 
        (current[1].amount || 0) > (max[1].amount || 0) ? current : max
      );
    } else if (dashboard?.categorySpending && Object.keys(dashboard.categorySpending).length > 0) {
      const entries = Object.entries(dashboard.categorySpending);
      return entries.reduce((max, current) => 
        (current[1].amount || 0) > (max[1].amount || 0) ? current : max
      );
    }
    return null;
  };

  const topCategory = getTopSpendingCategory();
  const forecastChartData = generateForecastData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <div className="mx-auto h-12 w-12 text-red-500">
          <FiAlertCircle className="h-12 w-12" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">Something went wrong</h3>
        <p className="mt-2 text-gray-500">{error}</p>
        <div className="mt-6">
          <button 
            onClick={handleRefreshData} 
            className="btn-primary inline-flex items-center"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600 mt-1">Gain insights into your financial patterns</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button 
            onClick={handleRefreshData}
            className="btn-secondary inline-flex items-center hover:bg-gray-50"
          >
            <FiRefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </button>
          <button 
            onClick={handleExportReport}
            className="btn-primary inline-flex items-center"
          >
            <FiFileText className="mr-2 h-4 w-4" />
            Export CSV
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
                  className={`flex-1 py-2 rounded-lg border text-sm ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Income Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Income</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatAmount(summary?.income || 0)}
              </p>
              <p className="text-sm text-blue-600 mt-2">
                {summary?.transactionCount || 0} transactions
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Expenses</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatAmount(summary?.expenses || 0)}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Avg: {formatAmount(summary?.avgDailySpending || 0)}/day
              </p>
            </div>
            <FiTrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Net Balance</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatAmount(summary?.net || 0)}
              </p>
              <p className={`text-sm mt-2 ${summary?.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary?.net >= 0 ? 'Positive' : 'Negative'} cash flow
              </p>
            </div>
            <FiPieChart className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Savings Progress Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Savings Progress</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {savingsProgress?.progress?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-purple-600 mt-2">
                {formatAmount(savingsProgress?.remaining || 0)} remaining
              </p>
            </div>
            <FiBarChart2 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={monthlyTrend}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatAmount(value), '']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#0ea5e9" 
                  strokeWidth={2}
                  name="Income"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Expenses"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="h-80">
            {categoryData.length > 0 ? (
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
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color || getCategoryColors()[index % getCategoryColors().length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatAmount(value), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <FiPieChart className="h-16 w-16 mb-4 opacity-50" />
                <p>No category data available</p>
                <p className="text-sm mt-1">Add transactions to see category breakdown</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Spending Pattern */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Spending Pattern</h3>
          <div className="h-80">
            {summary?.dailyData && summary.dailyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.dailyData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [formatAmount(value), 'Daily Spending']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="#f59e0b" 
                    name="Daily Spending"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <FiBarChart2 className="h-16 w-16 mb-4 opacity-50" />
                <p>No daily spending data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Balance Forecast */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day Balance Forecast</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={forecastChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatAmount(value), 'Projected Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                  strokeWidth={2}
                  name="Projected Balance"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {forecast && (
            <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatAmount(forecast.currentBalance || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Projected in 30 days</p>
                <p className="text-xl font-bold text-green-600">
                  {formatAmount(forecast.projectedBalance || 0)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {forecast.accuracy || 0}% accuracy
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Category Performance */}
      {categoryStats?.categories && categoryStats.categories.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilization
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categoryStats.categories.map((category, index) => {
                  const percentage = category.percentage || 0;
                  const spent = category.spent || 0;
                  const budget = category.budget || 0;
                  
                  return (
                    <tr key={index}>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color || '#EF4444' }}
                          />
                          <span className="text-sm font-medium text-gray-900">
                            {category.category || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {budget > 0 ? formatAmount(budget) : `${currency.symbol}0`}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatAmount(spent)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: percentage > 100 ? '#EF4444' : 
                                               percentage > 80 ? '#F59E0B' : '#10B981'
                              }}
                            />
                          </div>
                          <span className="ml-2 text-xs font-medium text-gray-700">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          percentage > 100 ? 'bg-red-100 text-red-800' :
                          percentage > 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {percentage > 100 ? 'Over Budget' :
                           percentage > 80 ? 'Near Limit' : 'On Track'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Top Spending Category */}
          <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
            <div className="flex items-center mb-3">
              <FiAlertCircle className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Top Spending Category</h4>
            </div>
            {topCategory ? (
              <>
                <p className="text-blue-800 text-lg font-semibold mb-1">
                  {topCategory[0]}
                </p>
                <p className="text-blue-700 mb-2">
                  {formatAmount(topCategory[1].amount || 0)}
                </p>
                <p className="text-sm text-blue-600">
                  Consider reviewing expenses in this category to optimize spending
                </p>
              </>
            ) : (
              <p className="text-blue-600">No spending data available</p>
            )}
          </div>

          {/* Savings Rate */}
          <div className="bg-green-50 rounded-lg p-5 border border-green-200">
            <div className="flex items-center mb-3">
              <FiTrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Savings Rate</h4>
            </div>
            {summary?.income && summary.income > 0 ? (
              <>
                <p className="text-green-800 text-2xl font-bold mb-1">
                  {((summary.net || 0) / summary.income * 100).toFixed(1)}%
                </p>
                <p className="text-green-700 mb-2">
                  {summary.net >= 0 ? 'Positive' : 'Negative'} savings rate
                </p>
                <p className="text-sm text-green-600">
                  {((summary.net || 0) / summary.income * 100) > 20 
                    ? 'Excellent savings rate!' 
                    : 'Aim for 20% savings rate for financial security'}
                </p>
              </>
            ) : (
              <p className="text-green-600">Add income data to calculate</p>
            )}
          </div>

          {/* Budget Alerts */}
          <div className="bg-red-50 rounded-lg p-5 border border-red-200">
            <div className="flex items-center mb-3">
              <FiAlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h4 className="font-medium text-red-900">Budget Status</h4>
            </div>
            {dashboard?.alerts && dashboard.alerts.length > 0 ? (
              <>
                <p className="text-red-800 text-lg font-semibold mb-1">
                  {dashboard.alerts.length} alert{dashboard.alerts.length > 1 ? 's' : ''}
                </p>
                <p className="text-red-700 mb-2">
                  {dashboard.alerts.map(a => a.category).join(', ')}
                </p>
                <p className="text-sm text-red-600">
                  Review spending in these categories
                </p>
              </>
            ) : (
              <p className="text-red-600">All categories within budget</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Period</p>
            <p className="text-lg font-semibold text-gray-900">
              {summary?.period ? summary.period.charAt(0).toUpperCase() + summary.period.slice(1) : 'N/A'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Transactions</p>
            <p className="text-lg font-semibold text-gray-900">
              {summary?.transactionCount || 0}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Average Daily</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatAmount(summary?.avgDailySpending || 0)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Date Range</p>
            <p className="text-lg font-semibold text-gray-900">
              {dateRange.startDate} to {dateRange.endDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;