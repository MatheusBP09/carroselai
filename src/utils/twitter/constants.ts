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
  margin: 60, // Optimized margins for better space utilization
  profileSize: 100, // Better proportion for square format
  spacing: {
    small: 16,
    medium: 32,
    large: 48,
  },
  positions: {
    // Optimized positioning for Instagram 1080x1080 format
    profile: { x: 110, y: 110 }, // Centered with margin
    username: { x: 230, y: 90 }, // Aligned with profile
    handle: { x: 230, y: 130 }, // Proper spacing below username
    tweet: { x: 110, y: 200 }, // More space from profile section
  },
} as const;