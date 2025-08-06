interface RequestTracker {
  count: number;
  resetTime: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  backoffMultiplier: number;
  maxBackoffMs: number;
}

class RateLimitService {
  private requests: Map<string, RequestTracker> = new Map();
  private config: RateLimitConfig = {
    maxRequests: 10, // Increased for better throughput
    windowMs: 60000, // 1 minute window
    backoffMultiplier: 1.5,
    maxBackoffMs: 8000 // Reduced max backoff
  };

  async throttleRequest(key: string = 'default'): Promise<void> {
    const now = Date.now();
    const tracker = this.requests.get(key) || { count: 0, resetTime: now + this.config.windowMs };

    // Reset if window has passed
    if (now > tracker.resetTime) {
      tracker.count = 0;
      tracker.resetTime = now + this.config.windowMs;
    }

    // Check if we need to wait
    if (tracker.count >= this.config.maxRequests) {
      const waitTime = Math.min(
        tracker.resetTime - now,
        this.config.maxBackoffMs
      );
      
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        // Reset after waiting
        tracker.count = 0;
        tracker.resetTime = now + waitTime + this.config.windowMs;
      }
    }

    tracker.count++;
    this.requests.set(key, tracker);
  }

  getDelayBetweenRequests(): number {
    return 1000; // 1 second between requests
  }

  // Enhanced quota detection
  isQuotaError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || '';
    return msg.includes('quota') || 
           msg.includes('billing') || 
           msg.includes('insufficient_quota') ||
           msg.includes('rate_limit_exceeded') ||
           msg.includes('requests per');
  }

  async withDelay(fn: () => Promise<any>, delay?: number): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, delay || this.getDelayBetweenRequests()));
    return fn();
  }
}

export const rateLimitService = new RateLimitService();