/**
 * Unified Design System for Resume Templates
 *
 * This is the single source of truth for all design tokens across
 * frontend (React), PDF (PDFKit), and DOCX (docx library) renderers.
 *
 * All measurements are in POINTS (pt) as the base unit, which can be
 * converted to the target format using the unit converters.
 */

export const UnifiedDesignSystem = {
  /**
   * Font sizes in points (pt)
   * These values should be used consistently across all renderers
   */
  fontSize: {
    h1: 20, // Name header
    h2: 11, // Section headers (PROFESSIONAL SUMMARY, EXPERIENCE, etc.)
    h3: 10, // Job titles, project names, institution names
    body: 9, // Main body text, bullet points
    small: 8.5, // Meta information (dates, locations)
    contact: 9, // Contact line text
  },

  /**
   * Spacing in points (pt)
   * Consistent spacing between elements
   */
  spacing: {
    section: 12, // Space between major sections
    element: 8, // Space between elements within a section
    tight: 4, // Space between tightly related items (e.g., job title and bullets)
    minimal: 2, // Minimal space (e.g., between bullet items)
    line: 1.3, // Line height multiplier
    bulletIndent: 16, // Left indent for bullet points
  },

  /**
   * Page margins in points (pt)
   * 36pt = 0.5 inches
   */
  margins: {
    page: 36, // All page margins (top, right, bottom, left)
    pageTop: 36,
    pageRight: 36,
    pageBottom: 36,
    pageLeft: 36,
  },

  /**
   * Page dimensions (A4)
   * Width: 595pt (8.27 inches)
   * Height: 842pt (11.69 inches)
   */
  page: {
    width: 595, // A4 width in points
    height: 842, // A4 height in points
    widthInches: 8.27,
    heightInches: 11.69,
  },

  /**
   * Font families mapped to each rendering engine
   * Using web-safe fonts that are available across all platforms
   */
  fonts: {
    primary: {
      web: "Arial, Helvetica, sans-serif",
      pdf: "Helvetica",
      pdfBold: "Helvetica-Bold",
      docx: "Arial",
    },
    serif: {
      web: 'Georgia, "Times New Roman", serif',
      pdf: "Times-Roman",
      pdfBold: "Times-Bold",
      docx: "Times New Roman",
    },
  },

  /**
   * Font weights
   * Map semantic weights to numeric values
   */
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },

  /**
   * Color palette
   * Using hex colors that work across all formats
   */
  colors: {
    primary: "#1e3a8a", // Deep Blue (brand color)
    secondary: "#64748b", // Slate (secondary elements)
    accent: "#10b981", // Emerald (success/highlights)
    text: "#1e293b", // Slate 800 (main text)
    textLight: "#64748b", // Slate 500 (meta text)
    white: "#ffffff",
    black: "#000000",
  },

  /**
   * Border styles
   */
  borders: {
    sectionUnderline: {
      width: 2, // Border width in points
      color: "#1e3a8a", // Primary color
    },
  },

  /**
   * Bullet point settings
   */
  bullets: {
    character: "•", // Bullet character
    indent: 16, // Left indent in points
    spacing: 2, // Space between bullets
  },
} as const;

/**
 * Helper to get clean color (without # for some renderers)
 */
export function getCleanColor(hexColor: string): string {
  return hexColor.replace("#", "");
}

/**
 * Density Level Definitions
 * Controls resume compression and spacing
 */
export enum DensityLevel {
  NORMAL = "normal", // Full spacing, good for shorter resumes
  COMPACT = "compact", // Optimized spacing, balanced for mid-length resumes
  ULTRA_COMPACT = "ultra-compact", // Maximum density, for extensive experience
}

/**
 * Density Configuration
 * Defines how design tokens scale at each density level
 */
export interface DensityConfig {
  level: DensityLevel;
  marginMultiplier: number; // Applied to margins
  spacingMultiplier: number; // Applied to spacing (section, element, tight, minimal)
  fontSizeMultiplier: number; // Applied to all font sizes
  lineHeightMultiplier: number; // Applied to line height (spacing.line)
  hideOptionalSections: string[]; // Section names to hide: "awards", "coursework", "leadership"
}

/**
 * Density Presets for each level
 * These define the multipliers for scaling design tokens
 */
export const DENSITY_PRESETS: Record<DensityLevel, DensityConfig> = {
  [DensityLevel.NORMAL]: {
    level: DensityLevel.NORMAL,
    marginMultiplier: 1.0, // 36pt margins
    spacingMultiplier: 1.0, // Full spacing
    fontSizeMultiplier: 1.0, // No font reduction
    lineHeightMultiplier: 1.3, // Normal line height
    hideOptionalSections: [],
  },

  [DensityLevel.COMPACT]: {
    level: DensityLevel.COMPACT,
    marginMultiplier: 0.67, // ~24pt margins
    spacingMultiplier: 0.8, // 80% spacing
    fontSizeMultiplier: 0.95, // 5% font reduction
    lineHeightMultiplier: 1.25, // Slightly tighter
    hideOptionalSections: ["awards"],
  },

  [DensityLevel.ULTRA_COMPACT]: {
    level: DensityLevel.ULTRA_COMPACT,
    marginMultiplier: 0.56, // ~20pt margins
    spacingMultiplier: 0.6, // 60% spacing
    fontSizeMultiplier: 0.9, // 10% font reduction
    lineHeightMultiplier: 1.2, // Compact line height
    hideOptionalSections: ["awards", "coursework"],
  },
};

/**
 * Content Analysis Result
 * Output of analyzing resume content for density determination
 */
export interface ContentAnalysis {
  wordCount: number;
  sectionCount: number;
  hasOptionalSections: boolean;
  estimatedLines: number;
  recommendedDensity: DensityLevel;
  confidenceScore: number; // 0-100
}

/**
 * Scaled Design System
 * Design tokens multiplied by density multipliers
 */
export interface ScaledDesignSystem {
  fontSize: Record<string, number>;
  spacing: Record<string, number>;
  margins: Record<string, number>;
  lineHeight: number;
}

/**
 * Content Density Engine
 *
 * Intelligently analyzes resume content and applies optimal compression
 * to fit content on exactly one page while maintaining readability and ATS compliance
 */
export class ContentDensityEngine {
  // ATS and readability safety bounds
  private readonly MIN_FONT_SIZE = 10; // Minimum font size (pt)
  private readonly MIN_MARGIN = 18; // Minimum page margin (pt)
  private readonly MIN_LINE_HEIGHT = 1.2; // Minimum line height multiplier

  // Heuristics for density detection
  private readonly NORMAL_WORD_THRESHOLD = 4000; // Max words for NORMAL density
  private readonly COMPACT_WORD_THRESHOLD = 7000; // Max words for COMPACT density

  /**
   * Analyze resume content to determine optimal density level
   *
   * Considers:
   * - Total word count
   * - Number of sections
   * - Optional sections present
   *
   * Returns recommended DensityLevel and analysis details
   */
  analyzeContentVolume(contentData: {
    wordCount: number;
    sectionCount: number;
    hasOptionalSections: boolean;
  }): ContentAnalysis {
    const { wordCount, sectionCount, hasOptionalSections } = contentData;

    let recommendedDensity = DensityLevel.NORMAL;
    let confidenceScore = 50;

    // Heuristic 1: Based on word count
    if (wordCount > this.COMPACT_WORD_THRESHOLD) {
      recommendedDensity = DensityLevel.ULTRA_COMPACT;
      confidenceScore = Math.min(
        100,
        60 + (wordCount - this.COMPACT_WORD_THRESHOLD) / 100,
      );
    } else if (wordCount > this.NORMAL_WORD_THRESHOLD) {
      recommendedDensity = DensityLevel.COMPACT;
      confidenceScore = 70;
    } else {
      recommendedDensity = DensityLevel.NORMAL;
      confidenceScore = 85;
    }

    // Heuristic 2: Adjust based on section count
    if (sectionCount > 8 && recommendedDensity === DensityLevel.NORMAL) {
      recommendedDensity = DensityLevel.COMPACT;
      confidenceScore = Math.max(confidenceScore - 10, 60);
    }

    // Heuristic 3: Consider optional sections
    if (hasOptionalSections && wordCount > this.NORMAL_WORD_THRESHOLD) {
      if (recommendedDensity !== DensityLevel.ULTRA_COMPACT) {
        recommendedDensity = DensityLevel.COMPACT;
      }
    }

    const estimatedLines = Math.ceil(wordCount / 10); // Approximate lines

    return {
      wordCount,
      sectionCount,
      hasOptionalSections,
      estimatedLines,
      recommendedDensity,
      confidenceScore,
    };
  }

  /**
   * Get scaled design system for a specific density level
   *
   * Applies DensityConfig multipliers to all design tokens
   * Enforces minimum thresholds for readability and ATS compliance
   */
  getScaledDesignSystem(density: DensityLevel): ScaledDesignSystem {
    const config = DENSITY_PRESETS[density];
    const baseDS = UnifiedDesignSystem;

    // Scale font sizes
    const fontSize: Record<string, number> = {};
    for (const [key, value] of Object.entries(baseDS.fontSize)) {
      const scaled = value * config.fontSizeMultiplier;
      fontSize[key] = Math.max(this.MIN_FONT_SIZE, scaled);
    }

    // Scale spacing
    const spacing: Record<string, number> = {};
    for (const [key, value] of Object.entries(baseDS.spacing)) {
      if (typeof value === "number") {
        // Don't scale line height through spacing multiplier
        if (key === "line") {
          spacing[key] = Math.max(
            this.MIN_LINE_HEIGHT,
            value * config.lineHeightMultiplier,
          );
        } else {
          spacing[key] = value * config.spacingMultiplier;
        }
      } else {
        spacing[key] = value;
      }
    }

    // Scale margins
    const margins: Record<string, number> = {};
    for (const [key, value] of Object.entries(baseDS.margins)) {
      if (typeof value === "number") {
        const scaled = value * config.marginMultiplier;
        margins[key] = Math.max(this.MIN_MARGIN, scaled);
      } else {
        margins[key] = value;
      }
    }

    return {
      fontSize,
      spacing,
      margins,
      lineHeight: config.lineHeightMultiplier,
    };
  }

  /**
   * Determine which sections should be hidden based on density level
   *
   * Returns array of section names that should be hidden
   */
  getHiddenSections(density: DensityLevel): string[] {
    return DENSITY_PRESETS[density].hideOptionalSections;
  }

  /**
   * Check if a specific section should be visible
   */
  isSectionVisible(density: DensityLevel, sectionName: string): boolean {
    return !this.getHiddenSections(density).includes(sectionName);
  }

  /**
   * Get effective scaled value for a font size key
   */
  getScaledFontSize(density: DensityLevel, fontSizeKey: string): number {
    const scaledDS = this.getScaledDesignSystem(density);
    return scaledDS.fontSize[fontSizeKey] ?? UnifiedDesignSystem.fontSize.body;
  }

  /**
   * Get effective scaled value for a spacing key
   */
  getScaledSpacing(density: DensityLevel, spacingKey: string): number {
    const scaledDS = this.getScaledDesignSystem(density);
    const value = scaledDS.spacing[spacingKey];
    return typeof value === "number" ? value : 1.3;
  }

  /**
   * Get effective scaled margin value
   */
  getScaledMargin(density: DensityLevel, marginType: string = "page"): number {
    const scaledDS = this.getScaledDesignSystem(density);
    return scaledDS.margins[marginType] ?? scaledDS.margins.page;
  }
}

/**
 * Singleton instance for use throughout the application
 */
export const contentDensityEngine = new ContentDensityEngine();

/**
 * Type exports for TypeScript
 */
export type DesignSystem = typeof UnifiedDesignSystem;
export type FontSize = keyof typeof UnifiedDesignSystem.fontSize;
export type Spacing = keyof typeof UnifiedDesignSystem.spacing;
export type ColorName = keyof typeof UnifiedDesignSystem.colors;
