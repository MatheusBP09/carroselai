/**
 * Enhanced text wrapping with proper line breaks and formatting
 */
export const wrapText = (text: string, maxWidth: number, fontSize: number): string => {
  // Clean and normalize text first
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  const words = cleanText.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  // Better character width calculation for Instagram format
  const avgCharWidth = fontSize * 0.55; // More accurate for modern fonts
  const maxCharsPerLine = Math.floor(maxWidth / avgCharWidth);
  
  console.log(`📝 Text wrapping - Max width: ${maxWidth}px, Font: ${fontSize}px, Max chars: ${maxCharsPerLine}`);
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    
    // Handle very long words
    if (word.length > maxCharsPerLine) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = '';
      }
      
      // Split long words intelligently
      let remainingWord = word;
      while (remainingWord.length > maxCharsPerLine) {
        lines.push(remainingWord.substring(0, maxCharsPerLine - 1) + '-');
        remainingWord = remainingWord.substring(maxCharsPerLine - 1);
      }
      currentLine = remainingWord;
      
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
  
  const result = lines.join('\n');
  console.log(`📝 Text wrapped into ${lines.length} lines:`, result.substring(0, 100) + '...');
  
  return result;
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