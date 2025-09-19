/**
 * Debug utilities for Twitter image generation
 */

export interface LayoutMetrics {
  canvasSize: { width: number; height: number };
  elementCount: number;
  textMetrics: {
    length: number;
    lines: number;
    fontSize: number;
    height: number;
  };
  imageMetrics?: {
    hasContentImage: boolean;
    hasProfileImage: boolean;
    contentImageStatus: 'loaded' | 'placeholder' | 'none';
  };
}

export class TwitterImageDebugger {
  private static logs: string[] = [];

  static log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;

    console.log(logEntry, data || '');
    this.logs.push(logEntry + (data ? ` ${JSON.stringify(data)}` : ''));
  }

  static error(message: string, error?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ERROR: ${message}`;

    console.error(logEntry, error || '');
    this.logs.push(logEntry + (error ? ` ${JSON.stringify(error)}` : ''));
  }

  static getLayoutMetrics(canvas: any, text: string, fontSize: number): LayoutMetrics {
    const objects = canvas?.getObjects() || [];
    const textElement = objects.find((obj: any) => obj.type === 'text' && obj.text?.includes(text.substring(0, 20)));

    const metrics: LayoutMetrics = {
      canvasSize: {
        width: canvas?.width || 0,
        height: canvas?.height || 0
      },
      elementCount: objects.length,
      textMetrics: {
        length: text.length,
        lines: text.split('\n').length,
        fontSize: fontSize,
        height: textElement?.height || 0
      },
      imageMetrics: {
        hasContentImage: objects.some((obj: any) => obj.type === 'image' && obj !== textElement),
        hasProfileImage: objects.some((obj: any) => obj.type === 'circle'),
        contentImageStatus: 'none'
      }
    };

    // Determine content image status
    const hasImageElement = objects.some((obj: any) => obj.type === 'image');
    const hasPlaceholder = objects.some((obj: any) => obj.type === 'text' && obj.text?.includes('Imagem gerada'));

    if (hasImageElement) {
      metrics.imageMetrics!.contentImageStatus = 'loaded';
    } else if (hasPlaceholder) {
      metrics.imageMetrics!.contentImageStatus = 'placeholder';
    }

    this.log('Layout metrics calculated', metrics);
    return metrics;
  }

  static validateCanvas(canvas: any): boolean {
    if (!canvas) {
      this.error('Canvas is null or undefined');
      return false;
    }

    const objects = canvas.getObjects();
    if (objects.length === 0) {
      this.error('Canvas has no objects');
      return false;
    }

    if (canvas.width !== 1080 || canvas.height !== 1080) {
      this.error('Canvas dimensions are incorrect', { width: canvas.width, height: canvas.height });
      return false;
    }

    this.log('Canvas validation passed', { objectCount: objects.length });
    return true;
  }

  static getDebugLogs(): string[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }

  static downloadDebugLog(): void {
    const logContent = this.logs.join('\n');
    const blob = new Blob([logContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `carousel-debug-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    this.log('Debug log downloaded');
  }
}