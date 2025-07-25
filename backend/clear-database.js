/**
 * Script to clear the database for testing purposes
 */

const { db, closeDatabase } = require('./database/db');

const clearDatabase = async () => {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM modules', (err) => {
            if (err) {
                console.error('Error clearing database:', err.message);
                reject(err);
            } else {
                console.log('Database cleared successfully');
                resolve();
            }
        });
    });
};

// Run the clear operation
if (require.main === module) {
    clearDatabase()
        .then(() => {
            console.log('✓ Database cleared');
            return closeDatabase();
        })
        .then(() => {
            console.log('✓ Database connection closed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Failed to clear database:', error.message);
            process.exit(1);
        });
}

module.exports = { clearDatabase };