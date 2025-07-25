import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Module, AppState, Language } from './types';
import { processWithGemini } from './utils/geminiApi';
import {
  fetchModules,
  createModule,
  updateModule,
  deleteModule,
  getErrorMessage,
  CreateModuleRequest,
  UpdateModuleRequest
} from './services/moduleApi';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ForgotPasswordForm from './components/auth/ForgotPasswordForm';
import UserProfile from './components/user/UserProfile';
import AdminDashboard from './components/admin/AdminDashboard';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AddModuleModal from './components/modals/AddModuleModal';
import EditModuleModal from './components/modals/EditModuleModal';
import SettingsModal from './components/modals/SettingsModal';
import ErrorToast from './components/ErrorToast';
import SuccessToast from './components/SuccessToast';

function MainApp() {
  const { user, profile, isAdmin, trackModuleUsage } = useAuth();
  const [state, setState] = useState<AppState>({
    modules: [],
    selectedModule: null,
    isAdminMode: false,
    apiKey: '',
    input: '',
    output: '',
    isLoading: false,
    error: null,
    language: 'en'
  });

  const [moduleOperationLoading, setModuleOperationLoading] = useState(false);
  const [moduleLoadingError, setModuleLoadingError] = useState<string | null>(null);
  const [moduleOperationError, setModuleOperationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [modals, setModals] = useState({
    addModule: false,
    editModule: false,
    settings: false,
    editingModule: null as Module | null
  });

  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Load modules on component mount
  useEffect(() => {
    const loadModules = async () => {
      try {
        setModuleLoadingError(null);
        updateState({ isLoading: true });
        const modules = await fetchModules();
        updateState({ modules, isLoading: false });
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        setModuleLoadingError(errorMessage);
        updateState({ isLoading: false });
        console.error('Failed to load modules:', error);
      }
    };

    loadModules();
  }, [updateState]);

  // Retry function for loading modules
  const retryLoadModules = useCallback(async () => {
    try {
      setModuleLoadingError(null);
      updateState({ isLoading: true });
      const modules = await fetchModules();
      updateState({ modules, isLoading: false });
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setModuleLoadingError(errorMessage);
      updateState({ isLoading: false });
      console.error('Failed to load modules:', error);
    }
  }, [updateState]);

  const handleToggleAdminMode = () => {
    // Only allow admin mode if user is actually an admin
    if (isAdmin) {
      updateState({ isAdminMode: !state.isAdminMode });
    }
  };

  const handleLanguageChange = (language: Language) => {
    updateState({ language });
  };

  const handleSelectModule = (module: Module) => {
    updateState({
      selectedModule: module,
      input: '',
      output: '',
      error: null
    });
  };

  const handleAddModule = async (moduleData: CreateModuleRequest) => {
    try {
      setModuleOperationLoading(true);
      setModuleOperationError(null);
      const newModule = await createModule(moduleData);
      updateState({
        modules: [...state.modules, newModule]
      });
      setSuccessMessage('Module added successfully!');
      setModuleOperationLoading(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setModuleOperationError(`Failed to add module: ${errorMessage}`);
      setModuleOperationLoading(false);
      console.error('Failed to add module:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleEditModule = async (moduleId: number, moduleData: UpdateModuleRequest) => {
    try {
      setModuleOperationLoading(true);
      setModuleOperationError(null);
      const updatedModule = await updateModule(moduleId, moduleData);

      const updatedModules = state.modules.map(module =>
        module.id === moduleId ? updatedModule : module
      );

      const updatedSelectedModule = state.selectedModule?.id === moduleId
        ? updatedModule
        : state.selectedModule;

      updateState({
        modules: updatedModules,
        selectedModule: updatedSelectedModule
      });
      setSuccessMessage('Module updated successfully!');
      setModuleOperationLoading(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setModuleOperationError(`Failed to update module: ${errorMessage}`);
      setModuleOperationLoading(false);
      console.error('Failed to update module:', error);
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    try {
      setModuleOperationLoading(true);
      setModuleOperationError(null);
      await deleteModule(moduleId);

      const updatedModules = state.modules.filter(module => module.id !== moduleId);
      const updatedSelectedModule = state.selectedModule?.id === moduleId
        ? null
        : state.selectedModule;

      updateState({
        modules: updatedModules,
        selectedModule: updatedSelectedModule,
        input: updatedSelectedModule ? state.input : '',
        output: updatedSelectedModule ? state.output : '',
        error: null
      });
      setSuccessMessage('Module deleted successfully!');
      setModuleOperationLoading(false);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setModuleOperationError(`Failed to delete module: ${errorMessage}`);
      setModuleOperationLoading(false);
      console.error('Failed to delete module:', error);
      // Don't re-throw for delete operations as they're typically called directly from UI
    }
  };

  const handleInputChange = (input: string) => {
    updateState({ input, error: null });
  };

  const handleProcess = async () => {
    if (!state.selectedModule || !state.input.trim()) return;

    const startTime = Date.now();
    updateState({ isLoading: true, error: null, output: '' });

    try {
      const result = await processWithGemini(
        state.selectedModule.prompt,
        state.input,
        state.apiKey
      );

      if (result.success && result.output) {
        const processingTime = Date.now() - startTime;
        
        // Track module usage
        if (user && state.selectedModule) {
          await trackModuleUsage({
            module_name: state.selectedModule.en.name,
            input_data: { input: state.input },
            output_data: { output: result.output },
            processing_time: processingTime,
            status: 'completed'
          });
        }

        updateState({
          output: result.output,
          isLoading: false,
          error: null
        });
      } else {
        const processingTime = Date.now() - startTime;
        
        // Track failed usage
        if (user && state.selectedModule) {
          await trackModuleUsage({
            module_name: state.selectedModule.en.name,
            input_data: { input: state.input },
            output_data: { error: result.error },
            processing_time: processingTime,
            status: 'failed'
          });
        }

        updateState({
          error: result.error || 'Processing failed',
          isLoading: false,
          output: ''
        });
      }
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Track failed usage
      if (user && state.selectedModule) {
        await trackModuleUsage({
          module_name: state.selectedModule.en.name,
          input_data: { input: state.input },
          output_data: { error: 'An unexpected error occurred' },
          processing_time: processingTime,
          status: 'failed'
        });
      }

      updateState({
        error: 'An unexpected error occurred',
        isLoading: false,
        output: ''
      });
    }
  };

  const handleApiKeyChange = (apiKey: string) => {
    updateState({ apiKey });
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header
        isAdminMode={state.isAdminMode}
        onToggleAdminMode={isAdmin ? handleToggleAdminMode : undefined}
        onOpenSettings={() => setModals({ ...modals, settings: true })}
        user={user}
        profile={profile}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          modules={state.modules}
          selectedModule={state.selectedModule}
          isAdminMode={state.isAdminMode}
          apiKey={state.apiKey}
          language={state.language}
          isLoading={state.isLoading}
          error={moduleLoadingError}
          moduleOperationLoading={moduleOperationLoading}
          onSelectModule={handleSelectModule}
          onAddModule={() => setModals({ ...modals, addModule: true })}
          onEditModule={(module) => setModals({
            ...modals,
            editModule: true,
            editingModule: module
          })}
          onDeleteModule={handleDeleteModule}
          onApiKeyChange={handleApiKeyChange}
          onRetryLoadModules={retryLoadModules}
        />

        <MainContent
          selectedModule={state.selectedModule}
          input={state.input}
          output={state.output}
          isLoading={state.isLoading}
          error={state.error}
          language={state.language}
          onInputChange={handleInputChange}
          onProcess={handleProcess}
        />
      </div>

      <AddModuleModal
        isOpen={modals.addModule}
        onClose={() => setModals({ ...modals, addModule: false })}
        onAdd={handleAddModule}
      />

      <EditModuleModal
        isOpen={modals.editModule}
        module={modals.editingModule}
        onClose={() => setModals({
          ...modals,
          editModule: false,
          editingModule: null
        })}
        onEdit={handleEditModule}
      />

      <SettingsModal
        isOpen={modals.settings}
        onClose={() => setModals({ ...modals, settings: false })}
        language={state.language}
        onLanguageChange={handleLanguageChange}
      />

      <ErrorToast
        message={moduleOperationError}
        onClose={() => setModuleOperationError(null)}
      />

      <SuccessToast
        message={successMessage}
        onClose={() => setSuccessMessage(null)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          } />
          
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;