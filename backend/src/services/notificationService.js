const EmailService = require('./emailService');
const { User, Category, Budget, Transaction } = require('../model/index');

class NotificationService {
  static async checkBudgetAlerts(userId) {
    try {
      const categories = await Category.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Transaction,
            attributes: [
              [sequelize.fn('SUM', sequelize.col('amount')), 'total_spent']
            ],
            where: {
              type: 'expense',
              date: {
                [Op.between]: [
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                  new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
                ]
              }
            },
            required: false
          }
        ],
        group: ['Category.id']
      });

      const alerts = [];
      const user = await User.findByPk(userId);

      for (const category of categories) {
        const totalSpent = parseFloat(category.Transactions[0]?.dataValues.total_spent || 0);
        const budget = category.monthly_budget;
        
        if (budget > 0) {
          const percentage = (totalSpent / budget) * 100;
          
          if (percentage >= category.budget_threshold) {
            alerts.push({
              category: category.name,
              spent: totalSpent,
              budget,
              percentage: Math.round(percentage),
            });

            // Send email alert if threshold reached
            if (user.settings?.notifications !== false) {
              await EmailService.sendBudgetAlertEmail(user, category, {
                spent: totalSpent,
                budget,
                percentage: Math.round(percentage),
              });
            }
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error('Error checking budget alerts:', error);
      return [];
    }
  }

  static async getFinancialSummary(userId, period = 'week') {
    try {
      const now = new Date();
      let startDate, endDate;

      switch (period) {
        case 'day':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - now.getDay()));
          endDate = new Date(now.setDate(now.getDate() - now.getDay() + 6));
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        default:
          startDate = new Date(now.setDate(now.getDate() - 7));
          endDate = new Date();
      }

      const transactions = await Transaction.findAll({
        where: {
          user_id: userId,
          date: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [Category],
        order: [['date', 'DESC']]
      });

      const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const categories = {};
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const catName = t.Category.name;
          categories[catName] = (categories[catName] || 0) + parseFloat(t.amount);
        });

      return {
        period,
        startDate,
        endDate,
        income,
        expenses,
        net: income - expenses,
        categories,
        transactionCount: transactions.length,
        averageDailySpending: expenses / ((endDate - startDate) / (1000 * 60 * 60 * 24))
      };
    } catch (error) {
      console.error('Error getting financial summary:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;