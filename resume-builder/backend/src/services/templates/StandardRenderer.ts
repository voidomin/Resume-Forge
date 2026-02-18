import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { UnifiedDesignSystem } from "../../../../shared/design-system";

export class StandardRenderer extends BaseTemplateRenderer {
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

    // Standard template uses adjusted spacing
    const baseFontSize = ds.fontSize.body * fontScale;
    const headerFontSize = 16 * fontScale;
    const sectionTitleSize = ds.fontSize.h2 * fontScale;

    // Spacing in points (adjusted for Standard aesthetics)
    const lineGap = 1 * spacingScale; // Space between lines of text
    const sectionGap = 12 * spacingScale; // Space between major sections
    const itemGap = 8 * spacingScale; // Space between job items/projects
    const headerGap = 5 * spacingScale; // Space after section headers

    // Section Header - Left Aligned with Line
    const drawHeader = (title: string) => {
      this.moveDownPoints(doc, 2 * spacingScale);
      doc
        .font(fontBold)
        .fontSize(sectionTitleSize)
        .fillColor(ds.colors.text)
        .text(title.toUpperCase());

      const y = doc.y + 2 * spacingScale;
      doc
        .strokeColor(ds.colors.primary)
        .lineWidth(0.5)
        .moveTo(36, y)
        .lineTo(559, y)
        .stroke();

      doc.y = y + headerGap;
    };

    // Header - Name
    doc
      .font(fontBold)
      .fontSize(headerFontSize)
      .fillColor(ds.colors.text)
      .text(resume.contactInfo.name.toUpperCase(), { align: "left" });

    this.moveDownPoints(doc, 2 * spacingScale);

    // Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      baseFontSize,
      false,
      "left",
    );

    this.moveDownPoints(doc, 5 * spacingScale);

    if (resume.summary) {
      drawHeader("PROFESSIONAL SUMMARY");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(ds.colors.text)
        .text(resume.summary, { align: "justify", lineGap: 1 });
      doc.y += sectionGap;
    }

    if (resume.experiences?.length) {
      drawHeader("WORK EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role & Company Line
        const startY = doc.y;

        // Role (Left)
        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(ds.colors.text)
          .text(exp.role, { continued: true, align: "left" });

        doc
          .font(fontRegular)
          .fillColor(ds.colors.secondary)
          .text("  |  ", { continued: true })
          .fillColor(ds.colors.primary)
          .text(exp.company, { continued: true })
          .fillColor(ds.colors.textLight)
          .text(exp.location ? `  |  ${exp.location}` : "", {
            continued: false,
            align: "left",
          });

        // Date (Right Aligned)
        const dateWidth = doc.widthOfString(exp.dateRange);
        // Reset Y to start of line to draw date
        doc
          .fillColor(ds.colors.textLight)
          .text(exp.dateRange, 595 - 36 - dateWidth, startY, {
            align: "left",
          });

        // Move back to below the line
        doc.y = startY + doc.currentLineHeight(false) + 2 * spacingScale;

        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(ds.colors.text)
            .text(`•  ${b}`, 42, doc.y, {
              width: 510,
              lineGap: 1,
              align: "left",
            });
        });
        doc.y += itemGap;
      });
      // Adjust last item gap to section gap
      doc.y = doc.y - itemGap + sectionGap;
    }

    if (resume.projects?.length) {
      drawHeader("PROJECTS");
      resume.projects.forEach((proj) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(ds.colors.text)
          .text(proj.name, { continued: true, align: "left" });

        if (proj.link) {
          doc
            .font(fontRegular)
            .fillColor(ds.colors.textLight)
            .text("  |  ", { continued: true })
            .fillColor(ds.colors.primary)
            .text(proj.link, {
              link: proj.link.startsWith("http")
                ? proj.link
                : `https://${proj.link}`,
              underline: true,
              align: "left",
              continued: false,
            });
        } else {
          doc.text(""); // Clear continued state
        }

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize - 1)
            .fillColor(ds.colors.textLight)
            .text(proj.technologies, { align: "left", oblique: true });
        }

        doc
          .font(fontRegular)
          .fontSize(baseFontSize)
          .fillColor(ds.colors.text)
          .text(proj.bullets ? "" : proj.description || "", {
            align: "left",
            lineGap: 1,
          });

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(baseFontSize)
              .fillColor(ds.colors.text)
              .text(`•  ${b}`, 42, doc.y, {
                width: 510,
                lineGap: 1,
                align: "left",
              });
          });
        }
        doc.y += itemGap;
      });
      doc.y = doc.y - itemGap + sectionGap;
    }

    if (resume.education?.length) {
      drawHeader("EDUCATION");
      resume.education.forEach((edu) => {
        const startY = doc.y;

        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(ds.colors.text)
          .text(`${edu.degree} in ${edu.field}`, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(ds.colors.textLight)
          .text("  |  ", { continued: true })
          .fillColor(ds.colors.text)
          .text(edu.institution);

        if (edu.dateRange) {
          const w = doc.widthOfString(edu.dateRange);
          doc
            .fillColor(ds.colors.textLight)
            .text(edu.dateRange, 595 - 36 - w, startY, { align: "left" });
          doc.y = startY + doc.currentLineHeight(false) + 2 * spacingScale;
        }

        if (edu.gpa) {
          doc.fillColor(ds.colors.textLight).text(`CGPA: ${edu.gpa}`);
        }
        doc.y += itemGap;
      });
      doc.y = doc.y - itemGap + sectionGap;
    }

    if (resume.skills?.length) {
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(ds.colors.text)
        .text(resume.skills.join("  •  "), {
          align: "left",
          lineGap: 1.5,
        });
    }
  }
}
