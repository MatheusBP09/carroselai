import { useState } from 'react';
import { ArrowRight, Key, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepProps } from '../types/carousel';

export const Step0ApiKey = ({ data, onNext }: StepProps) => {
  const [apiKey, setApiKey] = useState(data.openaiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');

  const validateApiKey = (key: string) => {
    if (!key) {
      setError('Chave da API é obrigatória');
      return false;
    }
    if (!key.startsWith('sk-')) {
      setError('Chave da API deve começar com "sk-"');
      return false;
    }
    if (key.length < 20) {
      setError('Chave da API parece estar incompleta');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    if (validateApiKey(apiKey)) {
      onNext({ 
        openaiApiKey: apiKey
      });
    }
  };

  const handleKeyChange = (value: string) => {
    setApiKey(value);
    if (error) {
      validateApiKey(value);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center mb-4 shadow-elegant">
            <Key className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Configuração da API
          </CardTitle>
          <p className="text-muted-foreground">
            Insira sua chave da API OpenAI para gerar carrosseis automaticamente
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Sua chave da API é armazenada apenas localmente e nunca é compartilhada. 
              É necessária para gerar conteúdo com inteligência artificial.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="apiKey" className="text-sm font-medium">
              Chave da API OpenAI *
            </Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showKey ? 'text' : 'password'}
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                className={`pr-10 transition-all duration-300 ${error ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <span className="text-sm text-destructive">{error}</span>
            )}
          </div>


          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Como obter sua chave da API:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Acesse <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.openai.com</a></li>
              <li>Faça login em sua conta OpenAI</li>
              <li>Clique em "Create new secret key"</li>
              <li>Copie a chave e cole aqui</li>
            </ol>
          </div>

          <div className="pt-4">
            <EnhancedButton
              variant="instagram"
              size="xl"
              onClick={handleSubmit}
              disabled={!apiKey}
              className="w-full"
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </EnhancedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};