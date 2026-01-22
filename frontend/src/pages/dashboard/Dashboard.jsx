import { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiTarget } from 'react-icons/fi';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';
import StatCard from '../../components/common/StatCard';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import BudgetProgress from '../../components/dashboard/BudgetProgress';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/user/dashboard');
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Current Balance',
      value: `$${dashboardData?.overview?.currentBalance?.toFixed(2) || '0.00'}`,
      icon: FiDollarSign,
      trend: dashboardData?.overview?.currentBalance > 0 ? 'up' : 'down',
      change: dashboardData?.overview?.currentBalance > 0 ? '+0.0%' : '0.0%',
      color: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total Income',
      value: `$${dashboardData?.overview?.totalIncome?.toFixed(2) || '0.00'}`,
      icon: FiTrendingUp,
      trend: dashboardData?.overview?.totalIncome > 0 ? 'up' : 'down',
      change: dashboardData?.overview?.totalIncome > 0 ? '+0.0%' : '0.0%',
      color: 'bg-green-50',
      iconColor: 'text-green-600',
    },
    {
      title: 'Total Expenses',
      value: `$${dashboardData?.overview?.totalExpenses?.toFixed(2) || '0.00'}`,
      icon: FiTrendingDown,
      trend: dashboardData?.overview?.totalExpenses > 0 ? 'down' : 'up',
      change: dashboardData?.overview?.totalExpenses > 0 ? '-0.0%' : '0.0%',
      color: 'bg-red-50',
      iconColor: 'text-red-600',
    },
    {
      title: 'Savings Progress',
      value: `${dashboardData?.overview?.savingsProgress?.progress?.toFixed(1) || '0'}%`,
      icon: FiTarget,
      trend: dashboardData?.overview?.savingsProgress?.progress > 50 ? 'up' : 'down',
      change: 'Set Target',
      color: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
  ];

  const categoryData = dashboardData?.categorySpending 
    ? Object.entries(dashboardData.categorySpending).map(([name, data]) => ({
        name,
        value: data.amount,
        color: data.color,
      }))
    : [];

  // Create empty monthly data - all zeros
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlySpendingData = monthNames.slice(0, 6).map(month => ({
    month,
    income: 0,
    expenses: 0,
  }));

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySpendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="income" fill="#0ea5e9" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
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

      {/* Budget Progress and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Progress */}
        <div className="lg:col-span-1">
          <BudgetProgress budget={dashboardData?.budget} />
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View All →
            </button>
          </div>
          <RecentTransactions 
            transactions={dashboardData?.recentTransactions || []} 
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;