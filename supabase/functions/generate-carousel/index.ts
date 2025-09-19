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

    const {
      title,
      username,
      content,
      instagramHandle,
      isVerified,
      slideCount = 10,
      contentType,
      contentFormat,
      callToAction,
      customCTA,
      copywritingFramework,
      targetAudience
    } = await req.json();

    console.log('Generating carousel with params:', {
      username,
      slideCount,
      contentType,
      contentFormat,
      callToAction,
      copywritingFramework
    });

    // Model cascade with fallback
    const modelConfigs = [
      { model: 'gpt-4.1-2025-04-14', timeout: 45000, maxTokens: 2000 },
      { model: 'gpt-4o', timeout: 40000, maxTokens: 1800 },
      { model: 'gpt-4o-mini', timeout: 35000, maxTokens: 1500 }
    ];

    // Helper to detect audience
    const detectAudience = (content: string): string => {
      const keywords = {
        business: ['empresa', 'negócio', 'vendas', 'marketing'],
        tech: ['tecnologia', 'programação', 'ia', 'digital'],
        health: ['saúde', 'exercício', 'bem-estar', 'fitness'],
        finance: ['dinheiro', 'investimento', 'financeiro', 'renda'],
        education: ['educação', 'curso', 'aprender', 'ensino'],
        lifestyle: ['vida', 'casa', 'família', 'pessoal']
      };

      const lowerContent = content.toLowerCase();
      for (const [category, words] of Object.entries(keywords)) {
        if (words.some(word => lowerContent.includes(word))) {
          return category === 'business' ? 'Empreendedores (25-45 anos)' :
                 category === 'tech' ? 'Profissionais de tecnologia (20-40 anos)' :
                 category === 'health' ? 'Pessoas interessadas em saúde (25-50 anos)' :
                 category === 'finance' ? 'Investidores e interessados em finanças (25-55 anos)' :
                 category === 'education' ? 'Estudantes e profissionais em desenvolvimento (18-45 anos)' :
                 'Público geral interessado em lifestyle (20-50 anos)';
        }
      }
      return 'Público geral (18-50 anos)';
    };

    const audience = targetAudience || detectAudience(content);

    // Create optimized prompt
    const ctaText = callToAction === 'custom' && customCTA ? customCTA : 
                   callToAction === 'follow' ? 'Me segue!' :
                   callToAction === 'link_bio' ? 'Link na bio!' :
                   callToAction === 'comment' ? 'Comenta aqui!' :
                   callToAction === 'share' ? 'Compartilha!' :
                   callToAction === 'save' ? 'Salva este post!' :
                   callToAction === 'dm' ? 'Manda DM!' :
                   callToAction === 'tag_friends' ? 'Marca os amigos!' : 'Me segue!';

    const frameworkInstruction = copywritingFramework === 'aida' ? 'AIDA: 1-2 Atenção, 3-2 Interesse, 3-4 Desejo, 5 Ação' :
                                copywritingFramework === 'pas' ? 'PAS: 1-2 Problema, 3-4 Agitação, 5 Solução' :
                                copywritingFramework === 'before_after_bridge' ? 'Before-After-Bridge: 1-2 Before, 3-4 After, 5 Bridge' :
                                copywritingFramework === 'problem_solution' ? 'Problema-Solução: 1-2 Problema, 3-4 Solução, 5 CTA' :
                                copywritingFramework === 'storytelling' ? 'Storytelling: 1 Hook, 2-3 Contexto, 4 Clímax, 5 CTA' :
                                'Listicle: estrutura de lista numerada';

    const systemPrompt = "Especialista em marketing Instagram. Responda apenas JSON válido.";
    const userPrompt = `Crie carrossel Instagram OTIMIZADO:

PERFIL: ${username} (${instagramHandle}) ${isVerified ? '✓' : ''}
TEMA: ${content}
PÚBLICO: ${audience}
SLIDES: ${slideCount} | FORMATO: ${contentFormat}
FRAMEWORK: ${frameworkInstruction}
CTA: ${ctaText}

REGRAS:
- Texto INTELIGENTE: 180 chars se COM imagem, 400-500 chars se SEM imagem
- Texto EDUCATIVO específico do tema
- ALGUMAS slides: needsImage: true, OUTRAS: needsImage: false (variar para melhor experiência)
- ImagePrompts: FOTOS REAIS relacionadas ao texto
- NO design/gráfico, SIM fotos de pessoas/objetos/cenários
- Linguagem brasileira natural
- Para slides sem imagem: texto mais longo e detalhado (400-500 chars)
- Para slides com imagem: texto conciso (máximo 180 chars)

JSON:
{"slides":[{"id":1,"text":"[180 chars se needsImage:true, 400-500 chars se needsImage:false]","isEdited":false,"originalText":"[mesmo]","needsImage":true|false,"imagePrompt":"Foto realista de [pessoa/objeto/cenário] especificamente relacionado ao tema"}],"caption":"[legenda]","hashtags":["#tag1","#tag2"]}`;

    // Try each model with timeout
    for (const config of modelConfigs) {
      try {
        console.log(`Attempting with model: ${config.model}`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: config.model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: config.maxTokens,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error with ${config.model}:`, response.status, errorText);
          continue; // Try next model
        }

        const data = await response.json();
        const generatedText = data.choices[0].message.content;

        console.log(`Success with model: ${config.model}`);
        console.log('Generated content:', generatedText);

        // Parse JSON response
        let parsedResponse;
        try {
          parsedResponse = JSON.parse(generatedText);
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          continue; // Try next model
        }

        return new Response(JSON.stringify(parsedResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error(`Model ${config.model} failed:`, error);
        continue; // Try next model
      }
    }

    // If all models failed
    throw new Error('Todos os modelos falharam. Tente novamente em alguns minutos.');

  } catch (error) {
    console.error('Error in generate-carousel function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Erro interno do servidor' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});