export interface TwitterImageParams {
  text: string;
  username: string;
  handle: string;
  isVerified: boolean;
  profileImageUrl?: string;
}

export interface TwitterColors {
  background: string;
  cardBackground: string;
  text: string;
  secondaryText: string;
  blue: string;
  border: string;
  hoverGray: string;
}

export interface TwitterMetrics {
  replies: string;
  reposts: string;
  likes: string;
  timestamp: string;
}