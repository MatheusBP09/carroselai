import { TwitterColors, TwitterMetrics } from './types';

export const CANVAS_DIMENSIONS = {
  width: 1080,
  height: 1350,
} as const;

export const TWITTER_COLORS: TwitterColors = {
  background: '#ffffff',
  cardBackground: '#ffffff',
  text: '#000000',
  secondaryText: '#536471',
  blue: '#1D9BF0',
  border: 'transparent',
  hoverGray: '#f7f9fa'
} as const;

export const DEFAULT_METRICS: TwitterMetrics = {
  replies: '',
  reposts: '',
  likes: '',
  timestamp: ''
} as const;

export const TYPOGRAPHY = {
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  username: {
    fontSize: 66, // 3x increase: 22 → 66
    fontWeight: 'bold' as const,
  },
  handle: {
    fontSize: 54, // 3x increase: 18 → 54
    fontWeight: 'normal' as const,
  },
  tweet: {
    fontSize: 56, // 2x increase: 28 → 56
    lineHeight: 1.4,
    charSpacing: 0,
  },
  metrics: {
    icon: { fontSize: 0 },
    count: { fontSize: 0 },
  },
} as const;

export const LAYOUT = {
  margin: 120, // Reduced margin to fit content better
  profileSize: 144, // 3x increase: 48 → 144
  spacing: {
    small: 36, // 3x increase: 12 → 36
    medium: 72, // 3x increase: 24 → 72
    large: 240, // 3x increase: 80 → 240
  },
  positions: {
    // Optimized positions for better content fit
    profile: { x: 180, y: 450 }, // Moved up to create more space
    username: { x: 360, y: 410 }, // Moved up to create more space
    handle: { x: 360, y: 480 }, // Moved up to create more space  
    tweet: { x: 300, y: 540 }, // Moved up significantly to fit content
  },
} as const;