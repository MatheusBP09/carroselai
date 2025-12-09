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
    <Card className="w-full max-w-md bg-background text-foreground border p-3 sm:p-4 mx-auto">
      {/* Twitter Post Header */}
      <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3">
        {/* Profile Image */}
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-muted flex-shrink-0">
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
            <span className="font-semibold text-xs sm:text-sm truncate">
              {username}
            </span>
            {isVerified && (
              <svg 
                className="w-3 h-3 text-twitter-blue flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.448-.298-.573-.906-.277-1.354.297-.448.906-.573 1.354-.277l1.906 1.27 3.75-5.626c.298-.446.906-.573 1.354-.277.448.298.573.906.277 1.354z"/>
              </svg>
            )}
          </div>
          {/* Handle on separate line */}
          <div className="-mt-1 sm:-mt-1.5">
            <span className="text-muted-foreground text-[10px] sm:text-xs">
              @{handle.replace(/^@+/, '')}
            </span>
          </div>
        </div>
      </div>

      {/* Tweet Text */}
      <div className={`text-foreground text-xs sm:text-sm leading-relaxed ${shouldShowImage ? 'mb-2 sm:mb-3 line-clamp-4' : 'mb-0 line-clamp-10'}`}>
        {text}
      </div>

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
            className="w-full h-24 sm:h-32 object-cover"
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