import { generateContentImage, ImageGenerationParams } from './imageGenerationService';
import { generateEnhancedProfileAvatar, generateEnhancedContentPlaceholder } from '@/utils/enhancedFallbackGenerator';
import { rateLimitService } from './rateLimitService';

interface EnhancedImageResult {
  imageUrl: string;
  generated: boolean;
  fallbackUsed: boolean;
  retries: number;
}

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

class EnhancedImageService {
  private retryConfig: RetryConfig = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 8000,
    backoffMultiplier: 2
  };

  async generateWithFallback(
    params: ImageGenerationParams, 
    slideIndex: number,
    totalSlides: number,
    username?: string
  ): Promise<EnhancedImageResult> {
    let retries = 0;
    
    // Apply rate limiting
    await rateLimitService.throttleRequest('image-generation');
    
    while (retries <= this.retryConfig.maxRetries) {
      try {
        console.log(`🎨 Attempting image generation for slide ${slideIndex + 1}/${totalSlides} (attempt ${retries + 1})`);
        
        // Progressive prompt simplification
        const optimizedParams = this.optimizePrompt(params, retries);
        
        const result = await generateContentImage(optimizedParams);
        
        return {
          imageUrl: result.imageUrl,
          generated: true,
          fallbackUsed: false,
          retries
        };
        
      } catch (error: any) {
        retries++;
        console.warn(`⚠️ Image generation attempt ${retries} failed:`, error.message);
        
        // Check if we should continue retrying
        if (retries > this.retryConfig.maxRetries || this.shouldUseFallback(error)) {
          break;
        }
        
        // Progressive backoff delay
        const delay = Math.min(
          this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retries - 1),
          this.retryConfig.maxDelay
        );
        
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Generate enhanced fallback
    console.log(`🎯 Using enhanced fallback for slide ${slideIndex + 1}`);
    const fallbackUrl = this.generateIntelligentFallback(params, slideIndex, username);
    
    return {
      imageUrl: fallbackUrl,
      generated: false,
      fallbackUsed: true,
      retries
    };
  }

  private optimizePrompt(params: ImageGenerationParams, retryAttempt: number): ImageGenerationParams {
    let optimizedText = params.text;
    
    // Progressive simplification based on retry attempt
    switch (retryAttempt) {
      case 0:
        // First attempt - use full prompt
        break;
      case 1:
        // Second attempt - simplify complex terms
        optimizedText = optimizedText
          .replace(/(\w+)(ação|ção|são)/g, '$1')
          .replace(/gradiente[s]?\s+\w+/gi, 'gradiente')
          .replace(/tipografia\s+\w+/gi, 'tipografia moderna');
        break;
      case 2:
        // Third attempt - basic version
        optimizedText = `Design moderno para slide de Instagram, ${params.contentFormat || 'feed'} format, cores vibrantes`;
        break;
      default:
        // Final attempt - minimal prompt
        optimizedText = `Modern Instagram design, ${params.contentFormat || 'feed'} format`;
    }
    
    return {
      ...params,
      text: optimizedText
    };
  }

  private shouldUseFallback(error: any): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    
    // Use fallback for quota/billing issues
    if (errorMessage.includes('quota') || 
        errorMessage.includes('billing') || 
        errorMessage.includes('insufficient_quota')) {
      return true;
    }
    
    // Use fallback for content policy violations
    if (errorMessage.includes('content_policy') || 
        errorMessage.includes('safety')) {
      return true;
    }
    
    return false;
  }

  private generateIntelligentFallback(
    params: ImageGenerationParams, 
    slideIndex: number, 
    username?: string
  ): string {
    // Determine the best fallback type based on content
    const text = params.text.toLowerCase();
    
    // For profile/avatar related content
    if (text.includes('perfil') || text.includes('avatar') || username) {
      return generateEnhancedProfileAvatar(username || 'User', {
        width: 400,
        height: 400,
        quality: 0.9
      });
    }
    
    // For content placeholders
    return generateEnhancedContentPlaceholder({
      width: params.width || (params.contentFormat === 'stories' ? 1080 : 1080),
      height: params.height || (params.contentFormat === 'stories' ? 1920 : 1350),
      quality: 0.9
    });
  }

  async generateBatch(
    requests: Array<{
      params: ImageGenerationParams;
      slideIndex: number;
      username?: string;
    }>,
    totalSlides: number,
    onProgress?: (progress: number, current: number) => void
  ): Promise<EnhancedImageResult[]> {
    const results: EnhancedImageResult[] = [];
    
    for (let i = 0; i < requests.length; i++) {
      const { params, slideIndex, username } = requests[i];
      
      // Update progress
      onProgress?.(((i + 1) / requests.length) * 100, i + 1);
      
      // Add delay between requests (except for the first one)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, rateLimitService.getDelayBetweenRequests()));
      }
      
      const result = await this.generateWithFallback(params, slideIndex, totalSlides, username);
      results.push(result);
      
      console.log(`✅ Slide ${slideIndex + 1}/${totalSlides} completed: ${result.generated ? 'Generated' : 'Fallback'}`);
    }
    
    return results;
  }
}

export const enhancedImageService = new EnhancedImageService();