// Simple test script to verify moduleRepository functionality
const { initializeDatabase } = require('./database/db');
const {
    getAllModules,
    createModule,
    updateModule,
    deleteModule,
    getModuleById
} = require('./database/moduleRepository');

async function testRepository() {
    try {
        console.log('Initializing database...');
        await initializeDatabase();

        console.log('Testing getAllModules...');
        const initialModules = await getAllModules();
        console.log(`Found ${initialModules.length} existing modules`);

        console.log('Testing createModule...');
        const testModule = {
            prompt: "Test prompt for automation",
            en: {
                name: "Test Module",
                description: "A test module for validation",
                inputPlaceholder: "Enter test input"
            },
            kn: {
                name: "ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
                description: "ಮೌಲ್ಯೀಕರಣಕ್ಕಾಗಿ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
                inputPlaceholder: "ಪರೀಕ್ಷಾ ಇನ್‌ಪುಟ್ ನಮೂದಿಸಿ"
            }
        };

        const createdModule = await createModule(testModule);
        console.log('Created module:', createdModule.id);

        console.log('Testing getModuleById...');
        const fetchedModule = await getModuleById(createdModule.id);
        console.log('Fetched module name:', fetchedModule.en.name);

        console.log('Testing updateModule...');
        const updatedData = {
            ...testModule,
            en: { ...testModule.en, name: "Updated Test Module" }
        };
        const updatedModule = await updateModule(createdModule.id, updatedData);
        console.log('Updated module name:', updatedModule.en.name);

        console.log('Testing deleteModule...');
        const deleteResult = await deleteModule(createdModule.id);
        console.log('Delete successful:', deleteResult);

        console.log('Verifying deletion...');
        const deletedModule = await getModuleById(createdModule.id);
        console.log('Module after deletion:', deletedModule === null ? 'null (correct)' : 'still exists (error)');

        console.log('All tests completed successfully!');

    } catch (error) {
        console.error('Test failed:', error.message);
    }

    // Exit the process
    process.exit(0);
}

testRepository();