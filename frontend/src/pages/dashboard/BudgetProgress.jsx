
const BudgetProgress = ({ budget }) => {
  if (!budget) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
        <p className="text-gray-500 text-center py-8">No active budget</p>
      </div>
    );
  }

  const progress = (budget.total_spent / budget.total_budget) * 100;
  const remaining = budget.total_budget - budget.total_spent;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Spent: ${budget.total_spent.toFixed(2)}</span>
            <span className="text-gray-600">Budget: ${budget.total_budget.toFixed(2)}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                progress > 90 ? 'bg-red-500' :
                progress > 75 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className="text-right text-sm text-gray-500 mt-1">
            {progress.toFixed(1)}% utilized
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Income</p>
            <p className="text-2xl font-bold text-gray-900">
              ${budget.total_income.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-2xl font-bold text-gray-900">
              ${remaining > 0 ? remaining.toFixed(2) : '0.00'}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <p className="text-sm text-gray-600 mb-2">Savings this month:</p>
          <p className="text-2xl font-bold text-green-600">
            +${budget.savings.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default BudgetProgress;