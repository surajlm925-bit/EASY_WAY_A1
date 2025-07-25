const express = require('express');
const cors = require('cors');
const { initializeDatabaseWithSeeding } = require('./database/db');
const {
    getAllModules,
    createModule,
    updateModule,
    deleteModule,
    getModuleById
} = require('./database/moduleRepository');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes for modules

// GET /api/modules - Fetch all modules
app.get('/api/modules', async (req, res) => {
    try {
        const modules = await getAllModules();
        res.status(200).json({
            success: true,
            data: modules
        });
    } catch (error) {
        console.error('Error fetching modules:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch modules'
        });
    }
});

// POST /api/modules - Create a new module
app.post('/api/modules', async (req, res) => {
    try {
        const moduleData = req.body;

        // Basic request validation
        if (!moduleData) {
            return res.status(400).json({
                success: false,
                error: 'Module data is required'
            });
        }

        const createdModule = await createModule(moduleData);
        res.status(201).json({
            success: true,
            data: createdModule
        });
    } catch (error) {
        console.error('Error creating module:', error.message);

        // Handle validation errors with 400 status
        if (error.message.includes('required') || error.message.includes('is required')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        // Handle other errors with 500 status
        res.status(500).json({
            success: false,
            error: 'Failed to create module'
        });
    }
});

// PUT /api/modules/:id - Update an existing module
app.put('/api/modules/:id', async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);
        const moduleData = req.body;

        // Validate ID parameter
        if (isNaN(moduleId) || moduleId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid module ID is required'
            });
        }

        // Basic request validation
        if (!moduleData) {
            return res.status(400).json({
                success: false,
                error: 'Module data is required'
            });
        }

        const updatedModule = await updateModule(moduleId, moduleData);
        res.status(200).json({
            success: true,
            data: updatedModule
        });
    } catch (error) {
        console.error('Error updating module:', error.message);

        // Handle not found errors with 404 status
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        // Handle validation errors with 400 status
        if (error.message.includes('required') || error.message.includes('is required')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        // Handle other errors with 500 status
        res.status(500).json({
            success: false,
            error: 'Failed to update module'
        });
    }
});

// DELETE /api/modules/:id - Delete a module
app.delete('/api/modules/:id', async (req, res) => {
    try {
        const moduleId = parseInt(req.params.id);

        // Validate ID parameter
        if (isNaN(moduleId) || moduleId <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Valid module ID is required'
            });
        }

        await deleteModule(moduleId);
        res.status(200).json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting module:', error.message);

        // Handle not found errors with 404 status
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }

        // Handle validation errors with 400 status
        if (error.message.includes('required') || error.message.includes('is required')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }

        // Handle other errors with 500 status
        res.status(500).json({
            success: false,
            error: 'Failed to delete module'
        });
    }
});

// Initialize database and start server
const startServer = async () => {
    try {
        // Initialize database tables and seed with default data
        await initializeDatabaseWithSeeding();
        console.log('Database initialized and seeded successfully');

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down server...');
    process.exit(0);
});

// Start the server
startServer();