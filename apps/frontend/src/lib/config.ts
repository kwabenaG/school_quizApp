// API configuration for School Quiz Frontend
export const API_CONFIG = {
  // Use environment variable in production, fallback to localhost for development
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  
  // API endpoints
  ENDPOINTS: {
    WORDS: '/words',
    RANDOM_WORD: '/words/random/word',
    IMPORT_CSV: '/words/import-csv',
    IMPORT_EXCEL: '/words/import-excel',
    TRUNCATE: '/words/truncate',
    QUIZ_SESSIONS: '/quiz/sessions',
    CURRENT_WORD: '/quiz/sessions',
    SUBMIT_ANSWER: '/quiz/sessions',
  }
} as const;

// Helper function to build full API URLs
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
