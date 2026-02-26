import { GeneratedResume } from "../gemini.service";
import { TemplateRenderer } from "./TemplateRenderer.interface";
import {
  contentDensityEngine,
  DensityLevel,
  ScaledDesignSystem,
} from "../../../../shared/design-system";

export abstract class BaseTemplateRenderer implements TemplateRenderer {
  abstract render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale?: number,
    spacingScale?: number,
  ): void;

  abstract renderWithDensity(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    density: DensityLevel,
  ): void;

  /**
   * Helper to move down by exact points, accounting for line height
   */
  protected moveDownPoints(doc: PDFKit.PDFDocument, points: number): void {
    const lineHeight = (doc.currentFontSize() || 12) * 1.2;
    doc.moveDown(points / lineHeight);
  }

  /**
   * Apply section-aware spacing adjustment
   *
   * Reduces spacing for sparse sections (few items/words)
   * to eliminate excessive white space while maintaining readability
   */
  protected getSectionSpacingAdjustment(
    doc: PDFKit.PDFDocument,
    sectionName: string,
    sectionData: any,
  ): number {
    const multiplier = contentDensityEngine.getSectionSpacingMultiplier(
      sectionName,
      sectionData,
    );
    return multiplier;
  }

  /**
   * Move down with section-aware spacing
   *
   * Applies the content-aware multiplier to adjust spacing
   */
  protected moveDownAdjusted(
    doc: PDFKit.PDFDocument,
    basePoints: number,
    sectionName: string,
    sectionData: any,
  ): void {
    const multiplier = this.getSectionSpacingAdjustment(
      doc,
      sectionName,
      sectionData,
    );
    const adjustedPoints = basePoints * multiplier;
    this.moveDownPoints(doc, adjustedPoints);
  }

  /**
   * Check if the document cursor has enough space before the bottom margin
   */
  protected hasEnoughSpace(
    doc: PDFKit.PDFDocument,
    requiredPoints: number,
  ): boolean {
    const bottomMargin = doc.page.margins.bottom;
    const pageHeight = doc.page.height;
    return doc.y + requiredPoints < pageHeight - bottomMargin;
  }

  /**
   * Get the remaining vertical space on the current page in points
   */
  protected getRemainingSpace(doc: PDFKit.PDFDocument): number {
    return doc.page.height - doc.page.margins.bottom - doc.y;
  }

  protected getScaledDesignSystem(
    doc: PDFKit.PDFDocument,
    density: DensityLevel,
  ): ScaledDesignSystem {
    const injected = (
      doc as PDFKit.PDFDocument & {
        __scaledDesignSystem?: ScaledDesignSystem;
      }
    ).__scaledDesignSystem;

    if (injected) {
      return injected;
    }

    return contentDensityEngine.getScaledDesignSystem(density);
  }

  private buildContactParts(
    resume: GeneratedResume,
  ): { text: string; link?: string }[] {
    const parts: { text: string; link?: string }[] = [];
    const isValid = (val: string | undefined) =>
      val &&
      val.trim().toLowerCase() !== "n/a" &&
      val.trim().toLowerCase() !== "none";

    // Helper to strip protocol for display
    const formatUrl = (url: string) =>
      url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

    if (resume.contactInfo.email && isValid(resume.contactInfo.email))
      parts.push({
        text: resume.contactInfo.email,
        link: `mailto:${resume.contactInfo.email}`,
      });
    if (resume.contactInfo.phone && isValid(resume.contactInfo.phone))
      parts.push({
        text: resume.contactInfo.phone,
        link: `tel:${resume.contactInfo.phone}`,
      });
    if (resume.contactInfo.location && isValid(resume.contactInfo.location))
      parts.push({ text: resume.contactInfo.location });

    if (resume.contactInfo.linkedin && isValid(resume.contactInfo.linkedin))
      parts.push({
        text: formatUrl(resume.contactInfo.linkedin),
        link: resume.contactInfo.linkedin.startsWith("http")
          ? resume.contactInfo.linkedin
          : `https://${resume.contactInfo.linkedin}`,
      });
    if (resume.contactInfo.github && isValid(resume.contactInfo.github))
      parts.push({
        text: formatUrl(resume.contactInfo.github),
        link: resume.contactInfo.github.startsWith("http")
          ? resume.contactInfo.github
          : `https://${resume.contactInfo.github}`,
      });
    if (resume.contactInfo.portfolio && isValid(resume.contactInfo.portfolio))
      parts.push({
        text: formatUrl(resume.contactInfo.portfolio),
        link: resume.contactInfo.portfolio.startsWith("http")
          ? resume.contactInfo.portfolio
          : `https://${resume.contactInfo.portfolio}`,
      });

    return parts;
  }

  protected renderContactLine(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    font: string,
    size: number,
    center: boolean,
    align: "center" | "left" | "right" = "center",
  ) {
    const parts = this.buildContactParts(resume);

    doc.font(font).fontSize(size);

    let startX = doc.x;
    if (align === "center" || center) {
      // Calculate total width
      const fullString = parts.map((p) => p.text).join("  |  ");
      const w = doc.widthOfString(fullString);
      startX = (doc.page.width - w) / 2;
      doc.x = startX;
    } else if (align === "right") {
      const fullString = parts.map((p) => p.text).join("  |  ");
      const w = doc.widthOfString(fullString);
      startX = doc.page.width - doc.page.margins.right - w;
      doc.x = startX;
    }

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const separator = isLast ? "" : "  |  ";

      doc.text(part.text, {
        continued: true,
        link: part.link,
        underline: !!part.link,
      });

      doc.text(separator, {
        continued: !isLast,
        underline: false,
        link: null,
      });
    });

    // Reset to separate line
    doc.text(" ", { continued: false });
  }
}
