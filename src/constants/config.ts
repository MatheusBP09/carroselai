// OpenAI API Configuration - Using Supabase secrets
const getApiKey = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('OpenAI API key not found. Please configure OPENAI_API_KEY in Supabase secrets.');
    return '';
  }
  
  return apiKey;
};

export const OPENAI_API_KEY = getApiKey();

// Note: API key is now securely managed through Supabase secrets.