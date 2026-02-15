import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FiArrowLeft, 
  FiEdit, 
  FiTrash2, 
  FiCalendar, 
  FiTag,
  FiMapPin,
  FiCreditCard,
  FiRepeat,
} from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useCurrency } from '../../context/CurrencyContext';

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatAmount } = useCurrency();
  
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await api.get(`/transactions/${id}`);
      if (response.data?.success) {
        setTransaction(response.data.data?.transaction);
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
      toast.error('Transaction not found');
      navigate('/transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    setDeleting(true);
    
    try {
      const response = await api.delete(`/transactions/${id}`);
      
      if (response.data?.success) {
        toast.success('Transaction deleted successfully');
        navigate('/transactions');
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!transaction) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/transactions"
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Transaction Details
              </h1>
              <p className="text-gray-600 mt-1">
                {transaction?.date && format(new Date(transaction.date), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate(`/transactions/edit/${id}`)}
              className="btn-secondary inline-flex items-center"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="btn-danger inline-flex items-center"
            >
              <FiTrash2 className="mr-2 h-4 w-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Transaction Details */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Amount and Type */}
            <div className="mb-8">
              <div className={`text-3xl font-bold ${
                transaction?.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}>
                {transaction?.type === 'income' ? '+' : '-'}
                {formatAmount(transaction?.amount ?? 0)}
              </div>
              <p className="text-gray-600 mt-2">{transaction?.description}</p>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <FiCalendar className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Date & Time</span>
                </div>
                <p className="text-gray-900">
                  {transaction?.date && format(new Date(transaction.date), 'MMMM d, yyyy')}
                </p>
                <p className="text-sm text-gray-500">
                  {transaction?.date && format(new Date(transaction.date), 'h:mm a')}
                </p>
              </div>

              {/* Category */}
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <FiTag className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Category</span>
                </div>
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2"
                    style={{ backgroundColor: transaction?.Category?.color }}
                  />
                  <span className="text-gray-900">
                    {transaction?.Category?.name || 'Uncategorized'}
                  </span>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center text-gray-500 mb-2">
                  <FiCreditCard className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">Payment Method</span>
                </div>
                <p className="text-gray-900 capitalize">
                  {transaction?.payment_method || 'Not specified'}
                </p>
              </div>

              {/* Location */}
              {transaction?.location && (
                <div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <FiMapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Location</span>
                  </div>
                  <p className="text-gray-900">{transaction.location}</p>
                </div>
              )}

              {/* Recurring Info */}
              {transaction?.is_recurring && (
                <div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <FiRepeat className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">Recurrence</span>
                  </div>
                  <p className="text-gray-900 capitalize">
                    {transaction.recurrence_pattern}
                  </p>
                  {transaction.next_occurrence && (
                    <p className="text-sm text-gray-500">
                      Next: {format(new Date(transaction.next_occurrence), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              )}

              {/* Budget - No FiDollarSign icon, just text */}
              {transaction?.Budget && (
                <div>
                  <div className="flex items-center text-gray-500 mb-2">
                    <span className="text-sm font-medium">Budget Period</span>
                  </div>
                  <p className="text-gray-900">
                    {format(new Date(transaction.Budget.year, (transaction.Budget.month ?? 1) - 1), 'MMMM yyyy')}
                  </p>
                </div>
              )}
            </div>

            {/* Notes */}
            {transaction?.notes && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Notes</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {transaction.notes}
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="mt-8 pt-6 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Transaction ID:</span>
                  <p className="text-gray-900 font-mono">{transaction?.id}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="text-gray-900">
                    {transaction?.createdAt && format(new Date(transaction.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`badge ${
                    transaction?.is_cleared 
                      ? 'badge-success' 
                      : 'badge-warning'
                  }`}>
                    {transaction?.is_cleared ? 'Cleared' : 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Last Updated:</span>
                  <p className="text-gray-900">
                    {transaction?.updatedAt && format(new Date(transaction.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Category Info */}
          {transaction?.Category && (
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div 
                    className="h-4 w-4 rounded-full mr-3"
                    style={{ backgroundColor: transaction.Category.color }}
                  />
                  <span className="font-medium">{transaction.Category.name}</span>
                </div>
                {transaction.Category.description && (
                  <p className="text-sm text-gray-600">
                    {transaction.Category.description}
                  </p>
                )}
                <div className="pt-3 border-t">
                  <Link
                    to={`/categories/${transaction.Category.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View category details →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Budget Info - No currency icons */}
          {transaction?.Budget && (
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Budget Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Period</p>
                  <p className="font-medium">
                    {format(new Date(transaction.Budget.year, (transaction.Budget.month ?? 1) - 1), 'MMMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Budget</p>
                  <p className="font-medium">
                    {formatAmount(transaction.Budget.total_budget ?? 0)}
                  </p>
                </div>
                <div className="pt-3 border-t">
                  <Link
                    to={`/budgets/${transaction.Budget.id}`}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    View budget details →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(`/transactions/create?duplicate=${id}`)}
                className="w-full btn-primary flex items-center justify-center"
              >
                Add Similar Transaction
              </button>
              <button
                onClick={() => {
                  if (transaction?.id) {
                    navigator.clipboard.writeText(transaction.id);
                    toast.success('Transaction ID copied to clipboard');
                  }
                }}
                className="w-full btn-secondary"
              >
                Copy Transaction ID
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;