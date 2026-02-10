import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { DesignTokens } from "./design-tokens";

export class ExecutiveRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    const fontRegular = DesignTokens.fonts.serif;
    const fontBold = DesignTokens.fonts.serifBold;
    const { primary, secondary, text, textLight } = DesignTokens.colors;

    // Adaptive sizes
    const baseFontSize = 10 * fontScale < 9 ? 9 : 10 * fontScale;
    const headerFontSize = 24 * fontScale;
    const sectionTitleSize = 12 * fontScale;

    // Spacing
    const lineGap = 1.5 * spacingScale;
    const sectionGap = 14 * spacingScale;
    const itemGap = 10 * spacingScale;
    const headerGap = 6 * spacingScale;

    // Helper: Section Headers (Centered, Uppercase, Primary Color)
    const drawHeader = (title: string) => {
      doc.moveDown(0.5 * spacingScale);
      doc
        .font(fontBold)
        .fontSize(sectionTitleSize)
        .fillColor(primary) // Executive Deep Blue
        .text(title.toUpperCase(), { align: "center", characterSpacing: 1 });

      const y = doc.y + 2 * spacingScale;
      doc
        .strokeColor(secondary) // Subtle separation
        .lineWidth(0.5)
        .moveTo(100, y) // Centered line
        .lineTo(495, y)
        .stroke();

      doc.y = y + headerGap;
    };

    // 1. Header Name
    doc
      .font(fontBold)
      .fontSize(headerFontSize)
      .fillColor(primary)
      .text(resume.contactInfo.name.toUpperCase(), {
        align: "center",
        characterSpacing: 1,
      });

    doc.moveDown(0.3 * spacingScale);

    // 2. Contact Line
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      baseFontSize,
      true,
      "center",
    );

    doc.moveDown(0.8 * spacingScale);

    // 3. Summary
    if (resume.summary) {
      drawHeader("PROFESSIONAL SUMMARY");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(text)
        .text(resume.summary, { align: "justify", lineGap: lineGap });
      doc.y += sectionGap;
    }

    // 4. Experience (Executive creates emphasis here)
    if (resume.experiences?.length) {
      drawHeader("WORK EXPERIENCE");
      resume.experiences.forEach((exp) => {
        // Role | Company | Location
        doc
          .font(fontBold)
          .fontSize(baseFontSize + 1)
          .fillColor(text)
          .text(exp.role.toUpperCase(), { continued: true });

        doc
          .font(fontRegular)
          .fillColor(textLight)
          .text(" | ", { continued: true })
          .fillColor(text)
          .text(exp.company, { continued: true })
          .fillColor(textLight)
          .text(exp.location ? ` | ${exp.location}` : "", { continued: false });

        // Date
        doc.moveUp(1);
        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(primary)
          .text(exp.dateRange, { align: "right" });

        doc.moveDown(0.5 * spacingScale);

        // Bullets
        exp.bullets.forEach((b: string) => {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(text)
            .text(`▪  ${b}`, 50, doc.y, {
              // Square bullet for executive
              width: 500,
              align: "left",
              lineGap: lineGap,
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
          .fillColor(text)
          .text(proj.name, { continued: true });

        if (proj.link) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(primary) // Link in Primary
            .text(`  [${proj.link}]`, { link: proj.link, continued: false });
        } else {
          doc.text("");
        }

        // Description
        if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(text)
            .text(proj.description);
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(baseFontSize)
              .fillColor(text)
              .text(`▪  ${b}`, 50, doc.y, {
                width: 500,
                align: "left",
                lineGap: lineGap,
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
          .fillColor(text)
          .text(edu.institution, { continued: true });

        doc
          .font(fontRegular)
          .fillColor(textLight)
          .text(`  |  ${edu.dateRange}`, { align: "right" });

        doc
          .font(fontRegular)
          .fillColor(text)
          .text(`${edu.degree} in ${edu.field}`);

        if (edu.gpa) {
          doc.fillColor(textLight).text(`GPA: ${edu.gpa}`);
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
        .fillColor(text)
        .text(resume.skills.join("  •  "), {
          align: "center",
          lineGap: lineGap * 1.5,
        });
    }
  }
}
