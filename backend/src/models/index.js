const User = require('./User');
const Category = require('./Category');
const Budget = require('./Budget');
const Transaction = require('./Transaction');
const PasswordReset = require('./PasswordReset');

// User associations
User.hasMany(Category, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(Budget, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(Transaction, { foreignKey: 'user_id', onDelete: 'CASCADE' });
User.hasMany(PasswordReset, { foreignKey: 'user_id', onDelete: 'CASCADE' });

// Category associations
Category.belongsTo(User, { foreignKey: 'user_id' });
Category.hasMany(Transaction, { foreignKey: 'category_id', onDelete: 'CASCADE' });

// Budget associations
Budget.belongsTo(User, { foreignKey: 'user_id' });
Budget.hasMany(Transaction, { foreignKey: 'budget_id', onDelete: 'SET NULL' });

// Transaction associations
Transaction.belongsTo(User, { foreignKey: 'user_id' });
Transaction.belongsTo(Category, { foreignKey: 'category_id' });
Transaction.belongsTo(Budget, { foreignKey: 'budget_id' });

// PasswordReset associations
PasswordReset.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  User,
  Category,
  Budget,
  Transaction,
  PasswordReset,
};