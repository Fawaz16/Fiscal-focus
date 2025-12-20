const app = require("./app");
const { sequelize } = require("./config/db");
require("./config/associations"); // Import associations

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Sync database (use { force: true } only in development to drop tables)
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log("✅ Database synchronized");

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Server URL: ${process.env.SERVER_URL || `http://localhost:${PORT}`}`);
      console.log(`👤 SMTP User: ${process.env.SMTP_USER}`);
    });
  } catch (err) {
    console.error('❌ Unable to connect to database: ', err);
    process.exit(1);
  }
};

startServer();