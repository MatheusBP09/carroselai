// Edge Function retry service with exponential backoff and detailed error handling

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface EdgeFunctionError {
  functionName: string;
  errorType: 'timeout' | 'quota' | 'rate_limit' | 'server_error' | 'network' | 'content_policy' | 'unknown';
  message: string;
  statusCode?: number;
  retryable: boolean;
  timestamp: Date;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2
};

// Classify error type based on error message/status
export const classifyError = (error: any, functionName: string): EdgeFunctionError => {
  const message = error?.message?.toLowerCase() || '';
  const statusCode = error?.status || error?.statusCode;
  
  // Quota/billing errors
  if (message.includes('quota') || message.includes('billing') || message.includes('exceeded') || statusCode === 429) {
    return {
      functionName,
      errorType: 'quota',
      message: `API quota exceeded for ${functionName}. Please check your API limits.`,
      statusCode,
      retryable: false,
      timestamp: new Date()
    };
  }
  
  // Rate limit errors
  if (message.includes('rate') || message.includes('too many requests') || message.includes('throttl')) {
    return {
      functionName,
      errorType: 'rate_limit',
      message: `Rate limit hit for ${functionName}. Will retry with backoff.`,
      statusCode,
      retryable: true,
      timestamp: new Date()
    };
  }
  
  // Timeout errors
  if (message.includes('timeout') || message.includes('timed out') || message.includes('deadline')) {
    return {
      functionName,
      errorType: 'timeout',
      message: `${functionName} timed out. The operation took too long.`,
      statusCode,
      retryable: true,
      timestamp: new Date()
    };
  }
  
  // Content policy errors (AI generation)
  if (message.includes('content policy') || message.includes('safety') || message.includes('blocked')) {
    return {
      functionName,
      errorType: 'content_policy',
      message: `Content policy violation in ${functionName}. The prompt may need adjustment.`,
      statusCode,
      retryable: false,
      timestamp: new Date()
    };
  }
  
  // Network errors
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return {
      functionName,
      errorType: 'network',
      message: `Network error calling ${functionName}. Check your connection.`,
      statusCode,
      retryable: true,
      timestamp: new Date()
    };
  }
  
  // Server errors (5xx)
  if (statusCode >= 500 || message.includes('non-2xx') || message.includes('server error')) {
    return {
      functionName,
      errorType: 'server_error',
      message: `Server error in ${functionName} (${statusCode || 'unknown status'}). Will retry.`,
      statusCode,
      retryable: true,
      timestamp: new Date()
    };
  }
  
  // Unknown error
  return {
    functionName,
    errorType: 'unknown',
    message: `Unknown error in ${functionName}: ${error?.message || 'No details available'}`,
    statusCode,
    retryable: true,
    timestamp: new Date()
  };
};

// Calculate delay with exponential backoff
const calculateDelay = (attempt: number, config: RetryConfig): number => {
  const delay = config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt);
  return Math.min(delay, config.maxDelayMs);
};

// Sleep helper
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Main retry wrapper
export async function withRetry<T>(
  functionName: string,
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  let lastError: EdgeFunctionError | null = null;
  
  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1, finalConfig);
        console.log(`🔄 [${functionName}] Retry attempt ${attempt}/${finalConfig.maxRetries} after ${delay}ms delay...`);
        await sleep(delay);
      }
      
      const result = await operation();
      
      if (attempt > 0) {
        console.log(`✅ [${functionName}] Succeeded on retry attempt ${attempt}`);
      }
      
      return result;
      
    } catch (error: any) {
      lastError = classifyError(error, functionName);
      
      console.error(`❌ [${functionName}] Attempt ${attempt + 1} failed:`, {
        errorType: lastError.errorType,
        message: lastError.message,
        retryable: lastError.retryable
      });
      
      // Don't retry non-retryable errors
      if (!lastError.retryable) {
        console.error(`🚫 [${functionName}] Error is not retryable, giving up immediately`);
        throw new Error(lastError.message);
      }
      
      // If this was the last attempt, throw
      if (attempt === finalConfig.maxRetries) {
        console.error(`💀 [${functionName}] All ${finalConfig.maxRetries + 1} attempts failed`);
        throw new Error(`${lastError.message} (after ${finalConfig.maxRetries + 1} attempts)`);
      }
    }
  }
  
  // Should never reach here, but TypeScript needs this
  throw new Error(lastError?.message || `Unknown error in ${functionName}`);
}

// Format error for user display
export const formatErrorForUser = (error: EdgeFunctionError): string => {
  const errorMessages: Record<EdgeFunctionError['errorType'], string> = {
    timeout: '⏰ A operação demorou muito. Tente novamente com menos slides.',
    quota: '💳 Limite de API atingido. Entre em contato com o suporte.',
    rate_limit: '🚦 Muitas requisições. Aguarde um momento e tente novamente.',
    server_error: '🔧 Erro no servidor. Tente novamente em alguns segundos.',
    network: '🌐 Erro de conexão. Verifique sua internet.',
    content_policy: '🔒 Conteúdo bloqueado pela política de segurança.',
    unknown: '❓ Erro desconhecido. Tente novamente.'
  };
  
  return errorMessages[error.errorType] || errorMessages.unknown;
};
