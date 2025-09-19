/**
 * Enhanced text wrapping with improved formatting for posts
 */
export const wrapText = (text: string, maxWidth: number, fontSize: number): string => {
  // Clean and normalize text
  const cleanText = text.trim().replace(/\s+/g, ' ');
  
  const words = cleanText.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  // Better character width calculation for justified text
  const avgCharWidth = fontSize * 0.52; // Optimized for justified alignment
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
      
      // Split long words more elegantly
      let remainingWord = word;
      while (remainingWord.length > maxCharsPerLine) {
        const breakPoint = maxCharsPerLine - 1;
        lines.push(remainingWord.substring(0, breakPoint) + '-');
        remainingWord = remainingWord.substring(breakPoint);
      }
      currentLine = remainingWord;
      
    } else if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) {
        lines.push(currentLine.trim()); // Trim whitespace for better justified alignment
      }
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine.trim());
  }
  
  const result = lines.join('\n');
  console.log(`📝 Text wrapped into ${lines.length} lines for justified display`);
  
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