import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { TemplateRenderer } from "./TemplateRenderer.interface";
import {
  UnifiedDesignSystem,
  dynamicSizingEngine,
} from "../../../../shared/design-system";

export abstract class BaseTemplateRenderer implements TemplateRenderer {
  abstract render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale?: number,
    spacingScale?: number,
  ): void;

  /**
   * Get scaled margin values from design system
   * Uses the scale factor attached to the document
   */
  protected getScaledMargin(doc: PDFKit.PDFDocument): number {
    const scale = (doc as any).__scale || 1;
    return dynamicSizingEngine.getScaledMargin(scale, "page");
  }

  /**
   * Get all scaled design system values (fonts, spacing, margins)
   */
  protected getScaledDesignSystem(doc: PDFKit.PDFDocument) {
    const scale = (doc as any).__scale || 1;
    return dynamicSizingEngine.getScaledDesignSystem(scale);
  }

  /**
   * Helper to move down by exact points, accounting for line height
   */
  protected moveDownPoints(doc: PDFKit.PDFDocument, points: number): void {
    const lineHeight = (doc.currentFontSize() || 12) * 1.2;
    doc.moveDown(points / lineHeight);
  }

  protected renderContactLine(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    font: string,
    size: number,
    center: boolean,
    align: "center" | "left" | "right" = "center",
  ) {
    const parts: { text: string; link?: string }[] = [];
    const isValid = (val: string | undefined) =>
      val &&
      val.trim().toLowerCase() !== "n/a" &&
      val.trim().toLowerCase() !== "none";

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

    // Helper to strip protocol for display
    const formatUrl = (url: string) =>
      url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

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
