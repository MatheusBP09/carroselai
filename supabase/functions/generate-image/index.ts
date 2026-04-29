import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Google AI Studio (Generative Language API) — direct billing on user's GCP project
async function generateWithGoogleDirect(
  prompt: string,
  apiKey: string,
  model: string
): Promise<{ imageUrl: string; provider: string }> {
  console.log(`🎨 [Google Direct] Gerando imagem com modelo: ${model}...`);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["IMAGE"],
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ [Google Direct] Erro ${response.status} com ${model}:`, errorText);

    if (response.status === 400 && errorText.includes("API_KEY_INVALID")) {
      throw new Error("API key Google inválida. Gere uma nova em aistudio.google.com/apikey");
    }
    if (response.status === 403) {
      throw new Error("Acesso negado. Verifique se o projeto GCP tem billing habilitado e a API Generative Language ativada.");
    }
    if (response.status === 429) {
      throw new Error("Quota excedida na Google AI. Verifique limites no console GCP.");
    }
    throw new Error(`Google API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Parse Google's native response format: candidates[0].content.parts[].inlineData
  const parts = data?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const imgPart = parts.find((p: any) => p.inlineData || p.inline_data);
    if (imgPart) {
      const inlineData = imgPart.inlineData || imgPart.inline_data;
      const b64 = inlineData.data;
      const mime = inlineData.mimeType || inlineData.mime_type || "image/png";
      console.log(`✅ [Google Direct] Imagem gerada com ${model}`);
      return {
        imageUrl: `data:${mime};base64,${b64}`,
        provider: `google-direct-${model}`,
      };
    }
  }

  console.error(`❌ [Google Direct] Resposta sem imagem de ${model}:`, JSON.stringify(data).substring(0, 500));
  throw new Error(`Modelo ${model} não retornou imagem`);
}

// Fallback: DALL-E 3 via OpenAI direta
async function generateWithOpenAI(prompt: string, apiKey: string): Promise<{ imageUrl: string; provider: string }> {
  console.log('🎨 [OpenAI] Usando fallback DALL-E 3...');

  const simplifiedPrompt = prompt.length > 3800 ? prompt.substring(0, 3800) + '...' : prompt;

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
      quality: 'standard',
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
    throw new Error('OpenAI não retornou uma imagem');
  }

  console.log('✅ [OpenAI] Imagem gerada com sucesso via fallback');
  return { imageUrl: `data:image/png;base64,${base64}`, provider: 'openai-dall-e-3' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!GOOGLE_AI_API_KEY && !OPENAI_API_KEY) {
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
    let fallbackUsed = false;

    // Chain: Gemini direct (Google AI Studio, billing on user's GCP) → DALL-E 3 (OpenAI)
    if (GOOGLE_AI_API_KEY) {
      try {
        result = await generateWithGoogleDirect(
          prompt,
          GOOGLE_AI_API_KEY,
          'gemini-3.1-flash-image-preview'
        );
      } catch (error: any) {
        console.warn('⚠️ Gemini direct falhou:', error.message);
        fallbackUsed = true;

        if (OPENAI_API_KEY) {
          try {
            result = await generateWithOpenAI(prompt, OPENAI_API_KEY);
          } catch (openaiError: any) {
            throw new Error(`Todos os provedores falharam. Google: ${error.message} | OpenAI: ${openaiError.message}`);
          }
        } else {
          throw error;
        }
      }
    } else if (OPENAI_API_KEY) {
      result = await generateWithOpenAI(prompt, OPENAI_API_KEY);
    } else {
      throw new Error('Nenhum provedor de imagem disponível');
    }

    console.log(`✅ Imagem gerada via ${result.provider}${fallbackUsed ? ' (fallback)' : ''}`);

    return new Response(JSON.stringify({
      imageUrl: result.imageUrl,
      success: true,
      provider: result.provider,
      fallbackUsed,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('❌ Erro final em generate-image:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Erro interno do servidor',
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
