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
   * Generate fallback content when AI services fail
   */
  static generateFallbackContent(data: CarouselData): FallbackContent {
    const { username, instagramHandle, content, slideCount = 2, contentType, callToAction } = data;

    console.log('🔧 Generating fallback content due to API failure');

    // Create meaningful slides based on content
    const slides: FallbackSlide[] = [];
    
    // Slide 1: Introduction
    slides.push({
      id: 1,
      text: `🚀 ${username} compartilha: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
      isEdited: false,
      originalText: `🚀 ${username} compartilha: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`,
      needsImage: true,
      imagePrompt: `Foto profissional relacionada a ${contentType}`
    });

    // Additional slides based on slideCount
    for (let i = 2; i <= slideCount; i++) {
      const isLastSlide = i === slideCount;
      
      if (isLastSlide) {
        // Final slide with CTA
        slides.push({
          id: i,
          text: `💡 Gostou do conteúdo? ${this.getFallbackCTA(callToAction)} para mais dicas como esta! 🔥`,
          isEdited: false,
          originalText: `💡 Gostou do conteúdo? ${this.getFallbackCTA(callToAction)} para mais dicas como esta! 🔥`,
          needsImage: false
        });
      } else {
        // Middle slides with content breakdown
        const contentPart = Math.floor((i - 1) / (slideCount - 1) * content.length);
        const slideContent = content.substring(contentPart, contentPart + 200);
        
        slides.push({
          id: i,
          text: `📌 Ponto ${i - 1}: ${slideContent}${slideContent.length >= 200 ? '...' : ''}`,
          isEdited: false,
          originalText: `📌 Ponto ${i - 1}: ${slideContent}${slideContent.length >= 200 ? '...' : ''}`,
          needsImage: i % 2 === 0, // Alternate images
          imagePrompt: i % 2 === 0 ? `Ilustração sobre ${contentType}` : undefined
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