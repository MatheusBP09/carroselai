/**
 * Enhanced rendering service for high-quality Instagram carousel images
 */

import { generateTwitterImage } from '@/utils/twitter';
import { TwitterImageParams } from '@/utils/twitter/types';
import { TwitterImageDebugger } from '@/utils/twitter/debugUtils';

export interface RenderingQuality {
  multiplier: number;
  format: 'png' | 'jpeg';
  quality: number;
  enableRetinaScaling: boolean;
}

export interface RenderingResult {
  dataUrl: string;
  size: number;
  quality: RenderingQuality;
  metrics: {
    renderTime: number;
    retries: number;
    success: boolean;
  };
}

export class EnhancedRenderingService {
  private static readonly QUALITY_PROFILES = {
    instagram: {
      multiplier: 2,
      format: 'png' as const,
      quality: 1,
      enableRetinaScaling: false,
    },
    preview: {
      multiplier: 1,
      format: 'png' as const,
      quality: 0.8,
      enableRetinaScaling: false,
    },
    high: {
      multiplier: 3,
      format: 'png' as const,
      quality: 1,
      enableRetinaScaling: false,
    },
  };

  private static readonly MAX_RETRIES = 3;
  private static readonly MIN_IMAGE_SIZE = 50000; // 50KB minimum for quality

  /**
   * Render Twitter-style image with enhanced quality and error handling
   */
  static async renderWithQuality(
    params: TwitterImageParams,
    qualityProfile: keyof typeof EnhancedRenderingService.QUALITY_PROFILES = 'instagram'
  ): Promise<RenderingResult> {
    const startTime = performance.now();
    const quality = this.QUALITY_PROFILES[qualityProfile];

    let retries = 0;
    let lastError: Error | null = null;

    while (retries < this.MAX_RETRIES) {
      try {
        TwitterImageDebugger.log(`Rendering attempt ${retries + 1}/${this.MAX_RETRIES}`, {
          quality,
          params: { username: params.username, textLength: params.text.length }
        });

        // Generate the image using the enhanced Twitter generator
        const dataUrl = await generateTwitterImage(params);

        // Validate the generated image
        const validation = this.validateRenderedImage(dataUrl);
        if (!validation.isValid) {
          throw new Error(`Image validation failed: ${validation.reason}`);
        }

        const renderTime = performance.now() - startTime;

        TwitterImageDebugger.log('Rendering completed successfully', {
          renderTime: `${renderTime.toFixed(2)}ms`,
          retries,
          imageSize: validation.size
        });

        return {
          dataUrl,
          size: validation.size,
          quality,
          metrics: {
            renderTime,
            retries,
            success: true,
          },
        };

      } catch (error) {
        lastError = error as Error;
        retries++;

        TwitterImageDebugger.error(`Rendering attempt ${retries} failed`, error);

        if (retries < this.MAX_RETRIES) {
          // Wait before retrying (exponential backoff)
          await this.delay(Math.pow(2, retries) * 500);
        }
      }
    }

    // All retries failed
    const renderTime = performance.now() - startTime;
    TwitterImageDebugger.error('All rendering attempts failed', lastError);

    throw new Error(`Failed to render image after ${this.MAX_RETRIES} attempts: ${lastError?.message}`);
  }

  /**
   * Validate a rendered image dataURL
   */
  private static validateRenderedImage(dataUrl: string): { isValid: boolean; reason?: string; size: number } {
    if (!dataUrl) {
      return { isValid: false, reason: 'DataURL is empty', size: 0 };
    }

    if (!dataUrl.startsWith('data:image/')) {
      return { isValid: false, reason: 'Invalid dataURL format', size: 0 };
    }

    const sizeInBytes = Math.round((dataUrl.length * 3) / 4); // Approximate size

    if (sizeInBytes < this.MIN_IMAGE_SIZE) {
      return {
        isValid: false,
        reason: `Image too small: ${sizeInBytes} bytes (minimum: ${this.MIN_IMAGE_SIZE})`,
        size: sizeInBytes
      };
    }

    // Check if the dataURL seems to contain actual image data
    const base64Data = dataUrl.split(',')[1];
    if (!base64Data || base64Data.length < 1000) {
      return { isValid: false, reason: 'Insufficient image data', size: sizeInBytes };
    }

    return { isValid: true, size: sizeInBytes };
  }

  /**
   * Render multiple images with batch processing
   */
  static async renderBatch(
    paramsList: TwitterImageParams[],
    qualityProfile: keyof typeof EnhancedRenderingService.QUALITY_PROFILES = 'instagram',
    onProgress?: (current: number, total: number) => void
  ): Promise<RenderingResult[]> {
    const results: RenderingResult[] = [];
    const total = paramsList.length;

    TwitterImageDebugger.log('Starting batch rendering', { count: total, quality: qualityProfile });

    for (let i = 0; i < total; i++) {
      onProgress?.(i, total);

      try {
        const result = await this.renderWithQuality(paramsList[i], qualityProfile);
        results.push(result);

        TwitterImageDebugger.log(`Batch item ${i + 1}/${total} completed`, {
          size: result.size,
          renderTime: result.metrics.renderTime
        });

        // Small delay between renders to prevent overwhelming the system
        if (i < total - 1) {
          await this.delay(100);
        }

      } catch (error) {
        TwitterImageDebugger.error(`Batch item ${i + 1}/${total} failed`, error);
        throw error; // Stop batch processing on error
      }
    }

    onProgress?.(total, total);
    TwitterImageDebugger.log('Batch rendering completed', { successCount: results.length });

    return results;
  }

  /**
   * Get optimal quality profile based on usage context
   */
  static getOptimalQuality(context: 'download' | 'preview' | 'sharing'): keyof typeof EnhancedRenderingService.QUALITY_PROFILES {
    switch (context) {
      case 'download':
      case 'sharing':
        return 'instagram';
      case 'preview':
        return 'preview';
      default:
        return 'instagram';
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}