export type Language = 'en' | 'kn';

export interface ModuleContent {
  name: string;
  description: string;
  inputPlaceholder: string;
}

export interface Module {
  id: number;
  prompt: string;
  en: ModuleContent;
  kn: ModuleContent;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  modules: Module[];
  selectedModule: Module | null;
  isAdminMode: boolean;
  apiKey: string;
  input: string;
  output: string;
  isLoading: boolean;
  error: string | null;
  language: Language;
}

export interface ProcessingResponse {
  success: boolean;
  output?: string;
  error?: string;
}