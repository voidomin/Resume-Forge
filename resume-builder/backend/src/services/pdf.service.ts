import PDFDocument from "pdfkit";
import { GeneratedResume } from "./gemini.service";
import { StandardRenderer } from "./templates/StandardRenderer";
import { ModernRenderer } from "./templates/ModernRenderer";
import { ExecutiveRenderer } from "./templates/ExecutiveRenderer";
import { MinimalistRenderer } from "./templates/MinimalistRenderer";
import { TemplateRenderer } from "./templates/TemplateRenderer.interface";

// Re-export type if needed
export type { TemplateType } from "./pdf.service.types";

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
   * Generate a one-page ATS-friendly PDF resume with selected template
   */
  generateResumePDF(
    resume: GeneratedResume,
    template: string = "modern",
  ): Promise<Buffer> {
    const chunks: Buffer[] = [];

    const pageMargins = {
      top: 36,
      bottom: 36,
      left: 36,
      right: 36,
    };

    // Safe template fallback
    const selectedTemplate = this.renderers[template] ? template : "modern";

    // Measure content height to determine if scaling is needed
    const scale = this.calculateScaleForContent(
      resume,
      selectedTemplate,
      pageMargins,
    );

    // Create PDF with A4 size
    const doc = new PDFDocument({
      size: "A4",
      margins: pageMargins,
    });

    // Collect PDF chunks
    doc.on("data", (chunk) => chunks.push(chunk));

    // Store scale on document for logic that relies on it (legacy or smart renderers)
    (doc as any).__fontScale = scale;

    // Route to appropriate renderer
    this.renderTemplate(doc, resume, selectedTemplate, scale);

    // Finalize PDF and return buffer via Promise
    return new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
      doc.end();
    });
  }

  private calculateScaleForContent(
    resume: GeneratedResume,
    template: string,
    margins: { top: number; bottom: number; left: number; right: number },
  ): number {
    const pageHeight = 842 - margins.top - margins.bottom;
    const minScale = 0.75; // Don't shrink too much (readability)
    const maxScale = 1.15; // Don't expand too much (looks comedic)

    // Initial measure with scale 1
    let { totalHeight, pages } = this.measureContentHeight(
      resume,
      template,
      margins,
      1,
    );

    // Case 1: Overflow (Need compression)
    if (pages > 1 || totalHeight > pageHeight) {
      let scale = 1;
      // Attempt mitigation loop
      for (let i = 0; i < 5; i++) {
        const ratio = pageHeight / totalHeight;
        scale = Math.max(minScale, scale * ratio * 0.98); // 0.98 buffer

        const check = this.measureContentHeight(
          resume,
          template,
          margins,
          scale,
        );
        if (check.pages === 1 && check.totalHeight <= pageHeight) return scale;

        totalHeight = check.totalHeight; // Update for next iteration
      }
      return minScale; // Fallback
    }

    // Case 2: Underflow (Need expansion)
    // If usage is less than 85% of page, try to expand
    const usageRatio = totalHeight / pageHeight;
    if (usageRatio < 0.85) {
      // Target ~92% fill
      const targetScale = Math.min(maxScale, 1 + (0.92 - usageRatio));

      // Verify expansion doesn't cause overflow
      const check = this.measureContentHeight(
        resume,
        template,
        margins,
        targetScale,
      );
      if (check.pages === 1) return targetScale;

      // If overflowed, back off halfway
      return (1 + targetScale) / 2;
    }

    return 1; // Perfect fit already
  }

  private measureContentHeight(
    resume: GeneratedResume,
    template: string,
    margins: { top: number; bottom: number; left: number; right: number },
    scale: number,
  ): { totalHeight: number; pages: number } {
    let pageCount = 1;

    const measureDoc = new PDFDocument({
      size: "A4",
      margins,
    });

    measureDoc.on("pageAdded", () => {
      pageCount += 1;
    });

    measureDoc.on("data", () => null);

    let fontScale = scale;
    let spacingScale = scale;

    if (template === "standard") {
      if (scale < 1) {
        spacingScale = scale * 0.9;
        fontScale = Math.max(0.9, scale * 1.05);
      }
    }

    // Inject for any legacy reading
    (measureDoc as any).__fontScale = fontScale;
    (measureDoc as any).__spacingScale = spacingScale;

    this.renderTemplate(measureDoc, resume, template, fontScale, spacingScale);

    const lastPageY = Math.max(0, measureDoc.y - margins.top);
    const pageHeight = 842 - margins.top - margins.bottom;
    const totalHeight = (pageCount - 1) * pageHeight + lastPageY;

    measureDoc.end();

    return { totalHeight, pages: pageCount };
  }

  private renderTemplate(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    template: string,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    const renderer = this.renderers[template] || this.renderers["modern"];
    renderer.render(doc, resume, fontScale, spacingScale);
  }
}

export const pdfService = new PDFService();
