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
        
        // Optimize prompt based on retry attempt
        if (retries > 0) {
          params = this.optimizePrompt(params, retries);
        }
        
        const result = await generateContentImage(params);
        
        if (result.success && result.imageUrl) {
          this.stats.successfulGenerations++;
          console.log(`✅ [${slideIndex + 1}/${totalSlides}] Image generated successfully on attempt ${retries + 1}`);
          
          return {
            imageUrl: result.imageUrl,
            generated: true,
            fallbackUsed: false,
            retries
          };
        } else {
          throw new Error(result.error || 'Image generation failed without specific error');
        }
        
      } catch (error: any) {
        retries++;
        console.error(`❌ [${slideIndex + 1}/${totalSlides}] Attempt ${retries} failed:`, error.message);
        
        // Track specific error types for analytics
        if (this.isContentPolicyError(error.message)) {
          this.stats.contentPolicyErrors++;
          console.log('🔒 Content policy violation detected, generating fallback');
          break; // Don't retry content policy violations
        }
        
        if (error.message.includes('401')) {
          console.error('🔑 Authentication error - API key invalid');
          break; // Don't retry auth errors
        }
        
        if (error.message.includes('insufficient_quota') || error.message.includes('billing')) {
          this.stats.quotaErrors++;
          console.log('💳 Quota/billing issue detected');
          break; // Don't retry quota errors
        }
        
        // Continue retrying for rate limits and temporary errors
        if (retries <= this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, retries - 1),
            this.retryConfig.maxDelay
          );
          
          console.log(`⏳ [${slideIndex + 1}/${totalSlides}] Retrying in ${delay}ms...`);
          await this.delay(delay);
        }
      }
    }
    
    // Generate intelligent fallback
    console.log(`🎯 [${slideIndex + 1}/${totalSlides}] Generating intelligent fallback`);
    const fallbackUrl = await this.generateIntelligentFallback(params, username);
    this.stats.fallbacksUsed++;
    
    return {
      imageUrl: fallbackUrl,
      generated: false,
      fallbackUsed: true,
      retries
    };
  }

  // Helper method to detect content policy errors
  private isContentPolicyError(errorMessage: string): boolean {
    const contentPolicyKeywords = ['content_policy_violation', 'safety_system', 'policy', 'inappropriate'];
    return contentPolicyKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  // Get generation statistics
  getStats() {
    return {
      ...this.stats,
      successRate: this.stats.totalRequests > 0 ? (this.stats.successfulGenerations / this.stats.totalRequests) * 100 : 0
    };
  }

  // Enhanced prompt optimization with progressive simplification
  private optimizePrompt(params: ImageGenerationParams, attemptNumber: number): ImageGenerationParams {
    const optimizedParams = { ...params };
    
    switch (attemptNumber) {
      case 1:
        // First retry: Simplify prompt slightly
        if (optimizedParams.text) {
          optimizedParams.text = optimizedParams.text.split(' ').slice(0, 20).join(' ');
        }
        break;
      case 2:
        // Second retry: Generic educational content
        optimizedParams.text = 'professional educational content, modern business concept, clean design';
        optimizedParams.contentType = 'educational';
        break;
      case 3:
        // Final retry: Very simple prompt
        optimizedParams.text = 'modern professional image, business concept, minimal design';
        optimizedParams.contentType = 'educational';
        break;
    }
    
    console.log(`🔄 Optimized prompt for attempt ${attemptNumber + 1}: "${optimizedParams.text?.substring(0, 60)}..."`);
    return optimizedParams;
  }

  // Intelligent fallback generator
  private async generateIntelligentFallback(
    params: ImageGenerationParams,
    username?: string
  ): Promise<string> {
    try {
      const text = params.text || '';
      
      // Analyze content to choose appropriate fallback type
      if (text.toLowerCase().includes('perfil') || username) {
        return generateEnhancedProfileAvatar(username || 'Usuario');
      } else {
        // Generate content placeholder with proper options
        return generateEnhancedContentPlaceholder({
          width: 800,
          height: 600,
          quality: 1.0
        });
      }
    } catch (error) {
      console.error('❌ Fallback generation failed:', error);
      // Return a basic placeholder as last resort
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbnRlw7pkbyBFZHVjYWNpb25hbDwvdGV4dD48L3N2Zz4=';
    }
  }

  // Batch processing with enhanced monitoring and progress tracking
  async generateBatch(
    requests: (ImageGenerationParams & { slideIndex: number; username?: string })[],
    totalSlides: number,
    onProgress?: (progressPercent: number, currentIndex: number) => void
  ): Promise<EnhancedImageResult[]> {
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
    
    console.log(`🚀 Starting batch generation: ${requests.length} images`);
    
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const progress = ((i + 1) / requests.length) * 100;
      
      // Update progress
      onProgress?.(progress, i + 1);
      
      try {
        // Smart delay between requests to avoid rate limits
        if (i > 0) {
          const smartDelay = this.calculateSmartDelay(i, this.stats.quotaErrors);
          await this.delay(smartDelay);
        }
        
        const result = await this.generateWithFallback(
          request,
          request.slideIndex,
          totalSlides,
          request.username
        );
        
        results.push(result);
        
        // Log progress
        const stats = this.getStats();
        console.log(`📊 Progress: ${i + 1}/${requests.length} | Success: ${stats.successRate.toFixed(1)}% | Fallbacks: ${this.stats.fallbacksUsed}`);
        
      } catch (error) {
        console.error(`❌ Failed to process request ${i + 1}:`, error);
        // Add fallback result
        results.push({
          imageUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzY2NzM4NSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm88L3RleHQ+PC9zdmc+',
          generated: false,
          fallbackUsed: true,
          retries: 0
        });
      }
    }
    
    const duration = (Date.now() - startTime) / 1000;
    const stats = this.getStats();
    
    console.log(`🏁 Batch completed in ${duration}s: ${stats.successfulGenerations} generated, ${stats.fallbacksUsed} fallbacks`);
    if (stats.quotaErrors > 0) console.log(`💳 Quota errors: ${stats.quotaErrors}`);
    if (stats.contentPolicyErrors > 0) console.log(`🔒 Content policy errors: ${stats.contentPolicyErrors}`);
    
    return results;
  }

  // Calculate smart delay based on previous performance
  private calculateSmartDelay(requestIndex: number, quotaErrors: number): number {
    const baseDelay = 300; // Base delay between requests
    const quotaMultiplier = quotaErrors > 0 ? 2 : 1; // Increase delay if quota issues
    const progressiveDelay = Math.min(requestIndex * 50, 1000); // Progressive increase
    
    return baseDelay * quotaMultiplier + progressiveDelay;
  }

  // Helper delay function
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const enhancedImageService = new EnhancedImageService();