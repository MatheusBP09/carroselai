import { OPENAI_CONFIG } from '../constants/config';

console.log('🔧 Contextual Image Service loaded - Advanced AI-powered image generation');

export interface ContextualImageParams {
  slideText: string;
  slideIndex: number;
  totalSlides: number;
  contentTheme: string;
  contentType: string;
  contentFormat: string;
  username?: string;
}

interface ImageGenerationResponse {
  imageUrl: string;
  success: boolean;
  error?: string;
  prompt?: string;
}

export class ContextualImageService {
  
  /**
   * Generates contextual images that are truly related to the slide content
   */
  static async generateContextualImage(params: ContextualImageParams): Promise<ImageGenerationResponse> {
    const { slideText, slideIndex, totalSlides, contentTheme, contentType, contentFormat } = params;
    
    console.log('🎨 Starting CONTEXTUAL image generation:', {
      slideIndex: slideIndex + 1,
      totalSlides,
      textPreview: slideText.substring(0, 50) + '...',
      contentType,
      theme: contentTheme.substring(0, 30) + '...'
    });

    // Generate intelligent, contextual prompt
    const intelligentPrompt = this.createIntelligentPrompt(
      slideText,
      slideIndex,
      totalSlides,
      contentTheme,
      contentType
    );
    
    console.log('🧠 Generated intelligent prompt:', intelligentPrompt);

    try {
      const dimensions = this.getOptimalDimensions(contentFormat);
      
      const response = await fetch(OPENAI_CONFIG.imageEndpoint, {
        method: 'POST',
        headers: OPENAI_CONFIG.headers,
        body: JSON.stringify({
          prompt: intelligentPrompt,
          model: 'gpt-image-1',
          size: `${dimensions.width}x${dimensions.height}`,
          quality: 'high',
          output_format: 'png'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
        console.error('❌ Contextual image generation failed:', errorData);
        throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No image data returned from API');
      }

      const imageData = data.data[0];
      const imageUrl = imageData.b64_json 
        ? `data:image/png;base64,${imageData.b64_json}`
        : imageData.url;

      console.log('✅ Contextual image generated successfully for slide', slideIndex + 1);
      
      return {
        imageUrl,
        success: true,
        prompt: intelligentPrompt
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Contextual image generation error:', errorMessage);
      
      return {
        imageUrl: '',
        success: false,
        error: errorMessage,
        prompt: intelligentPrompt
      };
    }
  }

  /**
   * Creates intelligent prompts based on comprehensive content analysis
   */
  private static createIntelligentPrompt(
    slideText: string,
    slideIndex: number,
    totalSlides: number,
    contentTheme: string,
    contentType: string
  ): string {
    
    // Clean and prepare text for analysis
    const cleanSlideText = slideText.replace(/[🧵📊💡⚡🔥✨💰📈📉🎯🚀]/g, '').trim();
    const cleanTheme = contentTheme.replace(/[🧵📊💡⚡🔥✨💰📈📉🎯🚀]/g, '').trim();
    
    // Analyze slide position and purpose
    const slidePosition = this.analyzeSlidePosition(slideIndex, totalSlides);
    
    // Perform semantic analysis of content
    const semanticAnalysis = this.performSemanticAnalysis(cleanSlideText, cleanTheme);
    
    // Generate visual concept based on analysis
    const visualConcept = this.generateVisualConcept(
      semanticAnalysis,
      slidePosition,
      contentType,
      cleanSlideText
    );
    
    // Create final optimized prompt
    const finalPrompt = this.buildOptimizedPrompt(visualConcept, semanticAnalysis);
    
    return finalPrompt;
  }

  /**
   * Analyzes the position and purpose of the slide
   */
  private static analyzeSlidePosition(slideIndex: number, totalSlides: number): {
    position: 'intro' | 'development' | 'conclusion';
    purpose: string;
  } {
    const normalizedPosition = slideIndex / (totalSlides - 1);
    
    if (normalizedPosition <= 0.2) {
      return {
        position: 'intro',
        purpose: 'captar atenção e introduzir o tema'
      };
    } else if (normalizedPosition >= 0.8) {
      return {
        position: 'conclusion',
        purpose: 'resumir pontos-chave e motivar ação'
      };
    } else {
      return {
        position: 'development',
        purpose: 'desenvolver conceitos e fornecer informações'
      };
    }
  }

  /**
   * Performs comprehensive semantic analysis of content
   */
  private static performSemanticAnalysis(slideText: string, contentTheme: string): {
    category: string;
    keywords: string[];
    sentiment: 'motivational' | 'educational' | 'actionable' | 'informative';
    visualElements: string[];
  } {
    const combinedText = `${slideText} ${contentTheme}`.toLowerCase();
    
    // Enhanced category detection
    const categories = {
      'financeiro': {
        keywords: ['dinheiro', 'renda', 'financeiro', 'investir', 'lucro', 'ganhar', 'economia', 'patrimônio', 'poupança', 'orçamento', 'cartão', 'conta', 'banco'],
        visuals: ['gráficos financeiros', 'calculadora', 'moedas', 'carteira', 'cofre', 'investimentos']
      },
      'negocio': {
        keywords: ['negócio', 'empresa', 'vendas', 'cliente', 'marketing', 'empreender', 'startup', 'produto', 'serviço', 'mercado', 'estratégia', 'crescimento'],
        visuals: ['reunião de negócios', 'apresentação', 'handshake', 'escritório moderno', 'estratégia', 'crescimento empresarial']
      },
      'saude': {
        keywords: ['saúde', 'exercício', 'bem-estar', 'energia', 'fitness', 'treino', 'alimentação', 'dieta', 'nutrição', 'vida', 'corpo', 'mente'],
        visuals: ['pessoa exercitando', 'alimentos saudáveis', 'academia', 'meditação', 'bem-estar', 'vitalidade']
      },
      'tecnologia': {
        keywords: ['tecnologia', 'digital', 'ia', 'inovação', 'software', 'app', 'programação', 'internet', 'código', 'dados', 'sistema', 'plataforma'],
        visuals: ['interfaces digitais', 'código', 'robô', 'circuitos', 'telas', 'inovação tecnológica']
      },
      'educacao': {
        keywords: ['educação', 'aprender', 'curso', 'conhecimento', 'estudar', 'ensino', 'formação', 'desenvolvimento', 'skill', 'capacitação', 'livro', 'aula'],
        visuals: ['livros', 'graduação', 'aprendizado', 'professor', 'conhecimento', 'desenvolvimento pessoal']
      },
      'produtividade': {
        keywords: ['processo', 'passo', 'etapa', 'método', 'organização', 'planejamento', 'produtividade', 'gestão', 'tempo', 'eficiência', 'sistema', 'rotina'],
        visuals: ['organização', 'checklist', 'planejamento', 'cronograma', 'otimização', 'eficiência']
      },
      'relacionamento': {
        keywords: ['família', 'relacionamento', 'amor', 'casamento', 'filhos', 'comunicação', 'parceiro', 'conexão', 'confiança', 'intimidade'],
        visuals: ['família feliz', 'casal', 'abraço', 'conexão humana', 'amor', 'união']
      },
      'desenvolvimento': {
        keywords: ['crescimento', 'desenvolvimento', 'melhoria', 'evolução', 'progresso', 'meta', 'objetivo', 'sucesso', 'conquista', 'resultado', 'transformação'],
        visuals: ['crescimento', 'evolução', 'escada do sucesso', 'transformação', 'conquista', 'vitória']
      }
    };

    // Find best matching category
    let bestCategory = 'geral';
    let maxMatches = 0;
    let categoryKeywords: string[] = [];
    let visualElements: string[] = [];

    for (const [category, data] of Object.entries(categories)) {
      const matches = data.keywords.filter(keyword => combinedText.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestCategory = category;
        categoryKeywords = data.keywords.filter(keyword => combinedText.includes(keyword));
        visualElements = data.visuals;
      }
    }

    // Determine sentiment
    let sentiment: 'motivational' | 'educational' | 'actionable' | 'informative' = 'informative';
    if (combinedText.includes('como') || combinedText.includes('passo') || combinedText.includes('método')) {
      sentiment = 'actionable';
    } else if (combinedText.includes('inspire') || combinedText.includes('conquiste') || combinedText.includes('transforme')) {
      sentiment = 'motivational';
    } else if (combinedText.includes('aprenda') || combinedText.includes('entenda') || combinedText.includes('descubra')) {
      sentiment = 'educational';
    }

    return {
      category: bestCategory,
      keywords: categoryKeywords,
      sentiment,
      visualElements
    };
  }

  /**
   * Generates specific visual concepts based on analysis
   */
  private static generateVisualConcept(
    analysis: any,
    position: any,
    contentType: string,
    slideText: string
  ): {
    type: 'infographic' | 'illustration' | 'diagram' | 'concept' | 'photo';
    description: string;
    style: string;
  } {
    
    // Choose visual type based on content and position
    let visualType: 'infographic' | 'illustration' | 'diagram' | 'concept' | 'photo' = 'concept';
    
    if (slideText.includes('passo') || slideText.includes('etapa') || slideText.includes('processo')) {
      visualType = 'diagram';
    } else if (slideText.includes('dados') || slideText.includes('%') || slideText.includes('estatística')) {
      visualType = 'infographic';
    } else if (analysis.sentiment === 'motivational' || position.position === 'intro') {
      visualType = 'illustration';
    } else if (analysis.category === 'tecnologia' || analysis.category === 'negocio') {
      visualType = 'concept';
    } else {
      visualType = 'photo';
    }

    // Generate description based on visual type and content
    let description = '';
    let style = '';

    switch (visualType) {
      case 'infographic':
        description = `Infográfico moderno sobre ${analysis.category} mostrando ${slideText.split(' ').slice(0, 5).join(' ')}`;
        style = 'design gráfico minimalista, cores vibrantes, tipografia clara';
        break;
        
      case 'diagram':
        description = `Diagrama visual explicando o processo de ${slideText.split(' ').slice(0, 4).join(' ')}`;
        style = 'design esquemático limpo, setas direcionais, layout organizado';
        break;
        
      case 'illustration':
        description = `Ilustração conceitual representando ${analysis.visualElements[0] || analysis.category}`;
        style = 'arte digital moderna, cores harmoniosas, composição equilibrada';
        break;
        
      case 'concept':
        description = `Conceito visual abstrato sobre ${analysis.category} relacionado a: ${slideText.split(' ').slice(0, 6).join(' ')}`;
        style = 'design conceitual minimalista, formas geométricas, gradientes suaves';
        break;
        
      case 'photo':
        description = `Fotografia profissional mostrando ${analysis.visualElements[0] || 'cenário relacionado ao tema'}`;
        style = 'fotografia realista, iluminação natural, composição profissional';
        break;
    }

    return { type: visualType, description, style };
  }

  /**
   * Builds the final optimized prompt for image generation
   */
  private static buildOptimizedPrompt(visualConcept: any, analysis: any): string {
    const basePrompt = `${visualConcept.description}, ${visualConcept.style}`;
    
    // Add quality and style modifiers
    const qualityModifiers = [
      'alta qualidade',
      'design profissional',
      'composição bem balanceada',
      'cores harmoniosas',
      'sem texto na imagem',
      'estilo contemporâneo'
    ];

    // Add category-specific enhancements
    const categoryEnhancements = {
      'financeiro': 'elementos de crescimento e prosperidade',
      'negocio': 'atmosfera de sucesso empresarial',
      'saude': 'sensação de vitalidade e bem-estar',
      'tecnologia': 'visual futurista e inovador',
      'educacao': 'ambiente de aprendizado e conhecimento',
      'produtividade': 'organização e eficiência visual',
      'relacionamento': 'conexão humana e harmonia',
      'desenvolvimento': 'progresso e evolução visual'
    };

    const enhancement = categoryEnhancements[analysis.category as keyof typeof categoryEnhancements] || 'visual atrativo e relevante';
    
    return `${basePrompt}, ${enhancement}, ${qualityModifiers.join(', ')}`;
  }

  /**
   * Get optimal dimensions based on content format
   */
  private static getOptimalDimensions(format: string): { width: number; height: number } {
    const dimensions = {
      'stories': { width: 1024, height: 1792 },
      'reels': { width: 1024, height: 1792 },
      'feed': { width: 1024, height: 1024 },
      'default': { width: 1024, height: 1024 }
    };
    
    return dimensions[format as keyof typeof dimensions] || dimensions.default;
  }
}

export const contextualImageService = new ContextualImageService();