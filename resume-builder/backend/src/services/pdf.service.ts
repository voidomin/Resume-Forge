import PDFDocument from "pdfkit";
import { GeneratedResume } from "./gemini.service";
import { StandardRenderer } from "./templates/StandardRenderer";
import { ModernRenderer } from "./templates/ModernRenderer";
import { ExecutiveRenderer } from "./templates/ExecutiveRenderer";
import { MinimalistRenderer } from "./templates/MinimalistRenderer";
import { TemplateRenderer } from "./templates/TemplateRenderer.interface";
import {
  UnifiedDesignSystem,
  dynamicSizingEngine,
} from "../../../shared/design-system";

// Re-export type if needed
export type { TemplateType } from "./pdf.service.types";

/**
 * Enhanced PDF Service with Dynamic Sizing
 *
 * Principles:
 * - Content determines scale (not AI heuristics)
 * - Scale applied proportionally to margins, fonts, spacing
 * - Minimums enforced: 7pt font, 2pt spacing, 24pt margins
 * - Always fits on one page, no overflow, minimal white space
 */
export class PDFService {
  private renderers: Record<string, TemplateRenderer>;

  constructor() {
    this.renderers = {
      standard: new StandardRenderer(),
      modern: new ModernRenderer(),
      executive: new ExecutiveRenderer(),
      minimalist: new MinimalistRenderer(),
    };
  }

  /**
   * Generate a one-page adaptive resume
   *
   * Algorithm:
   * 1. Measure content at 1.0 scale
   * 2. If fits: try to expand slightly for better spacing (up to 1.15)
   * 3. If overflows: iteratively compress until it fits
   * 4. Render with calculated scale factor
   *
   * All sizing (margins, fonts, spacing) scales proportionally
   */
  generateResumePDF(
    resume: GeneratedResume,
    template: string = "modern",
  ): Promise<Buffer> {
    const chunks: Buffer[] = [];

    const pageHeight = UnifiedDesignSystem.page.height;
    const baseMargin = UnifiedDesignSystem.margins.page;

    // Safe template fallback
    const selectedTemplate = this.renderers[template] ? template : "modern";

    // Step 1: Measure content at normal scale and calculate optimal scale
    const scale = this.calculateOptimalScale(
      resume,
      selectedTemplate,
      baseMargin,
    );

    // Create PDF with A4 size
    const doc = new PDFDocument({
      size: "A4",
      margins: baseMargin, // Will be scaled in renderer
    });

    // Collect PDF chunks
    doc.on("data", (chunk) => chunks.push(chunk));

    // Attach scale factor to doc for templates to use
    (doc as any).__scale = scale;
    (doc as any).__baseMargin = baseMargin;

    // Route to appropriate renderer with scale factor
    const renderer = this.renderers[selectedTemplate];
    renderer.render(doc, resume, scale, scale); // Both fontScale and spacingScale = scale

    // Finalize PDF and return buffer via Promise
    return new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    });
  }

  /**
   * Calculate optimal scale for content
   *
   * Smart algorithm:
   * 1. Measure at 1.0 scale
   * 2. If overflows: compress iteratively until fits
   * 3. If underflows significantly: expand slightly for better spacing
   * 4. Return scale that ensures exactly one page, optimal spacing
   */
  private calculateOptimalScale(
    resume: GeneratedResume,
    template: string,
    baseMargin: number,
  ): number {
    const pageHeight = UnifiedDesignSystem.page.height;

    // Initial measurement at normal scale
    let { totalHeight, pages } = this.measureContentHeight(
      resume,
      template,
      baseMargin,
      1.0,
    );

    const availableHeight = pageHeight - baseMargin * 2;

    // Perfect fit or better
    if (pages === 1 && totalHeight <= availableHeight) {
      // Check if we can expand slightly for better spacing distribution
      const usageRatio = totalHeight / availableHeight;

      if (usageRatio < 0.85) {
        // Underutilized, try to expand (up to 1.15)
        const targetScale = Math.min(
          1.15,
          1 + (0.92 - usageRatio) * 0.25, // Gradual expansion
        );

        const expandCheck = this.measureContentHeight(
          resume,
          template,
          baseMargin,
          targetScale,
        );

        // If expansion keeps us on one page, use it
        if (expandCheck.pages === 1) {
          const expandedHeight = expandCheck.totalHeight;
          if (expandedHeight <= availableHeight) {
            return targetScale;
          }
        }
      }

      // Current scale is good
      return 1.0;
    }

    // Overflow: compress iteratively
    let scale = 1.0;
    const maxIterations = 7;

    for (let i = 0; i < maxIterations; i++) {
      // Calculate compression ratio needed
      const compressionRatio = availableHeight / totalHeight;
      scale = Math.max(0.65, scale * compressionRatio * 0.97); // 0.97 = 3% safety buffer

      const check = this.measureContentHeight(
        resume,
        template,
        baseMargin,
        scale,
      );

      // Success: fits on one page
      if (check.pages === 1 && check.totalHeight <= availableHeight) {
        return scale;
      }

      totalHeight = check.totalHeight;
    }

    // Fallback (should rarely reach this)
    return 0.65;
  }

  /**
   * Measure actual rendered content height
   *
   * Creates a dry-run PDF to accurately measure what will be rendered
   * Uses dynamic sizing engine to apply scaled margins/fonts
   */
  private measureContentHeight(
    resume: GeneratedResume,
    template: string,
    baseMargin: number,
    scale: number,
  ): { totalHeight: number; pages: number } {
    let pageCount = 1;

    const measureDoc = new PDFDocument({
      size: "A4",
      margins: baseMargin, // Will use base, templates handle scaling
    });

    measureDoc.on("pageAdded", () => {
      pageCount += 1;
    });

    // Ignore data events (dry run)
    measureDoc.on("data", () => null);

    // Attach scale for templates to use
    (measureDoc as any).__scale = scale;
    (measureDoc as any).__baseMargin = baseMargin;

    // Render to measure
    const renderer = this.renderers[template];
    renderer.render(measureDoc, resume, scale, scale);

    const pageHeight = UnifiedDesignSystem.page.height;
    const usableHeight = pageHeight - baseMargin * 2;
    const lastPageY = Math.max(0, measureDoc.y - baseMargin);
    const totalHeight = (pageCount - 1) * usableHeight + lastPageY;

    measureDoc.end();

    return { totalHeight, pages: pageCount };
  }
}

export const pdfService = new PDFService();
