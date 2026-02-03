// Migration script to change INTEGER to TEXT/UUID
const { sequelize } = require('../../config/db');

async function migrateToUUID() {
  try {
    // 1. Create a backup table
    // await sequelize.query(`
    //   CREATE TABLE categories_backup AS 
    //   SELECT * FROM categories
    // `);
    
    // 2. Drop the old table
    // await sequelize.query('DROP TABLE categories');
    
    // 3. Sync the model to create new table with UUID
    const Category = require('../../models/Category');
    await Category.sync();
    
    console.log('Migrated to UUID successfully');
  } catch (error) {
    console.error('Migration error:', error);
  }
}

// Call this once
migrateToUUID();