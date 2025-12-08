import React from 'react';

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
    <div 
      style={{
        width: '1080px',
        height: '1350px',
        backgroundColor: '#ffffff',
        color: '#000000',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        fontSize: '16px',
        lineHeight: '1.5',
        padding: '64px',
        display: 'flex',
        flexDirection: 'column',
        border: 'none',
        borderRadius: '0px',
        boxSizing: 'border-box',
        margin: '0',
        position: 'relative'
      }}
    >
      {/* Twitter Post Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '32px' }}>
        {/* Profile Image - Aumentado para 64px */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-muted flex-shrink-0">
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
                  <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #1d9bf0, #0c7abf); display: flex; align-items: center; justify-content: center; border-radius: 50%; color: white; font-weight: bold; font-size: 24px; font-family: Inter, system-ui, sans-serif;">
                    ${username.substring(0, 2).toUpperCase()}
                  </div>
                `;
              }
              setTimeout(() => {
                console.log('Profile image fallback rendered successfully');
              }, 50);
            }}
              onLoad={() => {
                console.log('Profile image loaded successfully');
              }}
            />
          ) : null}
          {!profileImageUrl && (
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1d9bf0, #0c7abf)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '24px',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}>
              {username.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* User Info */}
        <div style={{ flex: '1', minWidth: '0' }}>
          {/* Username with verified badge - Aumentado para 28px */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0' }}>
            <span style={{ 
              fontWeight: 'bold', 
              color: '#000000', 
              fontSize: '28px', 
              minWidth: '0',
              wordWrap: 'break-word',
              overflow: 'visible'
            }}>
              {username}
            </span>
            {isVerified && (
              <svg 
                style={{ 
                  width: '24px', 
                  height: '24px', 
                  color: '#1d9bf0', 
                  flexShrink: '0'
                }}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.818-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.437 2.25c-.415-.165-.866-.25-1.336-.25-2.11 0-3.818 1.79-3.818 4 0 .494.083.964.237 1.4-1.272.65-2.147 2.018-2.147 3.6 0 1.495.782 2.798 1.942 3.486-.02.17-.032.34-.032.514 0 2.21 1.708 4 3.818 4 .47 0 .92-.086 1.335-.25.62 1.334 1.926 2.25 3.437 2.25 1.512 0 2.818-.916 3.437-2.25.415.163.865.248 1.336.248 2.11 0 3.818-1.79 3.818-4 0-.174-.012-.344-.033-.513 1.158-.687 1.943-1.99 1.943-3.484zm-6.616-3.334l-4.334 6.5c-.145.217-.382.334-.625.334-.143 0-.288-.04-.416-.126l-2.5-1.668c-.448-.298-.573-.906-.277-1.354.297-.448.906-.573 1.354-.277l1.906 1.27 3.75-5.626c.298-.446.906-.573 1.354-.277.448.298.573.906.277 1.354z"/>
              </svg>
            )}
          </div>
          {/* Handle on separate line - Aumentado para 22px */}
          <div style={{ marginTop: '-4px' }}>
            <span style={{ 
              color: '#6b7280', 
              fontSize: '22px', 
              fontWeight: 'normal'
            }}>
              @{handle.replace(/^@+/, '')}
            </span>
          </div>
        </div>
      </div>

      {/* Tweet Text - Aumentado para text-4xl com leading-snug */}
      <div 
        className={`text-black text-4xl leading-snug font-normal ${hasImage ? '' : 'flex-1 flex items-center'}`}
        style={{ flexGrow: hasImage ? 1 : undefined }}
      >
        {hasImage ? (
          <div>{text}</div>
        ) : (
          <div className="w-full text-center leading-normal">{text}</div>
        )}
      </div>

      {/* Content Image - Menor e posicionado embaixo */}
      {contentImageUrl && (
        <div className="rounded-2xl overflow-hidden bg-muted mt-auto">
          <img 
            src={contentImageUrl} 
            alt="Tweet content" 
            className="w-full max-h-[400px] object-cover"
            onError={(e) => {
              console.error('Content image failed to load, showing elegant placeholder');
              const target = e.target as HTMLImageElement;
              const container = target.parentElement;
              if (container) {
                container.innerHTML = `
                  <div style="
                    width: 100%; 
                    height: 300px; 
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 30%, #cbd5e1 70%, #94a3b8 100%); 
                    display: flex; 
                    align-items: center; 
                    justify-content: center; 
                    position: relative;
                    overflow: hidden;
                  ">
                    <div style="
                      position: absolute;
                      top: 0;
                      left: 0;
                      width: 100%;
                      height: 100%;
                      background-image: 
                        repeating-linear-gradient(
                          45deg,
                          rgba(255,255,255,0.1) 0px,
                          rgba(255,255,255,0.1) 2px,
                          transparent 2px,
                          transparent 20px
                        );
                    "></div>
                    <div style="
                      background: rgba(255,255,255,0.9);
                      border-radius: 16px;
                      padding: 32px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
                      backdrop-filter: blur(8px);
                    ">
                      <svg style="width: 64px; height: 64px; color: #64748b;" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-1.8c1.77 0 3.2-1.43 3.2-3.2 0-1.77-1.43-3.2-3.2-3.2S8.8 10.23 8.8 12c0 1.77 1.43 3.2 3.2 3.2z"/>
                      </svg>
                    </div>
                  </div>
                `;
              }
              console.log('⚠️ DOWNLOAD WARNING: Content image could not be loaded, using fallback placeholder');
              setTimeout(() => {
                console.log('Content image fallback rendered successfully');
              }, 50);
            }}
            onLoad={() => {
              console.log('Content image loaded successfully');
            }}
          />
        </div>
      )}
    </div>
  );
};
