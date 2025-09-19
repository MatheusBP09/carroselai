/**
 * Fallback content service for when APIs fail
 */

import { CarouselData } from '@/types/carousel';

export interface FallbackSlide {
  id: number;
  text: string;
  isEdited: boolean;
  originalText: string;
  needsImage?: boolean;
  imagePrompt?: string;
}

export interface FallbackContent {
  slides: FallbackSlide[];
  caption: string;
  hashtags: string[];
}

export class FallbackContentService {
  /**
   * Generate creative fallback content when AI services fail
   */
  static generateFallbackContent(data: CarouselData): FallbackContent {
    const { username, instagramHandle, content, slideCount = 2, contentType, callToAction } = data;

    console.log('🔧 Generating CREATIVE fallback content due to API failure');
    console.log('📝 Theme:', content);
    console.log('🎯 Content Type:', contentType);

    // Generate creative content based on the theme instead of just splitting text
    const slides: FallbackSlide[] = [];
    
    // Use intelligent templates to create new content based on the theme
    const creativeContent = this.generateCreativeContentFromTheme(content, contentType, slideCount);
    
    for (let i = 1; i <= slideCount; i++) {
      const isLastSlide = i === slideCount;
      
      if (isLastSlide) {
        // Final slide with CTA
        slides.push({
          id: i,
          text: `💡 ${creativeContent.cta || `Gostou do conteúdo? ${this.getFallbackCTA(callToAction)} para mais dicas como esta! 🔥`}`,
          isEdited: false,
          originalText: `💡 ${creativeContent.cta || `Gostou do conteúdo? ${this.getFallbackCTA(callToAction)} para mais dicas como esta! 🔥`}`,
          needsImage: false
        });
      } else {
        // Create meaningful slides with new content based on theme
        const slideContent = creativeContent.slides[i - 1] || this.getDefaultSlideContent(content, contentType, i);
        
        slides.push({
          id: i,
          text: slideContent,
          isEdited: false,
          originalText: slideContent,
          needsImage: true,
          imagePrompt: `Imagem profissional e atrativa sobre ${contentType}: ${this.extractKeywords(content).join(', ')}`
        });
      }
    }

    // Generate caption
    const caption = `✨ ${content.substring(0, 80)}... 

Siga @${instagramHandle} para mais conteúdo sobre ${contentType}! 

${this.getFallbackCTA(callToAction)} 🚀`;

    // Generate hashtags
    const hashtags = this.generateFallbackHashtags(contentType, content);

    return {
      slides,
      caption,
      hashtags
    };
  }

  private static getFallbackCTA(callToAction: string): string {
    const ctas = {
      follow: 'Me segue',
      link_bio: 'Confere o link na bio',
      comment: 'Comenta aqui',
      share: 'Compartilha',
      save: 'Salva este post',
      dm: 'Manda DM',
      tag_friends: 'Marca um amigo'
    };
    
    return ctas[callToAction as keyof typeof ctas] || 'Me segue';
  }

  /**
   * Generate creative content based on theme and content type
   */
  private static generateCreativeContentFromTheme(theme: string, contentType: string, slideCount: number): { slides: string[], cta: string } {
    const keywords = this.extractKeywords(theme);
    const templates = this.getContentTemplates(contentType);
    
    const slides: string[] = [];
    
    // Generate slide 1 (intro/hook)
    if (slideCount >= 1) {
      slides.push(templates.intro.replace('{theme}', theme).replace('{keywords}', keywords.slice(0, 2).join(' e ')));
    }
    
    // Generate middle slides with expanded content
    for (let i = 2; i < slideCount; i++) {
      const point = templates.points[Math.min(i - 2, templates.points.length - 1)];
      slides.push(point.replace('{theme}', theme).replace('{keywords}', keywords[i % keywords.length] || 'sucesso'));
    }
    
    const cta = templates.cta.replace('{theme}', theme);
    
    return { slides, cta };
  }

  /**
   * Extract relevant keywords from theme
   */
  private static extractKeywords(theme: string): string[] {
    const words = theme.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return words.slice(0, 5);
  }

  /**
   * Get content templates based on content type
   */
  private static getContentTemplates(contentType: string): { intro: string, points: string[], cta: string } {
    const templates = {
      educational: {
        intro: '📚 Você sabia que {theme}? Vou te ensinar os pontos mais importantes sobre {keywords}!',
        points: [
          '🎓 Primeiro passo: entenda que {keywords} é fundamental para quem quer dominar {theme}',
          '💡 Dica importante: a maioria das pessoas não sabe que {keywords} pode transformar seus resultados',
          '🚀 Estratégia avançada: use {keywords} para acelerar seu progresso com {theme}'
        ],
        cta: 'Quer dominar {theme}? Me segue para mais conteúdos educativos!'
      },
      motivational: {
        intro: '💪 Sua jornada com {theme} começa AGORA! Vou te mostrar como {keywords} pode mudar tudo!',
        points: [
          '🔥 Acredite: {keywords} é o que separa quem sonha de quem realiza com {theme}',
          '⚡ Mindset: quando você domina {keywords}, {theme} se torna mais simples',
          '🎯 Foco total: use {keywords} como sua bússola para alcançar seus objetivos'
        ],
        cta: 'Pronto para transformar sua vida com {theme}? Vem comigo!'
      },
      business: {
        intro: '💼 {theme} pode ser o diferencial do seu negócio! Vou mostrar como {keywords} gera resultados reais.',
        points: [
          '📈 Resultado comprovado: empresas que usam {keywords} têm 3x mais sucesso com {theme}',
          '💰 ROI garantido: investir em {keywords} é investir no futuro do seu {theme}',
          '🎯 Estratégia vencedora: combine {keywords} com {theme} para dominar seu mercado'
        ],
        cta: 'Quer escalar seu negócio com {theme}? Me segue para mais estratégias!'
      },
      lifestyle: {
        intro: '✨ {theme} pode transformar seu dia a dia! Descubra como {keywords} faz a diferença na sua vida.',
        points: [
          '🌟 Qualidade de vida: {keywords} é o segredo para aproveitar melhor {theme}',
          '🎨 Estilo único: personalize {keywords} e torne {theme} parte da sua identidade',
          '🌱 Crescimento pessoal: use {keywords} para evoluir constantemente com {theme}'
        ],
        cta: 'Quer mais dicas de {theme} para sua vida? Me acompanha!'
      }
    };

    return templates[contentType as keyof typeof templates] || templates.educational;
  }

  /**
   * Get default slide content when creative generation fails
   */
  private static getDefaultSlideContent(theme: string, contentType: string, slideIndex: number): string {
    const defaultContent = [
      `🔑 Ponto essencial sobre ${theme}: isso pode mudar sua perspectiva completamente!`,
      `⭐ Segredo revelado: a maioria não sabe esse aspecto importante de ${theme}`,
      `🎯 Aplicação prática: como usar ${theme} no seu dia a dia de forma inteligente`
    ];
    
    return defaultContent[Math.min(slideIndex - 1, defaultContent.length - 1)];
  }

  private static generateFallbackHashtags(contentType: string, content: string): string[] {
    const baseHashtags = ['#instagram', '#carrossel'];
    
    // Content type specific hashtags
    const typeHashtags = {
      educational: ['#educacao', '#aprendizado', '#dicas'],
      motivational: ['#motivacao', '#inspiracao', '#mindset'],
      tutorial: ['#tutorial', '#comoFazer', '#passo a passo'],
      storytelling: ['#historia', '#experiencia', '#vida'],
      business: ['#negocios', '#empreendedorismo', '#vendas'],
      lifestyle: ['#lifestyle', '#vida', '#bem estar'],
      tips: ['#dicas', '#tips', '#conselhos'],
      personal: ['#pessoal', '#reflexao', '#desenvolvimento']
    };

    const specificHashtags = typeHashtags[contentType as keyof typeof typeHashtags] || ['#conteudo'];
    
    // Extract keywords from content for additional hashtags
    const keywords = content.toLowerCase().match(/\b\w{4,}\b/g) || [];
    const contentHashtags = keywords
      .slice(0, 2)
      .map(word => `#${word.replace(/[^a-zA-Z0-9]/g, '')}`);

    return [...baseHashtags, ...specificHashtags, ...contentHashtags].slice(0, 8);
  }
}