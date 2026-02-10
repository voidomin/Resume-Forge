import PDFDocument from "pdfkit";
import { GeneratedResume } from "../gemini.service";
import { BaseTemplateRenderer } from "./BaseTemplateRenderer";
import { DesignTokens } from "./design-tokens";

export class MinimalistRenderer extends BaseTemplateRenderer {
  render(
    doc: PDFKit.PDFDocument,
    resume: GeneratedResume,
    fontScale: number = 1,
    spacingScale: number = 1,
  ): void {
    const fontRegular = DesignTokens.fonts.sans;
    const fontBold = DesignTokens.fonts.sansBold;
    const { primary, secondary, text, textLight } = DesignTokens.colors;

    // Airy Minimalist Design
    const baseFontSize = 10 * fontScale < 9 ? 9 : 10 * fontScale;
    const headerFontSize = 20 * fontScale; // Smaller than Executive, larger than body
    const sectionTitleSize = 10 * fontScale;

    const lineGap = 1.6 * spacingScale; // More leading for clean look
    const sectionGap = 18 * spacingScale; // Large gaps between sections
    const itemGap = 12 * spacingScale;

    // Helper: Section Headers (Uppercase, Tracking, TextLight Color)
    const drawHeader = (title: string) => {
      doc.moveDown(0.2 * spacingScale);
      doc
        .font(fontBold)
        .fontSize(sectionTitleSize)
        .fillColor(textLight) // Distinctive feature of Minimalist: muted headers
        .text(title.toUpperCase(), { characterSpacing: 2 });

      const y = doc.y + 2 * spacingScale;
      // No border for Minimalist in Pro Max, or very subtle short line.
      doc
        .strokeColor(secondary)
        .opacity(0.3)
        .lineWidth(0.5)
        .moveTo(36, y)
        .lineTo(100, y) // Short underline
        .stroke()
        .opacity(1); // Reset opacity

      doc.y = y + 8 * spacingScale;
    };

    // 1. Header (Left Aligned, Clean)
    doc
      .font(fontBold)
      .fontSize(headerFontSize)
      .fillColor(text)
      .text(resume.contactInfo.name, { align: "left", characterSpacing: -0.5 }); // Tight styling

    doc.moveDown(0.4 * spacingScale);

    // 2. Contact (Left aligned, wrapped)
    this.renderContactLine(
      doc,
      resume,
      fontRegular,
      baseFontSize,
      false,
      "left",
    );

    doc.moveDown(1.5 * spacingScale);

    // 3. Summary
    if (resume.summary) {
      drawHeader("ABOUT");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(text)
        .text(resume.summary, { align: "left", lineGap: lineGap });
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
          .fillColor(text)
          .text(exp.role);

        doc.moveDown(0.2 * spacingScale);

        // Company | Location | Date (Single line secondary)
        doc
          .font(fontRegular)
          .fontSize(baseFontSize - 1)
          .fillColor(textLight)
          .text(
            `${exp.company} ${exp.location ? " | " + exp.location : ""} | ${exp.dateRange}`,
          );

        doc.moveDown(0.5 * spacingScale);

        // Bullets (Clean indentation)
        exp.bullets.forEach((b: string) => {
          doc.font(fontRegular).fontSize(baseFontSize).fillColor(text).text(b, {
            indent: 10,
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

        if (proj.technologies) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize - 1)
            .fillColor(textLight)
            .text(`  ${proj.technologies}`, { continued: false });
        } else {
          doc.text("");
        }

        doc.moveDown(0.2 * spacingScale);

        if (proj.link) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize - 1)
            .fillColor(primary)
            .text(proj.link, { link: proj.link });
          doc.moveDown(0.2 * spacingScale);
        }

        if (proj.description) {
          doc
            .font(fontRegular)
            .fontSize(baseFontSize)
            .fillColor(text)
            .text(proj.description, { lineGap: lineGap });
        }

        if (proj.bullets) {
          proj.bullets.forEach((b: string) => {
            doc
              .font(fontRegular)
              .fontSize(baseFontSize)
              .fillColor(text)
              .text(b, {
                indent: 10,
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
        // Institution
        doc
          .font(fontBold)
          .fontSize(baseFontSize)
          .fillColor(text)
          .text(edu.institution, { continued: true });

        // Date right? Or inline for minimalist? Inline is cleaner.
        doc
          .font(fontRegular)
          .fillColor(textLight)
          .text(`  |  ${edu.dateRange}`, { continued: false });

        // Degree
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
      drawHeader("SKILLS");
      doc
        .font(fontRegular)
        .fontSize(baseFontSize)
        .fillColor(text)
        .text(resume.skills.join(", "), {
          lineGap: lineGap,
        });
    }
  }
}
