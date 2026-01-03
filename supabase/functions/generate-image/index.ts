import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Tenta gerar imagem com Gemini (Nano Banana)
async function generateWithGemini(prompt: string, apiKey: string): Promise<{ imageUrl: string; provider: string }> {
  console.log('🎨 [Gemini] Tentando gerar imagem com Gemini 2.5 Flash Image...');
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] }
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [Gemini] API error:', response.status, errorText);
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData);

  if (!imagePart?.inlineData?.data) {
    console.error('❌ [Gemini] Resposta sem imagem:', JSON.stringify(data, null, 2));
    throw new Error('Gemini não retornou uma imagem');
  }

  const base64 = imagePart.inlineData.data;
  const mimeType = imagePart.inlineData.mimeType || 'image/png';
  
  console.log('✅ [Gemini] Imagem gerada com sucesso');
  return { imageUrl: `data:${mimeType};base64,${base64}`, provider: 'gemini' };
}

// Fallback: gera imagem com OpenAI DALL-E
async function generateWithOpenAI(prompt: string, apiKey: string): Promise<{ imageUrl: string; provider: string }> {
  console.log('🎨 [OpenAI] Usando fallback DALL-E 3...');
  
  // Simplifica o prompt para DALL-E (max 4000 chars)
  const simplifiedPrompt = prompt.length > 3800 
    ? prompt.substring(0, 3800) + '...' 
    : prompt;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: simplifiedPrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
      quality: 'standard'
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ [OpenAI] API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const base64 = data.data?.[0]?.b64_json;

  if (!base64) {
    console.error('❌ [OpenAI] Resposta sem imagem:', JSON.stringify(data, null, 2));
    throw new Error('OpenAI não retornou uma imagem');
  }

  console.log('✅ [OpenAI] Imagem gerada com sucesso via fallback');
  return { imageUrl: `data:image/png;base64,${base64}`, provider: 'openai' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const NANO_BANANA_KEY = Deno.env.get('NANO_BANANA');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!NANO_BANANA_KEY && !OPENAI_API_KEY) {
      console.error('Nenhuma API key configurada');
      return new Response(JSON.stringify({ error: 'Nenhuma API de imagem configurada' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📝 Prompt recebido:', prompt.substring(0, 100) + '...');

    let result: { imageUrl: string; provider: string };
    let geminiError: string | null = null;

    // Tenta Gemini primeiro (se disponível)
    if (NANO_BANANA_KEY) {
      try {
        result = await generateWithGemini(prompt, NANO_BANANA_KEY);
      } catch (error: any) {
        geminiError = error.message;
        console.warn('⚠️ Gemini falhou, tentando fallback...', geminiError);
        
        // Tenta OpenAI como fallback
        if (OPENAI_API_KEY) {
          result = await generateWithOpenAI(prompt, OPENAI_API_KEY);
        } else {
          throw new Error(`Gemini falhou e OpenAI não está configurada: ${geminiError}`);
        }
      }
    } else if (OPENAI_API_KEY) {
      // Se só tem OpenAI, usa direto
      result = await generateWithOpenAI(prompt, OPENAI_API_KEY);
    } else {
      throw new Error('Nenhum provedor de imagem disponível');
    }

    console.log(`✅ Imagem gerada via ${result.provider}${geminiError ? ' (fallback)' : ''}`);

    return new Response(JSON.stringify({ 
      imageUrl: result.imageUrl,
      success: true,
      provider: result.provider,
      fallbackUsed: !!geminiError
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Erro final em generate-image:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
