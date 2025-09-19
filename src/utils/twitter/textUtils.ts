/**
 * Advanced text wrapping with better word break handling
 */
export const wrapText = (text: string, maxWidth: number, fontSize: number): string => {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  // More accurate character width calculation
  const avgCharWidth = fontSize * 0.35; // Optimized for square format and better text flow
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    
    // Handle long words that exceed line length
    if (word.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      // Break long words
      const chunks = word.match(new RegExp(`.{1,${maxCharsPerLine}}`, 'g')) || [word];
      chunks.forEach((chunk, index) => {
        if (index === chunks.length - 1) {
          currentLine = chunk;
        } else {
          lines.push(chunk);
        }
      });
    } else if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines.join('\n');
};

/**
 * Format engagement numbers (1200 -> 1.2K)
 */
export const formatEngagement = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
};

/**
 * Generate realistic engagement metrics based on text length and content
 */
export const generateRealisticMetrics = (text: string) => {
  const baseMultiplier = Math.max(1, text.length / 100);
  const randomFactor = 0.5 + Math.random();
  
  const likes = Math.floor(baseMultiplier * randomFactor * 3000);
  const reposts = Math.floor(likes * (0.1 + Math.random() * 0.15));
  const replies = Math.floor(likes * (0.05 + Math.random() * 0.1));
  
  return {
    likes: formatEngagement(likes),
    reposts: formatEngagement(reposts),
    replies: formatEngagement(replies),
  };
};