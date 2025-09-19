import { useState } from 'react';
import { ArrowRight, ArrowLeft, Upload, X, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StepProps } from '../types/carousel';

export const Step3PhotoUpload = ({ data, onNext, onBack }: StepProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(data.profileImage || null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file: File) => {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setError('Formato não suportado. Use JPEG, PNG ou WebP.');
      return false;
    }

    if (file.size > maxSize) {
      setError('Arquivo muito grande. Máximo 5MB.');
      return false;
    }

    setError('');
    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError('');
  };

  const handleNext = () => {
    onNext({ profileImage: selectedFile || undefined });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="shadow-card border-0 bg-gradient-card">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-accent to-accent/80 rounded-2xl flex items-center justify-center mb-4 shadow-elegant">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Passo 3: Foto de Perfil
          </CardTitle>
          <p className="text-muted-foreground">
            Faça upload da foto que aparecerá no perfil do carrossel
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {!selectedFile ? (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-primary bg-primary/10' 
                  : error 
                    ? 'border-destructive bg-destructive/5'
                    : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="photo-upload"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                accept="image/*"
                onChange={handleInputChange}
              />
              
              <Upload className={`w-12 h-12 mx-auto mb-4 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  {dragActive ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para fazer upload'}
                </p>
                <p className="text-sm text-muted-foreground">
                  JPEG, PNG ou WebP até 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative bg-muted/50 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                   <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center overflow-hidden">
                     {selectedFile && selectedFile instanceof File && (
                       <img
                         src={URL.createObjectURL(selectedFile)}
                         alt="Preview"
                         className="w-full h-full object-cover"
                       />
                     )}
                   </div>
                   <div className="flex-1">
                     <p className="font-medium">{selectedFile?.name || 'Arquivo selecionado'}</p>
                     <p className="text-sm text-muted-foreground">
                       {selectedFile?.size ? (selectedFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Tamanho desconhecido'}
                     </p>
                   </div>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
              
              <Alert>
                <AlertDescription>
                  Imagem selecionada com sucesso! Esta será a foto de perfil do seu carrossel.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription>
              <strong>Opcional:</strong> Você pode pular este passo se não quiser adicionar uma foto de perfil.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4 pt-4">
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
              onClick={handleNext}
              className="flex-1"
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