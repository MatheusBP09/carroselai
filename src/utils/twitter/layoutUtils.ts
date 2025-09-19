  import { Canvas as FabricCanvas, FabricText, Circle, Rect } from "fabric";
  import { CANVAS_DIMENSIONS, TWITTER_COLORS, TYPOGRAPHY, LAYOUT } from './constants';
  import { TwitterImageParams } from './types';

  /**
   * Create the main canvas with proper DOM element for headless rendering
   */
  export const createCanvas = (): FabricCanvas => {
    // Create temporary canvas element for proper Fabric.js initialization
    const canvasElement = document.createElement('canvas');
    canvasElement.width = CANVAS_DIMENSIONS.width;
    canvasElement.height = CANVAS_DIMENSIONS.height;

    // Temporarily add to DOM (required for Fabric.js v6)
    canvasElement.style.position = 'absolute';
    canvasElement.style.left = '-9999px';
    canvasElement.style.top = '-9999px';
    document.body.appendChild(canvasElement);

    console.log('🎨 Creating Fabric canvas with DOM element');

    const canvas = new FabricCanvas(canvasElement, {
      width: CANVAS_DIMENSIONS.width,
      height: CANVAS_DIMENSIONS.height,
      backgroundColor: TWITTER_COLORS.background,
    });

    return canvas;
  };

  /**
   * Create the tweet container background - optimized for square format
   */
  export const createTweetContainer = (): Rect => {
    return new Rect({
      left: LAYOUT.margin,
      top: LAYOUT.margin,
      width: CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2),
      height: CANVAS_DIMENSIONS.height - (LAYOUT.margin * 2),
      fill: TWITTER_COLORS.cardBackground,
      rx: 24, // Rounded corners for modern look
      ry: 24,
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
   * Create verified badge with proper alignment and positioning
   */
  export const createVerifiedBadge = (usernameText: FabricText): [Circle, FabricText] => {
    // Get username text width for proper positioning
    const usernameWidth = usernameText.width || 0;
    const badgeX = usernameText.left + usernameWidth + LAYOUT.spacing.small;
    const badgeY = usernameText.top + (TYPOGRAPHY.username.fontSize / 2) - 12; // Center vertically with username
    
    const badge = new Circle({
      left: badgeX,
      top: badgeY,
      radius: 12, // Smaller, more proportional size
      fill: TWITTER_COLORS.blue,
      originX: 'center',
      originY: 'center',
    });

    const checkmark = new FabricText('✓', {
      left: badgeX,
      top: badgeY,
      fontSize: 16, // Proportional to badge size
      fontFamily: TYPOGRAPHY.fontFamily,
      fill: '#ffffff',
      fontWeight: 'bold',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    });

    return [badge, checkmark];
  };

  /**
   * Create handle and timestamp text
   */
  export const createHandleAndTime = (handle: string, timestamp: string): FabricText => {
    // Clean handle - remove @ if already present and add single @
    const cleanHandle = handle.startsWith('@') ? handle.slice(1) : handle;
    const displayText = timestamp ? `@${cleanHandle} · ${timestamp}` : `@${cleanHandle}`;
    
    return new FabricText(displayText, {
      left: LAYOUT.positions.handle.x,
      top: LAYOUT.positions.handle.y,
      fontSize: TYPOGRAPHY.handle.fontSize,
      fontFamily: TYPOGRAPHY.fontFamily,
      fill: TWITTER_COLORS.secondaryText,
    });
  };

  /**
   * Create tweet text with centered and justified formatting
   */
  export const createTweetText = (text: string): FabricText => {
    const maxWidth = CANVAS_DIMENSIONS.width - (LAYOUT.margin * 2);
    
    return new FabricText(text, {
      left: LAYOUT.positions.tweet.x,
      top: LAYOUT.positions.tweet.y,
      fontSize: TYPOGRAPHY.tweet.fontSize,
      fontFamily: TYPOGRAPHY.fontFamily,
      fill: TWITTER_COLORS.text,
      lineHeight: TYPOGRAPHY.tweet.lineHeight,
      charSpacing: 0,
      splitByGrapheme: false,
      width: maxWidth,
      textAlign: 'justify', // Justified text like requested
      objectCaching: false,
    });
  };