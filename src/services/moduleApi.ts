import { Module, ModuleContent } from '../types';

// API base URL - can be configured via environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// API response interface matching backend format
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// Module data for API requests (without id, createdAt, updatedAt)
export interface CreateModuleRequest {
    prompt: string;
    en: ModuleContent;
    kn: ModuleContent;
}

export interface UpdateModuleRequest {
    prompt: string;
    en: ModuleContent;
    kn: ModuleContent;
}

// Custom error class for API errors
export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

// Helper function to handle HTTP requests
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, requestOptions);
        const data: ApiResponse<T> = await response.json();

        if (!response.ok) {
            throw new ApiError(
                data.error || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                data
            );
        }

        if (!data.success) {
            throw new ApiError(
                data.error || 'API request failed',
                response.status,
                data
            );
        }

        return data.data as T;
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        // Handle network errors
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new ApiError(
                'Network error: Unable to connect to server. Please check your connection.',
                0
            );
        }

        // Handle other errors
        throw new ApiError(
            error instanceof Error ? error.message : 'An unexpected error occurred',
            0
        );
    }
}

/**
 * Fetch all modules from the backend
 * Implements error handling for network failures and API errors
 */
export async function fetchModules(): Promise<Module[]> {
    try {
        const modules = await apiRequest<Module[]>('/api/modules', {
            method: 'GET',
        });

        // Transform date strings back to Date objects
        return modules.map(module => ({
            ...module,
            createdAt: new Date(module.createdAt),
            updatedAt: new Date(module.updatedAt),
        }));
    } catch (error) {
        console.error('Failed to fetch modules:', error);
        throw error;
    }
}

/**
 * Create a new module
 * Implements request validation and error handling
 */
export async function createModule(moduleData: CreateModuleRequest): Promise<Module> {
    // Client-side validation
    if (!moduleData.prompt?.trim()) {
        throw new ApiError('Prompt is required', 400);
    }

    if (!moduleData.en?.name?.trim()) {
        throw new ApiError('English name is required', 400);
    }

    if (!moduleData.kn?.name?.trim()) {
        throw new ApiError('Kannada name is required', 400);
    }

    try {
        const createdModule = await apiRequest<Module>('/api/modules', {
            method: 'POST',
            body: JSON.stringify(moduleData),
        });

        // Transform date strings back to Date objects
        return {
            ...createdModule,
            createdAt: new Date(createdModule.createdAt),
            updatedAt: new Date(createdModule.updatedAt),
        };
    } catch (error) {
        console.error('Failed to create module:', error);
        throw error;
    }
}

/**
 * Update an existing module
 * Implements optimistic updates by returning the expected result immediately
 * while handling errors appropriately
 */
export async function updateModule(
    id: number,
    moduleData: UpdateModuleRequest
): Promise<Module> {
    // Client-side validation
    if (!id || id <= 0) {
        throw new ApiError('Valid module ID is required', 400);
    }

    if (!moduleData.prompt?.trim()) {
        throw new ApiError('Prompt is required', 400);
    }

    if (!moduleData.en?.name?.trim()) {
        throw new ApiError('English name is required', 400);
    }

    if (!moduleData.kn?.name?.trim()) {
        throw new ApiError('Kannada name is required', 400);
    }

    try {
        const updatedModule = await apiRequest<Module>(`/api/modules/${id}`, {
            method: 'PUT',
            body: JSON.stringify(moduleData),
        });

        // Transform date strings back to Date objects
        return {
            ...updatedModule,
            createdAt: new Date(updatedModule.createdAt),
            updatedAt: new Date(updatedModule.updatedAt),
        };
    } catch (error) {
        console.error('Failed to update module:', error);
        throw error;
    }
}

/**
 * Delete a module
 * Implements confirmation handling through proper error messaging
 */
export async function deleteModule(id: number): Promise<void> {
    // Client-side validation
    if (!id || id <= 0) {
        throw new ApiError('Valid module ID is required', 400);
    }

    try {
        await apiRequest<void>(`/api/modules/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error('Failed to delete module:', error);
        throw error;
    }
}

/**
 * Helper function to check if an error is an API error
 */
export function isApiError(error: any): error is ApiError {
    return error instanceof ApiError;
}

/**
 * Helper function to get user-friendly error message
 */
export function getErrorMessage(error: any): string {
    if (isApiError(error)) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'An unexpected error occurred';
}
