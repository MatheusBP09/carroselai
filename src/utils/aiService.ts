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

export const generateCarousel = async (params: GenerateCarouselParams): Promise<GenerateCarouselResponse> => {
  const { title, username, content, instagramHandle, isVerified, slideCount = 10, contentType, contentFormat, callToAction, customCTA, copywritingFramework, targetAudience } = params;

// Auto-detect target audience based on content
const detectTargetAudience = (content: string, contentType: string): string => {
  const businessKeywords = ['empresa', 'negócio', 'vendas', 'marketing', 'empreendedor', 'startup', 'lucro'];
  const techKeywords = ['tecnologia', 'programação', 'desenvolvimento', 'software', 'ia', 'digital'];
  const healthKeywords = ['saúde', 'exercício', 'nutrição', 'bem-estar', 'fitness', 'mental'];
  const educationKeywords = ['estudar', 'aprender', 'educação', 'conhecimento', 'curso', 'ensino'];
  
  const lowerContent = content.toLowerCase();
  
  if (businessKeywords.some(keyword => lowerContent.includes(keyword))) return 'Empreendedores e profissionais de negócios (25-45 anos)';
  if (techKeywords.some(keyword => lowerContent.includes(keyword))) return 'Profissionais de tecnologia e entusiastas de inovação (20-40 anos)';
  if (healthKeywords.some(keyword => lowerContent.includes(keyword))) return 'Pessoas interessadas em saúde e bem-estar (18-50 anos)';
  if (educationKeywords.some(keyword => lowerContent.includes(keyword))) return 'Estudantes e profissionais em desenvolvimento (18-35 anos)';
  
  return targetAudience || 'Público geral interessado em crescimento pessoal (20-40 anos)';
};

const detectedAudience = detectTargetAudience(content, contentType);

// Get framework-specific structure
const getFrameworkStructure = (framework: string, slideCount: number): string => {
  switch (framework) {
    case 'aida':
      return slideCount === 1 ? 
        'Estrutura AIDA: Atenção + Interesse + Desejo + Ação em um slide impactante' :
        `Estrutura AIDA:\n- Slides 1-2: ATENÇÃO (hook forte, problema urgente)\n- Slides 3-${Math.floor(slideCount/2)}: INTERESSE (dados, benefícios)\n- Slides ${Math.floor(slideCount/2)+1}-${slideCount-1}: DESEJO (transformação, resultados)\n- Slide ${slideCount}: AÇÃO (CTA claro)`;
    
    case 'pas':
      return slideCount === 1 ?
        'Estrutura PAS: Problema + Agitação + Solução em um slide poderoso' :
        `Estrutura PAS:\n- Slides 1-2: PROBLEMA (dor real do público)\n- Slides 3-${Math.floor(slideCount/2)}: AGITAÇÃO (consequências, urgência)\n- Slides ${Math.floor(slideCount/2)+1}-${slideCount}: SOLUÇÃO (benefícios, CTA)`;
    
    case 'before_after_bridge':
      return slideCount === 1 ?
        'Estrutura Before-After-Bridge: Estado atual + Futuro desejado + Ponte (solução)' :
        `Estrutura Before-After-Bridge:\n- Slides 1-2: BEFORE (situação atual, frustrações)\n- Slides 3-4: AFTER (resultado desejado, benefícios)\n- Slides 5-${slideCount}: BRIDGE (como chegar lá, CTA)`;
    
    case 'problem_solution':
      return slideCount === 1 ?
        'Estrutura Problema-Solução: Problema claro + Solução prática' :
        `Estrutura Problema-Solução:\n- Slides 1-${Math.floor(slideCount/2)}: PROBLEMA (identificação, impacto)\n- Slides ${Math.floor(slideCount/2)+1}-${slideCount}: SOLUÇÃO (passos, benefícios, CTA)`;
    
    case 'storytelling':
      return slideCount === 1 ?
        'Narrativa completa: Contexto + Conflito + Resolução + Lição' :
        `Storytelling:\n- Slides 1-2: CONTEXTO (situação inicial)\n- Slides 3-${Math.floor(slideCount/2)}: CONFLITO (desafio, obstáculo)\n- Slides ${Math.floor(slideCount/2)+1}-${slideCount-1}: RESOLUÇÃO (como resolveu)\n- Slide ${slideCount}: LIÇÃO/CTA (aprendizado aplicável)`;
    
    default: // listicle
      return slideCount === 1 ?
        'Lista concisa: Introdução + Pontos principais + Conclusão' :
        `Lista estruturada:\n- Slide 1: INTRODUÇÃO (promessa, benefício)\n- Slides 2-${slideCount-1}: PONTOS (um por slide, com detalhes)\n- Slide ${slideCount}: CONCLUSÃO/CTA`;
  }
};

// Get CTA based on selection
const getCTAText = (cta: string, customCTA?: string): string => {
  if (cta === 'custom' && customCTA) return customCTA;
  
  const ctas = {
    follow: 'Me segue para mais conteúdos como este!',
    link_bio: 'Link na bio para saber mais',
    comment: 'Comenta aqui embaixo sua opinião',
    share: 'Compartilha com quem precisa ver isso',
    save: 'Salva este post para consultar depois',
    dm: 'Manda DM se tiver dúvidas',
    tag_friends: 'Marca aquele amigo que precisa ver isso'
  };
  
  return ctas[cta as keyof typeof ctas] || ctas.follow;
};

// Get psychological triggers
const getPsychologicalTriggers = (contentType: string): string => {
  const triggers = {
    educational: 'Curiosidade (revelar segredos), Autoridade (dados/estatísticas), Benefício (transformação)',
    motivational: 'Urgência (momento certo), Exclusividade (poucos fazem), Inspiração (superação)',
    tutorial: 'Utilidade (resultado prático), Simplicidade (fácil de seguir), Progresso (passo a passo)',
    storytelling: 'Identificação (relatable), Suspense (o que aconteceu), Emoção (conexão humana)',
    business: 'Autoridade (expertise), Urgência (oportunidade), Benefício (ROI/resultados)',
    lifestyle: 'Aspiração (vida desejada), Identidade (quem você quer ser), Tendência (popular)',
    tips: 'Utilidade (aplicável), Curiosidade (insights), Simplicidade (fácil implementar)',
    personal: 'Autenticidade (vulnerabilidade), Identificação (experiências comuns), Inspiração'
  };
  
  return triggers[contentType as keyof typeof triggers] || triggers.educational;
};

const prompt = `
Crie um carrossel para Instagram baseado nas seguintes especificações:

INFORMAÇÕES BÁSICAS:
${title ? `Título: ${title}` : ''}
Criador: ${username} (@${instagramHandle})${isVerified ? ' ✓' : ''}
Conteúdo: ${content}

CONFIGURAÇÕES:
- Tipo: ${contentType}
- Formato: ${contentFormat}
- Framework: ${copywritingFramework}
- Público-alvo: ${detectedAudience}
- CTA desejado: ${getCTAText(callToAction, customCTA)}
- Número de slides: ${slideCount}

DIRETRIZES OBRIGATÓRIAS:

📝 CONTEÚDO:
- PROIBIDO usar emojis no texto dos slides
- Máximo 280 caracteres por slide
- Aplicar gatilhos psicológicos: ${getPsychologicalTriggers(contentType)}
- Tom personalizado para o público-alvo detectado
- Linguagem natural e conversacional
- ${getFrameworkStructure(copywritingFramework, slideCount)}

🖼️ IMAGENS (CRÍTICO):
- Dimensões EXATAS: ${contentFormat === 'stories' ? '1080x1920' : contentFormat === 'reels' ? '1080x1920' : '1080x1080'}
- Marcar 3-5 slides com needsImage: true
- Priorizar slides com: dados, comparações, processos, conceitos visuais
- Prompts seguindo tendências Instagram 2024: minimalismo, cores vibrantes, tipografia bold
- Considerar formato ${contentFormat} na composição visual

🎯 OTIMIZAÇÃO POR FORMATO:
${contentFormat === 'feed' ? 
  '- Posts quadrados otimizados para descoberta\n- Texto legível em preview pequena\n- Primeira slide como capa atrativa' :
  contentFormat === 'stories' ? 
  '- Formato vertical, texto grande e centralizado\n- Elementos visuais no topo/centro\n- Swipe up/CTA visível' :
  '- Formato vertical para Reels\n- Texto conciso e impactante\n- Primeira slide como hook forte'
}

🧠 PERSUASÃO E INFLUÊNCIA:
- Princípio da Reciprocidade: ofereça valor primeiro
- Prova Social: use "milhares fazem isso", "método comprovado"
- Escassez: "poucos sabem", "estratégia exclusiva"
- Autoridade: dados, estatísticas, expertise
- Compromisso: convide à ação/reflexão

💬 STORYTELLING COMPLEMENTAR:
- Conectar slides com elementos narrativos
- Usar transitions suaves ("Mas aqui está o problema...", "E foi aí que descobri...")
- Criar expectativa entre slides
- Resolver tensões gradualmente

Responda apenas com um JSON válido no seguinte formato:
{
  "slides": [
    {
      "id": 1,
      "text": "🧵 THREAD: Como dominar [tópico]\n\nVou te ensinar os 9 passos que mudaram minha vida profissional:\n\n👇",
      "isEdited": false,
      "originalText": "🧵 THREAD: Como dominar [tópico]\n\nVou te ensinar os 9 passos que mudaram minha vida profissional:\n\n👇",
      "needsImage": false
    },
    {
      "id": 2,
      "text": "📊 Estatísticas mostram que 73% das empresas...",
      "isEdited": false,
      "originalText": "📊 Estatísticas mostram que 73% das empresas...",
      "needsImage": true,
      "imagePrompt": "Gráfico moderno mostrando estatísticas de empresas, design minimalista"
    }
  ],
  "caption": "Legenda atrativa para o carrossel...",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em marketing digital e criação de conteúdo para Instagram. Sempre responda apenas com JSON válido.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error?.message || 
        `Erro da API OpenAI: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('Resposta vazia da API');
    }

    try {
      const result = JSON.parse(content);
      
      // Validate response structure
      if (!result.slides || !Array.isArray(result.slides)) {
        throw new Error('Formato de resposta inválido: slides não encontrados');
      }

      if (result.slides.length !== slideCount) {
        throw new Error(`Número incorreto de slides: esperado ${slideCount}, recebido ${result.slides.length}`);
      }

      if (!result.caption || !result.hashtags) {
        throw new Error('Formato de resposta inválido: legenda ou hashtags não encontradas');
      }

      return result;
    } catch (parseError) {
      console.error('Erro ao parsear JSON:', content);
      throw new Error('Erro ao processar resposta da IA. Tente novamente.');
    }

  } catch (error: any) {
    console.error('Erro na geração do carrossel:', error);
    
    if (error.message.includes('401')) {
      throw new Error('Chave da API inválida. Verifique sua chave OpenAI.');
    }
    
    if (error.message.includes('insufficient_quota')) {
      throw new Error('Cota da API esgotada. Verifique seu plano OpenAI.');
    }
    
    if (error.message.includes('rate_limit')) {
      throw new Error('Muitas solicitações. Aguarde um momento e tente novamente.');
    }

    throw error;
  }
};