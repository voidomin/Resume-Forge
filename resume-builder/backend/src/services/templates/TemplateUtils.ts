import {
  UnifiedDesignSystem,
  ScaledDesignSystem,
} from "../../../../shared/design-system";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";

/**
 * Shared layout/rendering functions for generating PDF resumes
 */
export interface HeaderOptions {
  doc: PDFKit.PDFDocument;
  renderer: BaseTemplateRenderer;
  ds: ScaledDesignSystem;
  title: string;
  fontBold: string;
  color: string;
  align?: "left" | "center";
  drawLine?: boolean;
}

export class TemplateUtils {
  /**
   * Helper to draw a section header with standard styling.
   * Customize layout inside specific renderers based on their theme.
   */
  static drawHeader(options: HeaderOptions) {
    const {
      doc,
      ds,
      title,
      fontBold,
      color,
      align = "left",
      drawLine = true,
    } = options;

    doc.y += ds.spacing.tight;

    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h2)
      .fillColor(color)
      .text(title.toUpperCase(), {
        align,
        characterSpacing: align === "center" ? 1 : 0,
      });

    if (drawLine) {
      const scaledMargin = ds.margins.pageLeft;
      const y = doc.y + 2;

      const startX = align === "center" ? scaledMargin + 64 : scaledMargin;
      const endX =
        align === "center" ? 595 - scaledMargin - 64 : 595 - scaledMargin;

      doc
        .strokeColor(UnifiedDesignSystem.colors.primary)
        .lineWidth(0.5)
        .moveTo(startX, y)
        .lineTo(endX, y)
        .stroke();
    }

    doc.y += ds.spacing.element;
  }
}
