const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 100],
    },
  },
  profile_picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isDate: true,
    },
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/i, // Basic phone number validation
    },
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'USD',
  },
  monthly_income: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  savings_target: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verification_token: {
    type: DataTypes.STRING,
  },
  verification_expires: {
    type: DataTypes.DATE,
  },
  reset_token: {
    type: DataTypes.STRING,
  },
  reset_expires: {
    type: DataTypes.DATE,
  },
  last_login: {
    type: DataTypes.DATE,
  },
  settings: {
    type: DataTypes.JSON,
    defaultValue: {
      notifications: true,
      theme: 'light',
      language: 'en',
      profile_visibility: 'private',
    },
  },
}, {
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, parseInt(process.env.SALT));
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, parseInt(process.env.SALT));
      }
    },
  },
});

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.verification_token;
  delete values.reset_token;
  return values;
};

// Add age calculation method
User.prototype.getAge = function() {
  if (!this.date_of_birth) return null;
  
  const birthDate = new Date(this.date_of_birth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

module.exports = User;