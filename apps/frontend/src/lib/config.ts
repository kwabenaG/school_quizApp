// API configuration for School Quiz Frontend
const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl) return 'http://localhost:3001';
  
  // Ensure the URL has a protocol
  if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
    return envUrl;
  }
  
  // Add https:// if no protocol is provided
  return `https://${envUrl}`;
};

export const API_CONFIG = {
  // Use environment variable in production, fallback to localhost for development
  BASE_URL: getBaseUrl(),
  
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
