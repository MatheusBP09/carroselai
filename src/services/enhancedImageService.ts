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
    maxRetries: 3, // Increased retries for better success rate
    baseDelay: 600, // Faster initial retry
    maxDelay: 4000, // Optimized max delay
    backoffMultiplier: 1.6 // Balanced backoff
  };

  private stats = {
    totalRequests: 0,
    successfulGenerations: 0,
    fallbacksUsed: 0,
    quotaErrors: 0,
    contentPolicyErrors: 0
  };

  async generateWithFallback(
    params: ImageGenerationParams, 
    slideIndex: number,
    totalSlides: number,
    username?: string
  ): Promise<EnhancedImageResult> {
    this.stats.totalRequests++;
    let retries = 0;
    
    // Enhanced rate limiting with quota detection
    await rateLimitService.throttleRequest('image-generation');
    
    while (retries <= this.retryConfig.maxRetries) {
      try {
        console.log(`🎨 [${slideIndex + 1}/${totalSlides}] Attempt ${retries + 1}/${this.retryConfig.maxRetries + 1}`);
        
        // Progressive prompt optimization
        const optimizedParams = this.optimizePrompt(params, retries);
        
        const result = await generateContentImage(optimizedParams);
        
        this.stats.successfulGenerations++;
        console.log(`✅ Image generated successfully for slide ${slideIndex + 1}`);
        
        return {
          imageUrl: result.imageUrl,
          generated: true,
          fallbackUsed: false,
          retries
        };
        
      } catch (error: any) {
        retries++;
        console.warn(`❌ [${slideIndex + 1}/${totalSlides}] Attempt ${retries} failed:`, error.message);
        
        // Enhanced error categorization
        if (rateLimitService.isQuotaError(error)) {
          this.stats.quotaErrors++;
          console.log(`💳 Quota error detected, using fallback immediately`);
          break;
        }
        
        if (this.isContentPolicyError(error)) {
          this.stats.contentPolicyErrors++;
          console.log(`🔒 Content policy violation, using fallback`);
          break;
        }
        
        // Check if we should continue retrying
        if (retries > this.retryConfig.maxRetries) {
          console.log(`🔄 Max retries reached for slide ${slideIndex + 1}`);
          break;
        }
        
        // Progressive backoff with jitter
        const baseDelay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retries - 1);
        const jitter = Math.random() * 200; // Add randomness to prevent thundering herd
        const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelay);
        
        console.log(`⏳ Waiting ${Math.round(delay)}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Generate intelligent fallback with detailed logging
    this.stats.fallbacksUsed++;
    console.log(`🎯 Using intelligent fallback for slide ${slideIndex + 1} (${this.stats.fallbacksUsed}/${this.stats.totalRequests} total fallbacks)`);
    
    const fallbackUrl = this.generateIntelligentFallback(params, slideIndex, username);
    
    return {
      imageUrl: fallbackUrl,
      generated: false,
      fallbackUsed: true,
      retries
    };
  }

  // Enhanced error detection
  private isContentPolicyError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || '';
    return msg.includes('content_policy') || 
           msg.includes('safety') ||
           msg.includes('inappropriate') ||
           msg.includes('policy violation');
  }

  // Get real-time statistics
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalRequests > 0 ? (this.stats.successfulGenerations / this.stats.totalRequests) * 100 : 0,
      fallbackRate: this.stats.totalRequests > 0 ? (this.stats.fallbacksUsed / this.stats.totalRequests) * 100 : 0
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
        // Third attempt - extract main subject only
        const mainSubject = optimizedText.split(',')[0] || 'pessoa em ambiente profissional';
        optimizedText = `Foto realista: ${mainSubject}, ambiente moderno, iluminação natural`;
        break;
      default:
        // Final attempt - minimal reliable prompt
        optimizedText = `Foto profissional de pessoa, ambiente moderno, iluminação natural`;
    }
    
    return {
      ...params,
      text: optimizedText
    };
  }

  // Legacy method for backward compatibility - now uses enhanced detection
  private shouldUseFallback(error: any): boolean {
    return rateLimitService.isQuotaError(error) || this.isContentPolicyError(error);
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
    console.log(`🚀 Starting batch generation: ${requests.length} images`);
    const startTime = Date.now();
    const results: EnhancedImageResult[] = [];
    
    // Reset stats for this batch
    this.stats = {
      totalRequests: 0,
      successfulGenerations: 0,
      fallbacksUsed: 0,
      quotaErrors: 0,
      contentPolicyErrors: 0
    };
    
    for (let i = 0; i < requests.length; i++) {
      const { params, slideIndex, username } = requests[i];
      
      // Update progress with detailed status
      const progressPercent = ((i + 1) / requests.length) * 100;
      onProgress?.(progressPercent, i + 1);
      
      // Smart delay management - reduced delay after successful generations
      if (i > 0) {
        const previousResult = results[i - 1];
        const delay = previousResult?.generated ? 
          rateLimitService.getDelayBetweenRequests() * 0.8 : // Faster after success
          rateLimitService.getDelayBetweenRequests();
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const result = await this.generateWithFallback(params, slideIndex, totalSlides, username);
      results.push(result);
      
      const status = result.generated ? 
        `✅ Generated (${result.retries} retries)` : 
        `🎯 Fallback (after ${result.retries} attempts)`;
      
      console.log(`[${i + 1}/${totalSlides}] ${status}`);
      
      // Log intermediate stats every 3 slides
      if ((i + 1) % 3 === 0 || i === requests.length - 1) {
        const stats = this.getStats();
        console.log(`📊 Progress: ${Math.round(stats.successRate)}% success, ${Math.round(stats.fallbackRate)}% fallbacks`);
      }
    }
    
    // Final batch statistics
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    const stats = this.getStats();
    
    console.log(`🏁 Batch completed in ${duration}s: ${stats.successfulGenerations} generated, ${stats.fallbacksUsed} fallbacks`);
    if (stats.quotaErrors > 0) console.log(`💳 Quota errors: ${stats.quotaErrors}`);
    if (stats.contentPolicyErrors > 0) console.log(`🔒 Content policy errors: ${stats.contentPolicyErrors}`);
    
    return results;
  }
}

export const enhancedImageService = new EnhancedImageService();