import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found in environment variables');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt, size = "1024x1024" } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Generating image with prompt:', prompt);

    // Validate and normalize size parameter to OpenAI supported values
    const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
    let normalizedSize = size;
    
    // Convert common invalid sizes to valid ones
    if (size === '1080x1080' || size === '1080x1080') {
      normalizedSize = '1024x1024';
    } else if (size === '1080x1920' || size === '1024x1920') {
      normalizedSize = '1024x1792';
    } else if (!validSizes.includes(size)) {
      normalizedSize = '1024x1024'; // Default fallback
    }

    console.log('Using normalized size:', normalizedSize);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: normalizedSize,
        quality: 'standard',
        // Request base64 directly to avoid any CORS or download issues on the client
        response_format: 'b64_json'
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const base64 = data?.data?.[0]?.b64_json as string | undefined;

    if (!base64) {
      console.error('OpenAI response did not include b64_json field', data);
      throw new Error('Invalid image response from OpenAI');
    }

    const dataUrl = `data:image/png;base64,${base64}`;

    console.log('Image generated successfully as base64');

    return new Response(JSON.stringify({ 
      imageUrl: dataUrl,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});