import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    ApiError,
    isApiError,
    getErrorMessage,
} from '../moduleApi';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('moduleApi', () => {
    beforeEach(() => {
        mockFetch.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('fetchModules', () => {
        it('should fetch modules successfully', async () => {
            const mockModules = [
                {
                    id: 1,
                    prompt: 'Test prompt',
                    en: { name: 'Test', description: 'Test desc', inputPlaceholder: 'Enter text' },
                    kn: { name: 'ಟೆಸ್ಟ್', description: 'ಟೆಸ್ಟ್ ವಿವರಣೆ', inputPlaceholder: 'ಪಠ್ಯ ನಮೂದಿಸಿ' },
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z',
                },
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockModules }),
            });

            const result = await fetchModules();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/modules',
                expect.objectContaining({
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
            );

            expect(result).toHaveLength(1);
            expect(result[0].createdAt).toBeInstanceOf(Date);
            expect(result[0].updatedAt).toBeInstanceOf(Date);
        });

        it('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'));

            await expect(fetchModules()).rejects.toThrow(ApiError);
            await expect(fetchModules()).rejects.toThrow('Network error');
        });
    });

    describe('createModule', () => {
        const validModuleData = {
            prompt: 'Test prompt',
            en: { name: 'Test', description: 'Test desc', inputPlaceholder: 'Enter text' },
            kn: { name: 'ಟೆಸ್ಟ್', description: 'ಟೆಸ್ಟ್ ವಿವರಣೆ', inputPlaceholder: 'ಪಠ್ಯ ನಮೂದಿಸಿ' },
        };

        it('should create module successfully', async () => {
            const mockCreatedModule = {
                id: 1,
                ...validModuleData,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockCreatedModule }),
            });

            const result = await createModule(validModuleData);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/modules',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(validModuleData),
                })
            );

            expect(result.id).toBe(1);
            expect(result.createdAt).toBeInstanceOf(Date);
        });

        it('should validate required fields', async () => {
            await expect(
                createModule({ ...validModuleData, prompt: '' })
            ).rejects.toThrow('Prompt is required');

            await expect(
                createModule({ ...validModuleData, en: { ...validModuleData.en, name: '' } })
            ).rejects.toThrow('English name is required');

            await expect(
                createModule({ ...validModuleData, kn: { ...validModuleData.kn, name: '' } })
            ).rejects.toThrow('Kannada name is required');
        });
    });

    describe('updateModule', () => {
        const validUpdateData = {
            prompt: 'Updated prompt',
            en: { name: 'Updated', description: 'Updated desc', inputPlaceholder: 'Enter text' },
            kn: { name: 'ಅಪ್ಡೇಟ್', description: 'ಅಪ್ಡೇಟ್ ವಿವರಣೆ', inputPlaceholder: 'ಪಠ್ಯ ನಮೂದಿಸಿ' },
        };

        it('should update module successfully', async () => {
            const mockUpdatedModule = {
                id: 1,
                ...validUpdateData,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T01:00:00.000Z',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, data: mockUpdatedModule }),
            });

            const result = await updateModule(1, validUpdateData);

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/modules/1',
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(validUpdateData),
                })
            );

            expect(result.id).toBe(1);
            expect(result.updatedAt).toBeInstanceOf(Date);
        });

        it('should validate module ID', async () => {
            await expect(
                updateModule(0, validUpdateData)
            ).rejects.toThrow('Valid module ID is required');

            await expect(
                updateModule(-1, validUpdateData)
            ).rejects.toThrow('Valid module ID is required');
        });
    });

    describe('deleteModule', () => {
        it('should delete module successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ success: true, message: 'Module deleted successfully' }),
            });

            await expect(deleteModule(1)).resolves.toBeUndefined();

            expect(mockFetch).toHaveBeenCalledWith(
                'http://localhost:3001/api/modules/1',
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });

        it('should validate module ID', async () => {
            await expect(deleteModule(0)).rejects.toThrow('Valid module ID is required');
            await expect(deleteModule(-1)).rejects.toThrow('Valid module ID is required');
        });
    });

    describe('error handling utilities', () => {
        it('should identify API errors correctly', () => {
            const apiError = new ApiError('Test error', 400);
            const regularError = new Error('Regular error');

            expect(isApiError(apiError)).toBe(true);
            expect(isApiError(regularError)).toBe(false);
        });

        it('should get user-friendly error messages', () => {
            const apiError = new ApiError('API error message', 400);
            const regularError = new Error('Regular error message');
            const unknownError = 'string error';

            expect(getErrorMessage(apiError)).toBe('API error message');
            expect(getErrorMessage(regularError)).toBe('Regular error message');
            expect(getErrorMessage(unknownError)).toBe('An unexpected error occurred');
        });
    });
});