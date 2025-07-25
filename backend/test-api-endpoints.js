/**
 * API Endpoints Test Suite
 * Tests all module API endpoints for proper functionality and error handling
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
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

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
};

// Test data
const testModule = {
    prompt: "Test automation prompt",
    en: {
        name: "Test Module",
        description: "A test module for automation",
        inputPlaceholder: "Enter test input"
    },
    kn: {
        name: "ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        description: "ಯಾಂತ್ರೀಕರಣಕ್ಕಾಗಿ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        inputPlaceholder: "ಪರೀಕ್ಷಾ ಇನ್‌ಪುಟ್ ನಮೂದಿಸಿ"
    }
};

const updatedModule = {
    prompt: "Updated automation prompt",
    en: {
        name: "Updated Test Module",
        description: "An updated test module for automation",
        inputPlaceholder: "Enter updated test input"
    },
    kn: {
        name: "ನವೀಕರಿಸಿದ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        description: "ಯಾಂತ್ರೀಕರಣಕ್ಕಾಗಿ ನವೀಕರಿಸಿದ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        inputPlaceholder: "ನವೀಕರಿಸಿದ ಪರೀಕ್ಷಾ ಇನ್‌ಪುಟ್ ನಮೂದಿಸಿ"
    }
};

// Test runner
const runTests = async () => {
    console.log('🚀 Starting API Endpoints Test Suite\n');

    let createdModuleId = null;
    let testsPassed = 0;
    let testsTotal = 0;

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

    // Test 1: GET /api/modules - Fetch all modules (empty initially)
    await test('GET /api/modules - Fetch all modules', async () => {
        const response = await makeRequest('GET', '/api/modules');

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        if (!response.body.success) {
            throw new Error('Expected success: true');
        }

        if (!Array.isArray(response.body.data)) {
            throw new Error('Expected data to be an array');
        }

        console.log(`   Found ${response.body.data.length} existing modules`);
    });

    // Test 2: POST /api/modules - Create a new module
    await test('POST /api/modules - Create a new module', async () => {
        const response = await makeRequest('POST', '/api/modules', testModule);

        if (response.statusCode !== 201) {
            throw new Error(`Expected status 201, got ${response.statusCode}`);
        }

        if (!response.body.success) {
            throw new Error('Expected success: true');
        }

        if (!response.body.data || !response.body.data.id) {
            throw new Error('Expected created module with ID');
        }

        createdModuleId = response.body.data.id;
        console.log(`   Created module with ID: ${createdModuleId}`);

        // Verify module structure
        const module = response.body.data;
        if (module.prompt !== testModule.prompt) {
            throw new Error('Prompt mismatch');
        }
        if (module.en.name !== testModule.en.name) {
            throw new Error('English name mismatch');
        }
        if (module.kn.name !== testModule.kn.name) {
            throw new Error('Kannada name mismatch');
        }
    });

    // Test 3: POST /api/modules - Invalid data (missing required fields)
    await test('POST /api/modules - Invalid data validation', async () => {
        const invalidModule = { prompt: "Test" }; // Missing en and kn
        const response = await makeRequest('POST', '/api/modules', invalidModule);

        if (response.statusCode !== 400) {
            throw new Error(`Expected status 400, got ${response.statusCode}`);
        }

        if (response.body.success !== false) {
            throw new Error('Expected success: false');
        }

        console.log(`   Correctly rejected invalid data: ${response.body.error}`);
    });

    // Test 4: GET /api/modules - Fetch all modules (should include created module)
    await test('GET /api/modules - Fetch modules after creation', async () => {
        const response = await makeRequest('GET', '/api/modules');

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        if (!response.body.success) {
            throw new Error('Expected success: true');
        }

        const modules = response.body.data;
        const createdModule = modules.find(m => m.id === createdModuleId);

        if (!createdModule) {
            throw new Error('Created module not found in list');
        }

        console.log(`   Found created module in list of ${modules.length} modules`);
    });

    // Test 5: PUT /api/modules/:id - Update existing module
    await test('PUT /api/modules/:id - Update existing module', async () => {
        if (!createdModuleId) {
            throw new Error('No module ID available for update test');
        }

        const response = await makeRequest('PUT', `/api/modules/${createdModuleId}`, updatedModule);

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        if (!response.body.success) {
            throw new Error('Expected success: true');
        }

        const module = response.body.data;
        if (module.prompt !== updatedModule.prompt) {
            throw new Error('Updated prompt mismatch');
        }
        if (module.en.name !== updatedModule.en.name) {
            throw new Error('Updated English name mismatch');
        }

        console.log(`   Successfully updated module ${createdModuleId}`);
    });

    // Test 6: PUT /api/modules/:id - Update non-existent module
    await test('PUT /api/modules/:id - Update non-existent module', async () => {
        const nonExistentId = 99999;
        const response = await makeRequest('PUT', `/api/modules/${nonExistentId}`, updatedModule);

        if (response.statusCode !== 404) {
            throw new Error(`Expected status 404, got ${response.statusCode}`);
        }

        if (response.body.success !== false) {
            throw new Error('Expected success: false');
        }

        console.log(`   Correctly returned 404 for non-existent module`);
    });

    // Test 7: PUT /api/modules/:id - Invalid ID format
    await test('PUT /api/modules/:id - Invalid ID format', async () => {
        const response = await makeRequest('PUT', '/api/modules/invalid', updatedModule);

        if (response.statusCode !== 400) {
            throw new Error(`Expected status 400, got ${response.statusCode}`);
        }

        if (response.body.success !== false) {
            throw new Error('Expected success: false');
        }

        console.log(`   Correctly rejected invalid ID format`);
    });

    // Test 8: DELETE /api/modules/:id - Delete non-existent module
    await test('DELETE /api/modules/:id - Delete non-existent module', async () => {
        const nonExistentId = 99999;
        const response = await makeRequest('DELETE', `/api/modules/${nonExistentId}`);

        if (response.statusCode !== 404) {
            throw new Error(`Expected status 404, got ${response.statusCode}`);
        }

        if (response.body.success !== false) {
            throw new Error('Expected success: false');
        }

        console.log(`   Correctly returned 404 for non-existent module`);
    });

    // Test 9: DELETE /api/modules/:id - Invalid ID format
    await test('DELETE /api/modules/:id - Invalid ID format', async () => {
        const response = await makeRequest('DELETE', '/api/modules/invalid');

        if (response.statusCode !== 400) {
            throw new Error(`Expected status 400, got ${response.statusCode}`);
        }

        if (response.body.success !== false) {
            throw new Error('Expected success: false');
        }

        console.log(`   Correctly rejected invalid ID format`);
    });

    // Test 10: DELETE /api/modules/:id - Delete existing module
    await test('DELETE /api/modules/:id - Delete existing module', async () => {
        if (!createdModuleId) {
            throw new Error('No module ID available for delete test');
        }

        const response = await makeRequest('DELETE', `/api/modules/${createdModuleId}`);

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        if (!response.body.success) {
            throw new Error('Expected success: true');
        }

        console.log(`   Successfully deleted module ${createdModuleId}`);
    });

    // Test 11: GET /api/modules - Verify module was deleted
    await test('GET /api/modules - Verify module deletion', async () => {
        const response = await makeRequest('GET', '/api/modules');

        if (response.statusCode !== 200) {
            throw new Error(`Expected status 200, got ${response.statusCode}`);
        }

        const modules = response.body.data;
        const deletedModule = modules.find(m => m.id === createdModuleId);

        if (deletedModule) {
            throw new Error('Deleted module still found in list');
        }

        console.log(`   Confirmed module ${createdModuleId} was deleted`);
    });

    // Test Summary
    console.log('📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${testsTotal}`);
    console.log(`Passed: ${testsPassed}`);
    console.log(`Failed: ${testsTotal - testsPassed}`);
    console.log(`Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

    if (testsPassed === testsTotal) {
        console.log('\n🎉 All API endpoint tests passed!');
        console.log('\n✅ API Endpoints Implementation Complete:');
        console.log('   - GET /api/modules - Fetch all modules');
        console.log('   - POST /api/modules - Create new module');
        console.log('   - PUT /api/modules/:id - Update existing module');
        console.log('   - DELETE /api/modules/:id - Delete module');
        console.log('   - Proper HTTP status codes (200, 201, 400, 404, 500)');
        console.log('   - Comprehensive error handling');
        console.log('   - Request validation');
    } else {
        console.log('\n❌ Some tests failed. Please check the implementation.');
        process.exit(1);
    }
};

// Run the tests
runTests().catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
});