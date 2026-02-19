import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { UnifiedDesignSystem } from "../../../../shared/design-system";

export class MinimalistRenderer extends BaseTemplateRenderer {
  /**
   * Helper to move down by a specific point amount
   */
  private moveDownPoints(doc: PDFKit.PDFDocument, points: number): void {
    const lineHeight = (doc.currentFontSize() || 12) * 1.2;
    doc.moveDown(points / lineHeight);
  }

  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    const ds = UnifiedDesignSystem;
    const fontRegular = ds.fonts.primary.pdf;
    const fontBold = ds.fonts.primary.pdfBold;

    // Minimalist template uses clean, airy layout
    const baseFontSize = ds.fontSize.body * fontScale;
    const headerFontSize = 20 * fontScale;
    const sectionTitleSize = ds.fontSize.body * fontScale;

    const lineGap = 1.6 * spacingScale; // More leading for clean look
    const sectionGap = 18 * spacingScale; // Large gaps between sections
    const itemGap = 12 * spacingScale;

    // Helper: Section Headers (Uppercase, Tracking, TextLight Color)
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 2 * spacingScale);
      doc
        .font(fontBold)
        .fontSize(sectionTitleSize)
        .fillColor(ds.colors.textLight)
        .text(title.toUpperCase(), { characterSpacing: 2 });

      const y = doc.y + 2 * spacingScale;
      doc
        .strokeColor(ds.colors.secondary)
        .opacity(0.3)
        .lineWidth(0.5)
        .moveTo(36, y)
        .lineTo(100, y) // Short underline
        .stroke()
        .opacity(1);

      doc.y = y + 8 * spacingScale;
    };

    // 1. Header (Left Aligned, Clean)
    doc
      .font(fontBold)
      .fontSize(headerFontSize)
      .fillColor(ds.colors.text)
      .text(resume.contactInfo.name, { align: "left", characterSpacing: -0.5 });

    this.moveDownPoints(doc, 4 * spacingScale);

    // 2. Contact (Left aligned, wrapped)
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      baseFontSize,
      false,
      "left",
    );

    this.moveDownPoints(doc, 15 * spacingScale);

    // 3. Summary
    if (resume.summary) {
      drawHeader("ABOUT");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(ds.colors.text)
        .text(resume.summary, { align: "left", lineGap: 1.6 });
      doc.y += sectionGap;
    }

    // 4. Experience
    if (resume.experiences?.length) {
      drawHeader("EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role
        doc
          .font(fontBold)
          .fontSize(baseFontSize + 1)
          .fillColor(ds.colors.text)
          .text(exp.role);

        this.moveDownPoints(doc, 2 * spacingScale);

        // Company | Location | Date
        doc
          .font(fontRegular)
          .fontSize(baseFontSize - 1)
          .fillColor(ds.colors.textLight)
          .text(
            `${exp.company} ${exp.location ? " | " + exp.location : ""} | ${exp.dateRange}`,
          );

        this.moveDownPoints(doc, 5 * spacingScale);

        // Bullets
        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(ds.colors.text)
            .text(b, {
              indent: 10,
              lineGap: 1.6,
            });
        });
        doc.y += itemGap;
      });
      doc.y += sectionGap;
    }

    // 5. Projects
    if (resume.projects?.length) {
      drawHeader("PROJECTS");
      resume.projects.forEach((proj) => {
        doc
          .font(fontBold)
          .fontSize(baseFontSize + 1)
          .fillColor(ds.colors.text)
          .text(proj.name, { continued: true });

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize - 1)
            .fillColor(ds.colors.textLight)
            .text(`  ${proj.technologies}`, { continued: false });
        } else {
          doc.text("");
        }

        this.moveDownPoints(doc, 2 * spacingScale);

        if (proj.link) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize - 1)
            .fillColor(ds.colors.primary)
            .text(proj.link, { link: proj.link });
          this.moveDownPoints(doc, 2 * spacingScale);
        }

        if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(ds.colors.text)
            .text(proj.description, { lineGap: 1.6 });
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(baseFontSize)
              .fillColor(ds.colors.text)
              .text(b, {
                indent: 10,
                lineGap: 1.6,
              });
          });
        }
        doc.y += itemGap;
      });
      doc.y += sectionGap;
    }

    // 6. Education
    if (resume.education?.length) {
      drawHeader("EDUCATION");
      resume.education.forEach((edu) => {
        // Institution
        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(ds.colors.text)
          .text(edu.institution, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(ds.colors.textLight)
          .text(`  |  ${edu.dateRange}`, { continued: false });

        // Degree
        doc
          .font(fontRegular)
          .fillColor(ds.colors.text)
          .text(`${edu.degree} in ${edu.field}`);

        if (edu.gpa) {
          doc.fillColor(ds.colors.textLight).text(`GPA: ${edu.gpa}`);
        }
        doc.y += itemGap;
      });
      doc.y += sectionGap;
    }

    // 7. Skills
    if (resume.skills?.length) {
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(ds.colors.text)
        .text(resume.skills.join(", "), {
          lineGap: 1.6,
        });
    }
  }
}
