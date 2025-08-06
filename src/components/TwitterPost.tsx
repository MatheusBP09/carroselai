import React from 'react';
import { Card } from './ui/card';

interface TwitterPostProps {
  username: string;
  handle: string;
  isVerified: boolean;
  text: string;
  profileImageUrl?: string;
  contentImageUrl?: string;
  timestamp?: string;
  metrics?: {
    replies: string;
    reposts: string;
    likes: string;
  };
}

export const TwitterPost: React.FC<TwitterPostProps> = ({
  username,
  handle,
  isVerified,
  text,
  profileImageUrl,
  contentImageUrl
}) => {
  const hasImage = !!contentImageUrl;
  
  return (
    <Card className="w-[1080px] h-[1350px] bg-white text-black border-0 p-16 mx-auto font-twitter flex flex-col">
      {/* Twitter Post Header */}
      <div className="flex items-start space-x-4 mb-8">
        {/* Profile Image */}
        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {profileImageUrl ? (
            <img 
              src={profileImageUrl} 
              alt="Profile" 
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Profile image failed to load, showing initials fallback');
                const target = e.target as HTMLImageElement;
                const container = target.parentElement;
                if (container) {
                  container.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <span class="text-white font-bold text-lg">
                        ${username.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  `;
                }
              }}
              onLoad={() => {
                console.log('Profile image loaded successfully');
              }}
            />
          ) : null}
          {!profileImageUrl && (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {username.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div className="flex-1 min-w-0">
          {/* Username with verified badge */}
          <div className="flex items-center space-x-2">
            <span className="font-bold text-black text-[22px] truncate">
              {username}
            </span>
            {isVerified && (
              <svg 
                className="w-5 h-5 text-accent-blue flex-shrink-0" 
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.448-.298-.573-.906-.277-1.354.297-.448.906-.573 1.354-.277l1.906 1.27 3.75-5.626c.298-.446.906-.573 1.354-.277.448.298.573.906.277 1.354z"/>
              </svg>
            )}
          </div>
          {/* Handle on separate line */}
          <div className="-mt-2">
            <span className="text-muted-foreground text-[18px] font-normal">
              @{handle}
            </span>
          </div>
        </div>
      </div>

      {/* Tweet Text */}
      <div className={`text-black text-3xl leading-relaxed font-normal ${hasImage ? 'mb-12' : 'flex-1 flex items-center'}`}>
        {hasImage ? (
          <div>{text}</div>
        ) : (
          <div className="w-full text-center leading-normal">{text}</div>
        )}
      </div>

      {/* Content Image */}
      {contentImageUrl && (
        <div className="rounded-2xl overflow-hidden bg-muted">
          <img 
            src={contentImageUrl} 
            alt="Tweet content" 
            className="w-full max-h-[700px] object-cover"
            onError={(e) => {
              console.error('Content image failed to load, showing placeholder');
              const target = e.target as HTMLImageElement;
              const container = target.parentElement;
              if (container) {
                container.innerHTML = `
                  <div class="w-full h-[400px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div class="text-center text-gray-500">
                      <svg class="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                      <p class="text-sm font-medium">Image unavailable</p>
                    </div>
                  </div>
                `;
              }
            }}
            onLoad={() => {
              console.log('Content image loaded successfully');
            }}
          />
        </div>
      )}
    </Card>
  );
};