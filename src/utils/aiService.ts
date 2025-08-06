import { OPENAI_API_KEY } from '../constants/config';

interface GenerateCarouselParams {
  title?: string;
  username: string;
  content: string;
  instagramHandle: string;
  isVerified: boolean;
  slideCount?: number;
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
  const { title, username, content, instagramHandle, isVerified, slideCount = 10 } = params;

const prompt = `
Crie um carrossel para Instagram baseado nas seguintes informações:

${title ? `Título: ${title}` : ''}
Nome do criador: ${username}
Perfil: ${instagramHandle}${isVerified ? ' (verificado)' : ''}
Conteúdo: ${content}

IMPORTANTE: Gere EXATAMENTE ${slideCount} tweets que formem uma narrativa coesa sobre o conteúdo. Não gere mais nem menos que ${slideCount} slides.

DIRETRIZES PARA IMAGENS:
- SEMPRE avalie se cada slide se beneficiaria de uma imagem de apoio
- Para slides com conceitos visuais, estatísticas, comparações ou explicações técnicas, SEMPRE marque como needsImage: true
- Slides com dados, gráficos, tutoriais, processos ou comparações DEVEM ter imagens ilustrativas
- Slides de introdução/hooks podem ter imagens se forem impactantes
- Use 3-5 imagens por carrossel para maximizar o engagement

Cada tweet deve:
- Ter máximo 280 caracteres
- Ser um post completo e independente
- Formar uma sequência lógica (início, desenvolvimento, conclusão)
- Usar linguagem natural do Twitter
- Incluir quebras de linha quando necessário para legibilidade

${slideCount === 1 ? 
  'Para 1 tweet: Crie um post completo e impactante que resuma todo o conteúdo.' :
  slideCount === 2 ?
  'Para 2 tweets:\n- Tweet 1: Hook/introdução chamativa\n- Tweet 2: Desenvolvimento e conclusão' :
  'A sequência deve ter:\n- Tweet 1: Hook/introdução chamativa\n- Tweets 2-8: Desenvolvimento do conteúdo (pontos principais, exemplos, detalhes)\n- Tweet 9: Conclusão ou chamada para ação\n- Tweet 10: Engajamento (pergunta, reflexão ou CTA)'
}

Para CADA slide, avalie se precisa de imagem e adicione "needsImage": true/false e "imagePrompt": "descrição detalhada da imagem" quando necessário.

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