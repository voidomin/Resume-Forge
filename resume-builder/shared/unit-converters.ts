/**
 * Unit Conversion Utilities
 * 
 * Converts design system units (base: points) to target format units:
 * - Points (pt) - Base unit used in design system
 * - Pixels (px) - Frontend CSS
 * - Half-points - DOCX library unit (1pt = 2 half-points)
 * - Twips - Word spacing unit (1pt = 20 twips)
 * - Inches - Physical measurements
 */

/**
 * Unit Converter Class
 * All conversions use points (pt) as the base unit
 */
export class UnitConverter {
  /**
   * Convert points to half-points (used by docx library)
   * 1 point = 2 half-points
   * Example: 9pt = 18 half-points
   */
  static ptToHalfPoint(pt: number): number {
    return Math.round(pt * 2);
  }

  /**
   * Convert points to twips (used for Word spacing)
   * 1 point = 20 twips
   * Example: 12pt = 240 twips
   */
  static ptToTwip(pt: number): number {
    return Math.round(pt * 20);
  }

  /**
   * Convert points to pixels
   * Default DPI is 96 (standard screen resolution)
   * 1 inch = 72 points = 96 pixels (at 96 DPI)
   * Formula: pixels = (points / 72) * DPI
   */
  static ptToPixels(pt: number, dpi: number = 96): number {
    return Math.round((pt / 72) * dpi);
  }

  /**
   * Convert points to inches
   * 1 inch = 72 points
   */
  static ptToInches(pt: number): number {
    return pt / 72;
  }

  /**
   * Convert inches to points
   * 1 inch = 72 points
   */
  static inchesToPt(inches: number): number {
    return inches * 72;
  }

  /**
   * Convert pixels to points (inverse of ptToPixels)
   * Default DPI is 96
   */
  static pixelsToPt(pixels: number, dpi: number = 96): number {
    return (pixels * 72) / dpi;
  }

  /**
   * Convert half-points to points (inverse of ptToHalfPoint)
   */
  static halfPointToPt(halfPoints: number): number {
    return halfPoints / 2;
  }

  /**
   * Convert twips to points (inverse of ptToTwip)
   */
  static twipToPt(twips: number): number {
    return twips / 20;
  }

  /**
   * Convert inches to twips (for Word margins)
   * 1 inch = 1440 twips
   */
  static inchesToTwip(inches: number): number {
    return Math.round(inches * 1440);
  }

  /**
   * Get CSS value string from points
   * Returns a string like "9pt" or "12px"
   */
  static ptToCss(pt: number, unit: 'pt' | 'px' = 'pt', dpi: number = 96): string {
    if (unit === 'px') {
      return `${this.ptToPixels(pt, dpi)}px`;
    }
    return `${pt}pt`;
  }

  /**
   * Create inline CSS style object with point-based values
   */
  static createCssStyle(styles: {
    fontSize?: number;
    lineHeight?: number;
    marginTop?: number;
    marginBottom?: number;
    marginLeft?: number;
    marginRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    paddingRight?: number;
  }): React.CSSProperties {
    const cssProps: React.CSSProperties = {};

    if (styles.fontSize !== undefined) {
      cssProps.fontSize = `${styles.fontSize}pt`;
    }
    if (styles.lineHeight !== undefined) {
      cssProps.lineHeight = styles.lineHeight;
    }
    if (styles.marginTop !== undefined) {
      cssProps.marginTop = `${styles.marginTop}pt`;
    }
    if (styles.marginBottom !== undefined) {
      cssProps.marginBottom = `${styles.marginBottom}pt`;
    }
    if (styles.marginLeft !== undefined) {
      cssProps.marginLeft = `${styles.marginLeft}pt`;
    }
    if (styles.marginRight !== undefined) {
      cssProps.marginRight = `${styles.marginRight}pt`;
    }
    if (styles.paddingTop !== undefined) {
      cssProps.paddingTop = `${styles.paddingTop}pt`;
    }
    if (styles.paddingBottom !== undefined) {
      cssProps.paddingBottom = `${styles.paddingBottom}pt`;
    }
    if (styles.paddingLeft !== undefined) {
      cssProps.paddingLeft = `${styles.paddingLeft}pt`;
    }
    if (styles.paddingRight !== undefined) {
      cssProps.paddingRight = `${styles.paddingRight}pt`;
    }

    return cssProps;
  }
}

/**
 * Quick conversion helpers (convenience functions)
 */

export const pt2hp = UnitConverter.ptToHalfPoint;
export const pt2tw = UnitConverter.ptToTwip;
export const pt2px = UnitConverter.ptToPixels;
export const pt2in = UnitConverter.ptToInches;
export const in2pt = UnitConverter.inchesToPt;
export const in2tw = UnitConverter.inchesToTwip;

/**
 * Validation helpers
 */

/**
 * Ensure a value is within acceptable range for font sizes
 */
export function validateFontSize(size: number, min: number = 6, max: number = 72): number {
  return Math.max(min, Math.min(max, size));
}

/**
 * Ensure spacing is non-negative
 */
export function validateSpacing(spacing: number): number {
  return Math.max(0, spacing);
}

/**
 * Round to specified decimal places
 */
export function roundTo(value: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}
