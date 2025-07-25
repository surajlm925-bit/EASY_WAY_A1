# Design Document

## Overview

This design implements a complete persistence layer for the bolt automation app's module system. The solution will replace the current frontend-only state management with a proper backend API and SQLite database, ensuring modules persist across sessions while maintaining the existing UI/UX.

The design focuses on minimal changes to the existing frontend while adding robust backend persistence with proper error handling and loading states.

## Architecture

### Current State
- Frontend: React + TypeScript with Vite
- Backend: Express.js server (skeleton exists)
- Database: SQLite3 (installed but not configured)
- State Management: Local React state with preset modules

### Target Architecture
```
Frontend (React)
    ↓ HTTP API calls
Backend (Express.js)
    ↓ SQL queries
Database (SQLite3)
```

### Data Flow
1. **App Initialization**: Frontend fetches all modules from backend API
2. **Module Operations**: Frontend sends CRUD operations to backend API
3. **Database Operations**: Backend processes requests and updates SQLite database
4. **State Synchronization**: Backend returns updated data to keep frontend in sync

## Components and Interfaces

### Backend Components

#### 1. Database Layer (`backend/database/db.js`)
- **Purpose**: Handle SQLite database connection and table initialization
- **Responsibilities**:
  - Create and manage database connection
  - Initialize modules table with proper schema
  - Provide connection instance to other components

#### 2. Module Repository (`backend/database/moduleRepository.js`)
- **Purpose**: Data access layer for module operations
- **Methods**:
  - `getAllModules()`: Retrieve all modules
  - `createModule(moduleData)`: Insert new module
  - `updateModule(id, moduleData)`: Update existing module
  - `deleteModule(id)`: Remove module
  - `getModuleById(id)`: Get single module

#### 3. API Routes (`backend/routes/index.js`)
- **Purpose**: Define HTTP endpoints for module operations
- **Endpoints**:
  - `GET /api/modules`: Get all modules
  - `POST /api/modules`: Create new module
  - `PUT /api/modules/:id`: Update module
  - `DELETE /api/modules/:id`: Delete module

### Frontend Components

#### 1. API Service (`src/services/moduleApi.ts`)
- **Purpose**: Handle all HTTP requests to backend
- **Methods**:
  - `fetchModules()`: Get all modules
  - `createModule(moduleData)`: Create new module
  - `updateModule(id, moduleData)`: Update module
  - `deleteModule(id)`: Delete module

#### 2. Updated App Component (`src/App.tsx`)
- **Changes**:
  - Replace `defaultModules` with API calls
  - Add loading states for module operations
  - Add error handling for API failures
  - Implement proper state synchronization

## Data Models

### Database Schema
```sql
CREATE TABLE modules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prompt TEXT NOT NULL,
    en_name TEXT NOT NULL,
    en_description TEXT,
    en_input_placeholder TEXT,
    kn_name TEXT NOT NULL,
    kn_description TEXT,
    kn_input_placeholder TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### API Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface ModuleResponse {
  id: number;
  prompt: string;
  en: ModuleContent;
  kn: ModuleContent;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

## Error Handling

### Backend Error Handling
- **Database Errors**: Catch SQLite errors and return appropriate HTTP status codes
- **Validation Errors**: Validate required fields and return 400 Bad Request
- **Not Found Errors**: Return 404 for non-existent modules
- **Server Errors**: Return 500 for unexpected errors with sanitized messages

### Frontend Error Handling
- **Network Errors**: Display user-friendly messages for connection issues
- **API Errors**: Show specific error messages from backend responses
- **Loading States**: Show spinners during API operations
- **Retry Mechanism**: Allow users to retry failed operations

### Error States
1. **Module Loading Failed**: Show error message with retry button
2. **Module Save Failed**: Keep modal open, show error, allow retry
3. **Module Delete Failed**: Show error toast, don't remove from UI
4. **Network Offline**: Show offline indicator and queue operations

## Testing Strategy

### Backend Testing
- **Unit Tests**: Test repository methods with mock database
- **Integration Tests**: Test API endpoints with test database
- **Error Scenarios**: Test database failures and validation errors

### Frontend Testing
- **API Service Tests**: Mock HTTP requests and test error handling
- **Component Tests**: Test loading states and error displays
- **Integration Tests**: Test full CRUD workflows

### Manual Testing Checklist
1. Create module → Verify persistence after page refresh
2. Edit module → Verify changes are saved
3. Delete module → Verify removal from database
4. Network failure → Verify error handling
5. Large dataset → Verify performance

## Implementation Considerations

### Database Initialization
- Create database file in `backend/database/modules.db`
- Initialize tables on server startup
- Handle database migration if schema changes

### API Design
- RESTful endpoints following standard conventions
- Consistent error response format
- Proper HTTP status codes
- Request/response validation

### Frontend State Management
- Maintain existing React state structure
- Add loading and error states
- Implement optimistic updates where appropriate
- Handle race conditions in concurrent operations

### Performance Optimizations
- Database indexing on frequently queried fields
- Connection pooling for database access
- Caching strategies for frequently accessed data
- Pagination for large module lists (future consideration)

### Security Considerations
- Input validation and sanitization
- SQL injection prevention using parameterized queries
- Rate limiting for API endpoints
- CORS configuration for production deployment

## Migration Strategy

### Phase 1: Backend Implementation
1. Set up database schema and connection
2. Implement repository layer
3. Create API endpoints
4. Add error handling and validation

### Phase 2: Frontend Integration
1. Create API service layer
2. Update App component to use API
3. Add loading and error states
4. Test CRUD operations

### Phase 3: Data Migration
1. Seed database with default modules
2. Test data persistence
3. Verify all functionality works end-to-end

This design ensures minimal disruption to the existing user experience while providing robust persistence and proper error handling for production use.