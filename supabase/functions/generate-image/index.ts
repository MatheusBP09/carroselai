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
    const NANO_BANANA_KEY = Deno.env.get('NANO_BANANA');
    if (!NANO_BANANA_KEY) {
      console.error('NANO_BANANA key not found in environment variables');
      return new Response(JSON.stringify({ error: 'Nano Banana API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('🎨 Generating image with Nano Banana (Gemini Preview):', prompt);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${NANO_BANANA_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ 
            parts: [{ text: prompt }] 
          }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"]
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini response received');

    // Extract image from Gemini response
    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData
    );

    if (!imagePart?.inlineData?.data) {
      console.error('Gemini response did not include image data', JSON.stringify(data, null, 2));
      throw new Error('Invalid image response from Gemini');
    }

    const base64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log('✅ Image generated successfully with Nano Banana');

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
