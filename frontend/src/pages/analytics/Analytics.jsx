import { useState, useEffect, useRef } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiCalendar, 
  FiFilter,
  FiDownload,
  FiAlertCircle,
  FiDollarSign,
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
  Area
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, subDays, eachMonthOfInterval } from 'date-fns';
import { useBalance } from '../../context/BalanceContext';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Analytics = () => {
  const { getFinancialSummary, getCategoryBreakdown, getBalanceForecast, getSavingsProgress } = useBalance();
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
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(subMonths(new Date(), 1)), 'yyyy-MM-dd'),
    endDate: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  });

  // Refs for chart containers
  const incomeExpensesChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const dailySpendingChartRef = useRef(null);
  const forecastChartRef = useRef(null);

  // Chart dimensions state
  const [chartDimensions, setChartDimensions] = useState({
    incomeExpenses: { width: 500, height: 300 },
    category: { width: 400, height: 300 },
    dailySpending: { width: 500, height: 300 },
    forecast: { width: 500, height: 300 }
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [period, dateRange]);

  // Measure chart containers after loading
  useEffect(() => {
    if (!loading) {
      const measureCharts = () => {
        const newDimensions = { ...chartDimensions };
        
        if (incomeExpensesChartRef.current) {
          const width = incomeExpensesChartRef.current.clientWidth;
          if (width > 0) newDimensions.incomeExpenses.width = width;
        }
        if (categoryChartRef.current) {
          const width = categoryChartRef.current.clientWidth;
          if (width > 0) newDimensions.category.width = width;
        }
        if (dailySpendingChartRef.current) {
          const width = dailySpendingChartRef.current.clientWidth;
          if (width > 0) newDimensions.dailySpending.width = width;
        }
        if (forecastChartRef.current) {
          const width = forecastChartRef.current.clientWidth;
          if (width > 0) newDimensions.forecast.width = width;
        }
        
        setChartDimensions(newDimensions);
      };

      // Delay measurement to ensure DOM is ready
      const timer = setTimeout(measureCharts, 50);
      
      // Measure on resize
      window.addEventListener('resize', measureCharts);
      
      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', measureCharts);
      };
    }
  }, [loading]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    
    try {
      const [
        summaryData, 
        breakdownData, 
        forecastData, 
        savingsProgressData,
        dashboardData
      ] = await Promise.all([
        getFinancialSummary(period),
        getCategoryBreakdown(dateRange.startDate, dateRange.endDate),
        getBalanceForecast(30),
        getSavingsProgress(),
        fetchDashboardData(),
      ]);
      
      setSummary(summaryData);
      setBreakdown(breakdownData);
      setForecast(forecastData);
      setSavingsProgress(savingsProgressData);
      setDashboard(dashboardData);
      
      const transactionStatsData = await fetchTransactionStats(period);
      setTransactionStats(transactionStatsData);
      
      const categoryStatsData = await fetchCategoryStats('month');
      setCategoryStats(categoryStatsData);
      
      if (summaryData?.dailyData) {
        const trend = generateMonthlyTrendData(summaryData.dailyData);
        setMonthlyTrend(trend);
      } else if (transactionStatsData?.dailyData) {
        const trend = generateMonthlyTrendData(transactionStatsData.dailyData);
        setMonthlyTrend(trend);
      }
      
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      console.log('All request made and response are returned');
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

  const generateMonthlyTrendData = (dailyData) => {
    const months = eachMonthOfInterval({
      start: subMonths(new Date(), 5),
      end: new Date()
    });

    return months.map(month => {
      const monthStr = format(month, 'MMM');
      
      if (!dailyData || !Array.isArray(dailyData) || dailyData.length === 0) {
        return {
          month: monthStr,
          income: 0,
          expenses: 0,
          net: 0
        };
      }
      
      const monthKey = `${format(month, 'yyyy-MM')}`;
      const monthData = dailyData.filter(d => {
        if (!d || !d.date) return false;
        const dateStr = typeof d.date === 'string' ? d.date : d.date.toString();
        return dateStr.includes(monthKey);
      });
      
      if (summary?.categoryBreakdown && Object.keys(summary.categoryBreakdown).length > 0) {
        const expenses = Object.values(summary.categoryBreakdown).reduce((sum, val) => sum + val, 0);
        const income = summary.income || 0;
        
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
    csvData.push(['Total Income', formatCurrency(summary?.income || 0)]);
    csvData.push(['Total Expenses', formatCurrency(summary?.expenses || 0)]);
    csvData.push(['Net Balance', formatCurrency(summary?.net || 0)]);
    csvData.push(['Transaction Count', summary?.transactionCount || 0]);
    csvData.push(['Average Daily Spending', formatCurrency(summary?.avgDailySpending || 0)]);
    csvData.push([]);
    
    csvData.push(['CATEGORY BREAKDOWN']);
    csvData.push(['Category', 'Amount', 'Percentage']);
    
    if (breakdown?.breakdown) {
      Object.entries(breakdown.breakdown).forEach(([category, data]) => {
        csvData.push([category, formatCurrency(data.amount), `${data.percentage || 0}%`]);
      });
    } else if (dashboard?.categorySpending) {
      Object.entries(dashboard.categorySpending).forEach(([category, data]) => {
        csvData.push([category, formatCurrency(data.amount), `${data.percentage || 0}%`]);
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
          formatCurrency(category.budget),
          formatCurrency(category.spent),
          `${category.percentage}%`,
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
        formatCurrency(month.income),
        formatCurrency(month.expenses),
        formatCurrency(month.net)
      ]);
    });
    csvData.push([]);
    
    csvData.push(['BALANCE FORECAST (30 Days)']);
    csvData.push(['Day', 'Projected Balance']);
    
    if (forecast) {
      const forecastData = generateForecastData();
      forecastData.forEach(day => {
        csvData.push([day.day, formatCurrency(day.projected)]);
      });
      csvData.push(['Accuracy', `${forecast.accuracy || 0}%`]);
    }
    csvData.push([]);
    
    csvData.push(['SAVINGS PROGRESS']);
    csvData.push(['Metric', 'Value']);
    csvData.push(['Target', formatCurrency(savingsProgress?.target || 0)]);
    csvData.push(['Current', formatCurrency(savingsProgress?.current || 0)]);
    csvData.push(['Progress', `${savingsProgress?.progress || 0}%`]);
    csvData.push(['Remaining', formatCurrency(savingsProgress?.remaining || 0)]);
    csvData.push(['On Track', savingsProgress?.is_on_track ? 'Yes' : 'No']);
    csvData.push([]);
    
    if (summary?.dailyData && summary.dailyData.length > 0) {
      csvData.push(['DAILY SPENDING']);
      csvData.push(['Date', 'Amount']);
      
      summary.dailyData.forEach(day => {
        csvData.push([day.date, formatCurrency(day.amount)]);
      });
    }
    
    return csvData;
  };

  const handleRefreshData = () => {
    fetchAnalyticsData();
    toast.success('Analytics data refreshed!');
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
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
    const increment = forecast.projectedBalance - forecast.currentBalance;
    
    return days.map((day, index) => ({
      day,
      projected: forecast.currentBalance + (increment * (index / 4))
    }));
  };

  // Prepare category data for pie chart
  const categoryData = breakdown?.breakdown 
    ? Object.entries(breakdown.breakdown).map(([name, data]) => ({
        name,
        value: data.amount,
        color: data.color || '#EF4444',
      }))
    : dashboard?.categorySpending
    ? Object.entries(dashboard.categorySpending).map(([name, data]) => ({
        name,
        value: data.amount,
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
        current[1].amount > max[1].amount ? current : max
      );
    } else if (dashboard?.categorySpending && Object.keys(dashboard.categorySpending).length > 0) {
      const entries = Object.entries(dashboard.categorySpending);
      return entries.reduce((max, current) => 
        current[1].amount > max[1].amount ? current : max
      );
    }
    return null;
  };

  const topCategory = getTopSpendingCategory();
  const forecastChartData = generateForecastData();

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 w-full h-100 flex items-center justify-center">
        <div className="flex items-center justify-center">
          Loading Analytics...
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
        <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Income</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(summary?.income)}
              </p>
              <p className="text-sm text-blue-600 mt-2">
                {summary?.transactionCount || 0} transactions
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        {/* Expenses Card */}
        <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Expenses</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(summary?.expenses)}
              </p>
              <p className="text-sm text-red-600 mt-2">
                Avg: {formatCurrency(summary?.avgDailySpending || 0)}/day
              </p>
            </div>
            <FiTrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Net Balance</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(summary?.net)}
              </p>
              <p className={`text-sm mt-2 ${summary?.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary?.net >= 0 ? 'Positive' : 'Negative'} cash flow
              </p>
            </div>
            <FiDollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        {/* Savings Progress Card */}
        <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Savings Progress</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {savingsProgress?.progress?.toFixed(1) || 0}%
              </p>
              <p className="text-sm text-purple-600 mt-2">
                {formatCurrency(savingsProgress?.remaining)} remaining
              </p>
            </div>
            <FiPieChart className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Income vs Expenses - FIXED */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income vs Expenses Trend</h3>
          <div className="h-80" ref={incomeExpensesChartRef}>
            <LineChart 
              width={chartDimensions.incomeExpenses.width} 
              height={chartDimensions.incomeExpenses.height}
              data={monthlyTrend}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), '']}
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
          </div>
        </div>

        {/* Category Breakdown - FIXED */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
          <div className="h-80" ref={categoryChartRef}>
            {categoryData.length > 0 ? (
              <PieChart
                width={chartDimensions.category.width}
                height={chartDimensions.category.height}
              >
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
                    <Cell key={`cell-${index}`} fill={entry.color || getCategoryColors()[index % getCategoryColors().length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
              </PieChart>
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
        {/* Daily Spending Pattern - FIXED */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Spending Pattern</h3>
          <div className="h-80" ref={dailySpendingChartRef}>
            <BarChart
              width={chartDimensions.dailySpending.width}
              height={chartDimensions.dailySpending.height}
              data={summary?.dailyData || []}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Daily Spending']}
              />
              <Bar 
                dataKey="amount" 
                fill="#f59e0b" 
                name="Daily Spending"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </div>
        </div>

        {/* Balance Forecast - FIXED */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">30-Day Balance Forecast</h3>
          <div className="h-80" ref={forecastChartRef}>
            <AreaChart
              width={chartDimensions.forecast.width}
              height={chartDimensions.forecast.height}
              data={forecastChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [formatCurrency(value), 'Projected Balance']}
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
          </div>
          {forecast && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Balance</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(forecast.currentBalance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Projected in 30 days</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(forecast.projectedBalance)}
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
                {categoryStats.categories.map((category, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div 
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: category.color || '#EF4444' }}
                        />
                        <span className="text-sm font-medium text-gray-900">
                          {category.category}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(category.budget)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {formatCurrency(category.spent)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${Math.min(category.percentage, 100)}%`,
                              backgroundColor: category.percentage > 100 ? '#EF4444' : 
                                             category.percentage > 80 ? '#F59E0B' : '#10B981'
                            }}
                          />
                        </div>
                        <span className="ml-2 text-xs font-medium text-gray-700">
                          {category.percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        category.percentage > 100 ? 'bg-red-100 text-red-800' :
                        category.percentage > 80 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {category.percentage > 100 ? 'Over Budget' :
                         category.percentage > 80 ? 'Near Limit' : 'On Track'}
                      </span>
                    </td>
                  </tr>
                ))}
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
                  {formatCurrency(topCategory[1].amount)}
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
                  {((summary.net / summary.income) * 100).toFixed(1)}%
                </p>
                <p className="text-green-700 mb-2">
                  {summary.net >= 0 ? 'Positive' : 'Negative'} savings rate
                </p>
                <p className="text-sm text-green-600">
                  {((summary.net / summary.income) * 100) > 20 
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
              {summary?.period?.charAt(0).toUpperCase() + summary?.period?.slice(1) || 'N/A'}
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
              {formatCurrency(summary?.avgDailySpending || 0)}
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