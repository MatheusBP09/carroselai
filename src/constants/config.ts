import { supabase } from '@/integrations/supabase/client';

// Configuration to use Supabase Edge Functions for OpenAI API calls
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const getApiEndpoint = (type: 'chat' | 'image') => {
  return `${SUPABASE_URL}/functions/v1/generate-${type === 'chat' ? 'carousel' : 'image'}`;
};

export const OPENAI_CONFIG = {
  chatEndpoint: getApiEndpoint('chat'),
  imageEndpoint: getApiEndpoint('image'),
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  }
};

// Note: API calls now go through secure Supabase Edge Functions