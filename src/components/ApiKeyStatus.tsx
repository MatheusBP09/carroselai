import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ApiKeyStatusProps {
  className?: string;
}

export const ApiKeyStatus = ({ className = '' }: ApiKeyStatusProps) => {
  const hasApiKey = true; // Always true since we're using Supabase Edge Functions

  if (hasApiKey) {
    return (
      <Alert className={`border-green-200 bg-green-50 ${className}`}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ IA OpenAI configurada - Gerando conteúdo criativo!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        ⚠️ Usando modo criativo local - Configure OpenAI para melhor qualidade
      </AlertDescription>
    </Alert>
  );
};