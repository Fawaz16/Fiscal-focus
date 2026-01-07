const { Op } = require('sequelize');
const { Transaction, Budget } = require('../config/db');

class BalanceService {
  /**
   * Calculate current balance for a user
   */
  static async calculateCurrentBalance(userId) {
    try {
      // Get all transactions for the user
      const transactions = await Transaction.findAll({
        where: { user_id: userId },
        attributes: ['type', 'amount', 'date']
      });

      // Calculate total income and expenses
      let totalIncome = 0;
      let totalExpenses = 0;
      
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += parseFloat(transaction.amount);
        } else if (transaction.type === 'expense') {
          totalExpenses += parseFloat(transaction.amount);
        }
      });

      const currentBalance = totalIncome - totalExpenses;
      
      return {
        totalIncome,
        totalExpenses,
        currentBalance,
        transactionCount: transactions.length
      };
    } catch (error) {
      console.error('Error calculating balance:', error);
      throw error;
    }
  }

  /**
   * Calculate balance for specific period
   */
  static async calculatePeriodBalance(userId, startDate, endDate) {
    try {
      const transactions = await Transaction.findAll({
        where: {
          user_id: userId,
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        attributes: ['type', 'amount']
      });

      let periodIncome = 0;
      let periodExpenses = 0;
      
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          periodIncome += parseFloat(transaction.amount);
        } else {
          periodExpenses += parseFloat(transaction.amount);
        }
      });

      return {
        periodIncome,
        periodExpenses,
        periodBalance: periodIncome - periodExpenses,
        periodTransactionCount: transactions.length
      };
    } catch (error) {
      console.error('Error calculating period balance:', error);
      throw error;
    }
  }

  /**
   * Get balance breakdown by category
   */
  static async getCategoryBreakdown(userId, startDate, endDate) {
    try {
      const transactions = await Transaction.findAll({
        where: {
          user_id: userId,
          type: 'expense',
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: ['Category'],
        attributes: ['amount', 'category_id']
      });

      const breakdown = {};
      
      transactions.forEach(transaction => {
        const categoryName = transaction.Category?.name || 'Uncategorized';
        if (!breakdown[categoryName]) {
          breakdown[categoryName] = {
            amount: 0,
            color: transaction.Category?.color || '#6B7280',
            percentage: 0
          };
        }
        breakdown[categoryName].amount += parseFloat(transaction.amount);
      });

      // Calculate total expenses for percentages
      const totalExpenses = Object.values(breakdown)
        .reduce((sum, cat) => sum + cat.amount, 0);

      // Calculate percentages
      Object.keys(breakdown).forEach(category => {
        breakdown[category].percentage = totalExpenses > 0 
          ? (breakdown[category].amount / totalExpenses) * 100 
          : 0;
      });

      return breakdown;
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      throw error;
    }
  }

  /**
   * Get balance forecast for next period
   */
  static async getBalanceForecast(userId, days = 30) {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get past 30 days transactions
      const pastTransactions = await Transaction.findAll({
        where: {
          user_id: userId,
          date: {
            [Op.between]: [thirtyDaysAgo, now]
          }
        },
        attributes: ['type', 'amount', 'date']
      });

      // Calculate daily averages
      let totalIncome = 0;
      let totalExpenses = 0;
      
      pastTransactions.forEach(transaction => {
        if (transaction.type === 'income') {
          totalIncome += parseFloat(transaction.amount);
        } else {
          totalExpenses += parseFloat(transaction.amount);
        }
      });

      const daysInPeriod = 30;
      const avgDailyIncome = totalIncome / daysInPeriod;
      const avgDailyExpenses = totalExpenses / daysInPeriod;
      const avgDailyNet = avgDailyIncome - avgDailyExpenses;

      // Calculate forecast
      const forecastedIncome = avgDailyIncome * days;
      const forecastedExpenses = avgDailyExpenses * days;
      const forecastedNet = forecastedIncome - forecastedExpenses;

      // Get current balance
      const currentBalance = await this.calculateCurrentBalance(userId);

      // Projected balance after forecast period
      const projectedBalance = currentBalance.currentBalance + forecastedNet;

      return {
        forecastPeriod: days,
        currentBalance: currentBalance.currentBalance,
        averageDaily: {
          income: avgDailyIncome,
          expenses: avgDailyExpenses,
          net: avgDailyNet
        },
        forecasted: {
          income: forecastedIncome,
          expenses: forecastedExpenses,
          net: forecastedNet
        },
        projectedBalance: projectedBalance,
        accuracy: this.calculateForecastAccuracy(pastTransactions) // Implement this method
      };
    } catch (error) {
      console.error('Error calculating balance forecast:', error);
      throw error;
    }
  }

  /**
   * Calculate forecast accuracy based on historical data
   */
  static calculateForecastAccuracy(transactions) {
    // Simplified accuracy calculation
    // In a real app, you'd compare actual vs predicted values
    if (transactions.length < 10) return 75; // Low confidence with few transactions
    if (transactions.length < 30) return 85;
    return 95; // High confidence with many transactions
  }

  /**
   * Get balance update after transaction
   */
  static async getBalanceUpdate(userId, transactionId = null) {
    try {
      const currentBalance = await this.calculateCurrentBalance(userId);
      
      // Get previous balance if transaction ID is provided
      let previousBalance = null;
      let change = null;
      
      if (transactionId) {
        const transaction = await Transaction.findByPk(transactionId);
        if (transaction) {
          // Calculate what balance would be without this transaction
          previousBalance = currentBalance.currentBalance + 
            (transaction.type === 'income' ? -parseFloat(transaction.amount) : parseFloat(transaction.amount));
          change = transaction.type === 'income' 
            ? parseFloat(transaction.amount) 
            : -parseFloat(transaction.amount);
        }
      }

      // Get today's spending
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      
      const todaySpending = await Transaction.sum('amount', {
        where: {
          user_id: userId,
          type: 'expense',
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      }) || 0;

      // Get monthly budget status
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const budget = await Budget.findOne({
        where: {
          user_id: userId,
          month: currentMonth,
          year: currentYear,
          is_active: true
        }
      });

      return {
        current_balance: currentBalance.currentBalance,
        previous_balance: previousBalance,
        change: change,
        today_spending: todaySpending,
        monthly_budget: budget?.total_budget || 0,
        monthly_spent: budget?.total_spent || 0,
        monthly_remaining: budget ? budget.total_budget - budget.total_spent : 0,
        budget_utilization: budget ? (budget.total_spent / budget.total_budget) * 100 : 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting balance update:', error);
      throw error;
    }
  }

  /**
   * Get savings progress
   */
  static async getSavingsProgress(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user || !user.savings_target || user.savings_target <= 0) {
        return null;
      }

      const currentBalance = await this.calculateCurrentBalance(userId);
      
      // Calculate savings based on income - expenses for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const monthlyBalance = await this.calculatePeriodBalance(userId, startOfMonth, endOfMonth);
      
      const savingsProgress = (monthlyBalance.periodBalance / user.savings_target) * 100;
      const isOnTrack = monthlyBalance.periodBalance >= (user.savings_target * (now.getDate() / endOfMonth.getDate()));

      return {
        target: user.savings_target,
        current: monthlyBalance.periodBalance,
        progress: Math.min(savingsProgress, 100), // Cap at 100%
        remaining: Math.max(user.savings_target - monthlyBalance.periodBalance, 0),
        is_on_track: isOnTrack,
        daily_required: isOnTrack ? 0 : (user.savings_target - monthlyBalance.periodBalance) / (endOfMonth.getDate() - now.getDate())
      };
    } catch (error) {
      console.error('Error getting savings progress:', error);
      throw error;
    }
  }
}

module.exports = BalanceService;