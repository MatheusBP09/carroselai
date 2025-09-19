import { TwitterColors, TwitterMetrics } from './types';

export const CANVAS_DIMENSIONS = {
  width: 1080,
  height: 1080, // Square format for Instagram posts
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
    fontSize: 48, // Reduced for better proportion
    fontWeight: 'bold' as const,
  },
  handle: {
    fontSize: 36, // Reduced for better proportion
    fontWeight: 'normal' as const,
  },
  tweet: {
    fontSize: 40, // Better readable size
    lineHeight: 1.3,
    charSpacing: 0,
  },
  metrics: {
    icon: { fontSize: 0 },
    count: { fontSize: 0 },
  },
} as const;

export const LAYOUT = {
  margin: 80, // Better margins for square format
  profileSize: 120, // Reduced for better proportion
  spacing: {
    small: 24, 
    medium: 48, 
    large: 160, 
  },
  positions: {
    // Optimized for square 1080x1080 format
    profile: { x: 100, y: 100 }, 
    username: { x: 250, y: 80 }, 
    handle: { x: 250, y: 140 }, 
    tweet: { x: 100, y: 220 }, // More space for text
  },
} as const;