const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Budget = sequelize.define('Budget', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  month: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 12,
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 2000,
    },
  },
  total_budget: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  total_spent: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  total_income: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  savings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notes: {
    type: DataTypes.TEXT,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'budgets',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['month', 'year', 'user_id'],
    },
  ],
});

module.exports = Budget;