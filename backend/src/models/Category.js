const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Category = sequelize.define(
  "Category",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT
    },
    color: {
      type: DataTypes.STRING,
      defaultValue: "#3B82F6"
    },
    icon: {
      type: DataTypes.STRING,
      defaultValue: "receipt"
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    monthly_budget: {
      type: DataTypes.DECIMAL(15, 2)
    },
    budget_threshold: {
      type: DataTypes.INTEGER,
      defaultValue: 80
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      }
    }
  },
  {
    tableName: "categories",
    timestamps: true
  }
);

module.exports = Category;