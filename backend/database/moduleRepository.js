const { db } = require('./db');

/**
 * Module Repository - Data access layer for module operations
 * Provides CRUD operations with proper error handling and validation
 */

/**
 * Get all modules from the database
 * @returns {Promise<Array>} Array of modules with transformed structure
 */
const getAllModules = () => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                id,
                prompt,
                en_name,
                en_description,
                en_input_placeholder,
                kn_name,
                kn_description,
                kn_input_placeholder,
                created_at,
                updated_at
            FROM modules 
            ORDER BY created_at DESC
        `;

        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching modules:', err.message);
                reject(new Error('Failed to fetch modules from database'));
                return;
            }

            // Transform database rows to match frontend expected format
            const modules = rows.map(row => ({
                id: row.id,
                prompt: row.prompt,
                en: {
                    name: row.en_name,
                    description: row.en_description,
                    inputPlaceholder: row.en_input_placeholder
                },
                kn: {
                    name: row.kn_name,
                    description: row.kn_description,
                    inputPlaceholder: row.kn_input_placeholder
                },
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));

            resolve(modules);
        });
    });
};

/**
 * Create a new module in the database
 * @param {Object} moduleData - Module data to create
 * @param {string} moduleData.prompt - Module prompt
 * @param {Object} moduleData.en - English content
 * @param {Object} moduleData.kn - Kannada content
 * @returns {Promise<Object>} Created module with ID
 */
const createModule = (moduleData) => {
    return new Promise((resolve, reject) => {
        // Validate required fields
        if (!moduleData || typeof moduleData !== 'object') {
            reject(new Error('Module data is required'));
            return;
        }

        if (!moduleData.prompt || typeof moduleData.prompt !== 'string' || moduleData.prompt.trim() === '') {
            reject(new Error('Module prompt is required'));
            return;
        }

        if (!moduleData.en || !moduleData.en.name || typeof moduleData.en.name !== 'string' || moduleData.en.name.trim() === '') {
            reject(new Error('English name is required'));
            return;
        }

        if (!moduleData.kn || !moduleData.kn.name || typeof moduleData.kn.name !== 'string' || moduleData.kn.name.trim() === '') {
            reject(new Error('Kannada name is required'));
            return;
        }

        const query = `
            INSERT INTO modules (
                prompt,
                en_name,
                en_description,
                en_input_placeholder,
                kn_name,
                kn_description,
                kn_input_placeholder
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            moduleData.prompt.trim(),
            moduleData.en.name.trim(),
            moduleData.en.description || null,
            moduleData.en.inputPlaceholder || null,
            moduleData.kn.name.trim(),
            moduleData.kn.description || null,
            moduleData.kn.inputPlaceholder || null
        ];

        db.run(query, params, function (err) {
            if (err) {
                console.error('Error creating module:', err.message);
                reject(new Error('Failed to create module in database'));
                return;
            }

            // Fetch the created module to return complete data
            const selectQuery = `
                SELECT 
                    id,
                    prompt,
                    en_name,
                    en_description,
                    en_input_placeholder,
                    kn_name,
                    kn_description,
                    kn_input_placeholder,
                    created_at,
                    updated_at
                FROM modules 
                WHERE id = ?
            `;

            db.get(selectQuery, [this.lastID], (err, row) => {
                if (err) {
                    console.error('Error fetching created module:', err.message);
                    reject(new Error('Module created but failed to retrieve'));
                    return;
                }

                // Transform to match frontend format
                const createdModule = {
                    id: row.id,
                    prompt: row.prompt,
                    en: {
                        name: row.en_name,
                        description: row.en_description,
                        inputPlaceholder: row.en_input_placeholder
                    },
                    kn: {
                        name: row.kn_name,
                        description: row.kn_description,
                        inputPlaceholder: row.kn_input_placeholder
                    },
                    createdAt: row.created_at,
                    updatedAt: row.updated_at
                };

                resolve(createdModule);
            });
        });
    });
};/*
*
 * Update an existing module in the database
 * @param {number} id - Module ID to update
 * @param {Object} moduleData - Updated module data
 * @returns {Promise<Object>} Updated module
 */
const updateModule = (id, moduleData) => {
    return new Promise((resolve, reject) => {
        // Validate ID
        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            reject(new Error('Valid module ID is required'));
            return;
        }

        // Validate module data
        if (!moduleData || typeof moduleData !== 'object') {
            reject(new Error('Module data is required'));
            return;
        }

        if (!moduleData.prompt || typeof moduleData.prompt !== 'string' || moduleData.prompt.trim() === '') {
            reject(new Error('Module prompt is required'));
            return;
        }

        if (!moduleData.en || !moduleData.en.name || typeof moduleData.en.name !== 'string' || moduleData.en.name.trim() === '') {
            reject(new Error('English name is required'));
            return;
        }

        if (!moduleData.kn || !moduleData.kn.name || typeof moduleData.kn.name !== 'string' || moduleData.kn.name.trim() === '') {
            reject(new Error('Kannada name is required'));
            return;
        }

        // First check if module exists
        const checkQuery = 'SELECT id FROM modules WHERE id = ?';

        db.get(checkQuery, [id], (err, row) => {
            if (err) {
                console.error('Error checking module existence:', err.message);
                reject(new Error('Failed to verify module existence'));
                return;
            }

            if (!row) {
                reject(new Error(`Module with ID ${id} not found`));
                return;
            }

            // Update the module with current timestamp
            const updateQuery = `
                UPDATE modules SET
                    prompt = ?,
                    en_name = ?,
                    en_description = ?,
                    en_input_placeholder = ?,
                    kn_name = ?,
                    kn_description = ?,
                    kn_input_placeholder = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            const params = [
                moduleData.prompt.trim(),
                moduleData.en.name.trim(),
                moduleData.en.description || null,
                moduleData.en.inputPlaceholder || null,
                moduleData.kn.name.trim(),
                moduleData.kn.description || null,
                moduleData.kn.inputPlaceholder || null,
                id
            ];

            db.run(updateQuery, params, function (err) {
                if (err) {
                    console.error('Error updating module:', err.message);
                    reject(new Error('Failed to update module in database'));
                    return;
                }

                // Fetch the updated module to return complete data
                const selectQuery = `
                    SELECT 
                        id,
                        prompt,
                        en_name,
                        en_description,
                        en_input_placeholder,
                        kn_name,
                        kn_description,
                        kn_input_placeholder,
                        created_at,
                        updated_at
                    FROM modules 
                    WHERE id = ?
                `;

                db.get(selectQuery, [id], (err, row) => {
                    if (err) {
                        console.error('Error fetching updated module:', err.message);
                        reject(new Error('Module updated but failed to retrieve'));
                        return;
                    }

                    // Transform to match frontend format
                    const updatedModule = {
                        id: row.id,
                        prompt: row.prompt,
                        en: {
                            name: row.en_name,
                            description: row.en_description,
                            inputPlaceholder: row.en_input_placeholder
                        },
                        kn: {
                            name: row.kn_name,
                            description: row.kn_description,
                            inputPlaceholder: row.kn_input_placeholder
                        },
                        createdAt: row.created_at,
                        updatedAt: row.updated_at
                    };

                    resolve(updatedModule);
                });
            });
        });
    });
};

/**
 * Delete a module from the database
 * @param {number} id - Module ID to delete
 * @returns {Promise<boolean>} True if deleted successfully
 */
const deleteModule = (id) => {
    return new Promise((resolve, reject) => {
        // Validate ID
        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            reject(new Error('Valid module ID is required'));
            return;
        }

        // First check if module exists
        const checkQuery = 'SELECT id FROM modules WHERE id = ?';

        db.get(checkQuery, [id], (err, row) => {
            if (err) {
                console.error('Error checking module existence:', err.message);
                reject(new Error('Failed to verify module existence'));
                return;
            }

            if (!row) {
                reject(new Error(`Module with ID ${id} not found`));
                return;
            }

            // Delete the module
            const deleteQuery = 'DELETE FROM modules WHERE id = ?';

            db.run(deleteQuery, [id], function (err) {
                if (err) {
                    console.error('Error deleting module:', err.message);
                    reject(new Error('Failed to delete module from database'));
                    return;
                }

                // Verify deletion was successful
                if (this.changes === 0) {
                    reject(new Error('Module deletion failed - no rows affected'));
                    return;
                }

                resolve(true);
            });
        });
    });
};

/**
 * Get a single module by ID
 * @param {number} id - Module ID to retrieve
 * @returns {Promise<Object|null>} Module object or null if not found
 */
const getModuleById = (id) => {
    return new Promise((resolve, reject) => {
        // Validate ID
        if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
            reject(new Error('Valid module ID is required'));
            return;
        }

        const query = `
            SELECT 
                id,
                prompt,
                en_name,
                en_description,
                en_input_placeholder,
                kn_name,
                kn_description,
                kn_input_placeholder,
                created_at,
                updated_at
            FROM modules 
            WHERE id = ?
        `;

        db.get(query, [id], (err, row) => {
            if (err) {
                console.error('Error fetching module by ID:', err.message);
                reject(new Error('Failed to fetch module from database'));
                return;
            }

            if (!row) {
                resolve(null);
                return;
            }

            // Transform to match frontend format
            const module = {
                id: row.id,
                prompt: row.prompt,
                en: {
                    name: row.en_name,
                    description: row.en_description,
                    inputPlaceholder: row.en_input_placeholder
                },
                kn: {
                    name: row.kn_name,
                    description: row.kn_description,
                    inputPlaceholder: row.kn_input_placeholder
                },
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };

            resolve(module);
        });
    });
};

module.exports = {
    getAllModules,
    createModule,
    updateModule,
    deleteModule,
    getModuleById
};