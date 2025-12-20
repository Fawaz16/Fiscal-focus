const { Op } = require('sequelize');
const { User, Category, Budget, Transaction } = require('../models/index');

class UserController {
  static async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get current month's budget
      const budget = await Budget.findOne({
        where: {
          user_id: userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          is_active: true
        }
      });

      // Get monthly transactions
      const transactions = await Transaction.findAll({
        where: {
          user_id: userId,
          date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        },
        include: [Category],
        order: [['date', 'DESC']],
        limit: 10
      });

      // Calculate totals
      const monthlyIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const monthlyExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      // Get category spending
      const categorySpending = await Transaction.findAll({
        attributes: [
          'category_id',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        where: {
          user_id: userId,
          type: 'expense',
          date: {
            [Op.between]: [startOfMonth, endOfMonth]
          }
        },
        include: [{
          model: Category,
          attributes: ['name', 'color', 'monthly_budget']
        }],
        group: ['category_id']
      });

      // Get today's spending
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));
      
      const todaySpending = await Transaction.sum('amount', {
        where: {
          user_id: userId,
          type: 'expense',
          date: {
            [Op.between]: [startOfDay, endOfDay]
          }
        }
      }) || 0;

      res.json({
        success: true,
        data: {
          overview: {
            monthlyIncome,
            monthlyExpenses,
            netIncome: monthlyIncome - monthlyExpenses,
            todaySpending,
            savingsTarget: req.user.savings_target,
            currentSavings: 0 // You'll need to calculate this based on your logic
          },
          budget: budget || null,
          recentTransactions: transactions,
          categorySpending,
          alerts: [] // Add budget alerts here
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getFinancialSummary(req, res, next) {
    try {
      const { period } = req.params; // day, week, month, year
      const userId = req.user.id;

      const now = new Date();
      let startDate, endDate;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'week':
          const day = now.getDay();
          startDate = new Date(now.setDate(now.getDate() - day));
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: 'Invalid period'
          });
      }

      const transactions = await Transaction.findAll({
        where: {
          user_id: userId,
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [Category]
      });

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const categoryBreakdown = {};
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const catName = t.Category.name;
          categoryBreakdown[catName] = (categoryBreakdown[catName] || 0) + parseFloat(t.amount);
        });

      // Calculate daily averages
      const daysInPeriod = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      const avgDailySpending = expenses / daysInPeriod;

      res.json({
        success: true,
        data: {
          period,
          startDate,
          endDate,
          income,
          expenses,
          net: income - expenses,
          categoryBreakdown,
          transactionCount: transactions.length,
          avgDailySpending,
          dailyData: await this.getDailyData(userId, startDate, endDate)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDailyData(userId, startDate, endDate) {
    const transactions = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('date')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      where: {
        user_id: userId,
        type: 'expense',
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('date'))],
      order: [[sequelize.fn('DATE', sequelize.col('date')), 'ASC']]
    });

    return transactions.map(t => ({
      date: t.get('date'),
      amount: parseFloat(t.get('total')) || 0
    }));
  }
}

module.exports = UserController;