const { Budget, Category, Transaction } = require("../models/index");
const { Op } = require("sequelize");
const { sequelize } = require("../config/db");

class BudgetController {
  static async createBudget(req, res, next) {
    try {
      const { month, year, total_budget, categories } = req.body;
      const userId = req.user.id;

      // Check if budget already exists for this month/year
      const existingBudget = await Budget.findOne({
        where: {
          user_id: userId,
          month,
          year
        }
      });

      if (existingBudget) {
        return res.status(400).json({
          success: false,
          message: "Budget already exists for this period"
        });
      }

      // Create budget
      const budget = await Budget.create({
        month,
        year,
        total_budget,
        user_id: userId
      });

      // Update category budgets if provided
      if (categories && Array.isArray(categories)) {
        for (const cat of categories) {
          await Category.update(
            { monthly_budget: cat.budget },
            { where: { id: cat.category_id, user_id: userId } }
          );
        }
      }

      res.status(201).json({
        success: true,
        message: "Budget created successfully",
        data: { budget }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBudgets(req, res, next) {
    try {
      const budgets = await Budget.findAll({
        where: { user_id: req.user.id },
        order: [["year", "DESC"], ["month", "DESC"]]
      });

      res.json({
        success: true,
        data: { budgets }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBudget(req, res, next) {
    try {
      const { id } = req.params;
      const budget = await Budget.findOne({
        where: {
          id,
          user_id: req.user.id
        },
        include: [
          {
            model: Transaction,
            include: [Category]
          }
        ]
      });

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: "Budget not found"
        });
      }

      // Calculate spending by category
      const categorySpending = await Transaction.findAll({
        attributes: [
          "category_id",
          [sequelize.fn("SUM", sequelize.col("amount")), "total_spent"]
        ],
        where: {
          user_id: req.user.id,
          type: "expense",
          date: {
            [Op.between]: [
              new Date(budget.year, budget.month - 1, 1),
              new Date(budget.year, budget.month, 0)
            ]
          }
        },
        include: [
          {
            model: Category,
            attributes: ["name", "color", "monthly_budget"]
          }
        ],
        group: ["category_id"]
      });

      res.json({
        success: true,
        data: {
          budget,
          categorySpending
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateBudget(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const budget = await Budget.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: "Budget not found"
        });
      }

      await budget.update(updates);

      res.json({
        success: true,
        message: "Budget updated successfully",
        data: { budget }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteBudget(req, res, next) {
    try {
      const { id } = req.params;

      const budget = await Budget.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!budget) {
        return res.status(404).json({
          success: false,
          message: "Budget not found"
        });
      }

      await budget.destroy();

      res.json({
        success: true,
        message: "Budget deleted successfully"
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBudgetOverview(req, res, next) {
    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const budget = await Budget.findOne({
        where: {
          user_id: req.user.id,
          month: currentMonth,
          year: currentYear,
          is_active: true
        }
      });

      if (!budget) {
        return res.json({
          success: true,
          data: {
            hasBudget: false,
            message: "No active budget for this month"
          }
        });
      }

      // Calculate spending for current month
      const startDate = new Date(currentYear, currentMonth - 1, 1);
      const endDate = new Date(currentYear, currentMonth, 0);

      const transactions = await Transaction.findAll({
        where: {
          user_id: req.user.id,
          date: {
            [Op.between]: [startDate, endDate] // Changed from sequelize.Op.between to Op.between
          }
        }
      });

      const totalIncome = transactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const totalExpenses = transactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const remainingBudget = budget.total_budget - totalExpenses;
      const budgetUtilization = totalExpenses / budget.total_budget * 100;

      res.json({
        success: true,
        data: {
          hasBudget: true,
          budget,
          totals: {
            income: totalIncome,
            expenses: totalExpenses,
            remaining: remainingBudget,
            utilization: Math.round(budgetUtilization)
          },
          dailyAverage: totalExpenses / now.getDate(),
          projectedEndOfMonth: totalExpenses / now.getDate() * endDate.getDate()
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BudgetController;
