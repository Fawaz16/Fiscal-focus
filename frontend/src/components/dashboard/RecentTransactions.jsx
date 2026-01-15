import { format } from 'date-fns';
import { FiShoppingBag, FiCoffee, FiTruck, FiHome, FiBriefcase } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const RecentTransactions = ({ transactions = [] }) => {
  const getCategoryIcon = (categoryName) => {
    if (!categoryName) return <FiShoppingBag className="h-5 w-5" />;
    
    const name = categoryName.toLowerCase();
    if (name.includes('food') || name.includes('dining') || name.includes('coffee')) {
      return <FiCoffee className="h-5 w-5" />;
    }
    if (name.includes('shopping') || name.includes('store')) {
      return <FiShoppingBag className="h-5 w-5" />;
    }
    if (name.includes('transport') || name.includes('car') || name.includes('gas')) {
      return <FiTruck className="h-5 w-5" />;
    }
    if (name.includes('home') || name.includes('rent') || name.includes('utility')) {
      return <FiHome className="h-5 w-5" />;
    }
    if (name.includes('income') || name.includes('salary') || name.includes('business')) {
      return <FiBriefcase className="h-5 w-5" />;
    }
    return <FiShoppingBag className="h-5 w-5" />;
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No recent transactions</p>
        <Link to="/transactions/create" className="btn-primary mt-4 inline-block">
          Add Your First Transaction
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.slice(0, 5).map((transaction) => (
        <Link
          key={transaction.id}
          to={`/transactions/${transaction.id}`}
          className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors group"
        >
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
            } group-hover:scale-110 transition-transform`}>
              {getCategoryIcon(transaction.Category?.name)}
            </div>
            <div className="ml-4">
              <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                {transaction.description}
              </p>
              <p className="text-sm text-gray-500">
                {transaction.Category?.name || 'Uncategorized'} • {format(new Date(transaction.date), 'MMM d, h:mm a')}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount?.toFixed(2) || '0.00'}
            </p>
            <p className="text-sm text-gray-500 capitalize">{transaction.payment_method || 'Cash'}</p>
          </div>
        </Link>
      ))}
      
      {transactions.length > 5 && (
        <div className="text-center pt-4 border-t">
          <Link to="/transactions" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All Transactions →
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;