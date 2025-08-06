import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Upload, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface ImageControlsProps {
  hasImage: boolean;
  customImageUrl?: string;
  imagePosition: 'center' | 'top' | 'bottom';
  imageScale: number;
  onRemoveImage: () => void;
  onUploadImage: (file: File) => void;
  onPositionChange: (position: 'center' | 'top' | 'bottom') => void;
  onScaleChange: (scale: number) => void;
  onResetToGenerated: () => void;
  hasGeneratedImage: boolean;
}

export const ImageControls: React.FC<ImageControlsProps> = ({
  hasImage,
  customImageUrl,
  imagePosition,
  imageScale,
  onRemoveImage,
  onUploadImage,
  onPositionChange,
  onScaleChange,
  onResetToGenerated,
  hasGeneratedImage
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        onUploadImage(file);
      } else {
        toast.error('Por favor, selecione um arquivo de imagem válido.');
      }
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="p-4 space-y-4">
      <h4 className="font-semibold text-sm">Controles de Imagem</h4>
      
      {/* Remove Image / Upload Image */}
      <div className="flex gap-2">
        {hasImage ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemoveImage}
              className="flex-1"
            >
              <X className="w-4 h-4 mr-2" />
              Remover Imagem
            </Button>
            {hasGeneratedImage && customImageUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={onResetToGenerated}
                className="flex-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Voltar para IA
              </Button>
            )}
          </>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={triggerFileUpload}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            Adicionar Imagem
          </Button>
        )}
      </div>

      {/* Custom Image Upload */}
      {hasImage && (
        <Button
          variant="outline"
          size="sm"
          onClick={triggerFileUpload}
          className="w-full"
        >
          <Upload className="w-4 h-4 mr-2" />
          {customImageUrl ? 'Trocar Imagem' : 'Enviar Imagem Personalizada'}
        </Button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Image Position and Scale Controls - only show when image is present */}
      {hasImage && (
        <>
          <div className="space-y-2">
            <Label className="text-xs">Posição da Imagem</Label>
            <Select value={imagePosition} onValueChange={onPositionChange}>
              <SelectTrigger className="h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="top">Superior</SelectItem>
                <SelectItem value="center">Centro</SelectItem>
                <SelectItem value="bottom">Inferior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Escala da Imagem: {imageScale.toFixed(1)}x</Label>
            <Slider
              value={[imageScale]}
              onValueChange={(value) => onScaleChange(value[0])}
              min={0.5}
              max={2.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </>
      )}
    </Card>
  );
};