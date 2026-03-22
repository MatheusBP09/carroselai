import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function generateWithGateway(
  prompt: string,
  apiKey: string,
  model: string
): Promise<{ imageUrl: string; provider: string }> {
  console.log(`🎨 [Gateway] Gerando imagem com modelo: ${model}...`);

  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ [Gateway] Erro ${response.status} com ${model}:`, errorText);
    if (response.status === 429) {
      throw new Error(`Rate limit excedido (429). Tente novamente em instantes.`);
    }
    if (response.status === 402) {
      throw new Error(`Créditos insuficientes (402). Adicione fundos no workspace Lovable.`);
    }
    throw new Error(`Gateway error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Extract image from response - Gateway returns base64 inline in content parts
  const content = data.choices?.[0]?.message?.content;

  // Content can be a string or an array of parts
  if (Array.isArray(content)) {
    const imagePart = content.find(
      (part: any) => part.type === "image_url" || part.inline_data || part.type === "image"
    );
    if (imagePart?.image_url?.url) {
      console.log(`✅ [Gateway] Imagem gerada com ${model} (image_url)`);
      return { imageUrl: imagePart.image_url.url, provider: model };
    }
    if (imagePart?.inline_data) {
      const { data: b64, mime_type } = imagePart.inline_data;
      console.log(`✅ [Gateway] Imagem gerada com ${model} (inline_data)`);
      return { imageUrl: `data:${mime_type || "image/png"};base64,${b64}`, provider: model };
    }
  }

  // Try parsing as a single base64 string or data URL
  if (typeof content === "string") {
    if (content.startsWith("data:image")) {
      console.log(`✅ [Gateway] Imagem gerada com ${model} (data URL string)`);
      return { imageUrl: content, provider: model };
    }
    // Check if it's raw base64
    if (content.length > 1000 && !content.includes(" ")) {
      console.log(`✅ [Gateway] Imagem gerada com ${model} (raw base64)`);
      return { imageUrl: `data:image/png;base64,${content}`, provider: model };
    }
  }

  // Check message.images array (Gemini via Gateway returns images here)
  const images = data.choices?.[0]?.message?.images;
  if (Array.isArray(images)) {
    const imgEntry = images.find((img: any) => img.image_url?.url || img.url);
    const imgUrl = imgEntry?.image_url?.url || imgEntry?.url;
    if (imgUrl) {
      console.log(`✅ [Gateway] Imagem gerada com ${model} (message.images)`);
      return { imageUrl: imgUrl, provider: model };
    }
  }

  // Check raw response structure for inline images
  const parts = data.choices?.[0]?.message?.parts;
  if (Array.isArray(parts)) {
    const imgPart = parts.find((p: any) => p.inlineData || p.inline_data);
    if (imgPart) {
      const inlineData = imgPart.inlineData || imgPart.inline_data;
      const b64 = inlineData.data;
      const mime = inlineData.mimeType || inlineData.mime_type || "image/png";
      console.log(`✅ [Gateway] Imagem gerada com ${model} (parts inline)`);
      return { imageUrl: `data:${mime};base64,${b64}`, provider: model };
    }
  }

  console.error(`❌ [Gateway] Resposta sem imagem de ${model}:`, JSON.stringify(data).substring(0, 500));
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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!LOVABLE_API_KEY && !OPENAI_API_KEY) {
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

    // Chain: Gemini via Gateway → DALL-E 3 via OpenAI
    if (LOVABLE_API_KEY) {
      try {
        result = await generateWithGateway(prompt, LOVABLE_API_KEY, 'google/gemini-2.5-flash-image');
      } catch (error: any) {
        console.warn('⚠️ Gemini Flash Image falhou:', error.message);
        fallbackUsed = true;

        if (OPENAI_API_KEY) {
          try {
            result = await generateWithOpenAI(prompt, OPENAI_API_KEY);
          } catch (openaiError: any) {
            throw new Error(`Todos os provedores falharam. Gemini: ${error.message} | OpenAI: ${openaiError.message}`);
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
