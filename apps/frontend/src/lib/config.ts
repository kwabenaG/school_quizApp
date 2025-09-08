// API configuration for School Quiz Frontend
const getBaseUrl = () => {
  // Production API URL from Vercel rewrites
  const productionApiUrl = 'https://schoolquizapp-production.up.railway.app';
  
  // Development fallback
  const developmentApiUrl = 'http://localhost:3001';
  
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Use environment variable if provided, otherwise use production/development defaults
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // Debug logging (only in development)
  if (!isProduction) {
    console.log('🔍 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔍 NEXT_PUBLIC_API_URL:', envUrl);
    console.log('🔍 isProduction:', isProduction);
  }
  
  // If environment variable is provided, use it
  if (envUrl) {
    const cleanUrl = envUrl.trim().replace(/^\/+|\/+$/g, '');
    
    // Ensure the URL has a protocol
    if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
      if (!isProduction) console.log('🔍 Using URL with protocol:', cleanUrl);
      return cleanUrl;
    }
    
    // Add appropriate protocol based on environment
    const isLocalhost = cleanUrl.includes('localhost') || cleanUrl.includes('127.0.0.1');
    const finalUrl = isLocalhost ? `http://${cleanUrl}` : `https://${cleanUrl}`;
    if (!isProduction) console.log('🔍 Using URL with added protocol:', finalUrl);
    return finalUrl;
  }
  
  // Use production URL in production, development URL in development
  const defaultUrl = isProduction ? productionApiUrl : developmentApiUrl;
  if (!isProduction) console.log('🔍 Using default URL:', defaultUrl);
  return defaultUrl;
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
