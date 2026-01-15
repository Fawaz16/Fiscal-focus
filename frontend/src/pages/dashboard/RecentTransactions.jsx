import { format } from 'date-fns';
import { FiShoppingBag, FiCoffee, FiCar, FiHome } from 'react-icons/fi';

const RecentTransactions = ({ transactions }) => {
  const getCategoryIcon = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'food & dining':
        return <FiCoffee className="h-5 w-5" />;
      case 'shopping':
        return <FiShoppingBag className="h-5 w-5" />;
      case 'transportation':
        return <FiCar className="h-5 w-5" />;
      case 'bills & utilities':
        return <FiHome className="h-5 w-5" />;
      default:
        return <FiShoppingBag className="h-5 w-5" />;
    }
  };

  if (!transactions?.length) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recent transactions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.slice(0, 5).map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {getCategoryIcon(transaction.Category?.name)}
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900">{transaction.description}</p>
              <p className="text-sm text-gray-500">
                {transaction.Category?.name} • {format(new Date(transaction.date), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">{transaction.payment_method}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;