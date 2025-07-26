# Easy Way A1 - AI Processing Platform

A powerful, modular AI processing platform with comprehensive authentication that enables users to create custom AI-powered tools with persistent data storage. Built with React, TypeScript, Node.js, and Supabase, Easy Way A1 provides a seamless interface for AI content generation and processing with secure user management.

## 🚀 Features

### Core Functionality

- **Authentication System**: Secure user registration, login, and role-based access control
- **User Management**: Admin dashboard for managing users and viewing analytics
- **Bilingual Interface**: Full support for English and Kannada languages
- **Modular AI Tools**: Create custom modules with specific prompts for different use cases
- **Persistent Storage**: SQLite database for storing modules and configurations
- **Real-time Processing**: Integration with Google Gemini AI for content generation
- **Role-Based Access**: Admin and user roles with appropriate permissions
- **Activity Tracking**: Comprehensive logging of module usage and analytics

### Current Modules Support

- Content generation with custom prompts
- Bilingual content management
- Module CRUD operations (Create, Read, Update, Delete)
- Error handling and validation
- User activity tracking and analytics

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Framework**: React 18 with TypeScript
- **Authentication**: Supabase Auth with JWT tokens
- **Routing**: React Router with protected routes
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks with centralized state
- **Build Tool**: Vite for fast development and building
- **Icons**: Lucide React for consistent iconography

### Backend (Node.js + Express)

- **Runtime**: Node.js with Express.js framework
- **Database**: Supabase PostgreSQL for scalable data storage
- **Authentication**: Supabase Auth integration
- **API**: RESTful API with proper error handling
- **CORS**: Cross-origin resource sharing enabled

### Database Schema

```sql
-- User profiles (extends Supabase auth.users)
user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Module usage tracking
module_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  module_name TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  processing_time INTEGER,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)

-- Existing modules table
modules (
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
)
```

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account and project

### Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/surajlm925-bit/EASY_WAY_A1.git
   cd EASY_WAY_A1
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Supabase Setup**

   a. Create a new Supabase project at [supabase.com](https://supabase.com)
   
   b. Run the authentication migration:
   ```bash
   # Copy the SQL from supabase/migrations/create_auth_tables.sql
   # and run it in your Supabase SQL editor
   ```

5. **Environment Configuration**

   **IMPORTANT: For Bolt Environment**
   
   Update the `.env` file in the root directory with your actual Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key
   VITE_API_BASE_URL=http://localhost:3001
   ```

   Update `backend/.env` file with your actual Supabase credentials:

   ```env
   PORT=3001
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   ```

6. **Database Setup**

   Run the database migrations in your Supabase dashboard:
   
   a. Go to your Supabase project dashboard
   b. Navigate to the SQL Editor
   c. Copy and run the SQL from `supabase/migrations/create_auth_tables.sql`
   d. Copy and run the SQL from `supabase/migrations/setup_permissions.sql`

7. **Create Your First Admin User**
   
   After setting up the database:
   a. Register a new account through the application
   b. In Supabase SQL Editor, run:
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```
8. **Start the application**

   **Backend** (Terminal 1):

   ```bash
   cd backend
   npm start
   ```

   **Frontend** (Terminal 2):

   ```bash
   npm run dev
   ```

9. **Access the application**
   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:3001>

   **Note**: You'll be redirected to login page. After authentication, you'll have access to all features.

## 🔧 Usage

### Basic Workflow

1. **Register/Login**: Create an account or sign in to access the platform
2. **Setup API Key**: Configure your Google Gemini API key in settings
3. **Select Language**: Choose between English and Kannada interface
4. **Choose Module**: Select from available AI modules or create new ones
5. **Process Content**: Input your content and get AI-generated results

### Admin Mode Features

- Access admin dashboard with user management
- View platform analytics and usage statistics
- Create new modules with custom prompts
- Edit existing module configurations
- Delete modules
- Manage user roles and permissions

### User Features

- Personal profile management
- View usage history and statistics
- Access to all AI processing modules
- Bilingual interface support
### API Endpoints

#### Authentication Endpoints
| Method | Endpoint                    | Description                    |
| ------ | --------------------------- | ------------------------------ |
| GET    | `/api/auth/users`          | Get all users (admin only)    |
| PUT    | `/api/auth/users/:id/role` | Update user role (admin only) |
| GET    | `/api/auth/usage`          | Get user's module usage        |
| GET    | `/api/auth/usage/all`      | Get all usage (admin only)    |
| POST   | `/api/auth/usage`          | Track module usage             |

#### Module Endpoints
| Method | Endpoint           | Description            |
| ------ | ------------------ | ---------------------- |
| GET    | `/api/modules`     | Fetch all modules      |
| POST   | `/api/modules`     | Create a new module    |
| PUT    | `/api/modules/:id` | Update existing module |
| DELETE | `/api/modules/:id` | Delete a module        |
| GET    | `/health`          | Health check endpoint  |

## 🧪 Testing

### Authentication Tests

```bash
# Test user registration and login flows
npm run test:auth

# Test role-based access control
npm run test:rbac
```

### Backend Tests

```bash
cd backend
node test-api-endpoints.js    # Test API endpoints
node test-repository.js       # Test database operations
node test-validation.js       # Test input validation
```

### Frontend Tests

```bash
npm run test  # Run frontend test suite
```

## 📁 Project Structure

```
EASY_WAY_A1/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── auth/               # Authentication components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── ForgotPasswordForm.tsx
│   │   ├── admin/              # Admin components
│   │   │   └── AdminDashboard.tsx
│   │   ├── user/               # User components
│   │   │   └── UserProfile.tsx
│   ├── components/              # React components
│   │   ├── modals/             # Modal components
│   │   ├── Header.tsx          # Application header
│   │   ├── Sidebar.tsx         # Module sidebar
│   │   ├── MainContent.tsx     # Main content area
│   │   └── ErrorToast.tsx      # Error notifications
│   ├── contexts/               # React contexts
│   │   └── AuthContext.tsx     # Authentication context
│   ├── lib/                    # Library configurations
│   │   └── supabase.ts         # Supabase client setup
│   ├── services/               # API services
│   │   ├── moduleApi.ts        # Module API client
│   │   └── __tests__/          # Service tests
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Utility functions
│   └── App.tsx                 # Main application component
├── backend/                     # Backend source code
│   ├── lib/                    # Backend libraries
│   │   └── supabase.js         # Supabase server client
│   ├── middleware/             # Express middleware
│   │   └── auth.js             # Authentication middleware
│   ├── routes/                 # API routes
│   │   └── auth.js             # Authentication routes
│   ├── database/               # Database layer
│   │   ├── db.js              # Database connection
│   │   ├── moduleRepository.js # Data access layer
│   │   └── modules.db         # SQLite database file
│   ├── server.js              # Express server
│   └── test-*.js              # Backend tests
├── supabase/                   # Supabase configuration
│   └── migrations/             # Database migrations
│       └── create_auth_tables.sql
├── .kiro/                      # Kiro IDE configuration
│   └── specs/                 # Project specifications
└── package.json               # Project dependencies
```

## 🔄 Development Status

### ✅ Completed Features

- [x] Complete authentication system with Supabase
- [x] User registration and login
- [x] Role-based access control (admin/user)
- [x] Protected routes and middleware
- [x] User profile management
- [x] Admin dashboard with user management
- [x] Module usage tracking and analytics
- [x] Database infrastructure with SQLite
- [x] Module repository layer with CRUD operations
- [x] RESTful API endpoints with error handling
- [x] Frontend API service layer
- [x] React components with TypeScript
- [x] Bilingual interface support
- [x] Admin/User mode toggle
- [x] Error handling and validation
- [x] Loading states and user feedback

### 🚧 In Progress

- [ ] Email verification flow
- [ ] Password reset functionality
- [ ] Advanced analytics dashboard
- [ ] User activity notifications

### 📋 Planned Features

- Two-factor authentication (2FA)
- Social login providers (Google, GitHub)
- API rate limiting per user
- Advanced user permissions system
- Export/import functionality for modules
- Performance optimization and caching

## 🛠️ Development

### Code Style

- ESLint configuration for code quality
- TypeScript for type safety
- Tailwind CSS for consistent styling
- Modular component architecture

### API Design

- RESTful endpoints with proper HTTP status codes
- Consistent error response format
- Request validation and sanitization
- CORS support for cross-origin requests

### Database Design

- Normalized schema for bilingual content
- Automatic timestamp management
- Foreign key constraints and data integrity
- Migration-ready structure

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Dependencies

### Frontend

- React 18.3.1
- React Router DOM 6.x
- @supabase/supabase-js 2.x
- React 18.3.1
- TypeScript 5.5.3
- Tailwind CSS 3.4.1
- Vite 7.0.6
- Lucide React 0.344.0

### Backend

- @supabase/supabase-js 2.x
- Express 4.18.2
- SQLite3 5.1.6
- CORS 2.8.5
- Nodemon 3.0.1 (dev)

## 📞 Support

For support and questions:
- Open an issue in the repository
- Check the [Supabase documentation](https://supabase.com/docs) for auth-related questions
- Contact the development team

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/surajlm925-bit/EASY_WAY_A1.git
cd EASY_WAY_A1

# Install dependencies
npm install
cd backend && npm install && cd ..

# Set up Supabase (create project and run migrations)
# Copy environment variables from Supabase dashboard

# Start the application
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend  
npm run dev
```

**Status**: Production Ready - Full-featured AI processing platform with authentication  
**Version**: 1.0.0  
**Last Updated**: January 2025