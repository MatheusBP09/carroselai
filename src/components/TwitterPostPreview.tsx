import React from 'react';
import { Card } from './ui/card';

interface TwitterPostPreviewProps {
  username: string;
  handle: string;
  isVerified: boolean;
  text: string;
  profileImageUrl?: string;
  contentImageUrl?: string;
  hasImage?: boolean;
  imagePosition?: 'center' | 'top' | 'bottom';
  imageScale?: number;
}

export const TwitterPostPreview: React.FC<TwitterPostPreviewProps> = ({
  username,
  handle,
  isVerified,
  text,
  profileImageUrl,
  contentImageUrl,
  hasImage = true,
  imagePosition = 'center',
  imageScale = 1
}) => {
  const shouldShowImage = hasImage && contentImageUrl;
  return (
    <Card className="w-full max-w-md bg-background text-foreground border p-4 mx-auto">
      {/* Twitter Post Header */}
      <div className="flex items-start space-x-3 mb-3">
        {/* Profile Image */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
          )}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          {/* Username with verified badge */}
          <div className="flex items-center space-x-1">
            <span className="font-semibold text-sm truncate">
              {username}
            </span>
            {isVerified && (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg 
                  className="w-2.5 h-2.5 text-white" 
                  fill="currentColor" 
                  viewBox="0 0 16 16"
                >
                  <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
              </div>
            )}
          </div>
          {/* Handle on separate line */}
          <div className="-mt-1.5">
            <span className="text-muted-foreground text-xs">
              @{handle}
            </span>
          </div>
        </div>
      </div>

      {/* Tweet Text - Preview com truncamento para melhor UI */}
      <div className={`text-foreground text-sm leading-relaxed ${shouldShowImage ? 'mb-3 line-clamp-4' : 'mb-0 line-clamp-10'}`}>
        {text}
      </div>
      
      {/* Mostrar indicador se o texto está truncado */}
      {text.length > 200 && (
        <p className="text-xs text-muted-foreground italic mt-1">
          * Texto será exibido completo na imagem final
        </p>
      )}

      {/* Content Image */}
      {shouldShowImage && (
        <div className={`rounded-lg overflow-hidden bg-muted ${
          imagePosition === 'center' ? 'flex items-center justify-center' :
          imagePosition === 'top' ? 'flex items-start justify-center' :
          'flex items-end justify-center'
        }`}>
          <img 
            src={contentImageUrl} 
            alt="Tweet content" 
            className="w-full h-32 object-cover"
            style={{
              transform: `scale(${imageScale})`,
              transformOrigin: imagePosition === 'top' ? 'top center' : 
                               imagePosition === 'bottom' ? 'bottom center' : 
                               'center center'
            }}
          />
        </div>
      )}
    </Card>
  );
};