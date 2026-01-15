import { FiTarget, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const BudgetProgress = ({ budget = null }) => {
  if (!budget) {
    return (
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
          <Link to="/budgets/create" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Create Budget
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FiTarget className="h-12 w-12" />
          </div>
          <p className="mt-4 text-gray-600">No active budget</p>
          <p className="text-sm text-gray-500 mt-1">Create a budget to track your spending</p>
          <Link to="/budgets/create" className="btn-primary mt-4 inline-block">
            Create Budget
          </Link>
        </div>
      </div>
    );
  }

  const progress = (budget.total_spent / budget.total_budget) * 100;
  const remaining = budget.total_budget - budget.total_spent;
  const daysInMonth = new Date(budget.year, budget.month, 0).getDate();
  const today = new Date().getDate();
  const dailyAverage = remaining / Math.max(daysInMonth - today, 1);

  const getMonthName = (month) => {
    const date = new Date(budget.year, month - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Progress</h3>
          <p className="text-sm text-gray-500">
            {getMonthName(budget.month)} {budget.year}
          </p>
        </div>
        <Link to={`/budgets/${budget.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
          View Details
        </Link>
      </div>

      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Spent: ${budget.total_spent?.toFixed(2) || '0.00'}</span>
            <span className="text-gray-600">Budget: ${budget.total_budget?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progress > 90 ? 'bg-red-500' :
                progress > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">0%</span>
            <span className={`font-medium ${
              progress > 90 ? 'text-red-600' :
              progress > 75 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {progress?.toFixed(1) || '0'}%
            </span>
            <span className="text-gray-500">100%</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FiTrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Income</p>
                <p className="text-xl font-bold text-gray-900">
                  ${budget.total_income?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FiTarget className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-xl font-bold text-gray-900">
                  ${remaining > 0 ? remaining.toFixed(2) : '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Savings */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Savings This Month</p>
              <p className="text-2xl font-bold text-green-600">
                +${budget.savings?.toFixed(2) || '0.00'}
              </p>
            </div>
            {budget.savings > 0 ? (
              <FiTrendingUp className="h-6 w-6 text-green-600" />
            ) : (
              <FiTrendingDown className="h-6 w-6 text-red-600" />
            )}
          </div>
          
          {dailyAverage > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Daily average available: ${dailyAverage.toFixed(2)}
            </p>
          )}
        </div>

        {/* Status Indicator */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              progress > 90 ? 'bg-red-100 text-red-800' :
              progress > 75 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {progress > 90 ? 'Over Budget' :
               progress > 75 ? 'Approaching Limit' : 'On Track'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;