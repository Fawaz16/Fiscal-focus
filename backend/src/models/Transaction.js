const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  type: {
    type: DataTypes.ENUM('income', 'expense'),
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  is_recurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  recurrence_pattern: {
    type: DataTypes.STRING, // 'daily', 'weekly', 'monthly'
  },
  next_occurrence: {
    type: DataTypes.DATE,
  },
  location: {
    type: DataTypes.STRING,
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue: 'cash',
  },
  notes: {
    type: DataTypes.TEXT,
  },
  is_cleared: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  category_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id',
    },
  },
  budget_id: {
    type: DataTypes.UUID,
    references: {
      model: 'budgets',
      key: 'id',
    },
  },
}, {
  tableName: 'transactions',
  timestamps: true,
  indexes: [
    {
      fields: ['date'],
    },
    {
      fields: ['user_id', 'date'],
    },
    {
      fields: ['type'],
    },
  ],
});

module.exports = Transaction;