// Enhanced monitoring and debugging service for carousel generation
interface GenerationMetrics {
  timestamp: number;
  totalSlides: number;
  imagesGenerated: number;
  fallbacksUsed: number;
  duration: number;
  errors: string[];
  modelUsed: string;
  success: boolean;
}

interface ErrorMetrics {
  quotaErrors: number;
  contentPolicyErrors: number;
  timeoutErrors: number;
  networkErrors: number;
  parseErrors: number;
}

class MonitoringService {
  private metrics: GenerationMetrics[] = [];
  private errorMetrics: ErrorMetrics = {
    quotaErrors: 0,
    contentPolicyErrors: 0,
    timeoutErrors: 0,
    networkErrors: 0,
    parseErrors: 0
  };

  // Start tracking a generation session
  startSession(slideCount: number): string {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`📊 [${sessionId}] Starting generation session for ${slideCount} slides`);
    return sessionId;
  }

  // Log generation completion
  logGenerationComplete(sessionId: string, metrics: GenerationMetrics) {
    this.metrics.push(metrics);
    
    const successRate = metrics.totalSlides > 0 ? 
      (metrics.imagesGenerated / metrics.totalSlides) * 100 : 0;
    
    console.log(`📈 [${sessionId}] Generation completed:
      ✅ Success: ${metrics.success}
      🎨 Images: ${metrics.imagesGenerated}/${metrics.totalSlides} (${Math.round(successRate)}%)
      🎯 Fallbacks: ${metrics.fallbacksUsed}
      ⏱️ Duration: ${metrics.duration}s
      🤖 Model: ${metrics.modelUsed}`);
    
    if (metrics.errors.length > 0) {
      console.warn(`⚠️ [${sessionId}] Errors:`, metrics.errors);
    }
  }

  // Log specific errors
  logError(type: keyof ErrorMetrics, error: string, context?: any) {
    this.errorMetrics[type]++;
    
    const emoji = {
      quotaErrors: '💳',
      contentPolicyErrors: '🔒',
      timeoutErrors: '⏰',
      networkErrors: '🌐',
      parseErrors: '📝'
    };

    console.error(`${emoji[type]} ${type}: ${error}`, context || '');
  }

  // Get real-time statistics
  getStats() {
    const recentMetrics = this.metrics.slice(-10); // Last 10 generations
    const totalGenerations = this.metrics.length;
    
    const avgSuccessRate = totalGenerations > 0 ? 
      (this.metrics.filter(m => m.success).length / totalGenerations) * 100 : 0;
    
    const avgDuration = recentMetrics.length > 0 ?
      recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length : 0;
    
    const avgImageSuccessRate = recentMetrics.length > 0 ?
      recentMetrics.reduce((sum, m) => {
        const rate = m.totalSlides > 0 ? (m.imagesGenerated / m.totalSlides) * 100 : 0;
        return sum + rate;
      }, 0) / recentMetrics.length : 0;

    return {
      totalGenerations,
      avgSuccessRate: Math.round(avgSuccessRate),
      avgDuration: Math.round(avgDuration),
      avgImageSuccessRate: Math.round(avgImageSuccessRate),
      recentErrors: this.errorMetrics,
      performance: this.getPerformanceGrade()
    };
  }

  // Get performance grade
  private getPerformanceGrade(): string {
    const stats = this.metrics.slice(-5); // Last 5 generations
    if (stats.length === 0) return 'N/A';
    
    const successRate = (stats.filter(s => s.success).length / stats.length) * 100;
    const avgImageRate = stats.reduce((sum, s) => {
      const rate = s.totalSlides > 0 ? (s.imagesGenerated / s.totalSlides) * 100 : 0;
      return sum + rate;
    }, 0) / stats.length;
    
    const overallScore = (successRate + avgImageRate) / 2;
    
    if (overallScore >= 90) return '🟢 Excellent';
    if (overallScore >= 75) return '🟡 Good';
    if (overallScore >= 50) return '🟠 Fair';
    return '🔴 Poor';
  }

  // Enhanced debugging information with real-time monitoring
  logDebug(message: string, data?: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 DEBUG: ${message}`, data || '');
    }
  }

  // Real-time performance monitoring
  logRealTimeStats() {
    const stats = this.getStats();
    console.log(`📊 Real-time Stats: ${stats.totalGenerations} total, ${stats.avgSuccessRate}% success rate, ${stats.performance}`);
    return stats;
  }

  // Monitor API health
  getApiHealthStatus(): string {
    const recentErrors = Object.values(this.errorMetrics).reduce((sum, count) => sum + count, 0);
    if (recentErrors === 0) return '🟢 Healthy';
    if (recentErrors < 5) return '🟡 Warning';
    return '🔴 Critical';
  }

  // Export metrics for analysis
  exportMetrics() {
    return {
      generationHistory: this.metrics,
      errorSummary: this.errorMetrics,
      summary: this.getStats()
    };
  }

  // Clear old metrics (keep last 50)
  cleanup() {
    if (this.metrics.length > 50) {
      this.metrics = this.metrics.slice(-50);
      console.log('📋 Cleaned up old metrics, keeping last 50 generations');
    }
  }
}

export const monitoringService = new MonitoringService();
export type { GenerationMetrics, ErrorMetrics };
