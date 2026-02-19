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
 * Dynamic Scaling Engine for responsive content fitting
 *
 * Ensures resumes fit on one page while respecting minimum thresholds
 * Min font: 11pt, Min spacing: 2pt, Min margins: 28pt
 */
export class DynamicSizingEngine {
  private readonly MIN_FONT_SIZE = 11;
  private readonly MIN_SPACING = 2;
  private readonly MIN_MARGIN = 28;
  private readonly MAX_SCALE = 1.15;
  private readonly MIN_SCALE = 0.65;

  /**
   * Calculate optimal scale factor based on content height vs available space
   * Returns scale factor (1.0 = normal, 0.8 = 20% compressed)
   */
  calculateScale(
    contentHeight: number,
    pageHeight: number,
    margins: number,
  ): number {
    const availableHeight = pageHeight - margins * 2;
    if (contentHeight <= availableHeight) {
      return 1; // Perfect fit, no scaling needed
    }

    // Need to compress: calculate how much
    const requiredScale = availableHeight / contentHeight;
    return Math.max(this.MIN_SCALE, Math.min(this.MAX_SCALE, requiredScale));
  }

  /**
   * Apply scaling to design system values
   * All values scale proportionally: fonts, spacing, margins
   */
  getScaledDesignSystem(scale: number): {
    fontSize: Record<string, number>;
    spacing: Record<string, number>;
    margins: Record<string, number>;
  } {
    const ds = UnifiedDesignSystem;

    // Scale all font sizes, enforce minimum
    const fontSize: Record<string, number> = {};
    for (const [key, value] of Object.entries(ds.fontSize)) {
      fontSize[key] = Math.max(this.MIN_FONT_SIZE, value * scale);
    }

    // Scale all spacing, enforce minimum
    const spacing: Record<string, number> = {};
    for (const [key, value] of Object.entries(ds.spacing)) {
      if (typeof value === "number") {
        spacing[key] = Math.max(this.MIN_SPACING, value * scale);
      } else {
        spacing[key] = value; // Pass through non-numeric values like line multiplier
      }
    }

    // Scale margins, enforce minimum
    const margins: Record<string, number> = {};
    for (const [key, value] of Object.entries(ds.margins)) {
      if (typeof value === "number") {
        margins[key] = Math.max(this.MIN_MARGIN, value * scale);
      } else {
        margins[key] = value;
      }
    }

    return { fontSize, spacing, margins };
  }

  /**
   * Get effective margin value from scaled margins
   */
  getScaledMargin(
    scale: number,
    marginType:
      | "page"
      | "pageTop"
      | "pageRight"
      | "pageBottom"
      | "pageLeft" = "page",
  ): number {
    const scaledMargins = this.getScaledDesignSystem(scale).margins;
    return scaledMargins[marginType] as number;
  }

  /**
   * Get effective font size from scaled values
   */
  getScaledFontSize(scale: number, fontSize: FontSize): number {
    const scaledFonts = this.getScaledDesignSystem(scale).fontSize;
    return scaledFonts[fontSize] as number;
  }

  /**
   * Get effective spacing from scaled values
   */
  getScaledSpacing(scale: number, spacing: Spacing): number {
    const scaledSpacing = this.getScaledDesignSystem(scale).spacing;
    const value = scaledSpacing[spacing];
    return typeof value === "number" ? value : 1.3; // Default line multiplier
  }
}

/**
 * Singleton instance
 */
export const dynamicSizingEngine = new DynamicSizingEngine();

/**
 * Type exports for TypeScript
 */
export type DesignSystem = typeof UnifiedDesignSystem;
export type FontSize = keyof typeof UnifiedDesignSystem.fontSize;
export type Spacing = keyof typeof UnifiedDesignSystem.spacing;
export type ColorName = keyof typeof UnifiedDesignSystem.colors;
