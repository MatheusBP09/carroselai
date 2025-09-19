  import { EnhancedRenderingService } from './enhancedRenderingService';
  import { CarouselData } from '@/types/carousel';

  export interface DownloadProgress {
    current: number;
    total: number;
    status: 'preparing' | 'rendering' | 'downloading' | 'complete' | 'error';
    message?: string;
  }

  /**
   * Convert Fabric.js dataURL to Blob
   */
  const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  /**
   * Enhanced download service using improved rendering system
   */
  export class SimpleDownloadService {

    static async downloadSingleSlide(
      data: CarouselData,
      slideIndex: number,
      onProgress?: (progress: DownloadProgress) => void
    ): Promise<void> {
      if (!data.slides || !data.slides[slideIndex]) {
        throw new Error(`Slide ${slideIndex + 1} not found`);
      }

      const slide = data.slides[slideIndex];

      try {
        onProgress?.({
          current: 1,
          total: 1,
          status: 'rendering',
          message: `Renderizando slide ${slideIndex + 1}...`
        });

        console.log(`🎯 Rendering slide ${slideIndex + 1} for download using enhanced rendering service`);

        // Use the enhanced rendering service with better error handling
        const renderResult = await EnhancedRenderingService.renderWithQuality({
          text: slide.text,
          username: data.username,
          handle: data.instagramHandle,
          isVerified: data.isVerified,
          profileImageUrl: slide.profileImageUrl,
          contentImageUrl: slide.customImageUrl || slide.contentImageUrls?.[0]
        }, 'instagram');

        // Convert dataURL to blob
        const blob = dataUrlToBlob(renderResult.dataUrl);

        console.log(`✅ Slide ${slideIndex + 1} rendered successfully:`, {
          size: blob.size,
          type: blob.type,
          renderTime: renderResult.metrics.renderTime,
          retries: renderResult.metrics.retries
        });

        onProgress?.({
          current: 1,
          total: 1,
          status: 'downloading',
          message: `Baixando slide ${slideIndex + 1}...`
        });

        // Simple download without complex validation
        const filename = `slide-${(slideIndex + 1).toString().padStart(2, '0')}-${data.username.replace(/\s+/g, '-').toLowerCase()}.png`;
        await this.downloadBlob(blob, filename);

        onProgress?.({
          current: 1,
          total: 1,
          status: 'complete',
          message: `Slide ${slideIndex + 1} baixado com sucesso!`
        });

        console.log(`✅ Slide ${slideIndex + 1} downloaded successfully`);

      } catch (error) {
        console.error(`❌ Error downloading slide ${slideIndex + 1}:`, error);
        onProgress?.({
          current: 1,
          total: 1,
          status: 'error',
          message: `Erro ao baixar slide ${slideIndex + 1}`
        });
        throw error;
      }
    }

    static async downloadAllSlides(
      data: CarouselData,
      onProgress?: (progress: DownloadProgress) => void
    ): Promise<void> {
      if (!data.slides || data.slides.length === 0) {
        throw new Error('No slides to download');
      }

      const totalSlides = data.slides.length;

      try {
        onProgress?.({
          current: 0,
          total: totalSlides,
          status: 'preparing',
          message: 'Preparando downloads...'
        });

        // Download slides one by one with delay
        for (let i = 0; i < totalSlides; i++) {
          onProgress?.({
            current: i + 1,
            total: totalSlides,
            status: 'rendering',
            message: `Baixando slide ${i + 1} de ${totalSlides}...`
          });

          await this.downloadSingleSlide(data, i);

          // Small delay between downloads
          if (i < totalSlides - 1) {
            await this.delay(500);
          }
        }

        onProgress?.({
          current: totalSlides,
          total: totalSlides,
          status: 'complete',
          message: `Todos os ${totalSlides} slides baixados com sucesso!`
        });

      } catch (error) {
        console.error('❌ Error downloading slides:', error);
        onProgress?.({
          current: 0,
          total: totalSlides,
          status: 'error',
          message: 'Erro durante o download'
        });
        throw error;
      }
    }

    private static async downloadBlob(blob: Blob, filename: string): Promise<void> {
      try {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(`📥 File downloaded: ${filename}, size: ${blob.size} bytes`);

      } catch (error) {
        console.error('❌ Download failed:', error);
        throw new Error(`Failed to download ${filename}`);
      }
    }

    private static delay(ms: number): Promise<void> {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
  }