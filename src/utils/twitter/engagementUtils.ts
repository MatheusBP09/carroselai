import { FabricText } from "fabric";
import { TWITTER_COLORS, TYPOGRAPHY } from './constants';
import { TwitterMetrics } from './types';

/**
 * Create engagement metrics section with icons and counts
 */
export const createEngagementMetrics = (
  metrics: TwitterMetrics,
  baseY: number
): FabricText[] => {
  const elements: FabricText[] = [];
  const iconSpacing = 150;
  const baseX = 130;

  // Reply section
  elements.push(
    new FabricText('💬', {
      left: baseX,
      top: baseY,
      fontSize: TYPOGRAPHY.metrics.icon.fontSize,
      fill: TWITTER_COLORS.secondaryText,
      fontFamily: TYPOGRAPHY.fontFamily,
    }),
    new FabricText(metrics.replies, {
      left: baseX + 25,
      top: baseY + 2,
      fontSize: TYPOGRAPHY.metrics.count.fontSize,
      fill: TWITTER_COLORS.secondaryText,
      fontFamily: TYPOGRAPHY.fontFamily,
    })
  );

  // Repost section
  elements.push(
    new FabricText('🔁', {
      left: baseX + iconSpacing,
      top: baseY,
      fontSize: TYPOGRAPHY.metrics.icon.fontSize,
      fill: TWITTER_COLORS.secondaryText,
      fontFamily: TYPOGRAPHY.fontFamily,
    }),
    new FabricText(metrics.reposts, {
      left: baseX + iconSpacing + 25,
      top: baseY + 2,
      fontSize: TYPOGRAPHY.metrics.count.fontSize,
      fill: TWITTER_COLORS.secondaryText,
      fontFamily: TYPOGRAPHY.fontFamily,
    })
  );

  // Like section
  elements.push(
    new FabricText('❤️', {
      left: baseX + iconSpacing * 2,
      top: baseY,
      fontSize: TYPOGRAPHY.metrics.icon.fontSize,
      fill: TWITTER_COLORS.secondaryText,
      fontFamily: TYPOGRAPHY.fontFamily,
    }),
    new FabricText(metrics.likes, {
      left: baseX + iconSpacing * 2 + 25,
      top: baseY + 2,
      fontSize: TYPOGRAPHY.metrics.count.fontSize,
      fill: TWITTER_COLORS.secondaryText,
      fontFamily: TYPOGRAPHY.fontFamily,
    })
  );

  // Bookmark section
  elements.push(
    new FabricText('🔖', {
      left: baseX + iconSpacing * 3,
      top: baseY,
      fontSize: TYPOGRAPHY.metrics.icon.fontSize,
      fill: TWITTER_COLORS.secondaryText,
      fontFamily: TYPOGRAPHY.fontFamily,
    })
  );

  // Share section
  elements.push(
    new FabricText('↗️', {
      left: baseX + iconSpacing * 4,
      top: baseY,
      fontSize: TYPOGRAPHY.metrics.icon.fontSize,
      fill: TWITTER_COLORS.secondaryText,
      fontFamily: TYPOGRAPHY.fontFamily,
    })
  );

  return elements;
};

/**
 * Create hover effects for engagement metrics
 */
export const addHoverEffects = (elements: FabricText[]): void => {
  elements.forEach((element, index) => {
    // Add subtle hover states (for static image, we'll make some slightly brighter)
    if (index % 2 === 0) { // Icons
      element.set({
        shadow: `0 0 8px ${TWITTER_COLORS.blue}40`,
      });
    }
  });
};