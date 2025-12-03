const { Sequelize } = require("sequelize");
const path = require("path");

//Check the environment
const isProduction = process.env.NODE_ENV === "production";

//Check if to use SQLite in production
const useSQLite = process.env.USE_SQLite === "true";
let sequelize;

if (isProduction && useSQLite == false) {
  // Production -> Postgres
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: "postgres",
      logging: false,
      define: {
        timestamps: true,
        underscored: true
      }
    }
  );
} else {
  //Development -> SQLite
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage:
      process.env.DB_STORAGE ||
      path.join(__dirname, "../database/fiscal_focus.db"),
    logging: false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

module.exports = { sequelize };
