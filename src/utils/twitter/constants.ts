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
    fontSize: 52, // Slightly larger for better visibility
    fontWeight: 'bold' as const,
  },
  handle: {
    fontSize: 38, // Better proportion
    fontWeight: 'normal' as const,
  },
  tweet: {
    fontSize: 42, // Better readable size for main content
    lineHeight: 1.5, // Better line spacing for readability
    charSpacing: 0,
  },
  metrics: {
    icon: { fontSize: 0 },
    count: { fontSize: 0 },
  },
} as const;

export const LAYOUT = {
  margin: 80, // Increased margin for better centering
  profileSize: 120, // Slightly larger profile
  spacing: {
    small: 12,
    medium: 24,
    large: 40,
  },
  positions: {
    // Better centered positioning for Instagram-like layout
    profile: { x: 150, y: 150 }, // More centered
    username: { x: 290, y: 120 }, // Aligned with profile center
    handle: { x: 290, y: 165 }, // Better spacing from username
    tweet: { x: 150, y: 260 }, // More space and centered alignment
  },
} as const;