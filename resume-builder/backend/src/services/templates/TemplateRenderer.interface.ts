import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { DensityLevel } from "../../../../shared/design-system";

export interface TemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale?: number,
    spacingScale?: number,
  ): void;

  /**
   * Render resume with content density awareness
   *
   * The renderer should:
   * 1. Use scaled design system from doc.__scaledDesignSystem
   * 2. Call contentDensityEngine.isSectionVisible() for optional sections
   * 3. Apply all margins/fonts/spacing from scaledDS instead of constants
   * 4. Ensure responsive layout that respects density level
   */
  renderWithDensity(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    density: DensityLevel,
  ): void;
}
