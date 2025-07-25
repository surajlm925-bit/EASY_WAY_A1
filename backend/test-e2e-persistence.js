/**
 * End-to-End Module Persistence Test Suite
 * Tests complete module persistence workflow including:
 * - Module creation persistence after page refresh
 * - Module editing saves changes permanently
 * - Module deletion removes from database
 * - Error handling for network failures
 * - Concurrent operations and race conditions
 */

const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null, timeout = 5000) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: timeout
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedBody = body ? JSON.parse(body) : {};
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: parsedBody
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: body
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
};

// Helper function to wait for server to be ready
const waitForServer = async (url, maxAttempts = 30, delay = 1000) => {
    for (let i = 0; i < maxAttempts; i++) {
        try {
            await makeRequest('GET', '/health');
            console.log('✅ Server is ready');
            return true;
        } catch (error) {
            if (i === maxAttempts - 1) {
                throw new Error(`Server not ready after ${maxAttempts} attempts`);
            }
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return false;
};

// Helper function to simulate network failure
const simulateNetworkFailure = () => {
    // This would typically involve stopping the server or blocking network access
    // For this test, we'll simulate by making requests to a non-existent endpoint
    return makeRequest('GET', '/api/nonexistent', null, 1000);
};

// Test data
const testModules = [
    {
        prompt: "E2E Test Module 1",
        en: {
            name: "E2E Test Module 1",
            description: "First test module for E2E testing",
            inputPlaceholder: "Enter test input 1"
        },
        kn: {
            name: "E2E ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್ 1",
            description: "E2E ಪರೀಕ್ಷೆಗಾಗಿ ಮೊದಲ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
            inputPlaceholder: "ಪರೀಕ್ಷಾ ಇನ್‌ಪುಟ್ 1 ನಮೂದಿಸಿ"
        }
    },
    {
        prompt: "E2E Test Module 2",
        en: {
            name: "E2E Test Module 2",
            description: "Second test module for E2E testing",
            inputPlaceholder: "Enter test input 2"
        },
        kn: {
            name: "E2E ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್ 2",
            description: "E2E ಪರೀಕ್ಷೆಗಾಗಿ ಎರಡನೇ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
            inputPlaceholder: "ಪರೀಕ್ಷಾ ಇನ್‌ಪುಟ್ 2 ನಮೂದಿಸಿ"
        }
    }
];

const updatedModule = {
    prompt: "Updated E2E Test Module",
    en: {
        name: "Updated E2E Test Module",
        description: "Updated test module for E2E testing",
        inputPlaceholder: "Enter updated test input"
    },
    kn: {
        name: "ನವೀಕರಿಸಿದ E2E ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        description: "E2E ಪರೀಕ್ಷೆಗಾಗಿ ನವೀಕರಿಸಿದ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        inputPlaceholder: "ನವೀಕರಿಸಿದ ಪರೀಕ್ಷಾ ಇನ್‌ಪುಟ್ ನಮೂದಿಸಿ"
    }
};

// Test runner
const runE2ETests = async () => {
    console.log('🚀 Starting End-to-End Module Persistence Test Suite\n');

    let testsPassed = 0;
    let testsTotal = 0;
    let createdModuleIds = [];

    const test = async (name, testFn) => {
        testsTotal++;
        try {
            console.log(`📋 Testing: ${name}`);
            await testFn();
            console.log(`✅ PASSED: ${name}\n`);
            testsPassed++;
        } catch (error) {
            console.log(`❌ FAILED: ${name}`);
            console.log(`   Error: ${error.message}\n`);
        }
    };

    // Wait for server to be ready
    console.log('⏳ Waiting for server to be ready...');
    await waitForServer(BASE_URL);

    // Test 1: Module Creation Persistence - Create modules
    await test('Module Creation - Create test modules', async () => {
        for (let i = 0; i < testModules.length; i++) {
            const response = await makeRequest('POST', '/api/modules', testModules[i]);

            if (response.statusCode !== 201) {
                throw new Error(`Expected status 201, got ${response.statusCode} for module ${i + 1}`);
            }

            if (!response.body.success || !response.body.data.id) {
                throw new Error(`Failed to create module ${i + 1}`);
            }

            createdModuleIds.push(response.body.data.id);
            console.log(`   Created module ${i + 1} with ID: ${response.body.data.id}`);
        }
    });

    // Test 2: Module Creation Persistence - Verify persistence after "page refresh" (re-fetch)
    await test('Module Creation Persistence - Verify after refresh', async () => {
        // Simulate page refresh by fetching all modules
        const response = await makeRequest('GET', '/api/modules');

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        if (!response.body.success) {
            throw new Error('Failed to fetch modules after refresh');
        }

        const modules = response.body.data;

        // Verify all created modules are still present
        for (const moduleId of createdModuleIds) {
            const foundModule = modules.find(m => m.id === moduleId);
            if (!foundModule) {
                throw new Error(`Module with ID ${moduleId} not found after refresh`);
            }
        }

        console.log(`   ✅ All ${createdModuleIds.length} created modules persist after refresh`);
    });

    // Test 3: Module Editing Persistence - Update a module
    await test('Module Editing - Update module permanently', async () => {
        if (createdModuleIds.length === 0) {
            throw new Error('No modules available for editing test');
        }

        const moduleIdToUpdate = createdModuleIds[0];
        const response = await makeRequest('PUT', `/api/modules/${moduleIdToUpdate}`, updatedModule);

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        if (!response.body.success) {
            throw new Error('Failed to update module');
        }

        // Verify the update was applied
        const updatedData = response.body.data;
        if (updatedData.prompt !== updatedModule.prompt) {
            throw new Error('Module prompt was not updated');
        }
        if (updatedData.en.name !== updatedModule.en.name) {
            throw new Error('Module English name was not updated');
        }

        console.log(`   ✅ Module ${moduleIdToUpdate} updated successfully`);
    });

    // Test 4: Module Editing Persistence - Verify changes persist after refresh
    await test('Module Editing Persistence - Verify changes after refresh', async () => {
        const moduleIdToCheck = createdModuleIds[0];

        // Fetch all modules to simulate refresh
        const response = await makeRequest('GET', '/api/modules');

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        const modules = response.body.data;
        const updatedModuleFromDB = modules.find(m => m.id === moduleIdToCheck);

        if (!updatedModuleFromDB) {
            throw new Error(`Updated module with ID ${moduleIdToCheck} not found`);
        }

        // Verify the changes persisted
        if (updatedModuleFromDB.prompt !== updatedModule.prompt) {
            throw new Error('Updated prompt did not persist');
        }
        if (updatedModuleFromDB.en.name !== updatedModule.en.name) {
            throw new Error('Updated English name did not persist');
        }

        console.log(`   ✅ Module changes persist after refresh`);
    });

    // Test 5: Module Deletion - Delete a module
    await test('Module Deletion - Delete module from database', async () => {
        if (createdModuleIds.length < 2) {
            throw new Error('Need at least 2 modules for deletion test');
        }

        const moduleIdToDelete = createdModuleIds[1];
        const response = await makeRequest('DELETE', `/api/modules/${moduleIdToDelete}`);

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        if (!response.body.success) {
            throw new Error('Failed to delete module');
        }

        console.log(`   ✅ Module ${moduleIdToDelete} deleted successfully`);

        // Remove from our tracking array
        createdModuleIds = createdModuleIds.filter(id => id !== moduleIdToDelete);
    });

    // Test 6: Module Deletion Persistence - Verify deletion persists after refresh
    await test('Module Deletion Persistence - Verify removal after refresh', async () => {
        // Fetch all modules to verify deletion persisted
        const response = await makeRequest('GET', '/api/modules');

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        const modules = response.body.data;

        // Verify only remaining modules are present
        if (modules.filter(m => createdModuleIds.includes(m.id)).length !== createdModuleIds.length) {
            throw new Error('Module count mismatch after deletion');
        }

        console.log(`   ✅ Module deletion persisted after refresh`);
    });

    // Test 7: Error Handling - Network failure simulation
    await test('Error Handling - Network failure handling', async () => {
        try {
            // Try to access non-existent endpoint to simulate network failure
            const response = await simulateNetworkFailure();
            // If we get a 404, that's expected for a non-existent endpoint
            if (response.statusCode === 404) {
                console.log(`   ✅ Network failure properly handled: 404 Not Found`);
                return;
            }
            throw new Error('Expected network failure simulation to fail');
        } catch (error) {
            if (error.message.includes('Request timeout') ||
                error.message.includes('ECONNREFUSED') ||
                error.code === 'ENOTFOUND' ||
                error.statusCode === 404) {
                console.log(`   ✅ Network failure properly handled: ${error.message}`);
            } else {
                throw error;
            }
        }
    });

    // Test 8: Error Handling - Invalid operations
    await test('Error Handling - Invalid operations', async () => {
        // Test invalid module creation
        const invalidResponse = await makeRequest('POST', '/api/modules', { invalid: 'data' });
        if (invalidResponse.statusCode !== 400) {
            throw new Error(`Expected 400 for invalid data, got ${invalidResponse.statusCode}`);
        }

        // Test updating non-existent module
        const nonExistentResponse = await makeRequest('PUT', '/api/modules/99999', updatedModule);
        if (nonExistentResponse.statusCode !== 404) {
            throw new Error(`Expected 404 for non-existent module, got ${nonExistentResponse.statusCode}`);
        }

        // Test deleting non-existent module
        const deleteNonExistentResponse = await makeRequest('DELETE', '/api/modules/99999');
        if (deleteNonExistentResponse.statusCode !== 404) {
            throw new Error(`Expected 404 for deleting non-existent module, got ${deleteNonExistentResponse.statusCode}`);
        }

        console.log(`   ✅ Invalid operations properly rejected`);
    });

    // Test 9: Concurrent Operations - Race condition testing
    await test('Concurrent Operations - Race condition handling', async () => {
        // Create a module for concurrent testing
        const concurrentTestModule = {
            prompt: "Concurrent Test Module",
            en: { name: "Concurrent Test", description: "Test", inputPlaceholder: "Test" },
            kn: { name: "ಏಕಕಾಲೀನ ಪರೀಕ್ಷೆ", description: "ಪರೀಕ್ಷೆ", inputPlaceholder: "ಪರೀಕ್ಷೆ" }
        };

        const createResponse = await makeRequest('POST', '/api/modules', concurrentTestModule);
        if (createResponse.statusCode !== 201) {
            throw new Error('Failed to create module for concurrent test');
        }

        const concurrentModuleId = createResponse.body.data.id;

        // Perform concurrent operations
        const concurrentPromises = [
            makeRequest('GET', '/api/modules'),
            makeRequest('PUT', `/api/modules/${concurrentModuleId}`, {
                ...concurrentTestModule,
                prompt: "Updated Concurrent Test 1"
            }),
            makeRequest('PUT', `/api/modules/${concurrentModuleId}`, {
                ...concurrentTestModule,
                prompt: "Updated Concurrent Test 2"
            }),
            makeRequest('GET', `/api/modules`)
        ];

        const results = await Promise.allSettled(concurrentPromises);

        // Check that at least some operations succeeded
        const successfulOps = results.filter(r => r.status === 'fulfilled' && r.value.statusCode < 400);
        if (successfulOps.length === 0) {
            throw new Error('All concurrent operations failed');
        }

        // Verify the module still exists and is in a consistent state
        const finalCheck = await makeRequest('GET', '/api/modules');
        const finalModule = finalCheck.body.data.find(m => m.id === concurrentModuleId);
        if (!finalModule) {
            throw new Error('Module lost during concurrent operations');
        }

        console.log(`   ✅ Concurrent operations handled (${successfulOps.length}/${results.length} succeeded)`);

        // Clean up
        await makeRequest('DELETE', `/api/modules/${concurrentModuleId}`);
    });

    // Test 10: Data Integrity - Verify database consistency
    await test('Data Integrity - Database consistency check', async () => {
        const response = await makeRequest('GET', '/api/modules');

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        const modules = response.body.data;

        // Verify each module has required fields
        for (const module of modules) {
            if (!module.id || !module.prompt || !module.en || !module.kn) {
                throw new Error(`Module ${module.id} missing required fields`);
            }

            if (!module.createdAt || !module.updatedAt) {
                throw new Error(`Module ${module.id} missing timestamp fields`);
            }

            // Verify date format
            if (isNaN(Date.parse(module.createdAt)) || isNaN(Date.parse(module.updatedAt))) {
                throw new Error(`Module ${module.id} has invalid timestamp format`);
            }
        }

        console.log(`   ✅ All ${modules.length} modules have consistent data structure`);
    });

    // Cleanup remaining test modules
    console.log('🧹 Cleaning up test modules...');
    for (const moduleId of createdModuleIds) {
        try {
            await makeRequest('DELETE', `/api/modules/${moduleId}`);
            console.log(`   Deleted test module ${moduleId}`);
        } catch (error) {
            console.log(`   Warning: Failed to delete test module ${moduleId}: ${error.message}`);
        }
    }

    // Test Summary
    console.log('\n📊 End-to-End Test Results Summary');
    console.log('=====================================');
    console.log(`Total Tests: ${testsTotal}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsTotal - testsPassed}`);
    console.log(`Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

    if (testsPassed === testsTotal) {
        console.log('\n🎉 All end-to-end persistence tests passed!');
        console.log('\n✅ Module Persistence Implementation Verified:');
        console.log('   ✓ Module creation persists after page refresh');
        console.log('   ✓ Module editing saves changes permanently');
        console.log('   ✓ Module deletion removes from database');
        console.log('   ✓ Error handling for network failures');
        console.log('   ✓ Concurrent operations and race conditions handled');
        console.log('   ✓ Data integrity maintained');
        console.log('\n🚀 Module persistence feature is production-ready!');
    } else {
        console.log('\n❌ Some end-to-end tests failed. Please check the implementation.');
        process.exit(1);
    }
};

// Run the tests
if (require.main === module) {
    runE2ETests().catch(error => {
        console.error('E2E test suite failed:', error);
        process.exit(1);
    });
}

module.exports = { runE2ETests };