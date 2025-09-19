// OpenAI API Configuration - Using fallback system
const getApiKey = () => {
  // Try environment variable first, then fallback
  return import.meta.env.VITE_OPENAI_API_KEY || 
         localStorage.getItem('openai_api_key') || 
         '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';
};

export const OPENAI_API_KEY = getApiKey();

// Note: API key management with multiple fallback options for better reliability.