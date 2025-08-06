import { Canvas as FabricCanvas, FabricText, Circle, Rect } from "fabric";
import { CANVAS_DIMENSIONS, TWITTER_COLORS, TYPOGRAPHY, LAYOUT } from './constants';
import { TwitterImageParams } from './types';

/**
 * Create the main canvas with proper styling
 */
export const createCanvas = (): FabricCanvas => {
  return new FabricCanvas(null, {
    width: CANVAS_DIMENSIONS.width,
    height: CANVAS_DIMENSIONS.height,
    backgroundColor: TWITTER_COLORS.background,
  });
};

/**
 * Create the tweet container background
 */
export const createTweetContainer = (): Rect => {
  return new Rect({
    left: LAYOUT.margin,
    top: 250,
    width: CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2),
    height: CANVAS_DIMENSIONS.height - 330, // Adjust height for 1080x1350 format
    fill: TWITTER_COLORS.cardBackground,
    rx: 0,
    ry: 0,
    stroke: TWITTER_COLORS.border,
    strokeWidth: 0,
  });
};

/**
 * Create username text with proper styling
 */
export const createUsernameText = (username: string): FabricText => {
  return new FabricText(username, {
    left: LAYOUT.positions.username.x,
    top: LAYOUT.positions.username.y,
    fontSize: TYPOGRAPHY.username.fontSize,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontWeight: TYPOGRAPHY.username.fontWeight,
    fill: TWITTER_COLORS.text,
  });
};

/**
 * Create verified badge if user is verified
 */
export const createVerifiedBadge = (usernameText: FabricText): [Circle, FabricText] => {
  const badge = new Circle({
    left: usernameText.left + usernameText.width + LAYOUT.spacing.small,
    top: LAYOUT.positions.username.y + 4,
    radius: 8,
    fill: TWITTER_COLORS.blue,
    originX: 'center',
    originY: 'center',
  });

  const checkmark = new FabricText('✓', {
    left: usernameText.left + usernameText.width + LAYOUT.spacing.small,
    top: LAYOUT.positions.username.y - 1,
    fontSize: 11,
    fill: '#FFFFFF',
    fontWeight: 'bold',
    originX: 'center',
    originY: 'center',
  });

  return [badge, checkmark];
};

/**
 * Create handle and timestamp text
 */
export const createHandleAndTime = (handle: string, timestamp: string): FabricText => {
  const displayText = timestamp ? `@${handle} · ${timestamp}` : `@${handle}`;
  return new FabricText(displayText, {
    left: LAYOUT.positions.handle.x,
    top: LAYOUT.positions.handle.y,
    fontSize: TYPOGRAPHY.handle.fontSize,
    fontFamily: TYPOGRAPHY.fontFamily,
    fill: TWITTER_COLORS.secondaryText,
  });
};

/**
 * Create tweet text with proper formatting
 */
export const createTweetText = (text: string): FabricText => {
  return new FabricText(text, {
    left: LAYOUT.positions.tweet.x,
    top: LAYOUT.positions.tweet.y,
    fontSize: TYPOGRAPHY.tweet.fontSize,
    fontFamily: TYPOGRAPHY.fontFamily,
    fill: TWITTER_COLORS.text,
    lineHeight: TYPOGRAPHY.tweet.lineHeight,
    charSpacing: TYPOGRAPHY.tweet.charSpacing,
  });
};