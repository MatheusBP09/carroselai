import { OPENAI_API_KEY } from '../constants/config';

interface GenerateCarouselParams {
  title?: string;
  username: string;
  content: string;
  instagramHandle: string;
  isVerified: boolean;
  slideCount?: number;
  contentType: string;
  contentFormat: string;
  callToAction: string;
  customCTA?: string;
  copywritingFramework: string;
  targetAudience?: string;
}

interface GenerateCarouselResponse {
  slides: Array<{
    id: number;
    text: string;
    isEdited: boolean;
    originalText: string;
  }>;
  caption: string;
  hashtags: string[];
}

interface ModelConfig {
  model: string;
  timeout: number;
  maxTokens: number;
}

export const generateCarousel = async (params: GenerateCarouselParams): Promise<GenerateCarouselResponse> => {
  const { title, username, content, instagramHandle, isVerified, slideCount = 10, contentType, contentFormat, callToAction, customCTA, copywritingFramework, targetAudience } = params;

  // Model cascade with fallback
  const modelConfigs: ModelConfig[] = [
    { model: 'gpt-4o', timeout: 30000, maxTokens: 2000 },
    { model: 'gpt-4.1-2025-04-14', timeout: 25000, maxTokens: 1800 },
    { model: 'gpt-4o-mini', timeout: 20000, maxTokens: 1500 }
  ];

  // Helper functions with optimized logic
  const detectAudience = (content: string): string => {
    const keywords = {
      business: ['empresa', 'negócio', 'vendas', 'marketing'],
      tech: ['tecnologia', 'programação', 'ia', 'digital'],
      health: ['saúde', 'exercício', 'bem-estar', 'fitness'],
      education: ['estudar', 'aprender', 'educação', 'curso']
    };
    
    const lower = content.toLowerCase();
    if (keywords.business.some(k => lower.includes(k))) return 'Empreendedores (25-45 anos)';
    if (keywords.tech.some(k => lower.includes(k))) return 'Profissionais tech (20-40 anos)';
    if (keywords.health.some(k => lower.includes(k))) return 'Interessados em saúde (18-50 anos)';
    if (keywords.education.some(k => lower.includes(k))) return 'Estudantes (18-35 anos)';
    return targetAudience || 'Crescimento pessoal (20-40 anos)';
  };

  const getFramework = (fw: string, count: number): string => {
    const mid = Math.floor(count/2);
    const structures = {
      aida: count === 1 ? 'AIDA: Atenção+Interesse+Desejo+Ação' : `AIDA: 1-2 Atenção, 3-${mid} Interesse, ${mid+1}-${count-1} Desejo, ${count} Ação`,
      pas: count === 1 ? 'PAS: Problema+Agitação+Solução' : `PAS: 1-2 Problema, 3-${mid} Agitação, ${mid+1}-${count} Solução`,
      before_after_bridge: count === 1 ? 'Antes+Depois+Ponte' : `Before-After-Bridge: 1-2 Antes, 3-4 Depois, 5-${count} Ponte`,
      problem_solution: count === 1 ? 'Problema+Solução' : `Problema-Solução: 1-${mid} Problema, ${mid+1}-${count} Solução`,
      storytelling: count === 1 ? 'Contexto+Conflito+Resolução+Lição' : `Story: 1-2 Contexto, 3-${mid} Conflito, ${mid+1}-${count-1} Resolução, ${count} Lição`
    };
    return structures[fw as keyof typeof structures] || `Lista: 1 Intro, 2-${count-1} Pontos, ${count} Conclusão`;
  };

  const getCTA = (cta: string, custom?: string): string => {
    if (cta === 'custom' && custom) return custom;
    const ctas = { follow: 'Me segue!', link_bio: 'Link na bio', comment: 'Comenta aqui', share: 'Compartilha', save: 'Salva este post', dm: 'Manda DM', tag_friends: 'Marca um amigo' };
    return ctas[cta as keyof typeof ctas] || ctas.follow;
  };

  const triggers = {
    educational: 'Curiosidade, Autoridade, Benefício',
    motivational: 'Urgência, Exclusividade, Inspiração', 
    tutorial: 'Utilidade, Simplicidade, Progresso',
    storytelling: 'Identificação, Suspense, Emoção',
    business: 'Autoridade, Urgência, ROI',
    lifestyle: 'Aspiração, Identidade, Tendência'
  };

  // Optimized prompt (~800 chars vs 2300)
  const audience = detectAudience(content);
  const framework = getFramework(copywritingFramework, slideCount);
  const ctaText = getCTA(callToAction, customCTA);
  const trigger = triggers[contentType as keyof typeof triggers] || triggers.educational;
  const dimensions = contentFormat === 'stories' ? '1080x1920' : '1080x1350';

  const prompt = `Crie carrossel Instagram:
DADOS: ${username} (@${instagramHandle})${isVerified ? ' ✓' : ''} | ${content}
CONFIG: ${contentType} | ${contentFormat} | ${slideCount} slides | ${audience}
FRAMEWORK: ${framework}
CTA: ${ctaText}

REGRAS:
- Sem emojis no texto, max 280 chars/slide
- Gatilhos: ${trigger}
- TODAS slides: needsImage: true + imagePrompt detalhado
- Dimensões: ${dimensions}
- Variedade visual: gráficos, ilustrações, conceitos
- Design 2024: gradientes, tipografia bold, cores vibrantes

JSON formato:
{"slides":[{"id":1,"text":"...","isEdited":false,"originalText":"...","needsImage":true,"imagePrompt":"Design impactante..."}],"caption":"...","hashtags":["tag1"]}`;

  // Progressive model fallback with timeout and detailed error handling
  let lastError: any;
  
  for (let i = 0; i < modelConfigs.length; i++) {
    const config = modelConfigs[i];
    console.log(`🤖 Attempting generation with ${config.model} (${i + 1}/${modelConfigs.length})`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), config.timeout);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: 'Especialista em marketing Instagram. Responda apenas JSON válido.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: config.maxTokens,
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error?.message || `API Error: ${response.status}`;
        
        // Check for quota/billing issues
        if (errorMsg.includes('insufficient_quota') || errorMsg.includes('billing')) {
          console.warn(`💳 Quota/billing issue with ${config.model}, trying next model...`);
          lastError = new Error(`Quota issue: ${errorMsg}`);
          continue;
        }
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error('Empty API response');
      }

      // Progressive validation with auto-correction
      const result = JSON.parse(content);
      
      if (!result.slides || !Array.isArray(result.slides)) {
        throw new Error('Invalid format: slides missing');
      }

      // Auto-correct slide count mismatch
      if (result.slides.length !== slideCount) {
        console.warn(`⚠️ Slide count mismatch: expected ${slideCount}, got ${result.slides.length}`);
        if (result.slides.length > slideCount) {
          result.slides = result.slides.slice(0, slideCount);
        } else {
          // Generate missing slides
          const missing = slideCount - result.slides.length;
          for (let j = 0; j < missing; j++) {
            result.slides.push({
              id: result.slides.length + 1,
              text: `Slide adicional ${result.slides.length + 1}`,
              isEdited: false,
              originalText: `Slide adicional ${result.slides.length + 1}`,
              needsImage: true,
              imagePrompt: 'Design moderno para slide adicional'
            });
          }
        }
      }

      // Validate essential fields
      if (!result.caption) result.caption = 'Legenda automática para o carrossel';
      if (!result.hashtags || !Array.isArray(result.hashtags)) result.hashtags = ['instagram', 'carrossel', contentType];

      console.log(`✅ Successfully generated with ${config.model}`);
      return result;

    } catch (error: any) {
      console.warn(`❌ ${config.model} failed:`, error.message);
      lastError = error;
      
      // Don't retry on parse errors or auth issues
      if (error.message.includes('JSON') || error.message.includes('401')) {
        if (i < modelConfigs.length - 1) continue;
        break;
      }
      
      // Continue to next model
      if (i < modelConfigs.length - 1) continue;
    }
  }

  // All models failed
  console.error('🚨 All models failed, throwing last error');
  
  // Enhanced error messages
  if (lastError?.message?.includes('401')) {
    throw new Error('Chave da API inválida. Verifique sua chave OpenAI.');
  }
  
  if (lastError?.message?.includes('insufficient_quota') || lastError?.message?.includes('billing')) {
    throw new Error('Cota da API esgotada. Verifique seu plano OpenAI ou tente novamente mais tarde.');
  }
  
  if (lastError?.message?.includes('rate_limit')) {
    throw new Error('Limite de requisições atingido. Aguarde alguns minutos e tente novamente.');
  }

  if (lastError?.message?.includes('timeout') || lastError?.name === 'AbortError') {
    throw new Error('Timeout na geração. A IA está sobrecarregada, tente novamente em alguns minutos.');
  }

  throw lastError || new Error('Erro desconhecido na geração do carrossel. Tente novamente.');
};