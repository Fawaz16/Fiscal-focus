const { Op } = require('sequelize');
const { Transaction, Category, Budget } = require('../models/index');
const NotificationService = require('../services/notificationService');
const BalanceService = require('../services/balanceService');

class TransactionController {
  static async createTransaction(req, res, next) {
    try {
      const {
        amount,
        type,
        description,
        date,
        category_id,
        is_recurring,
        recurrence_pattern,
        location,
        payment_method,
        notes
      } = req.body;

      const userId = req.user.id;

      // Get current month's budget
      const now = new Date();
      const transactionDate = date ? new Date(date) : now;
      
      const budget = await Budget.findOne({
        where: {
          user_id: userId,
          month: transactionDate.getMonth() + 1,
          year: transactionDate.getFullYear(),
          is_active: true
        }
      });

      // Create transaction
      const transaction = await Transaction.create({
        amount,
        type,
        description,
        date: transactionDate,
        category_id,
        is_recurring,
        recurrence_pattern,
        next_occurrence: is_recurring ? this.calculateNextOccurrence(transactionDate, recurrence_pattern) : null,
        location,
        payment_method,
        notes,
        user_id: userId,
        budget_id: budget?.id || null
      });

      // Get updated balance after transaction
      const balanceUpdate = await BalanceService.getBalanceUpdate(userId, transaction.id);

      // Check for budget alerts
      await NotificationService.checkBudgetAlerts(userId);

      res.status(201).json({
        success: true,
        message: 'Transaction created successfully',
        data: {
          transaction,
          balanceUpdate // Include balance update in response
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateTransaction(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const transaction = await Transaction.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Store old values for balance calculation
      const oldAmount = transaction.amount;
      const oldType = transaction.type;

      // Update transaction
      await transaction.update(updates);

      // Get updated balance
      const balanceUpdate = await BalanceService.getBalanceUpdate(req.user.id, transaction.id);

      // Check for budget alerts
      await NotificationService.checkBudgetAlerts(req.user.id);

      res.json({
        success: true,
        message: 'Transaction updated successfully',
        data: {
          transaction,
          balanceUpdate // Include balance update in response
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteTransaction(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Store transaction info for balance calculation
      const transactionInfo = {
        amount: transaction.amount,
        type: transaction.type
      };

      // Delete transaction
      await transaction.destroy();

      // Get updated balance
      const balanceUpdate = await BalanceService.getBalanceUpdate(req.user.id);

      res.json({
        success: true,
        message: 'Transaction deleted successfully',
        data: {
          balanceUpdate // Include balance update in response
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static calculateNextOccurrence(date, pattern) {
    const nextDate = new Date(date);
    
    switch (pattern) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      default:
        return null;
    }
    
    return nextDate;
  }

  static async getTransactions(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        type,
        category_id,
        startDate,
        endDate,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      const where = { user_id: req.user.id };

      if (type) where.type = type;
      if (category_id) where.category_id = category_id;
      
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date[Op.gte] = new Date(startDate);
        if (endDate) where.date[Op.lte] = new Date(endDate);
      }

      if (search) {
        where[Op.or] = [
          { description: { [Op.iLike]: `%${search}%` } },
          { notes: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows: transactions } = await Transaction.findAndCountAll({
        where,
        include: [Category],
        order: [['date', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransaction(req, res, next) {
    try {
      const { id } = req.params;

      const transaction = await Transaction.findOne({
        where: {
          id,
          user_id: req.user.id
        },
        include: [Category, Budget]
      });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      res.json({
        success: true,
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionStats(req, res, next) {
    try {
      const { period } = req.params; // week, month, year
      const userId = req.user.id;

      const now = new Date();
      let startDate;

      switch (period) {
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = new Date(now.setMonth(now.getMonth() - 1));
      }

      const endDate = new Date();

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

      const topCategories = {};
      transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
          const catName = t.Category.name;
          topCategories[catName] = (topCategories[catName] || 0) + parseFloat(t.amount);
        });

      // Sort categories by amount
      const sortedCategories = Object.entries(topCategories)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, amount]) => ({ name, amount }));

      // Daily spending trend
      const dailyData = await this.getDailySpending(userId, startDate, endDate);

      res.json({
        success: true,
        data: {
          period,
          startDate,
          endDate,
          totals: {
            income,
            expenses,
            net: income - expenses
          },
          averages: {
            daily: expenses / ((endDate - startDate) / (1000 * 60 * 60 * 24)),
            weekly: expenses / (((endDate - startDate) / (1000 * 60 * 60 * 24)) / 7)
          },
          topCategories: sortedCategories,
          transactionCount: transactions.length,
          dailyData
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDailySpending(userId, startDate, endDate) {
    const results = await Transaction.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('date')), 'day'],
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

    return results.map(r => ({
      date: r.get('day'),
      amount: parseFloat(r.get('total')) || 0
    }));
  }

  static async processRecurringTransactions(req, res, next) {
    try {
      const userId = req.user.id;
      const now = new Date();

      // Find recurring transactions that are due
      const recurringTransactions = await Transaction.findAll({
        where: {
          user_id: userId,
          is_recurring: true,
          next_occurrence: {
            [Op.lte]: now
          }
        }
      });

      const processed = [];

      for (const transaction of recurringTransactions) {
        // Create new transaction
        const newTransaction = await Transaction.create({
          amount: transaction.amount,
          type: transaction.type,
          description: transaction.description,
          date: transaction.next_occurrence,
          category_id: transaction.category_id,
          is_recurring: true,
          recurrence_pattern: transaction.recurrence_pattern,
          next_occurrence: this.calculateNextOccurrence(transaction.next_occurrence, transaction.recurrence_pattern),
          location: transaction.location,
          payment_method: transaction.payment_method,
          notes: transaction.notes,
          user_id: userId
        });

        // Update next occurrence
        await transaction.update({
          next_occurrence: newTransaction.next_occurrence
        });

        processed.push(newTransaction);
      }

      res.json({
        success: true,
        message: `Processed ${processed.length} recurring transactions`,
        data: { transactions: processed }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TransactionController;