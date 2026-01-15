const { Op, where } = require("sequelize");
const { User, Category, Budget, Transaction } = require("../models/index");
const BalanceService = require("../services/balanceService");
const NotificationService = require('../services/notificationService');

class UserController {
  static async getFinancialSummary(req, res, next) {
    try {
      const { period } = req.params; // day, week, month, year
      const userId = req.user.id;

      const now = new Date();
      let startDate, endDate;

      switch (period) {
        case "day":
          startDate = new Date(now.setHours(0, 0, 0, 0));
          endDate = new Date(now.setHours(23, 59, 59, 999));
          break;
        case "week":
          const day = now.getDay();
          startDate = new Date(now.setDate(now.getDate() - day));
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 6);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        case "year":
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          return res.status(400).json({
            success: false,
            message: "Invalid period"
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
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const expenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const categoryBreakdown = {};
      transactions.filter(t => t.type === "expense").forEach(t => {
        const catName = t.Category.name;
        categoryBreakdown[catName] =
          (categoryBreakdown[catName] || 0) + parseFloat(t.amount);
      });

      // Calculate daily averages
      const daysInPeriod = Math.ceil(
        (endDate - startDate) / (1000 * 60 * 60 * 24)
      );
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
        [sequelize.fn("DATE", sequelize.col("date")), "date"],
        [sequelize.fn("SUM", sequelize.col("amount")), "total"]
      ],
      where: {
        user_id: userId,
        type: "expense",
        date: {
          [Op.between]: [startDate, endDate]
        }
      },
      group: [sequelize.fn("DATE", sequelize.col("date"))],
      order: [[sequelize.fn("DATE", sequelize.col("date")), "ASC"]]
    });

    return transactions.map(t => ({
      date: t.get("date"),
      amount: parseFloat(t.get("total")) || 0
    }));
  }

  static async getBalance(req, res, next) {
    try {
      const balance = await BalanceService.calculateCurrentBalance(req.user.id);

      res.json({
        success: true,
        data: {
          balance: balance.currentBalance,
          totalIncome: balance.totalIncome,
          totalExpenses: balance.totalExpenses,
          transactionCount: balance.transactionCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBalanceUpdate(req, res, next) {
    try {
      const { transaction_id } = req.query;
      const balanceUpdate = await BalanceService.getBalanceUpdate(
        req.user.id,
        transaction_id
      );

      res.json({
        success: true,
        data: balanceUpdate
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBalanceForecast(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const forecast = await BalanceService.getBalanceForecast(
        req.user.id,
        parseInt(days)
      );

      res.json({
        success: true,
        data: forecast
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryBreakdown(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      let startDate, endDate;

      if (start_date && end_date) {
        startDate = new Date(start_date);
        endDate = new Date(end_date);
      } else {
        // Default to current month
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }

      const breakdown = await BalanceService.getCategoryBreakdown(
        req.user.id,
        startDate,
        endDate
      );

      res.json({
        success: true,
        data: {
          period: {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString()
          },
          breakdown: breakdown
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSavingsProgress(req, res, next) {
    try {
      const progress = await BalanceService.getSavingsProgress(req.user.id);

      if (!progress) {
        return res.json({
          success: true,
          data: null,
          message: "No savings target set"
        });
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error) {
      next(error);
    }
  }

  // Update getDashboard method to include balance
  static async getDashboard(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      // Get current balance
      const balance = await BalanceService.calculateCurrentBalance(userId);

      // Get current month's budget
      const budget = await Budget.findOne({
        where: {
          user_id: userId,
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          is_active: true
        }
      });

      // Get recent transactions
      const transactions = await Transaction.findAll({
        where: { user_id: userId },
        include: [Category],
        order: [["date", "DESC"]],
        limit: 10
      });

      // Get category spending for current month
      const categorySpending = await BalanceService.getCategoryBreakdown(
        userId,
        startOfMonth,
        endOfMonth
      );

      // Get today's spending
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const endOfDay = new Date(now.setHours(23, 59, 59, 999));

      const todaySpending =
        (await Transaction.sum("amount", {
          where: {
            user_id: userId,
            type: "expense",
            date: {
              [Op.between]: [startOfDay, endOfDay]
            }
          }
        })) || 0;

      // Get savings progress
      const savingsProgress = await BalanceService.getSavingsProgress(userId);

      res.json({
        success: true,
        data: {
          overview: {
            currentBalance: balance.currentBalance,
            totalIncome: balance.totalIncome,
            totalExpenses: balance.totalExpenses,
            todaySpending: todaySpending,
            savingsProgress: savingsProgress,
            transactionCount: balance.transactionCount
          },
          budget: budget || null,
          recentTransactions: transactions,
          categorySpending: categorySpending,
          alerts: await NotificationService.checkBudgetAlerts(userId) // You'll need to implement this
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Helper method to check budget alerts
  static async checkBudgetAlerts(userId) {
    try {
      const categories = await Category.findAll({
        where: { user_id: userId },
        include: [
          {
            model: Transaction,
            where: {
              date: {
                [Op.between]: [
                  new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                  new Date()
                ]
              }
            },
            required: false
          }
        ]
      });

      const alerts = [];

      for (const category of categories) {
        if (category.monthly_budget > 0) {
          const spent = category.Transactions.reduce(
            (sum, t) => sum + parseFloat(t.amount),
            0
          );
          const percentage = spent / category.monthly_budget * 100;

          if (percentage >= category.budget_threshold) {
            alerts.push({
              category: category.name,
              spent: spent,
              budget: category.monthly_budget,
              percentage: Math.round(percentage),
              threshold: category.budget_threshold
            });
          }
        }
      }

      return alerts;
    } catch (error) {
      console.error("Error checking budget alerts:", error);
      return [];
    }
  }

  // Delete User Account
  static async deleteUser(req, res, next) {
    try {
      const userId = req.user.id;

      //Delete related data first
      await Transaction.destroy({ where: { user_id: userId } });
      await Budget.destroy({ where: { user_id: userId } });
      await Category.destroy({ where: { user_id: userId } });

      //Finally delete the user
      const deleted = await User.destroy({
        where: { id: userId }
      });
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }
      return res.json({
        success: true,
        message: "User account deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
