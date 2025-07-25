const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(__dirname, 'modules.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Initialize database tables
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        const createModulesTable = `
      CREATE TABLE IF NOT EXISTS modules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        prompt TEXT NOT NULL,
        en_name TEXT NOT NULL,
        en_description TEXT,
        en_input_placeholder TEXT,
        kn_name TEXT NOT NULL,
        kn_description TEXT,
        kn_input_placeholder TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

        db.run(createModulesTable, (err) => {
            if (err) {
                console.error('Error creating modules table:', err.message);
                reject(err);
            } else {
                console.log('Modules table created or already exists');
                resolve();
            }
        });
    });
};

// Initialize database with seeding
const initializeDatabaseWithSeeding = async () => {
    try {
        // First initialize the database tables
        await initializeDatabase();

        // Then seed the database if it's empty
        const { seedDatabase } = require('./seedData');
        await seedDatabase();

        console.log('Database initialization and seeding completed successfully');
    } catch (error) {
        console.error('Error during database initialization and seeding:', error.message);
        throw error;
    }
};

// Close database connection
const closeDatabase = () => {
    return new Promise((resolve) => {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
            resolve();
        });
    });
};

module.exports = {
    db,
    initializeDatabase,
    initializeDatabaseWithSeeding,
    closeDatabase
};