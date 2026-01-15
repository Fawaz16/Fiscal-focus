import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, trend = 'up', change = '0%', color = 'bg-blue-50', iconColor = 'text-blue-600' }) => {
  return (
    <div className={`${color} rounded-xl p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${iconColor.replace('text', 'bg').replace('-600', '-100')}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        {trend === 'up' ? (
          <FiTrendingUp className="h-4 w-4 text-green-600 mr-1" />
        ) : (
          <FiTrendingDown className="h-4 w-4 text-red-600 mr-1" />
        )}
        <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
          {change}
        </span>
        <span className="text-sm text-gray-500 ml-2">vs last month</span>
      </div>
    </div>
  );
};

export default StatCard;