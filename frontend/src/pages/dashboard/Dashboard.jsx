import { useState, useEffect } from 'react';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiTarget 
} from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import BudgetProgress from '../../components/dashboard/BudgetProgress';
import { useCurrency } from '../../context/CurrencyContext';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formatAmount, currency } = useCurrency();

    const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await api.get('/user/dashboard');
      if (response.data?.success) {
        setDashboardData(response.data.data);
      } else {
        throw new Error(response.data?.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);



  const getSavingsProgress = () => {
    const progress = dashboardData?.overview?.savingsProgress?.progress ?? 0;
    return `${progress.toFixed(1)}%`;
  };

  const getTrendChange = (value) => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  const statCards = [
    {
      title: 'Current Balance',
      value: formatAmount(dashboardData?.overview?.currentBalance ?? 0),
      icon: FiTarget,
      trend: getTrendChange(dashboardData?.overview?.currentBalance ?? 0),
      change: dashboardData?.overview?.currentBalance > 0 ? 'Available' : 'No balance',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Income',
      value: formatAmount(dashboardData?.overview?.totalIncome ?? 0),
      icon: FiTrendingUp,
      trend: getTrendChange(dashboardData?.overview?.totalIncome ?? 0),
      change: 'This month',
      color: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Expenses',
      value: formatAmount(dashboardData?.overview?.totalExpenses ?? 0),
      icon: FiTrendingDown,
      trend: getTrendChange(dashboardData?.overview?.totalExpenses ?? 0),
      change: 'This month',
      color: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Savings Progress',
      value: getSavingsProgress(),
      icon: FiTarget,
      trend: getTrendChange(dashboardData?.overview?.savingsProgress?.progress ?? 0),
      change: dashboardData?.overview?.savingsProgress?.target 
        ? `Target: ${formatAmount(dashboardData.overview.savingsProgress.target)}`
        : 'Set Target',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const categoryData = dashboardData?.categorySpending 
    ? Object.entries(dashboardData.categorySpending).map(([name, data]) => ({
        name,
        value: data.amount ?? 0,
        color: data.color ?? '#8884d8',
        formattedAmount: formatAmount(data.amount ?? 0),
      }))
    : [];

  const totalCategorySpending = categoryData.reduce((sum, item) => sum + item.value, 0);

  const monthlySpendingData = dashboardData?.monthlySpending?.length 
    ? dashboardData.monthlySpending.map(item => ({
        month: item.month,
        income: item.income ?? 0,
        expenses: item.expenses ?? 0,
      }))
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        .slice(0, 6)
        .map(month => ({
          month,
          income: 0,
          expenses: 0,
        }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatAmount(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      const percentage = totalCategorySpending > 0 
        ? ((data.value / totalCategorySpending) * 100).toFixed(1)
        : 0;
      
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border border-gray-200">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{data.formattedAmount}</p>
          <p className="text-sm text-gray-500">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const formatYAxisTick = (value) => {
    if (value === 0) return `0`;
    return formatAmount(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FiTrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {dashboardData?.user?.name?.split(' ')[0] ?? 'User'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with your finances today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Spending</h3>
            <div className="flex space-x-4 text-sm">
              <div className="flex items-center">
                <span className="h-3 w-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-gray-600">Income</span>
              </div>
              <div className="flex items-center">
                <span className="h-3 w-3 bg-red-500 rounded-full mr-2"></span>
                <span className="text-gray-600">Expenses</span>
              </div>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlySpendingData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={formatYAxisTick}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="income" fill="#0ea5e9" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
          <div className="h-80 w-full">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => {
                      const percentage = (percent * 100).toFixed(0);
                      return `${name}: ${percentage}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center">
                <p className="text-gray-500 mb-2">No spending data available</p>
                <p className="text-sm text-gray-400">
                  Add transactions to see your spending breakdown
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Budget Progress and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Progress */}
        <div className="lg:col-span-1">
          <BudgetProgress 
            budget={dashboardData?.budget}
            formatAmount={formatAmount}
          />
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            {dashboardData?.recentTransactions?.length > 0 && (
              <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                View All →
              </button>
            )}
          </div>
          <RecentTransactions 
            transactions={dashboardData?.recentTransactions ?? []}
            formatAmount={formatAmount}
          />
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Average Monthly Income</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatAmount(dashboardData?.overview?.averageIncome ?? 0)}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Average Monthly Expenses</p>
          <p className="text-lg font-semibold text-gray-900">
            {formatAmount(dashboardData?.overview?.averageExpenses ?? 0)}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Savings Rate</p>
          <p className="text-lg font-semibold text-gray-900">
            {dashboardData?.overview?.savingsRate 
              ? `${dashboardData.overview.savingsRate.toFixed(1)}%`
              : '0%'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;