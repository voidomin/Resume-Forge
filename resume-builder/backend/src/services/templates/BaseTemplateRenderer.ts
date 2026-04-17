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
    doc.y += points;
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
    const { contactInfo } = resume;

    const isValid = (val: string | undefined) =>
      val &&
      val.trim().toLowerCase() !== "n/a" &&
      val.trim().toLowerCase() !== "none";

    const addPart = (val: string | undefined, linkPrefix?: string) => {
      if (!isValid(val)) return;
      const text = linkPrefix ? this.formatUrl(val) : val;
      const link = linkPrefix ? this.ensureProtocol(val, linkPrefix) : undefined;
      parts.push({ text, link });
    };

    // Process each field
    addPart(contactInfo.email, "mailto:");
    addPart(contactInfo.phone, "tel:");

    if (isValid(contactInfo.location)) {
      parts.push({ text: contactInfo.location });
    }

    addPart(contactInfo.linkedin, "https://");
    addPart(contactInfo.github, "https://");
    addPart(contactInfo.portfolio, "https://");

    return parts;
  }

  private formatUrl(url: string): string {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
  }

  private ensureProtocol(val: string, prefix: string): string {
    if (prefix === "mailto:" || prefix === "tel:") return prefix + val;
    return val.startsWith("http") ? val : prefix + val;
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

  /**
   * Generic helper to render a resume section with a header and a loop of items.
   * Helps reduce code duplication across templates.
   */
  protected renderSection<T>(
    doc: PDFKit.PDFDocument,
    title: string,
    items: T[] | undefined,
    ds: ScaledDesignSystem,
    sectionName: string,
    options: {
      density?: DensityLevel;
      itemSpacing?: number;
      drawHeader: (title: string) => void;
      renderItem: (item: T) => void;
    },
  ) {
    // 1. Visibility Check
    if (!items?.length) return;
    if (
      options.density &&
      !contentDensityEngine.isSectionVisible(options.density, sectionName)
    ) {
      return;
    }

    // 2. Draw Header
    options.drawHeader(title);

    // 3. Render Items
    items.forEach((item) => {
      options.renderItem(item);
      if (options.itemSpacing) {
        this.moveDownPoints(doc, options.itemSpacing);
      }
    });

    // 4. Section Spacing
    this.moveDownAdjusted(doc, ds.spacing.section, sectionName, items);
  }
}
