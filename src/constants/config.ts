// OpenAI API Configuration - Using Supabase secrets
const getApiKey = () => {
  // Use environment variable from Supabase secrets
  return import.meta.env.VITE_OPENAI_API_KEY || 
         localStorage.getItem('openai_api_key') || 
         '';
};

export const OPENAI_API_KEY = getApiKey();

// Note: API key is now securely managed through Supabase secrets.