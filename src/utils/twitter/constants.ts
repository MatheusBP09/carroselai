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
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  username: {
    fontSize: 56, // Mais próximo do Twitter real
    fontWeight: '800' as const, // Mais pesado como no exemplo
  },
  handle: {
    fontSize: 40, // Proporção melhor com o username
    fontWeight: '400' as const,
  },
  tweet: {
    fontSize: 44, // Tamanho mais legível
    lineHeight: 1.3, // Espaçamento de linha como no Twitter
    charSpacing: -0.5, // Ligeiramente mais apertado
  },
  metrics: {
    icon: { fontSize: 0 },
    count: { fontSize: 0 },
  },
} as const;

export const LAYOUT = {
  margin: 80, // Margem similar às referências
  profileSize: 160, // Profile maior como nos exemplos
  spacing: {
    small: 12,
    medium: 20,
    large: 32,
  },
  positions: {
    // Posicionamento mais próximo do Twitter real
    profile: { x: 140, y: 140 }, // Centralizado
    username: { x: 320, y: 130 }, // Alinhado com o centro do profile
    handle: { x: 320, y: 185 }, // Espaçamento adequado do username
    tweet: { x: 140, y: 280 }, // Mais espaço para o texto
  },
} as const;