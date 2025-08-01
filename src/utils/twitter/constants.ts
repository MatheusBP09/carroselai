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
    fontSize: 22,
    fontWeight: 'bold' as const,
  },
  handle: {
    fontSize: 18,
    fontWeight: 'normal' as const,
  },
  tweet: {
    fontSize: 28,
    lineHeight: 1.4,
    charSpacing: 0,
  },
  metrics: {
    icon: { fontSize: 0 },
    count: { fontSize: 0 },
  },
} as const;

export const LAYOUT = {
  margin: 80,
  profileSize: 48,
  spacing: {
    small: 12,
    medium: 24,
    large: 80,
  },
  positions: {
    profile: { x: 120, y: 320 },
    username: { x: 180, y: 304 },
    handle: { x: 180, y: 330 },
    tweet: { x: 180, y: 380 },
  },
} as const;