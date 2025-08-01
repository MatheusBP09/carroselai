/**
 * Enhanced fallback image generator with beautiful designs
 */

export interface FallbackImageOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Generate high-quality gradient avatar with initials
 */
export const generateEnhancedProfileAvatar = (
  username: string,
  options: FallbackImageOptions = {}
): string => {
  const { width = 400, height = 400, quality = 1.0 } = options;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // Generate beautiful gradient based on username
  const gradients = [
    { start: '#667eea', end: '#764ba2' }, // Purple Blue
    { start: '#f093fb', end: '#f5576c' }, // Pink Red
    { start: '#4facfe', end: '#00f2fe' }, // Blue Cyan
    { start: '#43e97b', end: '#38f9d7' }, // Green Teal
    { start: '#fa709a', end: '#fee140' }, // Pink Yellow
    { start: '#a8edea', end: '#fed6e3' }, // Teal Pink
    { start: '#ff9a9e', end: '#fecfef' }, // Coral Pink
    { start: '#a18cd1', end: '#fbc2eb' }, // Purple Pink
  ];
  
  // Select gradient based on username hash
  const hash = username.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  const gradientIndex = Math.abs(hash) % gradients.length;
  const selectedGradient = gradients[gradientIndex];
  
  // Create radial gradient
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width / 2
  );
  gradient.addColorStop(0, selectedGradient.start);
  gradient.addColorStop(1, selectedGradient.end);
  
  // Draw circle
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(width / 2, height / 2, width / 2, 0, 2 * Math.PI);
  ctx.fill();
  
  // Add subtle shadow/border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 4;
  ctx.stroke();
  
  // Add initials
  const initials = username
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
    
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${width * 0.35}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 2;
  ctx.fillText(initials, width / 2, height / 2);
  
  return canvas.toDataURL('image/png', quality);
};

/**
 * Generate beautiful content placeholder
 */
export const generateEnhancedContentPlaceholder = (
  options: FallbackImageOptions = {}
): string => {
  const { width = 800, height = 600, quality = 1.0 } = options;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Canvas context not available');
  }
  
  canvas.width = width;
  canvas.height = height;
  
  // Create subtle gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f8fafc');
  gradient.addColorStop(0.5, '#f1f5f9');
  gradient.addColorStop(1, '#e2e8f0');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add subtle border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, width - 2, height - 2);
  
  // Add pattern dots
  ctx.fillStyle = 'rgba(148, 163, 184, 0.1)';
  const dotSize = 4;
  const spacing = 40;
  
  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, dotSize, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
  
  // Add centered icon and text
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Draw image icon
  ctx.fillStyle = '#64748b';
  ctx.font = `${width * 0.15}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('🖼️', centerX, centerY - 40);
  
  // Add descriptive text
  ctx.fillStyle = '#475569';
  ctx.font = `${width * 0.04}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('Content image unavailable', centerX, centerY + 30);
  
  ctx.fillStyle = '#64748b';
  ctx.font = `${width * 0.03}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('Image could not be loaded', centerX, centerY + 60);
  
  return canvas.toDataURL('image/png', quality);
};

/**
 * Generate minimal Twitter-style placeholder
 */
export const generateTwitterStylePlaceholder = (
  type: 'profile' | 'content',
  username?: string,
  options: FallbackImageOptions = {}
): string => {
  if (type === 'profile') {
    return generateEnhancedProfileAvatar(username || 'User', options);
  } else {
    return generateEnhancedContentPlaceholder(options);
  }
};