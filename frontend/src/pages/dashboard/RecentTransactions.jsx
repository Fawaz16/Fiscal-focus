import { format } from 'date-fns';
import { FiShoppingBag, FiCoffee, FiCar, FiHome } from 'react-icons/fi';
import { useCurrency } from '../../context/CurrencyContext';

const RecentTransactions = ({ transactions }) => {
  const { formatAmount } = useCurrency();

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

  const getCategoryColor = (categoryName) => {
    switch (categoryName?.toLowerCase()) {
      case 'food & dining':
        return 'bg-orange-100 text-orange-600';
      case 'shopping':
        return 'bg-purple-100 text-purple-600';
      case 'transportation':
        return 'bg-blue-100 text-blue-600';
      case 'bills & utilities':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
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
          <div className="flex items-center min-w-0 flex-1">
            <div className={`p-2 rounded-lg ${
              getCategoryColor(transaction.Category?.name)
            }`}>
              {getCategoryIcon(transaction.Category?.name)}
            </div>
            <div className="ml-4 truncate">
              <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
              <p className="text-sm text-gray-500">
                {transaction.Category?.name} • {format(new Date(transaction.date), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            <p className={`font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatAmount(transaction.amount)}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {transaction.payment_method?.replace('_', ' ')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentTransactions;