/**
 * Database seeding script for initial modules
 * Migrates defaultModules data to database format with proper transformation
 */

const { createModule, getAllModules } = require('./moduleRepository');

// Default modules data migrated from frontend storage.ts
const defaultModules = [
    {
        prompt: 'Please summarize the following text into clear, concise bullet points highlighting the main ideas and key information:',
        en: {
            name: 'Text Summarizer',
            description: 'Summarize long text content into key points',
            inputPlaceholder: 'Enter the text you want to summarize...',
        },
        kn: {
            name: 'ಪಠ್ಯ ಸಾರಾಂಶ',
            description: 'ದೀರ್ಘ ಪಠ್ಯ ವಿಷಯವನ್ನು ಪ್ರಮುಖ ಅಂಶಗಳಾಗಿ ಸಾರಾಂಶಗೊಳಿಸಿ',
            inputPlaceholder: 'ನೀವು ಸಾರಾಂಶ ಮಾಡಲು ಬಯಸುವ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ...',
        }
    },
    {
        prompt: 'Write a professional email based on the following requirements. Make it clear, polite, and well-structured:',
        en: {
            name: 'Email Writer',
            description: 'Generate professional emails from brief descriptions',
            inputPlaceholder: 'Describe the email you need (purpose, recipient, tone, key points)...',
        },
        kn: {
            name: 'ಇಮೇಲ್ ರಚನೆಕಾರ',
            description: 'ಸಂಕ್ಷಿಪ್ತ ವಿವರಣೆಗಳಿಂದ ವೃತ್ತಿಪರ ಇಮೇಲ್‌ಗಳನ್ನು ರಚಿಸಿ',
            inputPlaceholder: 'ನಿಮಗೆ ಬೇಕಾದ ಇಮೇಲ್ ಅನ್ನು ವಿವರಿಸಿ (ಉದ್ದೇಶ, ಸ್ವೀಕರಿಸುವವರು, ಧ್ವನಿ, ಪ್ರಮುಖ ಅಂಶಗಳು)...',
        }
    },
    {
        prompt: 'Analyze the following image and write a detailed description about it:',
        en: {
            name: 'Image Analysis',
            description: 'Analyze an image and generate a description',
            inputPlaceholder: 'Upload an image for analysis...',
        },
        kn: {
            name: 'ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆ',
            description: 'ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ ಮತ್ತು ವಿವರಣೆಯನ್ನು ರಚಿಸಿ',
            inputPlaceholder: 'ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ...',
        }
    }
];

/**
 * Check if the database is empty (no modules exist)
 * @returns {Promise<boolean>} True if database is empty, false otherwise
 */
const isDatabaseEmpty = async () => {
    try {
        const modules = await getAllModules();
        return modules.length === 0;
    } catch (error) {
        console.error('Error checking if database is empty:', error.message);
        throw new Error('Failed to check database state');
    }
};

/**
 * Seed the database with default modules
 * Only seeds if the database is empty to avoid duplicates
 * @returns {Promise<Array>} Array of created modules
 */
const seedDatabase = async () => {
    try {
        console.log('Checking if database needs seeding...');

        const isEmpty = await isDatabaseEmpty();

        if (!isEmpty) {
            console.log('Database already contains modules, skipping seeding');
            return [];
        }

        console.log('Database is empty, seeding with default modules...');

        const createdModules = [];

        // Create each default module in sequence to avoid race conditions
        for (let i = 0; i < defaultModules.length; i++) {
            const moduleData = defaultModules[i];

            try {
                console.log(`Creating module: ${moduleData.en.name}`);
                const createdModule = await createModule(moduleData);
                createdModules.push(createdModule);
                console.log(`✓ Created module with ID: ${createdModule.id}`);
            } catch (error) {
                console.error(`Failed to create module "${moduleData.en.name}":`, error.message);
                throw error; // Stop seeding if any module fails
            }
        }

        console.log(`✓ Successfully seeded database with ${createdModules.length} modules`);
        return createdModules;

    } catch (error) {
        console.error('Error seeding database:', error.message);
        throw new Error('Database seeding failed');
    }
};

/**
 * Force seed the database (for testing purposes)
 * This will create the default modules regardless of existing data
 * @returns {Promise<Array>} Array of created modules
 */
const forceSeedDatabase = async () => {
    try {
        console.log('Force seeding database with default modules...');

        const createdModules = [];

        // Create each default module in sequence
        for (let i = 0; i < defaultModules.length; i++) {
            const moduleData = defaultModules[i];

            try {
                console.log(`Creating module: ${moduleData.en.name}`);
                const createdModule = await createModule(moduleData);
                createdModules.push(createdModule);
                console.log(`✓ Created module with ID: ${createdModule.id}`);
            } catch (error) {
                console.error(`Failed to create module "${moduleData.en.name}":`, error.message);
                throw error;
            }
        }

        console.log(`✓ Successfully force seeded database with ${createdModules.length} modules`);
        return createdModules;

    } catch (error) {
        console.error('Error force seeding database:', error.message);
        throw new Error('Database force seeding failed');
    }
};

module.exports = {
    seedDatabase,
    forceSeedDatabase,
    isDatabaseEmpty,
    defaultModules
};