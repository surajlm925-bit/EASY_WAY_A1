/**
 * Frontend Module API Test Suite
 * Tests the frontend API service layer for proper error handling,
 * loading states, and data transformation
 */

import {
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    ApiError,
    isApiError,
    getErrorMessage,
    CreateModuleRequest,
    UpdateModuleRequest
} from '../services/moduleApi';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Test data
const mockModule = {
    id: 1,
    prompt: "Test prompt",
    en: {
        name: "Test Module",
        description: "Test description",
        inputPlaceholder: "Test placeholder"
    },
    kn: {
        name: "ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        description: "ಪರೀಕ್ಷಾ ವಿವರಣೆ",
        inputPlaceholder: "ಪರೀಕ್ಷಾ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್"
    },
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
};

const mockCreateRequest: CreateModuleRequest = {
    prompt: "New test prompt",
    en: {
        name: "New Test Module",
        description: "New test description",
        inputPlaceholder: "New test placeholder"
    },
    kn: {
        name: "ಹೊಸ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        description: "ಹೊಸ ಪರೀಕ್ಷಾ ವಿವರಣೆ",
        inputPlaceholder: "ಹೊಸ ಪರೀಕ್ಷಾ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್"
    }
};

const mockUpdateRequest: UpdateModuleRequest = {
    prompt: "Updated test prompt",
    en: {
        name: "Updated Test Module",
        description: "Updated test description",
        inputPlaceholder: "Updated test placeholder"
    },
    kn: {
        name: "ನವೀಕರಿಸಿದ ಪರೀಕ್ಷಾ ಮಾಡ್ಯೂಲ್",
        description: "ನವೀಕರಿಸಿದ ಪರೀಕ್ಷಾ ವಿವರಣೆ",
        inputPlaceholder: "ನವೀಕರಿಸಿದ ಪರೀಕ್ಷಾ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್"
    }
};

describe('Module API Service', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    describe('fetchModules', () => {
        it('should fetch modules successfully and transform dates', async () => {
            const mockResponse = {
                success: true,
                data: [mockModule]
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse
            });

            const result = await fetchModules();

            expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/modules', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            expect(result).toHaveLength(1);
            expect(result[0].id).toBe(1);
            expect(result[0].createdAt).toBeInstanceOf(Date);
            expect(result[0].updatedAt).toBeInstanceOf(Date);
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

            await expect(fetchModules()).rejects.toThrow(ApiError);
            await expect(fetchModules()).rejects.toThrow('Network error');
        });

        it('should handle API errors', async () => {
            const mockErrorResponse = {
                success: false,
                error: 'Internal server error'
            };

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                json: async () => mockErrorResponse
            });

            await expect(fetchModules()).rejects.toThrow(ApiError);
            await expect(fetchModules()).rejects.toThrow('Internal server error');
        });
    });

    describe('createModule', () => {
        it('should create module successfully', async () => {
            const mockResponse = {
                success: true,
                data: { ...mockModule, id: 2 }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => mockResponse
            });

            const result = await createModule(mockCreateRequest);

            expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/modules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mockCreateRequest)
            });

            expect(result.id).toBe(2);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it('should validate required fields', async () => {
            const invalidRequest = {
                prompt: '',
                en: { name: '', description: '', inputPlaceholder: '' },
                kn: { name: 'Valid', description: 'Valid', inputPlaceholder: 'Valid' }
            };

            await expect(createModule(invalidRequest)).rejects.toThrow(ApiError);
            await expect(createModule(invalidRequest)).rejects.toThrow('Prompt is required');
        });

        it('should handle validation errors from server', async () => {
            const mockErrorResponse = {
                success: false,
                error: 'English name is required'
            };

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400,
                json: async () => mockErrorResponse
            });

            await expect(createModule(mockCreateRequest)).rejects.toThrow(ApiError);
            await expect(createModule(mockCreateRequest)).rejects.toThrow('English name is required');
        });
    });

    describe('updateModule', () => {
        it('should update module successfully', async () => {
            const mockResponse = {
                success: true,
                data: { ...mockModule, ...mockUpdateRequest }
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse
            });

            const result = await updateModule(1, mockUpdateRequest);

            expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/modules/1', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(mockUpdateRequest)
            });

            expect(result.prompt).toBe(mockUpdateRequest.prompt);
            expect(result.createdAt).toBeInstanceOf(Date);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it('should validate module ID', async () => {
            await expect(updateModule(0, mockUpdateRequest)).rejects.toThrow(ApiError);
            await expect(updateModule(-1, mockUpdateRequest)).rejects.toThrow('Valid module ID is required');
        });

        it('should handle not found errors', async () => {
            const mockErrorResponse = {
                success: false,
                error: 'Module not found'
            };

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => mockErrorResponse
            });

            await expect(updateModule(999, mockUpdateRequest)).rejects.toThrow(ApiError);
            await expect(updateModule(999, mockUpdateRequest)).rejects.toThrow('Module not found');
        });
    });

    describe('deleteModule', () => {
        it('should delete module successfully', async () => {
            const mockResponse = {
                success: true,
                message: 'Module deleted successfully'
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => mockResponse
            });

            await expect(deleteModule(1)).resolves.toBeUndefined();

            expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/modules/1', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        });

        it('should validate module ID', async () => {
            await expect(deleteModule(0)).rejects.toThrow(ApiError);
            await expect(deleteModule(-1)).rejects.toThrow('Valid module ID is required');
        });

        it('should handle not found errors', async () => {
            const mockErrorResponse = {
                success: false,
                error: 'Module not found'
            };

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => mockErrorResponse
            });

            await expect(deleteModule(999)).rejects.toThrow(ApiError);
            await expect(deleteModule(999)).rejects.toThrow('Module not found');
        });
    });

    describe('Error handling utilities', () => {
        it('should identify API errors correctly', () => {
            const apiError = new ApiError('Test error', 400);
            const regularError = new Error('Regular error');

            expect(isApiError(apiError)).toBe(true);
            expect(isApiError(regularError)).toBe(false);
            expect(isApiError('string')).toBe(false);
            expect(isApiError(null)).toBe(false);
        });

        it('should extract error messages correctly', () => {
            const apiError = new ApiError('API error message', 400);
            const regularError = new Error('Regular error message');
            const stringError = 'String error';
            const unknownError = { unknown: 'error' };

            expect(getErrorMessage(apiError)).toBe('API error message');
            expect(getErrorMessage(regularError)).toBe('Regular error message');
            expect(getErrorMessage(stringError)).toBe('An unexpected error occurred');
            expect(getErrorMessage(unknownError)).toBe('An unexpected error occurred');
        });
    });

    describe('Concurrent operations', () => {
        it('should handle multiple simultaneous requests', async () => {
            // Mock multiple successful responses
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ success: true, data: [mockModule] })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 201,
                    json: async () => ({ success: true, data: { ...mockModule, id: 2 } })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ success: true, data: { ...mockModule, prompt: 'Updated' } })
                });

            // Execute concurrent operations
            const promises = [
                fetchModules(),
                createModule(mockCreateRequest),
                updateModule(1, mockUpdateRequest)
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);
            expect(results[0]).toHaveLength(1); // fetchModules result
            expect(results[1].id).toBe(2); // createModule result
            expect(results[2].prompt).toBe('Updated'); // updateModule result
        });

        it('should handle mixed success/failure in concurrent operations', async () => {
            mockFetch
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ success: true, data: [mockModule] })
                })
                .mockResolvedValueOnce({
                    ok: false,
                    status: 400,
                    json: async () => ({ success: false, error: 'Validation failed' })
                });

            const promises = [
                fetchModules(),
                createModule(mockCreateRequest)
            ];

            const results = await Promise.allSettled(promises);

            expect(results[0].status).toBe('fulfilled');
            expect(results[1].status).toBe('rejected');
            expect((results[1] as PromiseRejectedResult).reason).toBeInstanceOf(ApiError);
        });
    });
});