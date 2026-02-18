import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { UnifiedDesignSystem } from "../../../../shared/design-system";

export class ModernRenderer extends BaseTemplateRenderer {
  /**
   * Helper to convert points to PDFKit line heights
   * PDFKit moveDown(n) moves by n * current line height (~1.2 * font size)
   */
  private getLineHeight(doc: PDFKit.PDFDocument): number {
    return (doc.currentFontSize() || 12) * 1.2;
  }

  /**
   * Helper to move down by a specific point amount
   */
  private moveDownPoints(doc: PDFKit.PDFDocument, points: number): void {
    const lineHeight = this.getLineHeight(doc);
    doc.moveDown(points / lineHeight);
  }

  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    // Use Unified Design System
    const ds = UnifiedDesignSystem;
    const fontRegular = ds.fonts.primary.pdf;
    const fontBold = ds.fonts.primary.pdfBold;

    // Apply scaling factors
    const fs = fontScale;
    const ss = spacingScale;

    // Header - Name
    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h1 * fs)
      .fillColor(ds.colors.primary)
      .text(resume.contactInfo.name.toUpperCase(), { align: "center" });

    // Small spacing after name
    this.moveDownPoints(doc, ds.spacing.tight * fs);

    // Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      ds.fontSize.contact * fs,
      false,
    );

    // Spacing after contact
    this.moveDownPoints(doc, ds.spacing.element * fs);

    // Professional Summary
    if (resume.summary) {
      this.drawModernHeader(doc, "PROFESSIONAL SUMMARY", fs);
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body * fs)
        .fillColor(ds.colors.text)
        .text(resume.summary, {
          align: "justify",
          lineGap: 2,
        });
      this.moveDownPoints(doc, ds.spacing.element * fs);
    }

    // Work Experience
    if (resume.experiences?.length) {
      this.drawModernHeader(doc, "WORK EXPERIENCE", fs);
      resume.experiences.forEach((exp) => {
        this.renderExperienceModern(doc, exp, fontBold, fontRegular, fs, ss);
        this.moveDownPoints(doc, ds.spacing.tight * ss);
      });
    }

    // Projects
    if (resume.projects?.length) {
      this.drawModernHeader(doc, "PROJECTS", fs);
      resume.projects.forEach((proj) => {
        this.renderProjectModern(doc, proj, fontBold, fontRegular, fs, ss);
        this.moveDownPoints(doc, ds.spacing.tight * ss);
      });
    }

    // Education
    if (resume.education?.length) {
      this.drawModernHeader(doc, "EDUCATION", fs);
      resume.education.forEach((edu) => {
        this.renderEducationModern(doc, edu, fontBold, fontRegular, fs, ss);
        this.moveDownPoints(doc, ds.spacing.tight * ss);
      });
    }

    // Skills
    if (resume.skills?.length) {
      this.drawModernHeader(doc, "SKILLS", fs);
      doc
        .font(fontRegular)
        .fontSize(ds.fontSize.body * fs)
        .fillColor(ds.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: 2,
        });
    }
  }

  private drawModernHeader(
    doc: PDFKit.PDFDocument,
    title: string,
    fontScaleVal: number,
  ) {
    const ds = UnifiedDesignSystem;
    doc
      .font(ds.fonts.primary.pdfBold)
      .fontSize(ds.fontSize.h2 * fontScaleVal)
      .fillColor(ds.colors.primary)
      .text(title.toUpperCase());

    // Underline with design system border width
    doc
      .strokeColor(ds.colors.primary)
      .lineWidth(ds.borders.sectionUnderline.width)
      .moveTo(doc.x, doc.y + 2)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y + 2)
      .stroke();

    doc.fillColor(ds.colors.text); // Reset to standard text color
    this.moveDownPoints(doc, ds.spacing.element * fontScaleVal);
  }

  private renderExperienceModern(
    doc: PDFKit.PDFDocument,
    exp: any,
    fontBold: string,
    fontRegular: string,
    fontScaleVal: number,
    spacingScaleVal: number,
  ) {
    const ds = UnifiedDesignSystem;

    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h3 * fontScaleVal)
      .fillColor(ds.colors.text)
      .text(exp.role, { continued: true });

    doc
      .font(fontRegular)
      .fillColor(ds.colors.secondary)
      .text(" | ", { continued: true })
      .fillColor(ds.colors.primary)
      .text(exp.company, { continued: true });

    doc
      .fillColor(ds.colors.textLight)
      .text(exp.location ? ` | ${exp.location}` : "", {
        continued: false,
      });

    doc.moveUp(1);
    doc
      .fontSize(ds.fontSize.small * fontScaleVal)
      .fillColor(ds.colors.textLight)
      .text(exp.dateRange, { align: "right" });

    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body * fontScaleVal)
      .fillColor(ds.colors.text);
    exp.bullets.forEach((b: string) => {
      doc.text(`• ${b}`, {
        indent: ds.spacing.bulletIndent,
        lineGap: 2,
      });
    });
  }

  private renderProjectModern(
    doc: PDFKit.PDFDocument,
    proj: any,
    fontBold: string,
    fontRegular: string,
    fontScaleVal: number,
    spacingScaleVal: number,
  ) {
    const ds = UnifiedDesignSystem;

    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h3 * fontScaleVal)
      .fillColor(ds.colors.text)
      .text(proj.name, { continued: true });
    if (proj.link) {
      doc
        .font(fontRegular)
        .fillColor(ds.colors.textLight)
        .text(` | `, { continued: true })
        .fillColor(ds.colors.primary)
        .text(proj.link, { link: proj.link, continued: false })
        .fillColor(ds.colors.text);
    } else {
      doc.text("");
    }

    doc.font(fontRegular).fontSize(ds.fontSize.body * fontScaleVal);
    if (proj.technologies) {
      doc
        .fillColor(ds.colors.secondary)
        .text(`Stack: ${proj.technologies}`, { oblique: true });
    }

    doc.fillColor(ds.colors.text);
    if (proj.bullets) {
      proj.bullets.forEach((b: string) => {
        doc.text(`• ${b}`, {
          indent: ds.spacing.bulletIndent,
          lineGap: 2,
        });
      });
    } else if (proj.description) {
      doc.text(proj.description, { lineGap: 2 });
    }
  }

  private renderEducationModern(
    doc: PDFKit.PDFDocument,
    edu: any,
    fontBold: string,
    fontRegular: string,
    fontScaleVal: number,
    spacingScaleVal: number,
  ) {
    const ds = UnifiedDesignSystem;

    doc
      .font(fontBold)
      .fontSize(ds.fontSize.h3 * fontScaleVal)
      .fillColor(ds.colors.primary)
      .text(edu.institution, { continued: true });
    doc
      .font(fontRegular)
      .fontSize(ds.fontSize.body * fontScaleVal)
      .fillColor(ds.colors.textLight)
      .text(` | ${edu.degree} in ${edu.field}`, { continued: false });

    doc.moveUp(1);
    doc
      .fontSize(ds.fontSize.small * fontScaleVal)
      .fillColor(ds.colors.textLight)
      .text(edu.dateRange, { align: "right" });

    if (edu.gpa) {
      doc
        .fontSize(ds.fontSize.body * fontScaleVal)
        .fillColor(ds.colors.textLight)
        .text(`GPA: ${edu.gpa}`);
    }
  }
}
