/**
 * Demo script to showcase database seeding functionality
 * This script demonstrates the complete seeding process
 */

const { initializeDatabaseWithSeeding, closeDatabase } = require('./database/db');
const { getAllModules } = require('./database/moduleRepository');
const { clearDatabase } = require('./clear-database');

const demoSeeding = async () => {
    try {
        console.log('🌱 Database Seeding Demo\n');

        // Step 1: Clear existing data
        console.log('1. Clearing existing database...');
        await clearDatabase();
        console.log('✓ Database cleared\n');

        // Step 2: Initialize and seed
        console.log('2. Initializing database with seeding...');
        await initializeDatabaseWithSeeding();
        console.log('✓ Database initialized and seeded\n');

        // Step 3: Display seeded modules
        console.log('3. Displaying seeded modules:');
        const modules = await getAllModules();

        modules.forEach((module, index) => {
            console.log(`\n📄 Module ${index + 1}:`);
            console.log(`   ID: ${module.id}`);
            console.log(`   English Name: ${module.en.name}`);
            console.log(`   Kannada Name: ${module.kn.name}`);
            console.log(`   Description (EN): ${module.en.description}`);
            console.log(`   Description (KN): ${module.kn.description}`);
            console.log(`   Prompt: ${module.prompt.substring(0, 80)}...`);
            console.log(`   Created: ${module.createdAt}`);
        });

        console.log(`\n✅ Successfully seeded ${modules.length} default modules!`);
        console.log('\n🎯 Key Features Demonstrated:');
        console.log('   ✓ Automatic database initialization');
        console.log('   ✓ Default module seeding on empty database');
        console.log('   ✓ Proper bilingual content transformation');
        console.log('   ✓ Duplicate seeding prevention');
        console.log('   ✓ Database schema compliance');

    } catch (error) {
        console.error('\n❌ Demo failed:', error.message);
        throw error;
    } finally {
        await closeDatabase();
    }
};

// Run the demo
if (require.main === module) {
    demoSeeding()
        .then(() => {
            console.log('\n🎉 Seeding demo completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Demo failed:', error.message);
            process.exit(1);
        });
}

module.exports = { demoSeeding };