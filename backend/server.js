const app = require("./src/app");
const { sequelize } = require("./src/config/db");

const PORT = process.env.PORT || 5000;

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully");

    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  }).catch(err => {
    console.error('Unable to connect to database: ', err);
    process.exit(1);
  })
