import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { UnifiedDesignSystem } from "../../../../shared/design-system";

export class ExecutiveRenderer extends BaseTemplateRenderer {
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

    // Executive template uses larger fonts for emphasis
    const baseFontSize = ds.fontSize.body * fontScale;
    const headerFontSize = 24 * fontScale;
    const sectionTitleSize = ds.fontSize.h2 * fontScale;

    // Spacing in points (adjusted for Executive aesthetics)
    const lineGap = 1.5 * spacingScale;
    const sectionGap = 14 * spacingScale;
    const itemGap = 10 * spacingScale;
    const headerGap = 6 * spacingScale;

    // Helper: Section Headers (Centered, Uppercase, Primary Color)
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 5 * spacingScale);
      doc
        .font(fontBold)
        .fontSize(sectionTitleSize)
        .fillColor(ds.colors.primary)
        .text(title.toUpperCase(), { align: "center", characterSpacing: 1 });

      const y = doc.y + 2 * spacingScale;
      doc
        .strokeColor(ds.colors.secondary)
        .lineWidth(0.5)
        .moveTo(100, y)
        .lineTo(495, y)
        .stroke();

      doc.y = y + headerGap;
    };

    // 1. Header Name
    doc
      .font(fontBold)
      .fontSize(headerFontSize)
      .fillColor(ds.colors.primary)
      .text(resume.contactInfo.name.toUpperCase(), {
        align: "center",
        characterSpacing: 1,
      });

    this.moveDownPoints(doc, 3 * spacingScale);

    // 2. Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      baseFontSize,
      true,
      "center",
    );

    this.moveDownPoints(doc, 8 * spacingScale);

    // 3. Summary
    if (resume.summary) {
      drawHeader("PROFESSIONAL SUMMARY");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(ds.colors.text)
        .text(resume.summary, { align: "justify", lineGap: 1.5 });
      doc.y += sectionGap;
    }

    // 4. Experience
    if (resume.experiences?.length) {
      drawHeader("WORK EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role | Company | Location
        doc
          .font(fontBold)
          .fontSize(baseFontSize + 1)
          .fillColor(ds.colors.text)
          .text(exp.role.toUpperCase(), { continued: true });

        doc
          .font(fontRegular)
          .fillColor(ds.colors.textLight)
          .text(" | ", { continued: true })
          .fillColor(ds.colors.text)
          .text(exp.company, { continued: true })
          .fillColor(ds.colors.textLight)
          .text(exp.location ? ` | ${exp.location}` : "", { continued: false });

        // Date
        doc.moveUp(1);
        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(ds.colors.primary)
          .text(exp.dateRange, { align: "right" });

        this.moveDownPoints(doc, 5 * spacingScale);

        // Bullets
        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(ds.colors.text)
            .text(`▪  ${b}`, 50, doc.y, {
              width: 500,
              align: "left",
              lineGap: 1.5,
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

        if (proj.link) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(ds.colors.primary)
            .text(`  [${proj.link}]`, { link: proj.link, continued: false });
        } else {
          doc.text("");
        }

        // Description
        if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(ds.colors.text)
            .text(proj.description);
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(baseFontSize)
              .fillColor(ds.colors.text)
              .text(`▪  ${b}`, 50, doc.y, {
                width: 500,
                align: "left",
                lineGap: 1.5,
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
        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(ds.colors.text)
          .text(edu.institution, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(ds.colors.textLight)
          .text(`  |  ${edu.dateRange}`, { align: "right" });

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
      drawHeader("COMPETENCIES");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(ds.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "center",
          lineGap: 1.5,
        });
    }
  }
}
