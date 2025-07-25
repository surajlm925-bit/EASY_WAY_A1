# Module API Service

This service provides functions to interact with the backend API for module management.

## Usage Examples

### Fetching all modules

```typescript
import { fetchModules, getErrorMessage } from './moduleApi';

try {
  const modules = await fetchModules();
  console.log('Loaded modules:', modules);
} catch (error) {
  console.error('Failed to load modules:', getErrorMessage(error));
}
```

### Creating a new module

```typescript
import { createModule, getErrorMessage } from './moduleApi';

const newModuleData = {
  prompt: 'Translate the following text to formal language',
  en: {
    name: 'Formal Translator',
    description: 'Converts casual text to formal language',
    inputPlaceholder: 'Enter casual text here...'
  },
  kn: {
    name: 'ಔಪಚಾರಿಕ ಅನುವಾದಕ',
    description: 'ಸಾಮಾನ್ಯ ಪಠ್ಯವನ್ನು ಔಪಚಾರಿಕ ಭಾಷೆಗೆ ಪರಿವರ್ತಿಸುತ್ತದೆ',
    inputPlaceholder: 'ಇಲ್ಲಿ ಸಾಮಾನ್ಯ ಪಠ್ಯವನ್ನು ನಮೂದಿಸಿ...'
  }
};

try {
  const createdModule = await createModule(newModuleData);
  console.log('Module created:', createdModule);
} catch (error) {
  console.error('Failed to create module:', getErrorMessage(error));
}
```

### Updating a module

```typescript
import { updateModule, getErrorMessage } from './moduleApi';

const updateData = {
  prompt: 'Updated prompt text',
  en: {
    name: 'Updated Name',
    description: 'Updated description',
    inputPlaceholder: 'Updated placeholder'
  },
  kn: {
    name: 'ಅಪ್ಡೇಟ್ ಮಾಡಿದ ಹೆಸರು',
    description: 'ಅಪ್ಡೇಟ್ ಮಾಡಿದ ವಿವರಣೆ',
    inputPlaceholder: 'ಅಪ್ಡೇಟ್ ಮಾಡಿದ ಪ್ಲೇಸ್‌ಹೋಲ್ಡರ್'
  }
};

try {
  const updatedModule = await updateModule(1, updateData);
  console.log('Module updated:', updatedModule);
} catch (error) {
  console.error('Failed to update module:', getErrorMessage(error));
}
```

### Deleting a module

```typescript
import { deleteModule, getErrorMessage } from './moduleApi';

try {
  await deleteModule(1);
  console.log('Module deleted successfully');
} catch (error) {
  console.error('Failed to delete module:', getErrorMessage(error));
}
```

## Error Handling

The service provides comprehensive error handling:

- **Network errors**: When the server is unreachable
- **Validation errors**: When required fields are missing or invalid
- **API errors**: When the server returns error responses
- **Not found errors**: When trying to update/delete non-existent modules

Use the `isApiError()` and `getErrorMessage()` utilities for consistent error handling in your components.

## Configuration

The API base URL can be configured via the `VITE_API_BASE_URL` environment variable. If not set, it defaults to `http://localhost:3001`.

## Features

- ✅ Request validation on the client side
- ✅ Comprehensive error handling with user-friendly messages
- ✅ Proper TypeScript types for all requests and responses
- ✅ Date object transformation for createdAt/updatedAt fields
- ✅ Network error detection and handling
- ✅ Configurable API base URL
- ✅ Consistent API response format handling