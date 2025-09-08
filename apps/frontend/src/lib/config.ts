// API configuration for School Quiz Frontend
const getBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Debug logging (remove in production)
  console.log('🔍 NEXT_PUBLIC_API_URL:', envUrl);
  
  if (!envUrl) {
    console.log('🔍 Using localhost fallback');
    return 'http://localhost:3001';
  }
  
  // Clean the URL - remove any leading/trailing slashes and spaces
  const cleanUrl = envUrl.trim().replace(/^\/+|\/+$/g, '');
  
  // Ensure the URL has a protocol
  if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
    console.log('🔍 Using URL with protocol:', cleanUrl);
    return cleanUrl;
  }
  
  // Add https:// if no protocol is provided
  const finalUrl = `https://${cleanUrl}`;
  console.log('🔍 Using URL with added protocol:', finalUrl);
  return finalUrl;
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
  const fullUrl = `${API_CONFIG.BASE_URL}${endpoint}`;
  console.log('🔍 getApiUrl:', { baseUrl: API_CONFIG.BASE_URL, endpoint, fullUrl });
  return fullUrl;
};
