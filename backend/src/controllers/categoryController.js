const { Category, Transaction } = require('../models/index');

class CategoryController {
  static async createCategory(req, res, next) {
    try {
      const { name, description, color, icon, monthly_budget, budget_threshold } = req.body;

      const category = await Category.create({
        name,
        description,
        color,
        icon,
        monthly_budget,
        budget_threshold: budget_threshold || 80,
        user_id: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategories(req, res, next) {
    try {
      const categories = await Category.findAll({
        where: { user_id: req.user.id },
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: { categories }
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategory(req, res, next) {
    try {
      const { id } = req.params;

      const category = await Category.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Get category spending for current month
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const transactions = await Transaction.findAll({
        where: {
          category_id: id,
          user_id: req.user.id,
          date: {
            [sequelize.Op.between]: [startDate, endDate]
          }
        },
        order: [['date', 'DESC']]
      });

      const totalSpent = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);

      const budgetPercentage = category.monthly_budget > 0 
        ? (totalSpent / category.monthly_budget) * 100 
        : 0;

      res.json({
        success: true,
        data: {
          category,
          spending: {
            total: totalSpent,
            percentage: Math.round(budgetPercentage),
            transactions,
            count: transactions.length
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const category = await Category.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      await category.update(updates);

      res.json({
        success: true,
        message: 'Category updated successfully',
        data: { category }
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      const category = await Category.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }

      // Check if category has transactions
      const transactionCount = await Transaction.count({
        where: { category_id: id }
      });

      if (transactionCount > 0 && !category.is_default) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete category with existing transactions. Reassign transactions first.'
        });
      }

      await category.destroy();

      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCategoryStats(req, res, next) {
    try {
      const { period } = req.params; // month, quarter, year
      const now = new Date();
      let startDate;

      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      const endDate = new Date();

      const categories = await Category.findAll({
        where: { user_id: req.user.id }
      });

      const stats = await Promise.all(
        categories.map(async (category) => {
          const transactions = await Transaction.findAll({
            where: {
              category_id: category.id,
              user_id: req.user.id,
              type: 'expense',
              date: {
                [sequelize.Op.between]: [startDate, endDate]
              }
            }
          });

          const totalSpent = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

          return {
            category: category.name,
            color: category.color,
            icon: category.icon,
            budget: category.monthly_budget,
            spent: totalSpent,
            percentage: category.monthly_budget > 0 
              ? (totalSpent / category.monthly_budget) * 100 
              : 0,
            transactionCount: transactions.length
          };
        })
      );

      res.json({
        success: true,
        data: {
          period,
          startDate,
          endDate,
          categories: stats
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CategoryController;