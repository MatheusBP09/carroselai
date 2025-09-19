import { useState } from 'react';
import { ArrowRight, ArrowLeft, Instagram, CheckCircle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Checkbox } from '@/components/ui/checkbox';
import { StepProps } from '../types/carousel';
import { useCarousel } from '@/context/CarouselContext';

export const Step1Identification = ({ data, onNext, onBack }: StepProps) => {
  const { updateData, setCurrentStep } = useCarousel();
  
  const [formData, setFormData] = useState({
    title: data.title || '',
    username: data.username || '',
    instagramHandle: data.instagramHandle ? data.instagramHandle.replace('@', '') : '',
    isVerified: data.isVerified || false
  });
  
  const [errors, setErrors] = useState<{title?: string; username?: string; instagramHandle?: string}>({});

  const validateForm = () => {
    const newErrors: {title?: string; username?: string; instagramHandle?: string} = {};
    
    if (formData.title.length > 0 && formData.title.length < 3) {
      newErrors.title = 'Título deve ter pelo menos 3 caracteres';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Título deve ter no máximo 100 caracteres';
    }
    
    if (formData.username.length < 2) {
      newErrors.username = 'Nome deve ter pelo menos 2 caracteres';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Nome deve ter no máximo 50 caracteres';
    }
    
    if (!formData.instagramHandle || formData.instagramHandle.length < 1) {
      newErrors.instagramHandle = 'Instagram handle é obrigatório';
    } else if (formData.instagramHandle.startsWith('@')) {
      newErrors.instagramHandle = 'Digite apenas o nome de usuário, sem o @';
    } else if (formData.instagramHandle.length < 1) {
      newErrors.instagramHandle = 'Handle deve ter pelo menos 1 caractere';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.instagramHandle)) {
      newErrors.instagramHandle = 'Handle deve conter apenas letras, números e underscore';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onNext({
        title: formData.title,
        username: formData.username,
        instagramHandle: '@' + formData.instagramHandle.toLowerCase(), // Add @ when saving
        isVerified: formData.isVerified
      });
    }
  };

  const handleInstagramHandleChange = (value: string) => {
    // Remove @ if user adds it (since we want them to type without @)
    let handle = value.replace('@', '');
    setFormData(prev => ({ ...prev, instagramHandle: handle.toLowerCase() }));
  };

  const isFormValid = () => {
    return (formData.title.length === 0 || formData.title.length >= 3) && 
           formData.title.length <= 100 && 
           formData.username.length >= 2 &&
           formData.username.length <= 50 &&
           formData.instagramHandle.length > 0;
  };

  const handleAutoTest = () => {
    // Dados aleatórios para teste
    const testData = {
      title: 'Teste Automático - Empreendedorismo',
      username: 'Teste Usuario',
      instagramHandle: '@testeusuario',
      isVerified: true,
      content: 'Dicas essenciais sobre empreendedorismo digital e como começar seu negócio online com sucesso',
      slideCount: 2,
      contentType: 'educational' as const,
      contentFormat: 'feed' as const,
      callToAction: 'follow' as const,
      copywritingFramework: 'aida' as const,
      targetAudience: 'empreendedores iniciantes'
    };

    // Atualizar dados do contexto
    updateData(testData);
    
    // Pular direto para o processamento (Step 4)
    setCurrentStep(4);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-instagram-start to-instagram-middle rounded-2xl flex items-center justify-center mb-4 shadow-instagram">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Passo 1: Identifique seu Carrossel
          </CardTitle>
          <p className="text-muted-foreground">
            Vamos começar com as informações básicas do seu carrossel
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Nome/Título do Carrossel
            </Label>
            <Input
              id="title"
              placeholder="Ex: 10 Lições de Empreendedorismo"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`transition-all duration-300 ${errors.title ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`}
              maxLength={100}
            />
            <div className="flex justify-between items-center">
              {errors.title && (
                <span className="text-sm text-destructive">{errors.title}</span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formData.title.length}/100
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Nome de Exibição *
            </Label>
            <Input
              id="username"
              placeholder="Ex: Yan Simões"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className={`transition-all duration-300 ${errors.username ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`}
              maxLength={50}
            />
            <div className="flex justify-between items-center">
              {errors.username && (
                <span className="text-sm text-destructive">{errors.username}</span>
              )}
              <span className="text-xs text-muted-foreground ml-auto">
                {formData.username.length}/50
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instagram" className="text-sm font-medium">
              Seu @ do Instagram *
            </Label>
            <Input
              id="instagram"
              placeholder="yansimoesss"
              value={formData.instagramHandle}
              onChange={(e) => handleInstagramHandleChange(e.target.value)}
              className={`transition-all duration-300 ${errors.instagramHandle ? 'border-destructive focus:border-destructive' : 'focus:border-primary'}`}
            />
            <p className="text-xs text-muted-foreground">
              Digite apenas o nome de usuário, sem o @
            </p>
            {errors.instagramHandle && (
              <span className="text-sm text-destructive">{errors.instagramHandle}</span>
            )}
            
            <div className="flex items-center space-x-2 mt-3">
              <Checkbox
                id="verified"
                checked={formData.isVerified}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, isVerified: checked === true }))
                }
              />
              <Label htmlFor="verified" className="text-sm flex items-center gap-2">
                Mostrar ícone de verificado
                <CheckCircle className="w-4 h-4 text-accent-blue" />
              </Label>
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex gap-4">
              <EnhancedButton
                variant="outline"
                size="xl"
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="w-5 h-5" />
                Voltar
              </EnhancedButton>
              
              <EnhancedButton
                variant="instagram"
                size="xl"
                onClick={handleSubmit}
                disabled={!isFormValid()}
                className="flex-1"
              >
                Próximo Passo
                <ArrowRight className="w-5 h-5" />
              </EnhancedButton>
            </div>
            
            {/* Botão de teste automático - temporário */}
            <div className="border-t pt-4">
              <EnhancedButton
                variant="outline"
                size="lg"
                onClick={handleAutoTest}
                className="w-full bg-yellow-50 border-yellow-200 hover:bg-yellow-100 text-yellow-800"
              >
                <Zap className="w-4 h-4 mr-2" />
                🧪 Teste Automático (2 slides) - Desenvolvimento
              </EnhancedButton>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Gera automaticamente um carrossel de teste para validar a funcionalidade
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
