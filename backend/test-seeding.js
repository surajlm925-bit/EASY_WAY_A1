/**
 * Test script for database seeding functionality
 * This script tests the seeding process and verifies data transformation
 */

const { initializeDatabaseWithSeeding, closeDatabase } = require('./database/db');
const { getAllModules } = require('./database/moduleRepository');
const { seedDatabase, forceSeedDatabase, isDatabaseEmpty, defaultModules } = require('./database/seedData');

/**
 * Test the seeding functionality
 */
const testSeeding = async () => {
    try {
        console.log('=== Testing Database Seeding ===\n');

        // Test 1: Initialize database with seeding
        console.log('1. Testing database initialization with seeding...');
        await initializeDatabaseWithSeeding();
        console.log('✓ Database initialization completed\n');

        // Test 2: Check if modules were created
        console.log('2. Verifying seeded modules...');
        const modules = await getAllModules();
        console.log(`✓ Found ${modules.length} modules in database`);

        if (modules.length !== defaultModules.length) {
            throw new Error(`Expected ${defaultModules.length} modules, but found ${modules.length}`);
        }

        // Test 3: Verify data transformation
        console.log('\n3. Verifying data transformation...');
        for (let i = 0; i < modules.length; i++) {
            const module = modules[i];
            const expectedModule = defaultModules[i];

            console.log(`\nModule ${i + 1}: ${module.en.name}`);
            console.log(`  - ID: ${module.id}`);
            console.log(`  - Prompt: ${module.prompt.substring(0, 50)}...`);
            console.log(`  - EN Name: ${module.en.name}`);
            console.log(`  - KN Name: ${module.kn.name}`);
            console.log(`  - Created At: ${module.createdAt}`);
            console.log(`  - Updated At: ${module.updatedAt}`);

            // Verify data matches expected format
            if (module.prompt !== expectedModule.prompt) {
                throw new Error(`Prompt mismatch for module ${i + 1}`);
            }

            if (module.en.name !== expectedModule.en.name) {
                throw new Error(`English name mismatch for module ${i + 1}`);
            }

            if (module.kn.name !== expectedModule.kn.name) {
                throw new Error(`Kannada name mismatch for module ${i + 1}`);
            }

            // Verify required fields are present
            if (!module.id || !module.createdAt || !module.updatedAt) {
                throw new Error(`Missing required fields for module ${i + 1}`);
            }
        }

        console.log('\n✓ All modules verified successfully');

        // Test 4: Test duplicate seeding prevention
        console.log('\n4. Testing duplicate seeding prevention...');
        const isEmpty = await isDatabaseEmpty();
        console.log(`Database empty: ${isEmpty}`);

        if (isEmpty) {
            throw new Error('Database should not be empty after seeding');
        }

        // Try to seed again - should skip
        const secondSeedResult = await seedDatabase();
        console.log(`Second seeding result: ${secondSeedResult.length} modules created`);

        if (secondSeedResult.length !== 0) {
            throw new Error('Second seeding should have created 0 modules (duplicate prevention)');
        }

        console.log('✓ Duplicate seeding prevention working correctly');

        // Test 5: Verify final module count
        console.log('\n5. Final verification...');
        const finalModules = await getAllModules();
        console.log(`Final module count: ${finalModules.length}`);

        if (finalModules.length !== defaultModules.length) {
            throw new Error(`Final count should be ${defaultModules.length}, but got ${finalModules.length}`);
        }

        console.log('\n=== All Tests Passed! ===');
        console.log('✓ Database seeding is working correctly');
        console.log('✓ Data transformation is accurate');
        console.log('✓ Bilingual content is properly stored');
        console.log('✓ Duplicate prevention is working');

    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        throw error;
    } finally {
        // Clean up
        await closeDatabase();
    }
};

// Run the test
if (require.main === module) {
    testSeeding()
        .then(() => {
            console.log('\n🎉 Seeding test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Seeding test failed:', error.message);
            process.exit(1);
        });
}

module.exports = { testSeeding };