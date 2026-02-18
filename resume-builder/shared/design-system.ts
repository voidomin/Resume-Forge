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
    h1: 20,       // Name header
    h2: 11,       // Section headers (PROFESSIONAL SUMMARY, EXPERIENCE, etc.)
    h3: 10,       // Job titles, project names, institution names
    body: 9,      // Main body text, bullet points
    small: 8.5,   // Meta information (dates, locations)
    contact: 9    // Contact line text
  },

  /**
   * Spacing in points (pt)
   * Consistent spacing between elements
   */
  spacing: {
    section: 12,      // Space between major sections
    element: 8,       // Space between elements within a section
    tight: 4,         // Space between tightly related items (e.g., job title and bullets)
    minimal: 2,       // Minimal space (e.g., between bullet items)
    line: 1.3,        // Line height multiplier
    bulletIndent: 16  // Left indent for bullet points
  },

  /**
   * Page margins in points (pt)
   * 36pt = 0.5 inches
   */
  margins: {
    page: 36,         // All page margins (top, right, bottom, left)
    pageTop: 36,
    pageRight: 36,
    pageBottom: 36,
    pageLeft: 36
  },

  /**
   * Page dimensions (A4)
   * Width: 595pt (8.27 inches)
   * Height: 842pt (11.69 inches)
   */
  page: {
    width: 595,       // A4 width in points
    height: 842,      // A4 height in points
    widthInches: 8.27,
    heightInches: 11.69
  },

  /**
   * Font families mapped to each rendering engine
   * Using web-safe fonts that are available across all platforms
   */
  fonts: {
    primary: {
      web: 'Arial, Helvetica, sans-serif',
      pdf: 'Helvetica',
      pdfBold: 'Helvetica-Bold',
      docx: 'Arial'
    },
    serif: {
      web: 'Georgia, "Times New Roman", serif',
      pdf: 'Times-Roman',
      pdfBold: 'Times-Bold',
      docx: 'Times New Roman'
    }
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
    extrabold: 800
  },

  /**
   * Color palette
   * Using hex colors that work across all formats
   */
  colors: {
    primary: '#1e3a8a',      // Deep Blue (brand color)
    secondary: '#64748b',     // Slate (secondary elements)
    accent: '#10b981',        // Emerald (success/highlights)
    text: '#1e293b',          // Slate 800 (main text)
    textLight: '#64748b',     // Slate 500 (meta text)
    white: '#ffffff',
    black: '#000000'
  },

  /**
   * Border styles
   */
  borders: {
    sectionUnderline: {
      width: 2,               // Border width in points
      color: '#1e3a8a'        // Primary color
    }
  },

  /**
   * Bullet point settings
   */
  bullets: {
    character: '•',           // Bullet character
    indent: 16,               // Left indent in points
    spacing: 2                // Space between bullets
  }
} as const;

/**
 * Helper to get clean color (without # for some renderers)
 */
export function getCleanColor(hexColor: string): string {
  return hexColor.replace('#', '');
}

/**
 * Type exports for TypeScript
 */
export type DesignSystem = typeof UnifiedDesignSystem;
export type FontSize = keyof typeof UnifiedDesignSystem.fontSize;
export type Spacing = keyof typeof UnifiedDesignSystem.spacing;
export type ColorName = keyof typeof UnifiedDesignSystem.colors;
