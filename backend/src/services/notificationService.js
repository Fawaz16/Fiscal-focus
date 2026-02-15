const EmailService = require('./emailService');
const { User, Category, Transaction } = require('../models/index');
const { Op } = require('sequelize');
const { sequelize } = require("../config/db");

class NotificationService {
  static async getUserNotificationSettings(userId) {
    try {
      const user = await User.findByPk(userId, {
        attributes: ['settings']
      });

      // Default settings
      const defaultSettings = {
        emailNotifications: true,
        pushNotifications: true,
        budgetAlerts: true,
        weeklySummary: true,
        monthlyReport: true,
        transactionAlerts: true,
        lowBalanceAlert: true,
        securityAlerts: true,
        budgetThreshold: 80,
        alertFrequency: 'immediate'
      };

      return user.settings?.notificationPreferences || defaultSettings;
    } catch (error) {
      console.error('Error getting user notification settings:', error);
      return null;
    }
  }

  static async checkBudgetAlerts(userId) {
    try {
      // Get user notification settings
      const settings = await this.getUserNotificationSettings(userId);
      
      // If budget alerts are disabled, return empty array
      if (settings && !settings.budgetAlerts) {
        return [];
      }

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
          // Use user's budget threshold setting or default to category threshold
          const threshold = settings?.budgetThreshold || category.budget_threshold || 80;
          const percentage = (totalSpent / budget) * 100;
          
          if (percentage >= threshold) {
            alerts.push({
              category: category.name,
              spent: totalSpent,
              budget,
              percentage: Math.round(percentage),
              threshold
            });

            // Send email alert if email notifications are enabled
            if (settings?.emailNotifications !== false) {
              await EmailService.sendBudgetAlertEmail(user, category, {
                spent: totalSpent,
                budget,
                percentage: Math.round(percentage),
                threshold
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

  static async sendWeeklySummary(userId) {
    try {
      const settings = await this.getUserNotificationSettings(userId);
      
      // Check if weekly summary is enabled
      if (!settings || !settings.weeklySummary || !settings.emailNotifications) {
        return false;
      }

      // Check frequency - only send on the configured day/time
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
      if (settings.alertFrequency === 'weekly' && today !== 1) { // Send on Monday
        return false;
      }

      const user = await User.findByPk(userId);
      const summary = await this.getFinancialSummary(userId, 'week');
      
      await EmailService.sendWeeklySummaryEmail(user, summary);
      return true;
    } catch (error) {
      console.error('Error sending weekly summary:', error);
      return false;
    }
  }

  static async sendMonthlyReport(userId) {
    try {
      const settings = await this.getUserNotificationSettings(userId);
      
      // Check if monthly report is enabled
      if (!settings || !settings.monthlyReport || !settings.emailNotifications) {
        return false;
      }

      const today = new Date().getDate();
      if (today !== 1) { // Send on the 1st of each month
        return false;
      }

      const user = await User.findByPk(userId);
      const report = await this.getFinancialSummary(userId, 'month');
      
      await EmailService.sendMonthlyReportEmail(user, report);
      return true;
    } catch (error) {
      console.error('Error sending monthly report:', error);
      return false;
    }
  }

  static async checkLowBalance(userId, currentBalance) {
    try {
      const settings = await this.getUserNotificationSettings(userId);
      
      if (!settings || !settings.lowBalanceAlert) {
        return false;
      }

      const user = await User.findByPk(userId);
      const lowBalanceThreshold = 100; // You can make this configurable too
      
      if (currentBalance < lowBalanceThreshold) {
        await EmailService.sendLowBalanceAlert(user, currentBalance);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking low balance:', error);
      return false;
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