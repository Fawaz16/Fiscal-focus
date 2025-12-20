const { sequelize } = require("../../config/db");
const {
  User,
  Category,
  Budget,
  Transaction
} = require("../../config/associations");

const seedDatabase = async () => {
  try {
    // Clear existing data
    await Transaction.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Budget.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create test user with new fields
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      date_of_birth: "1995-05-15",
      phone_number: "+1234567890",
      is_verified: true,
      monthly_income: 2000,
      savings_target: 500,
      settings: {
        notifications: true,
        theme: "light",
        language: "en",
        profile_visibility: "public"
      }
    });

    console.log("✅ Test user created");

    // Create default categories
    const categories = await Category.bulkCreate([
      {
        name: "Food & Dining",
        color: "#EF4444",
        icon: "utensils",
        user_id: user.id,
        monthly_budget: 400
      },
      {
        name: "Transportation",
        color: "#3B82F6",
        icon: "car",
        user_id: user.id,
        monthly_budget: 200
      },
      {
        name: "Entertainment",
        color: "#8B5CF6",
        icon: "film",
        user_id: user.id,
        monthly_budget: 100
      },
      {
        name: "Shopping",
        color: "#10B981",
        icon: "shopping-bag",
        user_id: user.id,
        monthly_budget: 150
      },
      {
        name: "Bills & Utilities",
        color: "#F59E0B",
        icon: "receipt",
        user_id: user.id,
        monthly_budget: 300
      },
      {
        name: "Income",
        color: "#059669",
        icon: "dollar-sign",
        user_id: user.id,
        is_default: true
      }
    ]);

    console.log("✅ Default categories created");

    // Create current month budget
    const now = new Date();
    const budget = await Budget.create({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      total_budget: 1150,
      user_id: user.id
    });

    console.log("✅ Budget created");

    // Create sample transactions
    const transactions = [
      {
        amount: 2000,
        type: "income",
        description: "Monthly Salary",
        category_id: categories[5].id,
        user_id: user.id,
        date: new Date(now.getFullYear(), now.getMonth(), 1)
      },
      {
        amount: 25.5,
        type: "expense",
        description: "Groceries",
        category_id: categories[0].id,
        user_id: user.id,
        date: new Date(now.getFullYear(), now.getMonth(), 2)
      },
      {
        amount: 40.0,
        type: "expense",
        description: "Gas",
        category_id: categories[1].id,
        user_id: user.id,
        date: new Date(now.getFullYear(), now.getMonth(), 3)
      },
      {
        amount: 15.99,
        type: "expense",
        description: "Netflix",
        category_id: categories[2].id,
        user_id: user.id,
        date: new Date(now.getFullYear(), now.getMonth(), 5)
      },
      {
        amount: 80.0,
        type: "expense",
        description: "Electricity Bill",
        category_id: categories[4].id,
        user_id: user.id,
        date: new Date(now.getFullYear(), now.getMonth(), 10)
      },
      {
        amount: 29.99,
        type: "expense",
        description: "New shirt",
        category_id: categories[3].id,
        user_id: user.id,
        date: new Date(now.getFullYear(), now.getMonth(), 12)
      },
      {
        amount: 12.5,
        type: "expense",
        description: "Lunch",
        category_id: categories[0].id,
        user_id: user.id,
        date: new Date(now.getFullYear(), now.getMonth(), 15)
      },
      {
        amount: 60.0,
        type: "expense",
        description: "Monthly bus pass",
        category_id: categories[1].id,
        user_id: user.id,
        date: new Date(now.getFullYear(), now.getMonth(), 20)
      }
    ];

    await Transaction.bulkCreate(transactions);
    console.log("✅ Sample transactions created");

    console.log("\n🎉 Database seeded successfully!");
    console.log(`👤 Test user: ${user.email} / password123`);
    console.log(`🔗 Login URL: ${process.env.FRONTEND_DEV_URL}/login`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
